/* Kho Của Tôi — lõi nghiệp vụ (không phụ thuộc giao diện).
 * Nguồn sự thật duy nhất là danh sách biến động (movements). Tồn kho, cho mượn,
 * trạng thái và giá trị luôn được tính lại bằng cách phát lại biến động theo thứ tự seq.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KhoCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const APP_ID = 'kho-cua-toi';
  const BACKUP_VERSION = 1;
  const NONE_LOC = 'loc_none';
  const EPS = 1e-9;

  const REASONS = {
    su_dung: 'Đem sử dụng',
    cho_muon: 'Cho mượn',
    cho_tang: 'Cho, tặng',
    chuyen_di: 'Chuyển đi',
    khac: 'Khác'
  };
  const TYPES = {
    nhap: 'Nhập kho',
    xuat: 'Xuất kho',
    nhan_lai: 'Nhận lại hàng cho mượn',
    chuyen: 'Chuyển vị trí',
    kiemke: 'Kiểm kê',
    hoantac: 'Hoàn tác'
  };
  const DEFAULT_CATEGORIES = ['Đồ điện', 'Dụng cụ', 'Đồ gia dụng', 'Văn phòng phẩm', 'Đồ lưu niệm', 'Loại khác'];
  const DEFAULT_UNITS = ['cái', 'chiếc', 'bộ', 'hộp', 'viên', 'chai', 'túi', 'cuộn', 'đôi', 'gói', 'kg', 'mét'];

  /* ---------- tiện ích ---------- */
  function norm(s) {
    return String(s == null ? '' : s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function r6(n) { return Math.round(n * 1e6) / 1e6; }
  function uid(prefix) {
    const rnd = Math.random().toString(36).slice(2, 8);
    return (prefix || 'id') + '_' + Date.now().toString(36) + rnd;
  }
  function todayISO(d) {
    d = d || new Date();
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function isISODate(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s); }
  function parseQty(v) {
    if (v === '' || v == null) return NaN;
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? r6(n) : NaN;
  }
  /** Giá: trả về null nếu trống (chưa có giá), NaN nếu sai. "15.000" → 15000 */
  function parsePrice(v) {
    if (v === '' || v == null) return null;
    if (typeof v === 'number') return v >= 0 ? Math.round(v) : NaN;
    const s = String(v).replace(/[.\s₫đvndVND]/g, '').replace(',', '.');
    if (s === '') return null;
    const n = Number(s);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : NaN;
  }
  function fmtQty(n) {
    if (!Number.isFinite(n)) return '0';
    const v = r6(n);
    return v.toLocaleString('vi-VN', { maximumFractionDigits: 3 });
  }
  function fmtMoney(n) {
    if (n == null || !Number.isFinite(n)) return 'Chưa có giá';
    return Math.round(n).toLocaleString('vi-VN') + ' ₫';
  }

  /* ---------- trạng thái ---------- */
  function emptyState() {
    return { items: {}, movements: [], locations: {}, categories: {}, units: {}, meta: { seq: 0, codeSeq: 0 } };
  }
  function seedDefaults(state) {
    DEFAULT_CATEGORIES.forEach((name, i) => {
      const id = 'cat_' + (i + 1); state.categories[id] = { id, name, order: i };
    });
    DEFAULT_UNITS.forEach((name, i) => {
      const id = 'unit_' + (i + 1); state.units[id] = { id, name, order: i };
    });
    state.locations[NONE_LOC] = { id: NONE_LOC, kho: '', ke: '', tang: '', hop: '', system: true };
    return state;
  }

  function locPath(loc) {
    if (!loc || loc.id === NONE_LOC) return 'Chưa xếp vị trí';
    const parts = [loc.kho, loc.ke, loc.tang, loc.hop].map(x => (x || '').trim()).filter(Boolean);
    return parts.length ? parts.join(' → ') : 'Chưa xếp vị trí';
  }
  function locKey(o) {
    return [o.kho, o.ke, o.tang, o.hop].map(x => norm(x)).join('|');
  }
  function findLocation(state, o) {
    const k = locKey(o);
    if (k === '|||') return state.locations[NONE_LOC];
    return Object.values(state.locations).find(l => l.id !== NONE_LOC && locKey(l) === k) || null;
  }

  /* ---------- phát lại biến động ---------- */
  function derive(state) {
    const stock = {};      // itemId -> { locId: qty }
    const loans = {};      // movementId (xuất cho mượn) -> { itemId, qty, outstanding, recipient, date, locId }
    const undone = {};     // movementId -> hoantac movementId
    const batches = {};    // itemId -> [nhập không bị hoàn tác]
    const lastIn = {}, firstIn = {}, everLocs = {};
    const byId = {};
    const errors = [];

    const add = (itemId, locId, q) => {
      const s = stock[itemId] || (stock[itemId] = {});
      s[locId] = r6((s[locId] || 0) + q);
      if (s[locId] < -EPS) errors.push({ itemId, locId, value: s[locId] });
      (everLocs[itemId] || (everLocs[itemId] = {}))[locId] = true;
    };

    const moves = state.movements.slice().sort((a, b) => a.seq - b.seq);
    for (const m of moves) {
      byId[m.id] = m;
      switch (m.type) {
        case 'nhap':
          add(m.itemId, m.locId, m.qty);
          (batches[m.itemId] || (batches[m.itemId] = [])).push(m);
          if (!lastIn[m.itemId] || m.date > lastIn[m.itemId]) lastIn[m.itemId] = m.date;
          if (!firstIn[m.itemId] || m.date < firstIn[m.itemId]) firstIn[m.itemId] = m.date;
          break;
        case 'xuat':
          add(m.itemId, m.locId, -m.qty);
          if (m.reason === 'cho_muon') {
            loans[m.id] = { id: m.id, itemId: m.itemId, qty: m.qty, outstanding: m.qty, recipient: m.recipient || '', date: m.date, locId: m.locId };
          }
          break;
        case 'nhan_lai':
          add(m.itemId, m.locId, m.qty);
          if (loans[m.refId]) loans[m.refId].outstanding = r6(loans[m.refId].outstanding - m.qty);
          break;
        case 'chuyen':
          add(m.itemId, m.fromLocId, -m.qty);
          add(m.itemId, m.toLocId, m.qty);
          break;
        case 'kiemke':
          add(m.itemId, m.locId, r6(m.after - m.before));
          break;
        case 'hoantac': {
          const ref = byId[m.refId];
          if (!ref) { errors.push({ movementId: m.id, msg: 'missing ref' }); break; }
          undone[ref.id] = m.id;
          if (ref.type === 'xuat') {
            add(ref.itemId, ref.locId, ref.qty);
            if (loans[ref.id]) loans[ref.id].outstanding = 0;
          } else if (ref.type === 'nhap') {
            add(ref.itemId, ref.locId, -ref.qty);
            const arr = batches[ref.itemId];
            if (arr) batches[ref.itemId] = arr.filter(b => b.id !== ref.id);
          }
          break;
        }
        default:
          errors.push({ movementId: m.id, msg: 'unknown type ' + m.type });
      }
    }

    const total = {}, loaned = {}, price = {};
    for (const id of Object.keys(state.items)) {
      const s = stock[id] || {};
      let t = 0;
      for (const k of Object.keys(s)) { if (Math.abs(s[k]) < EPS) delete s[k]; else t += s[k]; }
      total[id] = r6(t);
      loaned[id] = 0;
      // Giá bình quân gia quyền theo các đợt nhập có giá
      const bs = batches[id] || [];
      let pq = 0, pv = 0, unpriced = 0;
      for (const b of bs) {
        if (b.price == null) unpriced++;
        else { pq += b.qty; pv += b.qty * b.price; }
      }
      const avg = pq > 0 ? pv / pq : null;
      price[id] = {
        avg,
        value: avg == null ? null : t * avg,
        pricedBatches: bs.length - unpriced,
        unpricedBatches: unpriced,
        batches: bs.length
      };
    }
    for (const l of Object.values(loans)) {
      if (l.outstanding > EPS && loaned[l.itemId] != null) loaned[l.itemId] = r6(loaned[l.itemId] + l.outstanding);
    }
    return { stock, total, loans, loaned, undone, price, lastIn, firstIn, everLocs, errors };
  }

  function statusOf(d, itemId) { return (d.total[itemId] || 0) > EPS ? 'con' : 'het'; }
  function statusLabel(st) { return st === 'con' ? 'Còn hàng' : 'Đã xuất hết'; }

  function summary(state, d) {
    let inStock = 0, outStock = 0, value = 0, noPrice = 0, partial = 0, loanedItems = 0;
    for (const id of Object.keys(state.items)) {
      if (statusOf(d, id) === 'con') {
        inStock++;
        const p = d.price[id];
        if (p.avg == null) noPrice++;
        else { value += p.value; if (p.unpricedBatches) partial++; }
      } else outStock++;
      if (d.loaned[id] > EPS) loanedItems++;
    }
    return { inStock, outStock, value, noPrice, partial, loanedItems, total: inStock + outStock };
  }

  /* ---------- tạo biến động (có kiểm tra) ---------- */
  function fail(msg) { return { ok: false, error: msg }; }
  function nextSeq(state) { state.meta.seq = (state.meta.seq || 0) + 1; return state.meta.seq; }
  function baseMove(state, type, input) {
    return {
      id: uid('mv'), seq: nextSeq(state), type,
      date: isISODate(input.date) ? input.date : todayISO(),
      createdAt: new Date().toISOString(),
      note: (input.note || '').trim()
    };
  }
  function qtyAt(d, itemId, locId) { return (d.stock[itemId] && d.stock[itemId][locId]) || 0; }
  function checkQty(q) {
    if (!Number.isFinite(q)) return 'Số lượng không hợp lệ.';
    if (q <= 0) return 'Số lượng phải lớn hơn 0.';
    return null;
  }
  function needItem(state, itemId) { return state.items[itemId] ? null : 'Không tìm thấy mặt hàng.'; }
  function needLoc(state, locId) { return state.locations[locId] ? null : 'Vị trí không tồn tại.'; }

  const ops = {
    nhap(state, d, input) {
      const q = parseQty(input.qty), price = parsePrice(input.price);
      const e = needItem(state, input.itemId) || needLoc(state, input.locId) || checkQty(q);
      if (e) return fail(e);
      if (Number.isNaN(price)) return fail('Giá ước tính không hợp lệ. Để trống nếu chưa biết giá.');
      const m = Object.assign(baseMove(state, 'nhap', input), { itemId: input.itemId, locId: input.locId, qty: q, price });
      return { ok: true, movement: m };
    },
    xuat(state, d, input) {
      const q = parseQty(input.qty);
      const e = needItem(state, input.itemId) || needLoc(state, input.locId) || checkQty(q);
      if (e) return fail(e);
      if (!REASONS[input.reason]) return fail('Hãy chọn lý do xuất.');
      const have = qtyAt(d, input.itemId, input.locId);
      if (q > have + EPS) return fail('Không thể xuất ' + fmtQty(q) + ': vị trí này chỉ còn ' + fmtQty(have) + '.');
      const m = Object.assign(baseMove(state, 'xuat', input), {
        itemId: input.itemId, locId: input.locId, qty: q, reason: input.reason,
        recipient: (input.recipient || '').trim()
      });
      return { ok: true, movement: m };
    },
    nhanLai(state, d, input) {
      const loan = d.loans[input.loanId];
      if (!loan) return fail('Không tìm thấy lần cho mượn.');
      const q = parseQty(input.qty);
      const e = needLoc(state, input.locId) || checkQty(q);
      if (e) return fail(e);
      if (q > loan.outstanding + EPS) return fail('Chỉ còn ' + fmtQty(loan.outstanding) + ' đang cho mượn.');
      const m = Object.assign(baseMove(state, 'nhan_lai', input), {
        itemId: loan.itemId, locId: input.locId, qty: q, refId: loan.id, recipient: loan.recipient
      });
      return { ok: true, movement: m };
    },
    chuyen(state, d, input) {
      const q = parseQty(input.qty);
      const e = needItem(state, input.itemId) || needLoc(state, input.fromLocId) || needLoc(state, input.toLocId) || checkQty(q);
      if (e) return fail(e);
      if (input.fromLocId === input.toLocId) return fail('Vị trí đích phải khác vị trí nguồn.');
      const have = qtyAt(d, input.itemId, input.fromLocId);
      if (q > have + EPS) return fail('Vị trí nguồn chỉ còn ' + fmtQty(have) + '.');
      const m = Object.assign(baseMove(state, 'chuyen', input), {
        itemId: input.itemId, fromLocId: input.fromLocId, toLocId: input.toLocId, qty: q
      });
      return { ok: true, movement: m };
    },
    kiemke(state, d, input) {
      const after = parseQty(input.actual);
      const e = needItem(state, input.itemId) || needLoc(state, input.locId);
      if (e) return fail(e);
      if (!Number.isFinite(after) || after < 0) return fail('Số lượng thực tế phải từ 0 trở lên.');
      const reason = (input.reason || '').trim();
      const before = qtyAt(d, input.itemId, input.locId);
      if (Math.abs(after - before) > EPS && !reason) return fail('Hãy ghi lý do điều chỉnh.');
      const m = Object.assign(baseMove(state, 'kiemke', input), {
        itemId: input.itemId, locId: input.locId, before: r6(before), after, reason
      });
      return { ok: true, movement: m };
    },
    hoanTac(state, d, input) {
      const ref = state.movements.find(m => m.id === input.refId);
      if (!ref) return fail('Không tìm thấy giao dịch.');
      if (ref.type !== 'xuat' && ref.type !== 'nhap') return fail('Chỉ hoàn tác được lần nhập hoặc xuất.');
      if (d.undone[ref.id]) return fail('Giao dịch này đã được hoàn tác.');
      if (ref.type === 'xuat' && ref.reason === 'cho_muon') {
        const loan = d.loans[ref.id];
        if (loan && loan.outstanding < ref.qty - EPS) return fail('Đã nhận lại một phần hàng cho mượn này nên không thể hoàn tác.');
      }
      if (ref.type === 'nhap') {
        const have = qtyAt(d, ref.itemId, ref.locId);
        if (have < ref.qty - EPS) return fail('Không thể hoàn tác: vị trí này hiện chỉ còn ' + fmtQty(have) + ', ít hơn ' + fmtQty(ref.qty) + ' đã nhập.');
      }
      const m = Object.assign(baseMove(state, 'hoantac', { date: todayISO(), note: input.note }), {
        refId: ref.id, refType: ref.type, itemId: ref.itemId, locId: ref.locId, qty: ref.qty
      });
      return { ok: true, movement: m };
    }
  };

  /* ---------- mặt hàng ---------- */
  function nextCode(state) {
    const used = new Set(Object.values(state.items).map(i => norm(i.code)));
    let n = state.meta.codeSeq || 0, code;
    do { n++; code = 'MH' + String(n).padStart(4, '0'); } while (used.has(norm(code)));
    return code;
  }
  function validateItem(state, item, selfId) {
    if (!item.name || !item.name.trim()) return 'Hãy nhập tên mặt hàng.';
    if (!item.code || !item.code.trim()) return 'Mã hàng không được để trống.';
    const c = norm(item.code);
    const dup = Object.values(state.items).find(i => i.id !== selfId && norm(i.code) === c);
    if (dup) return 'Mã hàng "' + item.code + '" đã được dùng cho "' + dup.name + '".';
    if (!state.units[item.unitId]) return 'Hãy chọn đơn vị tính.';
    if (item.categoryId && !state.categories[item.categoryId]) return 'Loại hàng không tồn tại.';
    return null;
  }
  function suggestItems(state, text, limit) {
    const q = norm(text);
    if (!q) return [];
    const words = q.split(' ');
    const res = [];
    for (const it of Object.values(state.items)) {
      const n = norm(it.name), c = norm(it.code);
      let score = -1;
      if (n === q) score = 100;
      else if (n.startsWith(q)) score = 80;
      else if (words.every(w => n.includes(w))) score = 60;
      else if (c.includes(q)) score = 50;
      if (score >= 0) res.push({ item: it, score, exact: n === q });
    }
    res.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, 'vi'));
    return res.slice(0, limit || 6);
  }

  /* ---------- tìm kiếm & lọc ---------- */
  function itemLocIds(d, itemId) {
    const s = d.stock[itemId] || {};
    const cur = Object.keys(s).filter(k => s[k] > EPS);
    return cur.length ? cur : Object.keys(d.everLocs[itemId] || {});
  }
  function haystack(state, d, it) {
    const locs = itemLocIds(d, it.id).map(id => locPath(state.locations[id]));
    const cat = state.categories[it.categoryId];
    return norm([it.name, it.code, it.note, cat && cat.name, locs.join(' ')].join(' '));
  }
  /**
   * f = { q, status: 'con'|'het'|'all', categoryId, locPrefix (norm path prefix), from, to, sort }
   */
  function filterItems(state, d, f) {
    f = f || {};
    const words = norm(f.q).split(' ').filter(Boolean);
    let out = Object.values(state.items).filter(it => {
      const st = statusOf(d, it.id);
      if (f.status && f.status !== 'all' && st !== f.status) return false;
      if (f.categoryId && it.categoryId !== f.categoryId) return false;
      if (f.locPrefix) {
        const ok = itemLocIds(d, it.id).some(id => norm(locPath(state.locations[id])).startsWith(f.locPrefix));
        if (!ok) return false;
      }
      if (f.from || f.to) {
        const ins = state.movements.filter(m => m.type === 'nhap' && m.itemId === it.id && !d.undone[m.id]);
        const ok = ins.some(m => (!f.from || m.date >= f.from) && (!f.to || m.date <= f.to));
        if (!ok) return false;
      }
      if (words.length) {
        const h = haystack(state, d, it);
        if (!words.every(w => h.includes(w))) return false;
      }
      return true;
    });
    const sort = f.sort || 'name';
    const val = id => (d.price[id].value == null ? -1 : d.price[id].value);
    out.sort((a, b) => {
      if (sort === 'recent') return (d.lastIn[b.id] || '').localeCompare(d.lastIn[a.id] || '') || a.name.localeCompare(b.name, 'vi');
      if (sort === 'qty') return (d.total[b.id] || 0) - (d.total[a.id] || 0) || a.name.localeCompare(b.name, 'vi');
      if (sort === 'value') return val(b.id) - val(a.id) || a.name.localeCompare(b.name, 'vi');
      return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
    });
    return out;
  }
  /** Các tiền tố vị trí (Kho, Kho→Kệ, ...) dùng cho bộ lọc */
  function locationPrefixes(state) {
    const map = new Map();
    for (const l of Object.values(state.locations)) {
      if (l.id === NONE_LOC) continue;
      const parts = [l.kho, l.ke, l.tang, l.hop].map(x => (x || '').trim()).filter(Boolean);
      for (let i = 1; i <= parts.length; i++) {
        const label = parts.slice(0, i).join(' → ');
        map.set(norm(label), { key: norm(label), label, depth: i });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'vi'));
  }

  function filterHistory(state, d, f) {
    f = f || {};
    return state.movements.filter(m => {
      if (f.type && f.type !== 'all') {
        if (f.type === 'xuat' && m.type !== 'xuat') return false;
        if (f.type !== 'xuat' && m.type !== f.type) return false;
      }
      if (f.itemId && m.itemId !== f.itemId) return false;
      if (f.from && m.date < f.from) return false;
      if (f.to && m.date > f.to) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date) || b.seq - a.seq);
  }

  /* ---------- mô tả biến động ---------- */
  function describe(state, d, m) {
    const it = state.items[m.itemId];
    const unit = it && state.units[it.unitId] ? state.units[it.unitId].name : '';
    const L = id => locPath(state.locations[id]);
    let title = TYPES[m.type], sign = '', where = '', extra = [];
    switch (m.type) {
      case 'nhap': sign = '+'; where = L(m.locId); extra.push(m.price == null ? 'Chưa có giá' : 'Giá ' + fmtMoney(m.price) + '/' + unit); break;
      case 'xuat': sign = '−'; where = L(m.locId); title = 'Xuất · ' + REASONS[m.reason]; if (m.recipient) extra.push('Người/nơi nhận: ' + m.recipient); break;
      case 'nhan_lai': sign = '+'; where = L(m.locId); if (m.recipient) extra.push('Từ: ' + m.recipient); break;
      case 'chuyen': sign = '⇄'; where = L(m.fromLocId) + '  ⟶  ' + L(m.toLocId); break;
      case 'kiemke': {
        const dl = r6(m.after - m.before);
        sign = dl > 0 ? '+' : dl < 0 ? '−' : '='; where = L(m.locId);
        extra.push('Trước ' + fmtQty(m.before) + ' → sau ' + fmtQty(m.after));
        if (m.reason) extra.push('Lý do: ' + m.reason);
        break;
      }
      case 'hoantac': {
        const ref = state.movements.find(x => x.id === m.refId);
        sign = m.refType === 'xuat' ? '+' : '−'; where = L(m.locId);
        title = 'Hoàn tác ' + (m.refType === 'xuat' ? 'xuất' : 'nhập');
        if (ref) extra.push('Hủy giao dịch ngày ' + fmtDate(ref.date) + (ref.reason ? ' (' + REASONS[ref.reason] + ')' : ''));
        break;
      }
    }
    let qty = m.qty;
    if (m.type === 'kiemke') qty = Math.abs(r6(m.after - m.before));
    return { title, sign, qty, unit, where, extra, undone: !!d.undone[m.id], itemName: it ? it.name : '(đã xóa)' };
  }
  function fmtDate(iso) {
    if (!iso) return '';
    const [y, mo, da] = iso.split('-');
    return da + '/' + mo + '/' + y;
  }

  /* ---------- sao lưu ---------- */
  function makeBackup(state, photos) {
    return {
      app: APP_ID, version: BACKUP_VERSION, exportedAt: new Date().toISOString(),
      counts: { items: Object.keys(state.items).length, movements: state.movements.length, photos: Object.keys(photos || {}).length },
      data: {
        meta: state.meta,
        categories: Object.values(state.categories),
        units: Object.values(state.units),
        locations: Object.values(state.locations),
        items: Object.values(state.items),
        movements: state.movements,
        photos: photos || {}
      }
    };
  }
  /** Kiểm tra tệp sao lưu. Trả về { ok, error, state, photos, counts } */
  function readBackup(obj) {
    try {
      if (typeof obj === 'string') obj = JSON.parse(obj);
    } catch (e) { return fail('Tệp không phải định dạng sao lưu (JSON hỏng).'); }
    if (!obj || obj.app !== APP_ID) return fail('Đây không phải tệp sao lưu của Kho Của Tôi.');
    if (typeof obj.version !== 'number' || obj.version > BACKUP_VERSION) return fail('Tệp sao lưu được tạo bởi phiên bản mới hơn, chưa đọc được.');
    const dt = obj.data;
    if (!dt || !Array.isArray(dt.items) || !Array.isArray(dt.movements) || !Array.isArray(dt.categories) || !Array.isArray(dt.units) || !Array.isArray(dt.locations))
      return fail('Tệp sao lưu thiếu dữ liệu bắt buộc.');
    const st = emptyState();
    st.meta = Object.assign({ seq: 0, codeSeq: 0 }, dt.meta || {});
    for (const c of dt.categories) { if (!c || !c.id || !c.name) return fail('Danh mục loại hàng bị lỗi.'); st.categories[c.id] = c; }
    for (const u of dt.units) { if (!u || !u.id || !u.name) return fail('Danh sách đơn vị bị lỗi.'); st.units[u.id] = u; }
    for (const l of dt.locations) { if (!l || !l.id) return fail('Danh sách vị trí bị lỗi.'); st.locations[l.id] = l; }
    if (!st.locations[NONE_LOC]) st.locations[NONE_LOC] = { id: NONE_LOC, kho: '', ke: '', tang: '', hop: '', system: true };
    for (const it of dt.items) {
      if (!it || !it.id || !it.name || !it.code) return fail('Có mặt hàng thiếu tên hoặc mã.');
      if (!st.units[it.unitId]) return fail('Mặt hàng "' + it.name + '" dùng đơn vị không tồn tại.');
      st.items[it.id] = it;
    }
    const ids = new Set();
    for (const m of dt.movements) {
      if (!m || !m.id || !TYPES[m.type] || typeof m.seq !== 'number' || !isISODate(m.date)) return fail('Lịch sử có bản ghi không hợp lệ.');
      if (ids.has(m.id)) return fail('Lịch sử có bản ghi trùng.');
      ids.add(m.id);
      if (!st.items[m.itemId]) return fail('Lịch sử tham chiếu mặt hàng không tồn tại.');
      for (const k of ['locId', 'fromLocId', 'toLocId']) if (m[k] && !st.locations[m[k]]) return fail('Lịch sử tham chiếu vị trí không tồn tại.');
      st.movements.push(m);
    }
    st.movements.sort((a, b) => a.seq - b.seq);
    if (st.movements.length) st.meta.seq = Math.max(st.meta.seq, st.movements[st.movements.length - 1].seq);
    const d = derive(st);
    if (d.errors.length) return fail('Dữ liệu trong tệp không nhất quán (tồn kho bị âm). Không khôi phục.');
    const photos = dt.photos && typeof dt.photos === 'object' ? dt.photos : {};
    for (const k of Object.keys(photos)) {
      if (typeof photos[k] !== 'string' || !photos[k].startsWith('data:image/')) return fail('Ảnh trong tệp sao lưu bị lỗi.');
    }
    if (obj.counts && (obj.counts.items !== dt.items.length || obj.counts.movements !== dt.movements.length))
      return fail('Tệp sao lưu không đầy đủ (số bản ghi không khớp). Có thể tệp bị cắt khi lưu.');
    return { ok: true, state: st, photos, counts: { items: dt.items.length, movements: dt.movements.length, photos: Object.keys(photos).length }, exportedAt: obj.exportedAt };
  }

  /* ---------- xuất bảng ---------- */
  function stockRows(state, d) {
    const head = ['Mã hàng', 'Tên mặt hàng', 'Loại hàng', 'Trạng thái', 'Vị trí', 'Số lượng tại vị trí', 'Tổng tồn', 'Đơn vị', 'Đang cho mượn', 'Giá bình quân (VNĐ)', 'Giá trị ước tính (VNĐ)', 'Ngày nhập gần nhất', 'Ghi chú'];
    const rows = [head];
    const items = Object.values(state.items).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    for (const it of items) {
      const unit = state.units[it.unitId].name;
      const cat = state.categories[it.categoryId];
      const p = d.price[it.id];
      const s = d.stock[it.id] || {};
      const locs = Object.keys(s).filter(k => s[k] > EPS);
      const base = (loc, q, first) => [
        it.code, it.name, cat ? cat.name : '', statusLabel(statusOf(d, it.id)), loc, q,
        first ? d.total[it.id] : '', unit, first ? (d.loaned[it.id] || 0) : '',
        first ? (p.avg == null ? 'Chưa có giá' : Math.round(p.avg)) : '',
        first ? (p.value == null ? 'Chưa có giá' : Math.round(p.value)) : '',
        first ? fmtDate(d.lastIn[it.id]) : '', first ? (it.note || '') : ''
      ];
      if (!locs.length) rows.push(base('', 0, true));
      else locs.forEach((l, i) => rows.push(base(locPath(state.locations[l]), s[l], i === 0)));
    }
    return rows;
  }
  function historyRows(state, d) {
    const rows = [['Ngày', 'Giờ ghi', 'Hoạt động', 'Mã hàng', 'Mặt hàng', 'Số lượng', 'Đơn vị', 'Vị trí', 'Lý do', 'Người/nơi nhận', 'Giá (VNĐ)', 'Ghi chú', 'Đã hoàn tác']];
    const ms = state.movements.slice().sort((a, b) => a.date.localeCompare(b.date) || a.seq - b.seq);
    for (const m of ms) {
      const it = state.items[m.itemId];
      const ds = describe(state, d, m);
      const t = new Date(m.createdAt);
      const time = isNaN(t) ? '' : String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
      rows.push([
        fmtDate(m.date), time, ds.title, it ? it.code : '', ds.itemName,
        (ds.sign === '−' ? -1 : 1) * ds.qty, ds.unit, ds.where,
        m.type === 'kiemke' ? (m.reason || '') : (m.reason ? REASONS[m.reason] : ''),
        m.recipient || '', m.type === 'nhap' ? (m.price == null ? 'Chưa có giá' : m.price) : '',
        m.note || '', ds.undone ? 'Có' : ''
      ]);
    }
    return rows;
  }
  function toCSV(rows) {
    const esc = v => {
      if (v == null) return '';
      const s = String(v);
      return /[",\n\r;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    return '﻿' + rows.map(r => r.map(esc).join(',')).join('\r\n');
  }

  return {
    APP_ID, BACKUP_VERSION, NONE_LOC, REASONS, TYPES, DEFAULT_CATEGORIES, DEFAULT_UNITS,
    norm, r6, uid, todayISO, parseQty, parsePrice, fmtQty, fmtMoney, fmtDate,
    emptyState, seedDefaults, locPath, findLocation, derive, statusOf, statusLabel, summary,
    ops, qtyAt, nextCode, validateItem, suggestItems, filterItems, filterHistory, itemLocIds,
    locationPrefixes, describe, makeBackup, readBackup, stockRows, historyRows, toCSV
  };
});

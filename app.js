/* Kho Của Tôi — giao diện */
(function () {
  'use strict';
  const K = KhoCore, DB = KhoDB;
  const APP_VERSION = '1.1.0';
  let S = null, D = null, saving = false, lastBtn = null;

  /* ================= tiện ích ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const IC = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    gear: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    in: '<path d="M12 3v10m0 0-4-4m4 4 4-4"/><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
    out: '<path d="M12 14V4m0 0L8 8m4-4 4 4"/><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    move: '<path d="M7 7h12m0 0-3-3m3 3-3 3M17 17H5m0 0 3-3m-3 3 3 3"/>',
    count: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="m3.5 6 1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    ret: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.01"/>',
    save: '<path d="M12 4v11m0 0-4-4m4 4 4-4"/><path d="M5 20h14"/>',
    restore: '<path d="M12 16V5m0 0L8 9m4-4 4 4"/><path d="M5 20h14"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    unit: '<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>',
    disk: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
    house: '<path d="M3 21V9l9-5 9 5v12"/><path d="M7 21v-8h10v8M7 17h10"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.4-1-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.2 0-2.2-.6-2.6-1.6M12 6.5V8m0 8v1.5"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    note: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7M9 7h3"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>',
    minus: '<path d="M5 12h14"/>',
    sort: '<path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3"/>'
  };
  const ic = (n, c) => '<svg class="i ' + (c || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>';
  const TYPE_IC = { nhap: 'in', xuat: 'out', nhan_lai: 'ret', chuyen: 'move', kiemke: 'count', hoantac: 'undo' };
  const WD = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  const unitOf = it => (it && S.units[it.unitId] ? S.units[it.unitId].name : '');
  const catOf = it => (it && S.categories[it.categoryId] ? S.categories[it.categoryId].name : '');
  const L = id => K.locPath(S.locations[id]);
  const qu = (n, it) => '<span class="num">' + K.fmtQty(n) + '</span> ' + esc(unitOf(it));
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };
  function dayLabel(iso) {
    const t = K.todayISO(), y = K.todayISO(new Date(Date.now() - 864e5));
    if (iso === t) return 'Hôm nay';
    if (iso === y) return 'Hôm qua';
    const [a, b, c] = iso.split('-').map(Number);
    return WD[new Date(a, b - 1, c).getDay()] + ', ' + K.fmtDate(iso);
  }
  function timeOf(m) { const d = new Date(m.createdAt); return isNaN(d) ? '' : String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function fmtPriceInput(v) { const d = String(v || '').replace(/\D/g, ''); return d ? Number(d).toLocaleString('vi-VN') : ''; }
  function locShort(it) {
    const s = D.stock[it.id] || {};
    const ids = Object.keys(s).filter(k => s[k] > 0);
    if (ids.length === 1) return L(ids[0]);
    if (ids.length > 1) return ids.length + ' vị trí';
    const ev = Object.keys(D.everLocs[it.id] || {});
    return ev.length === 1 && ev[0] !== K.NONE_LOC ? 'Từng cất: ' + L(ev[0]) : 'Không còn trong kho';
  }
  function thumb(it, cls) {
    if (it && it.thumb) return '<img class="thumb ' + (cls || '') + '" src="' + it.thumb + '" alt="">';
    const ch = (it && it.name ? it.name.trim()[0] : '?') || '?';
    return '<span class="thumb ' + (cls || '') + '" aria-hidden="true">' + esc(ch.toUpperCase()) + '</span>';
  }
  function badge(id) {
    const st = K.statusOf(D, id);
    return '<span class="badge b-' + st + '">' + K.statusLabel(st) + '</span>';
  }
  function locSummary(it) {
    const s = D.stock[it.id] || {};
    const ids = Object.keys(s).filter(k => s[k] > 0);
    if (ids.length === 1) return L(ids[0]);
    if (ids.length > 1) return ids.length + ' vị trí';
    return 'Mã ' + it.code;
  }
  function mainLoc(itemId) {
    const s = D.stock[itemId] || {};
    let best = null; for (const k of Object.keys(s)) if (s[k] > 0 && (!best || s[k] > s[best])) best = k;
    return best;
  }
  function sortedLocations() {
    return Object.values(S.locations).filter(l => l.id !== K.NONE_LOC).sort((a, b) => K.locPath(a).localeCompare(K.locPath(b), 'vi', { numeric: true }));
  }

  /* ================= lưu thay đổi ================= */
  async function commit(c) {
    const put = {}, del = {};
    const add = (o, s, arr) => { if (arr && arr.length) o[s] = (o[s] || []).concat(arr); };
    add(put, 'items', c.items); add(put, 'movements', c.movements); add(put, 'locations', c.locations);
    add(put, 'categories', c.categories); add(put, 'units', c.units);
    add(del, 'items', c.delItems); add(del, 'movements', c.delMovements); add(del, 'locations', c.delLocations);
    add(del, 'categories', c.delCategories); add(del, 'units', c.delUnits);
    if (c.photos) for (const k of Object.keys(c.photos)) {
      if (c.photos[k]) add(put, 'photos', [{ key: k, data: c.photos[k] }]); else add(del, 'photos', [k]);
    }
    const meta = Object.assign({}, S.meta, c.meta || {});
    saving = true;
    const busyBtn = lastBtn && lastBtn.isConnected && lastBtn.closest('.sh-foot') ? lastBtn : null;
    if (busyBtn) { busyBtn.classList.add('busy'); busyBtn.setAttribute('aria-busy', 'true'); }
    try { await DB.write(put, del, meta); }
    finally { saving = false; if (busyBtn) { busyBtn.classList.remove('busy'); busyBtn.removeAttribute('aria-busy'); } }
    S.meta = meta;
    (c.items || []).forEach(x => S.items[x.id] = x);
    (c.locations || []).forEach(x => S.locations[x.id] = x);
    (c.categories || []).forEach(x => S.categories[x.id] = x);
    (c.units || []).forEach(x => S.units[x.id] = x);
    if (c.movements) for (const m of c.movements) {
      const i = S.movements.findIndex(x => x.id === m.id);
      if (i >= 0) S.movements[i] = m; else S.movements.push(m);
    }
    (c.delItems || []).forEach(k => delete S.items[k]);
    (c.delLocations || []).forEach(k => delete S.locations[k]);
    (c.delCategories || []).forEach(k => delete S.categories[k]);
    (c.delUnits || []).forEach(k => delete S.units[k]);
    if (c.delMovements) { const set = new Set(c.delMovements); S.movements = S.movements.filter(m => !set.has(m.id)); }
    S.movements.sort((a, b) => a.seq - b.seq);
    D = K.derive(S);
  }
  async function safe(fn) {
    try { return await fn(); }
    catch (e) { console.error(e); toast('Không lưu được: ' + (e && e.message ? e.message : 'lỗi không rõ') + '. Dữ liệu chưa thay đổi.', 'err'); return false; }
  }

  /* ================= thông báo, hộp thoại ================= */
  let toastTimer = null;
  function toast(msg, type, action) {
    const t = $('#toast');
    t.className = 'toast ' + (type || 'ok');
    $('.ti', t).innerHTML = ic(type === 'err' ? 'alert' : 'check');
    $('.msg', t).textContent = msg;
    const b = $('.tact', t);
    if (action) { b.hidden = false; b.textContent = action.label; b.onclick = () => { hideToast(); action.run(); }; }
    else b.hidden = true;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, action ? 6500 : (type === 'err' ? 5000 : 2600));
  }
  function hideToast() { $('#toast').classList.remove('show'); }

  function dialog(o) {
    return new Promise(resolve => {
      const w = document.createElement('div');
      w.className = 'dialog-wrap';
      w.innerHTML = '<div class="dialog" role="alertdialog" aria-modal="true"><h3>' + esc(o.title) + '</h3>' +
        (o.msg ? '<p>' + esc(o.msg) + '</p>' : '') +
        (o.input != null ? '<input class="inp" id="dlg-in" value="' + esc(o.input) + '" placeholder="' + esc(o.placeholder || '') + '" autocomplete="off">' : '') +
        '<div class="ferr" id="dlg-err" hidden></div>' +
        '<button class="btn ' + (o.danger ? 'danger' : 'pri') + '" data-r="ok">' + esc(o.ok || 'Đồng ý') + '</button>' +
        (o.extra ? '<button class="btn sec" data-r="extra">' + esc(o.extra) + '</button>' : '') +
        (o.cancel === false ? '' : '<button class="btn ghost" data-r="cancel">' + esc(o.cancel || 'Hủy') + '</button>') + '</div>';
      $('#layers').appendChild(w);
      const inp = $('#dlg-in', w);
      if (inp) setTimeout(() => { inp.focus(); inp.select(); }, 60);
      const finish = r => {
        if (r === 'ok' && inp) {
          const v = inp.value.trim();
          const e = o.validate ? o.validate(v) : (!v ? 'Không được để trống.' : null);
          if (e) { const er = $('#dlg-err', w); er.hidden = false; er.innerHTML = ic('alert') + esc(e); return; }
          w.remove(); resolve(v); return;
        }
        w.remove(); resolve(inp ? (r === 'ok' ? inp.value : null) : r);
      };
      w.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) finish(b.dataset.r); });
      if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') finish('ok'); });
    });
  }
  const confirmBox = o => dialog(o);
  const promptBox = o => dialog(Object.assign({ input: o.value || '' }, o));

  /* ================= bảng trượt ================= */
  const sheets = [];
  function openSheet(o) {
    const bd = document.createElement('div'); bd.className = 'backdrop';
    const el = document.createElement('section'); el.className = 'sheet' + (o.full ? ' full' : '');
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', o.title);
    const head = o.full
      ? '<div class="sh-head center"><button class="back" data-act="close" aria-label="Quay lại">' + ic('back') + '</button><h3>' + esc(o.title) + '</h3><span class="sp"></span></div>'
      : '<div class="sh-head"><h3>' + esc(o.title) + '</h3><button class="x" data-act="close">' + esc(o.closeLabel || 'Đóng') + '</button></div>';
    el.innerHTML = head + '<div class="sh-body"></div>' + (o.foot === false ? '' : '<div class="sh-foot"></div>');
    $('#layers').append(bd, el);
    const sh = {
      el, body: $('.sh-body', el), foot: $('.sh-foot', el),
      close() { if (el.classList.contains('closing')) return; el.classList.add('closing'); if (document.activeElement && el.contains(document.activeElement)) document.activeElement.blur(); el.classList.remove('show'); bd.classList.remove('show'); const i = sheets.indexOf(sh); if (i >= 0) sheets.splice(i, 1); setTimeout(() => { el.remove(); bd.remove(); }, 240); if (o.onClose) o.onClose(); },
      err(msg) { const e = $('.ferr', el); if (!e) return; e.hidden = !msg; e.innerHTML = msg ? ic('alert') + '<span>' + esc(msg) + '</span>' : ''; if (msg) toast(msg, 'err'); }
    };
    bd.addEventListener('click', () => sh.close());
    el.addEventListener('click', e => { if (e.target.closest('[data-act="close"]')) sh.close(); });
    sheets.push(sh);
    requestAnimationFrame(() => { bd.classList.add('show'); el.classList.add('show'); });
    return sh;
  }
  function closeAllSheets() { sheets.slice().forEach(s => s.close()); }

  /* ================= ảnh ================= */
  function pickFile(id) {
    return new Promise(resolve => {
      const inp = document.getElementById(id);
      inp.value = '';
      inp.onchange = () => resolve(inp.files && inp.files[0] ? inp.files[0] : null);
      inp.click();
    });
  }
  async function compressImage(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Không đọc được ảnh này. Hãy thử ảnh khác.')); i.src = url; });
      const w = img.naturalWidth, h = img.naturalHeight;
      const sc = Math.min(1, 1280 / Math.max(w, h));
      const c = document.createElement('canvas'); c.width = Math.round(w * sc); c.height = Math.round(h * sc);
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      const full = c.toDataURL('image/jpeg', 0.72);
      const t = document.createElement('canvas'); t.width = t.height = 160;
      const s = Math.min(w, h), tx = t.getContext('2d');
      tx.fillStyle = '#fff'; tx.fillRect(0, 0, 160, 160);
      tx.drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, 160, 160);
      return { full, thumb: t.toDataURL('image/jpeg', 0.7) };
    } finally { URL.revokeObjectURL(url); }
  }
  async function getPhotoFromUser(source) {
    const f = await pickFile(source === 'camera' ? 'f-camera' : 'f-library');
    if (!f) return null;
    try { return await compressImage(f); } catch (e) { toast(e.message, 'err'); return null; }
  }
  async function showPhoto(itemId) {
    const data = await DB.getPhoto(itemId);
    const it = S.items[itemId];
    const src = data || (it && it.thumb);
    if (!src) return;
    const w = document.createElement('div'); w.className = 'lightbox';
    w.innerHTML = '<img src="' + src + '" alt="' + esc(it ? it.name : '') + '"><button>Đóng</button>';
    w.addEventListener('click', () => w.remove());
    $('#layers').appendChild(w);
  }

  /* ================= khung & điều hướng ================= */
  const ui = {
    tab: 'home', detail: null, homeQ: '',
    items: { q: '', status: 'con', categoryId: '', locPrefix: '', from: '', to: '', sort: lsGet('sort') || 'name' },
    hist: { type: 'all', itemId: '', from: '', to: '' }, histLimit: 120
  };
  const TABS = [['home', 'Trang chủ', 'home'], ['items', 'Hàng hóa', 'box'], ['history', 'Lịch sử', 'clock'], ['settings', 'Cài đặt', 'gear']];
  function renderTabbar() {
    $('#tabbar').innerHTML = TABS.map(([k, l, i]) => '<button data-tab="' + k + '" class="' + (ui.tab === k && !ui.detail ? 'on' : '') + '" aria-current="' + (ui.tab === k ? 'page' : 'false') + '">' + ic(i) + '<span>' + l + '</span></button>').join('');
  }
  function render(keepScroll) {
    const y = window.scrollY;
    renderTabbar();
    const v = $('#view');
    if (ui.detail && !S.items[ui.detail]) ui.detail = null;
    v.innerHTML = ui.detail ? detailHTML(ui.detail) : ({ home: homeHTML, items: itemsHTML, history: historyHTML, settings: settingsHTML }[ui.tab])();
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  }
  function go(tab) { ui.tab = tab; ui.detail = null; closeAllSheets(); render(); }
  function openItem(id) { ui.detail = id; closeAllSheets(); render(); }
  function refresh() { render(true); }

  /* ================= TRANG CHỦ ================= */
  function homeHTML() {
    return '<header class="hdr"><div class="hdr-row"><h1>Kho Của Tôi</h1></div>' +
      '<div class="search"><span class="si">' + ic('search') + '</span><input id="home-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="Tìm tên hàng, vị trí…" value="' + esc(ui.homeQ) + '" aria-label="Tìm tên hàng, mã, vị trí, ghi chú"><button class="clr" data-act="home-clear" aria-label="Xóa tìm kiếm"' + (ui.homeQ ? '' : ' hidden') + '>' + ic('x') + '</button></div>' +
      overviewHTML() + '</header><div class="wrap" id="home-body">' + homeBodyHTML() + '</div>';
  }
  function overviewHTML() {
    const sm = K.summary(S, D);
    let val, note = '';
    if (!sm.inStock) { val = '<div class="val none">—</div>'; note = 'Chưa có hàng trong kho'; }
    else if (sm.noPrice === sm.inStock) { val = '<div class="val none">Chưa có giá</div>'; note = 'Chưa mặt hàng nào có giá ước tính'; }
    else {
      val = '<div class="val num">' + K.fmtMoney(sm.value) + '</div>';
      if (sm.noPrice) note = ic('alert') + '<span>' + sm.noPrice + ' mặt hàng chưa có giá, chưa tính vào tổng</span>';
    }
    return '<div class="overview"><div class="ov-main">' +
      '<div class="count"><b class="num">' + sm.inStock + '</b><span>mặt hàng</span></div>' +
      '<div class="sub">' + (sm.outStock ? 'còn trong kho · ' + sm.outStock + ' đã xuất hết' : 'đang còn trong kho') + '</div>' +
      '<div class="k">Giá trị ước tính</div>' + val + (note ? '<div class="note">' + note + '</div>' : '') +
      '</div><span class="deco" aria-hidden="true">' + ic('box') + '</span></div>';
  }
  function homeBodyHTML() {
    if (ui.homeQ.trim()) return homeResultsHTML();
    const has = Object.keys(S.items).length > 0;
    let h = '<div class="big-actions"><button class="big" data-act="nhap">' + ic('in') + '<span>Nhập kho</span></button>' +
      '<button class="big" data-act="xuat">' + ic('out') + '<span>Xuất kho</span></button></div>';
    if (!has) {
      return h + '<div class="card"><div class="empty"><div class="eic">' + ic('box') + '</div><h3>Kho đang trống</h3><p>Bắt đầu bằng cách nhập món đồ đầu tiên: chụp ảnh, ghi số lượng và nơi cất. Mọi thứ được lưu ngay trên iPhone này.</p><button class="btn pri" data-act="nhap">' + ic('plus') + 'Thêm mặt hàng đầu tiên</button><button class="link" data-act="guide">Xem hướng dẫn nhanh</button></div></div>' + installHint();
    }
    h += installHint() + backupReminder();
    // Gần đây: mặt hàng vừa có hoạt động, kèm số lượng và vị trí hiện tại
    const seen = new Set(), recent = [];
    for (const m of S.movements.slice().sort((a, b) => b.seq - a.seq)) {
      if (!S.items[m.itemId] || seen.has(m.itemId)) continue;
      seen.add(m.itemId); recent.push(m);
      if (recent.length === 5) break;
    }
    h += '<section class="sec"><h2>Gần đây <button data-tab="history">Xem tất cả' + ic('chev') + '</button></h2><div class="rows">' + recent.map(recentRowHTML).join('') + '</div></section>';
    // Đang cho mượn
    const loans = Object.values(D.loans).filter(l => l.outstanding > 0 && S.items[l.itemId]);
    if (loans.length) {
      h += '<section class="sec"><h2>Đang cho mượn <span class="cnt">' + loans.length + ' lượt</span></h2><div class="rows">' + loans.slice(0, 5).map(l => {
        const it = S.items[l.itemId];
        return '<button class="row" data-act="open-item" data-id="' + it.id + '">' + thumb(it) + '<div class="mid"><div class="t">' + esc(it.name) + '</div><div class="s">' + ic('user') + esc(l.recipient || 'Chưa ghi người mượn') + ' · ' + K.fmtDate(l.date) + '</div></div><div class="end"><span class="badge b-loan">Mượn ' + qu(l.outstanding, it) + '</span></div>' + ic('chev', 'chev') + '</button>';
      }).join('') + '</div></section>';
    }
    // Lối tắt theo loại
    const catCount = {};
    for (const it of Object.values(S.items)) if (K.statusOf(D, it.id) === 'con') catCount[it.categoryId || ''] = (catCount[it.categoryId || ''] || 0) + 1;
    const cats = Object.values(S.categories).filter(c => catCount[c.id]).sort((a, b) => (a.order || 0) - (b.order || 0));
    if (cats.length || catCount['']) {
      h += '<section class="sec"><h2>Theo loại hàng</h2><div class="chips">' + cats.map(c => '<button class="chip" data-act="by-cat" data-id="' + c.id + '">' + ic('tag') + esc(c.name) + ' <b class="num">' + catCount[c.id] + '</b></button>').join('') +
        (catCount[''] ? '<button class="chip" data-act="by-cat" data-id="__none">' + ic('tag') + 'Chưa phân loại <b class="num">' + catCount[''] + '</b></button>' : '') + '</div></section>';
    }
    // Lối tắt theo vị trí
    const pref = K.locationPrefixes(S).filter(p => p.depth <= 2);
    const pc = pref.map(p => ({ p, n: Object.values(S.items).filter(it => K.statusOf(D, it.id) === 'con' && K.itemLocIds(D, it.id).some(id => K.norm(L(id)).startsWith(p.key))).length })).filter(x => x.n);
    if (pc.length) {
      h += '<section class="sec"><h2>Theo vị trí</h2><div class="chips">' + pc.map(x => '<button class="chip" data-act="by-loc" data-key="' + esc(x.p.key) + '">' + ic(x.p.depth === 1 ? 'house' : 'pin') + esc(x.p.label) + ' <b class="num">' + x.n + '</b></button>').join('') + '</div></section>';
    }
    return h;
  }
  function recentRowHTML(m) {
    const it = S.items[m.itemId], ds = K.describe(S, D, m);
    const what = (ds.undone ? 'Đã hoàn tác · ' : '') + ds.title.replace('Xuất · ', 'Xuất ') + ' ' + (ds.sign === '⇄' ? '' : ds.sign) + K.fmtQty(ds.qty) + ' · ' + dayLabel(m.date);
    return '<button class="row" data-act="open-item" data-id="' + it.id + '">' + thumb(it) +
      '<div class="mid"><div class="t">' + esc(it.name) + '</div>' +
      '<div class="s"><span class="num">' + K.fmtQty(D.total[it.id]) + '</span> ' + esc(unitOf(it)) + ' · ' + esc(locShort(it)) + '</div>' +
      '<div class="s3">' + esc(what) + '</div></div>' +
      (K.statusOf(D, it.id) === 'het' ? '<div class="end">' + badge(it.id) + '</div>' : '') + ic('chev', 'chev') + '</button>';
  }
  function homeResultsHTML() {
    const res = K.filterItems(S, D, { q: ui.homeQ, status: 'all', sort: 'name' });
    res.sort((a, b) => (K.statusOf(D, a.id) === 'con' ? 0 : 1) - (K.statusOf(D, b.id) === 'con' ? 0 : 1));
    if (!res.length) return '<div class="card"><div class="empty"><div class="eic">' + ic('search') + '</div><h3>Không tìm thấy</h3><p>Không có mặt hàng nào khớp “' + esc(ui.homeQ) + '”, kể cả hàng đã hết. Thử từ khóa ngắn hơn, có thể gõ không dấu.</p></div></div>';
    return '<section class="sec"><h2>' + res.length + ' kết quả <button data-act="home-to-items">Mở trong Hàng hóa' + ic('chev') + '</button></h2><div class="rows">' + res.slice(0, 40).map(it => itemRowHTML(it)).join('') + '</div></section>';
  }
  function installHint() {
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!ios || navigator.standalone || lsGet('hideInstall')) return '';
    return '<div class="notice info">' + ic('phone') + '<div>Để dùng như ứng dụng và giữ dữ liệu ổn định, hãy nhấn nút <b>Chia sẻ</b> của Safari rồi chọn <b>Thêm vào MH chính</b>. Sau đó luôn mở từ biểu tượng trên màn hình chính. <button data-act="hide-install">Ẩn</button></div></div>';
  }
  function backupReminder() {
    const last = S.meta.lastBackup ? new Date(S.meta.lastBackup) : null;
    const days = last ? Math.floor((Date.now() - last) / 864e5) : null;
    if (days != null && days < 14) return '';
    return '<div class="notice warn">' + ic('alert') + '<div>' + (last ? 'Lần sao lưu gần nhất cách đây ' + days + ' ngày.' : 'Bạn chưa sao lưu lần nào.') + ' Dữ liệu chỉ nằm trên máy này, nên hãy lưu một bản vào ứng dụng Tệp hoặc iCloud Drive. <button data-act="backup">Sao lưu ngay</button></div></div>';
  }

  /* ================= HÀNG HÓA ================= */
  function itemRowHTML(it) {
    const st = K.statusOf(D, it.id);
    const loaned = D.loaned[it.id] > 0 ? '<span class="badge b-loan">Mượn ' + K.fmtQty(D.loaned[it.id]) + '</span>' : '';
    return '<button class="row" data-act="open-item" data-id="' + it.id + '">' + thumb(it) +
      '<div class="mid"><div class="t">' + esc(it.name) + '</div><div class="s">' + ic('pin') + esc(locShort(it)) + '</div></div>' +
      '<div class="end"><div class="qty"><span class="num">' + K.fmtQty(D.total[it.id]) + '</span> <small>' + esc(unitOf(it)) + '</small></div>' + (st === 'het' ? badge(it.id) : '') + loaned + '</div>' + ic('chev', 'chev') + '</button>';
  }
  const SORTS = [['name', 'Tên A–Z'], ['recent', 'Ngày nhập gần nhất'], ['qty', 'Số lượng còn nhiều nhất'], ['value', 'Giá trị cao nhất']];
  function activeFilterCount() { const f = ui.items; return (f.categoryId ? 1 : 0) + (f.locPrefix ? 1 : 0) + (f.from || f.to ? 1 : 0); }
  function itemsHTML() {
    const f = ui.items;
    const seg = [['con', 'Còn hàng'], ['het', 'Đã hết'], ['all', 'Tất cả']].map(([k, l]) => '<button data-act="status" data-v="' + k + '" class="' + (f.status === k ? 'on' : '') + '" aria-pressed="' + (f.status === k) + '">' + l + '</button>').join('');
    const catLabel = f.categoryId ? (f.categoryId === '__none' ? 'Chưa phân loại' : (S.categories[f.categoryId] || {}).name || 'Loại hàng') : 'Loại hàng';
    const lp = f.locPrefix ? K.locationPrefixes(S).find(x => x.key === f.locPrefix) : null;
    const locLabel = f.locPrefix ? (lp ? lp.label : 'Vị trí') : 'Vị trí';
    const dateLabel = f.from || f.to ? (f.from ? K.fmtDate(f.from) : '…') + ' – ' + (f.to ? K.fmtDate(f.to) : '…') : 'Ngày nhập';
    const sortLabel = (SORTS.find(s => s[0] === f.sort) || SORTS[0])[1];
    const fc = (act, icn, label, set, aria) => '<button class="fchip' + (set ? ' set' : '') + '" data-act="' + act + '" aria-label="' + esc(aria) + '">' + ic(icn) + '<span>' + esc(label) + '</span>' + ic('chevd', 'cv') + '</button>';
    return '<header class="hdr sticky compact"><div class="hdr-row"><h1>Hàng hóa</h1><button class="add-btn" data-act="nhap" aria-label="Thêm mặt hàng">' + ic('plus') + '</button></div>' +
      '<div class="search"><span class="si">' + ic('search') + '</span><input id="items-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="Tìm tên hàng, vị trí…" value="' + esc(f.q) + '" aria-label="Tìm tên hàng, mã, vị trí, ghi chú"><button class="clr" data-act="items-clear" aria-label="Xóa tìm kiếm"' + (f.q ? '' : ' hidden') + '>' + ic('x') + '</button></div>' +
      '<div class="seg" role="group" aria-label="Trạng thái">' + seg + '</div></header>' +
      '<div class="wrap"><div class="toolbar">' +
      fc('f-cat', 'tag', catLabel, !!f.categoryId, 'Lọc theo loại hàng: ' + catLabel) +
      fc('f-loc', 'pin', locLabel, !!f.locPrefix, 'Lọc theo vị trí: ' + locLabel) +
      fc('f-date', 'cal', dateLabel, !!(f.from || f.to), 'Lọc theo ngày nhập') +
      fc('f-sort', 'sort', sortLabel, false, 'Sắp xếp: ' + sortLabel) + '</div>' +
      '<div id="items-list">' + itemsListHTML() + '</div></div>';
  }
  function itemsFilter() {
    const f = Object.assign({}, ui.items);
    if (f.categoryId === '__none') {
      const res = K.filterItems(S, D, Object.assign({}, f, { categoryId: '' }));
      return res.filter(it => !it.categoryId || !S.categories[it.categoryId]);
    }
    return K.filterItems(S, D, f);
  }
  function itemsListHTML() {
    if (!Object.keys(S.items).length) {
      return '<div class="card"><div class="empty"><div class="eic">' + ic('box') + '</div><h3>Chưa có mặt hàng nào</h3><p>Nhấn nút bên dưới để thêm món đồ đầu tiên vào kho.</p><button class="btn pri" data-act="nhap">' + ic('plus') + 'Thêm mặt hàng đầu tiên</button></div></div>';
    }
    const res = itemsFilter();
    if (!res.length) {
      let more = '';
      if (ui.items.status !== 'all') {
        const all = K.filterItems(S, D, Object.assign({}, ui.items, { status: 'all', categoryId: ui.items.categoryId === '__none' ? '' : ui.items.categoryId }));
        if (all.length) more = '<button class="btn sec" data-act="status" data-v="all">Xem ' + all.length + ' mặt hàng khớp trong “Tất cả”</button>';
      }
      return '<div class="card"><div class="empty"><div class="eic">' + ic('search') + '</div><h3>Không có mặt hàng phù hợp</h3><p>' + (ui.items.status === 'con' ? 'Danh sách đang chỉ hiện hàng còn trong kho.' : 'Thử bỏ bớt bộ lọc hoặc đổi từ khóa.') + '</p>' + more + (activeFilterCount() || ui.items.q ? '<button class="link" data-act="clear-filters">Xóa tìm kiếm và bộ lọc</button>' : '') + '</div></div>';
    }
    return '<div class="count-line"><span>' + res.length + ' mặt hàng</span>' + (activeFilterCount() ? '<button data-act="clear-filters">Bỏ lọc</button>' : '') + '</div><div class="rows" style="margin-top:8px">' + res.map(itemRowHTML).join('') + '</div>';
  }

  /* ================= CHI TIẾT ================= */
  function detailHTML(id) {
    const it = S.items[id], p = D.price[id], unit = unitOf(it);
    const st = D.stock[id] || {};
    const locs = Object.keys(st).filter(k => st[k] > 0).sort((a, b) => st[b] - st[a]);
    const loans = Object.values(D.loans).filter(l => l.itemId === id && l.outstanding > 0);
    const hist = S.movements.filter(m => m.itemId === id).sort((a, b) => b.date.localeCompare(a.date) || b.seq - a.seq);
    const hasStock = D.total[id] > 0;
    const valTxt = p.avg == null ? 'Chưa có giá' : K.fmtMoney(p.value);
    const valNote = p.avg == null ? 'Chưa đợt nhập nào có giá' : (p.unpricedBatches ? p.unpricedBatches + ' đợt chưa có giá' : 'Bình quân các đợt nhập');
    return '<header class="hdr sticky detail"><div class="hdr-row"><button class="hbtn plain" data-act="back" aria-label="Quay lại">' + ic('back') + '</button><h1>' + esc(it.name) + '</h1><button class="hbtn" data-act="edit-item" data-id="' + id + '" aria-label="Sửa thông tin">' + ic('edit') + '</button></div></header>' +
      '<div class="wrap">' +
      (it.thumb ? '<button class="photo-hero" data-act="zoom" data-id="' + id + '" aria-label="Phóng to ảnh"><img src="' + it.thumb + '" alt="" id="hero-img"><span class="zoom">' + ic('zoom') + 'Phóng to</span></button>'
        : '<button class="photo-hero" style="height:110px" data-act="edit-item" data-id="' + id + '">' + '<span style="display:flex;flex-direction:column;align-items:center;gap:6px;font-weight:600">' + ic('camera') + 'Thêm ảnh thực tế</span></button>') +
      '<div class="title-block"><h2>' + esc(it.name) + '</h2><div class="meta"><span class="num">Mã ' + esc(it.code) + '</span>' + (catOf(it) ? '<span>· ' + esc(catOf(it)) + '</span>' : '') + badge(id) + '</div></div>' +
      '<div class="card"><div class="kpis"><div class="kpi"><div class="k">Tổng tồn</div><div class="v">' + qu(D.total[id], it) + '</div><div class="n">' + (locs.length > 1 ? locs.length + ' vị trí' : locs.length ? '1 vị trí' : 'Không còn trong kho') + '</div></div>' +
      '<div class="kpi"><div class="k">Giá trị ước tính</div><div class="v num' + (p.avg == null ? '' : ' gold') + '" style="font-size:' + (valTxt.length > 12 ? 0.9375 : 1.125) + 'rem">' + valTxt + '</div><div class="n">' + esc(valNote) + '</div></div>' +
      '<div class="kpi"><div class="k">Đang cho mượn</div><div class="v" style="color:' + (D.loaned[id] > 0 ? 'var(--loan)' : 'inherit') + '">' + qu(D.loaned[id] || 0, it) + '</div><div class="n">' + (loans.length ? loans.length + ' lượt chưa trả' : 'Không có') + '</div></div></div></div>' +
      '<div class="actions4">' +
      '<button class="a4" data-act="nhap" data-id="' + id + '"><span class="act-ic t-nhap">' + ic('in') + '</span>Nhập thêm</button>' +
      '<button class="a4" data-act="xuat" data-id="' + id + '"' + (hasStock ? '' : ' disabled') + '><span class="act-ic t-xuat">' + ic('out') + '</span>Xuất kho</button>' +
      '<button class="a4" data-act="chuyen" data-id="' + id + '"' + (hasStock ? '' : ' disabled') + '><span class="act-ic t-chuyen">' + ic('move') + '</span>Chuyển vị trí</button>' +
      '<button class="a4" data-act="kiemke" data-id="' + id + '"><span class="act-ic t-kiemke">' + ic('count') + '</span>Kiểm kê</button></div>' +
      '<section class="sec"><h2>Số lượng theo vị trí</h2><div class="card">' +
      (locs.length ? locs.map(l => '<div class="locrow">' + ic('pin') + '<div class="p">' + esc(L(l)) + '</div><div class="qty">' + qu(st[l], it) + '</div></div>').join('')
        : '<div class="locrow">' + ic('info') + '<div class="p" style="color:var(--muted)">Đã xuất hết. Mặt hàng và lịch sử vẫn được giữ lại; nhấn “Nhập thêm” khi có hàng mới.</div></div>') + '</div></section>' +
      (loans.length ? '<section class="sec"><h2>Đang cho mượn</h2><div class="card">' + loans.map(l => '<div class="locrow">' + ic('user') + '<div class="p"><b>' + esc(l.recipient || 'Chưa ghi người mượn') + '</b><br><span class="hint">Mượn ' + K.fmtDate(l.date) + ' · còn giữ ' + K.fmtQty(l.outstanding) + '/' + K.fmtQty(l.qty) + ' ' + esc(unit) + '</span></div><button class="chip" data-act="nhanlai" data-id="' + l.id + '">' + ic('ret') + 'Nhận lại</button></div>').join('') + '</div></section>' : '') +
      '<section class="sec"><h2>Thông tin</h2><div class="card kv">' +
      '<div class="k">Đơn vị tính</div><div class="v">' + esc(unit) + '</div>' +
      '<div class="k">Giá ước tính / ' + esc(unit) + '</div><div class="v num">' + (p.avg == null ? 'Chưa có giá' : K.fmtMoney(p.avg)) + '</div>' +
      '<div class="k">Số đợt nhập</div><div class="v num">' + p.batches + '</div>' +
      '<div class="k">Nhập lần đầu</div><div class="v num">' + (D.firstIn[id] ? K.fmtDate(D.firstIn[id]) : '—') + '</div>' +
      '<div class="k">Nhập gần nhất</div><div class="v num">' + (D.lastIn[id] ? K.fmtDate(D.lastIn[id]) : '—') + '</div>' +
      '<div class="k">Ghi chú</div><div class="v">' + (it.note ? esc(it.note) : '<span style="color:var(--muted)">Không có</span>') + '</div></div></section>' +
      '<section class="sec"><h2>Lịch sử của mặt hàng <span style="text-transform:none;letter-spacing:0">' + hist.length + ' mục</span></h2><div class="card">' + hist.map(m => histRowHTML(m, false, false, true)).join('') + '</div></section>' +
      '</div>';
  }

  /* ================= LỊCH SỬ ================= */
  function histRowHTML(m, showItem, openItemOnTap, showDate) {
    const ds = K.describe(S, D, m);
    const it = S.items[m.itemId];
    const cls = ds.sign === '+' ? 'plus' : ds.sign === '−' ? 'minus' : '';
    const sub = [];
    if (showItem) sub.push(esc(ds.itemName));
    sub.push(esc(ds.where));
    if (showDate) sub.unshift(K.fmtDate(m.date));
    const meta = [timeOf(m)];
    return '<button class="row' + (ds.undone ? ' undone' : '') + '" data-act="' + (openItemOnTap ? 'open-item' : 'mv') + '" data-id="' + (openItemOnTap ? m.itemId : m.id) + '">' +
      '<span class="act-ic t-' + m.type + '">' + ic(TYPE_IC[m.type]) + '</span>' +
      '<div class="mid"><div class="t" style="white-space:normal">' + esc(ds.title) + (ds.undone ? ' · đã hoàn tác' : '') + '</div><div class="s" style="white-space:normal;display:block">' + sub.join(' · ') +
      (ds.extra.length ? '<br>' + esc(ds.extra.join(' · ')) : '') + (m.note ? '<br>Ghi chú: ' + esc(m.note) : '') + '</div></div>' +
      '<div class="end"><span class="sign num ' + cls + '">' + (ds.sign === '⇄' ? '' : ds.sign) + K.fmtQty(ds.qty) + '</span><span class="hint">' + esc(ds.unit) + '</span><span class="hint num">' + meta.join(' ') + '</span></div></button>';
  }
  const HTYPES = [['all', 'Tất cả'], ['nhap', 'Nhập'], ['xuat', 'Xuất'], ['nhan_lai', 'Nhận lại'], ['chuyen', 'Chuyển vị trí'], ['kiemke', 'Kiểm kê'], ['hoantac', 'Hoàn tác']];
  function historyHTML() {
    const f = ui.hist;
    const list = K.filterHistory(S, D, f);
    const nf = (f.itemId ? 1 : 0) + (f.from || f.to ? 1 : 0);
    let body = '';
    if (!S.movements.length) body = '<div class="card"><div class="empty"><div class="eic">' + ic('clock') + '</div><h3>Chưa có hoạt động</h3><p>Mỗi lần nhập, xuất, cho mượn, chuyển vị trí hay kiểm kê đều được ghi lại ở đây.</p><button class="btn pri" data-act="nhap">' + ic('plus') + 'Thêm mặt hàng đầu tiên</button></div></div>';
    else if (!list.length) body = '<div class="card"><div class="empty"><div class="eic">' + ic('filter') + '</div><h3>Không có hoạt động phù hợp</h3><p>Thử đổi loại hoạt động hoặc khoảng thời gian.</p><button class="link" data-act="hist-clear">Bỏ bộ lọc</button></div></div>';
    else {
      let cur = '', out = '';
      list.slice(0, ui.histLimit).forEach(m => {
        if (m.date !== cur) { if (cur) out += '</div>'; cur = m.date; out += '<div class="day">' + dayLabel(m.date) + '</div><div class="card">'; }
        out += histRowHTML(m, true, false);
      });
      body = '<div class="count-line">' + list.length + ' hoạt động</div><div>' + out + '</div></div>' + (list.length > ui.histLimit ? '<button class="btn ghost" data-act="hist-more">Xem thêm</button>' : '');
    }
    const chips = [];
    if (f.itemId && S.items[f.itemId]) chips.push(['itemId', ic('box') + esc(S.items[f.itemId].name)]);
    if (f.from || f.to) chips.push(['date', (f.from ? 'Từ ' + K.fmtDate(f.from) : '') + (f.to ? ' đến ' + K.fmtDate(f.to) : '')]);
    return '<header class="hdr sticky compact"><div class="hdr-row"><h1>Lịch sử</h1><button class="hbtn" data-act="hist-filter" aria-label="Bộ lọc">' + ic('filter') + '</button></div></header>' +
      '<div class="wrap"><div class="chips">' + HTYPES.map(([k, l]) => '<button class="chip' + (f.type === k ? ' on' : '') + '" data-act="htype" data-v="' + k + '">' + l + '</button>').join('') + '</div>' +
      '<div class="toolbar"><button class="chip' + (nf ? ' on' : '') + '" data-act="hist-filter">' + ic('filter') + 'Mặt hàng, thời gian' + (nf ? ' <b>' + nf + '</b>' : '') + '</button></div>' +
      (chips.length ? '<div class="chips">' + chips.map(([k, l]) => '<button class="chip on" data-act="hist-rm" data-k="' + k + '">' + l + ' ' + ic('x') + '</button>').join('') + '</div>' : '') +
      body + '</div>';
  }

  /* ================= CÀI ĐẶT ================= */
  function settingsHTML() {
    const nItems = Object.keys(S.items).length;
    const last = S.meta.lastBackup ? new Date(S.meta.lastBackup) : null;
    const row = (act, icn, t, s, extra) => '<button class="setting" data-act="' + act + '"' + (extra || '') + '><span class="act-ic t-chuyen">' + ic(icn) + '</span><div class="mid"><div class="t">' + t + '</div>' + (s ? '<div class="s">' + s + '</div>' : '') + '</div>' + ic('chev', 'chev') + '</button>';
    return '<header class="hdr sticky compact"><div class="hdr-row"><h1>Cài đặt</h1></div></header><div class="wrap">' +
      '<section class="sec"><h2>Danh mục</h2><div class="card">' +
      row('mg-cat', 'tag', 'Loại hàng', Object.keys(S.categories).length + ' loại') +
      row('mg-unit', 'unit', 'Đơn vị tính', Object.keys(S.units).length + ' đơn vị') +
      row('mg-loc', 'pin', 'Vị trí cất', (Object.keys(S.locations).length - 1) + ' vị trí · Kho → Kệ → Tầng → Hộp') + '</div></section>' +
      '<section class="sec"><h2>Dữ liệu</h2><div class="card">' +
      row('backup', 'save', 'Sao lưu', last ? 'Gần nhất: ' + last.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'Chưa sao lưu lần nào') +
      row('restore', 'restore', 'Khôi phục từ tệp sao lưu', 'Thay thế dữ liệu hiện có') +
      row('export', 'table', 'Xuất Excel / CSV', 'Danh sách tồn kho và lịch sử') + '</div></section>' +
      '<section class="sec"><h2>Trợ giúp</h2><div class="card">' +
      row('guide', 'book', 'Hướng dẫn sử dụng', 'Nhập, xuất, cho mượn, sao lưu') +
      row('storage', 'disk', 'Bộ nhớ trên máy', 'Dung lượng và độ bền dữ liệu') + '</div></section>' +
      '<section class="sec"><h2>Nâng cao</h2><div class="card"><button class="setting" data-act="wipe"><span class="act-ic" style="background:var(--danger-soft);color:var(--danger)">' + ic('trash') + '</span><div class="mid"><div class="t" style="color:var(--danger)">Xóa toàn bộ dữ liệu</div><div class="s">' + nItems + ' mặt hàng, ' + S.movements.length + ' hoạt động</div></div></button></div></section>' +
      '<p class="hint foot-note">Kho Của Tôi · phiên bản ' + APP_VERSION + ' · dữ liệu lưu trên thiết bị này</p></div>';
  }

  /* ================= sự kiện khung ================= */
  function bindUX() {
    // Chống bấm xác nhận nhiều lần khi đang lưu
    document.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (saving && b && b.closest('.sheet, .dialog-wrap')) { e.stopPropagation(); e.preventDefault(); return; }
      if (b) lastBtn = b;
    }, true);
    // Ô số lượng: chạm để nhập, chọn sẵn số cũ
    document.addEventListener('focusin', e => {
      const t = e.target;
      if (t.matches && t.matches('.qbox input')) setTimeout(() => { try { t.select(); } catch (er) { } }, 0);
      // Giữ ô đang nhập không bị bàn phím che
      if (t.matches && t.matches('input, textarea, select') && t.closest('.sh-body, .dialog')) setTimeout(() => t.scrollIntoView({ block: 'center', behavior: 'smooth' }), 280);
    });
    // Bàn phím iPhone: nâng biểu mẫu lên đúng phần màn hình còn nhìn thấy
    const vv = window.visualViewport;
    if (vv) {
      const fit = () => {
        const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        document.documentElement.style.setProperty('--kb', (kb > 80 ? kb : 0) + 'px');
        document.body.classList.toggle('kbopen', kb > 80);
      };
      vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit);
    }
  }
  function bindGlobal() {
    $('#tabbar').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) go(b.dataset.tab); });
    const v = $('#view');
    v.addEventListener('click', e => {
      const t = e.target.closest('[data-tab]'); if (t) return go(t.dataset.tab);
      const a = e.target.closest('[data-act]'); if (!a) return;
      const id = a.dataset.id;
      switch (a.dataset.act) {
        case 'nhap': return sheetNhap(id);
        case 'xuat': return sheetXuat(id);
        case 'chuyen': return sheetChuyen(id);
        case 'kiemke': return sheetKiemKe(id);
        case 'nhanlai': return sheetNhanLai(id);
        case 'open-item': return openItem(id);
        case 'back': ui.detail = null; return render();
        case 'edit-item': return sheetEditItem(id);
        case 'zoom': return showPhoto(id);
        case 'mv': return sheetMovement(id);
        case 'home-clear': ui.homeQ = ''; return render();
        case 'home-to-items': ui.items.q = ui.homeQ; ui.items.status = 'all'; ui.homeQ = ''; return go('items');
        case 'hide-install': lsSet('hideInstall', '1'); return refresh();
        case 'by-cat': Object.assign(ui.items, { categoryId: id, locPrefix: '', q: '', status: 'con' }); return go('items');
        case 'by-loc': Object.assign(ui.items, { locPrefix: a.dataset.key, categoryId: '', q: '', status: 'con' }); return go('items');
        case 'items-clear': ui.items.q = ''; return refresh();
        case 'status': ui.items.status = a.dataset.v; return refresh();
        case 'item-filter': case 'f-date': return sheetItemFilter();
        case 'f-cat': return pickOption({ title: 'Lọc theo loại hàng', current: ui.items.categoryId, options: [['', 'Tất cả loại hàng']].concat(Object.values(S.categories).sort((x, y) => (x.order || 0) - (y.order || 0)).map(c => [c.id, c.name]), [['__none', 'Chưa phân loại']]), onPick: v => { ui.items.categoryId = v; refresh(); } });
        case 'f-loc': return pickOption({ title: 'Lọc theo vị trí', current: ui.items.locPrefix, icon: 'pin', options: [['', 'Mọi vị trí']].concat(K.locationPrefixes(S).map(x => [x.key, x.label, x.depth > 1 ? 'Gồm cả các cấp bên trong' : 'Cả kho'])), onPick: v => { ui.items.locPrefix = v; refresh(); }, empty: 'Chưa có vị trí nào. Vị trí được tạo khi bạn nhập kho.' });
        case 'f-sort': return pickOption({ title: 'Sắp xếp', current: ui.items.sort, icon: 'sort', options: SORTS, onPick: v => { ui.items.sort = v; lsSet('sort', v); refresh(); } });
        case 'rm-filter': if (a.dataset.k === 'date') { ui.items.from = ui.items.to = ''; } else ui.items[a.dataset.k] = ''; return refresh();
        case 'clear-filters': Object.assign(ui.items, { q: '', categoryId: '', locPrefix: '', from: '', to: '' }); return refresh();
        case 'htype': ui.hist.type = a.dataset.v; ui.histLimit = 120; return refresh();
        case 'hist-filter': return sheetHistFilter();
        case 'hist-rm': if (a.dataset.k === 'date') { ui.hist.from = ui.hist.to = ''; } else ui.hist[a.dataset.k] = ''; return refresh();
        case 'hist-clear': ui.hist = { type: 'all', itemId: '', from: '', to: '' }; return refresh();
        case 'hist-more': ui.histLimit += 200; return refresh();
        case 'mg-cat': return sheetManageSimple('categories');
        case 'mg-unit': return sheetManageSimple('units');
        case 'mg-loc': return sheetManageLocations();
        case 'backup': return sheetBackup();
        case 'restore': return startRestore();
        case 'export': return sheetExport();
        case 'guide': return sheetGuide();
        case 'storage': return sheetStorage();
        case 'wipe': return wipeAll();
      }
    });
    v.addEventListener('input', e => {
      if (e.target.id === 'home-q') {
        ui.homeQ = e.target.value;
        $('#home-body').innerHTML = homeBodyHTML();
        $('[data-act="home-clear"]').hidden = !ui.homeQ;
      } else if (e.target.id === 'items-q') {
        ui.items.q = e.target.value;
        $('#items-list').innerHTML = itemsListHTML();
        $('[data-act="items-clear"]').hidden = !ui.items.q;
      }
    });
    v.addEventListener('change', e => {
      if (e.target.id === 'items-sort') { ui.items.sort = e.target.value; lsSet('sort', e.target.value); $('#items-list').innerHTML = itemsListHTML(); }
    });
    v.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.type === 'search') e.target.blur(); });
  }

  /* ================= các trường dùng chung trong biểu mẫu ================= */
  function stepper(id, val) {
    return '<div class="qbox"><button type="button" data-step="-1" data-for="' + id + '" aria-label="Bớt 1">' + ic('minus') + '</button><input class="num" id="' + id + '" inputmode="decimal" enterkeyhint="done" autocomplete="off" value="' + esc(val) + '" placeholder="0" aria-label="Số lượng, chạm để nhập"><button type="button" data-step="1" data-for="' + id + '" aria-label="Thêm 1">' + ic('plus') + '</button></div>';
  }
  function bindSteppers(root, onChange) {
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-step]'); if (!b) return;
      const inp = document.getElementById(b.dataset.for);
      const cur = K.parseQty(inp.value);
      const nv = Math.max(0, (Number.isFinite(cur) ? cur : 0) + Number(b.dataset.step));
      inp.value = K.r6(nv); onChange && onChange();
    });
  }
  function chipsSelect(kind, selected, allowNone) {
    const list = Object.values(S[kind]).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'vi'));
    return '<div class="wrapchips" data-kind="' + kind + '">' + (allowNone ? '<button type="button" class="chip' + (!selected ? ' on' : '') + '" data-pick="' + kind + '" data-v="">Không chọn</button>' : '') +
      list.map(x => '<button type="button" class="chip' + (selected === x.id ? ' on' : '') + '" data-pick="' + kind + '" data-v="' + x.id + '">' + esc(x.name) + '</button>').join('') +
      '<button type="button" class="chip add" data-addlist="' + kind + '">' + ic('plus') + 'Thêm</button></div>';
  }
  async function addListEntry(kind) {
    const label = kind === 'units' ? 'đơn vị tính' : 'loại hàng';
    const v = await promptBox({ title: 'Thêm ' + label, placeholder: kind === 'units' ? 'Ví dụ: thùng' : 'Ví dụ: Đồ thể thao', ok: 'Thêm', validate: v => !v ? 'Hãy nhập tên.' : Object.values(S[kind]).some(x => K.norm(x.name) === K.norm(v)) ? 'Tên này đã có.' : null });
    if (!v) return null;
    const id = K.uid(kind === 'units' ? 'unit' : 'cat');
    const rec = { id, name: v.trim(), order: Object.keys(S[kind]).length + 100 };
    const ok = await safe(() => commit({ [kind]: [rec] }));
    if (ok === false) return null;
    toast('Đã thêm ' + label + ' “' + rec.name + '”');
    return id;
  }
  function photoBlock(src) {
    return '<div class="field"><span class="flabel">Ảnh thực tế <span class="opt">không bắt buộc</span></span><div class="photo-pick">' +
      (src ? '<img class="pv" src="' + src + '" alt="Ảnh mặt hàng">' : '<span class="pv">' + ic('image') + '</span>') +
      '<div class="bt"><button type="button" class="btn sec" data-photo="camera">' + ic('camera') + 'Chụp ảnh</button><button type="button" class="btn ghost" data-photo="library">' + ic('image') + (src ? 'Đổi ảnh từ thư viện' : 'Chọn từ thư viện') + '</button>' + (src ? '<button type="button" class="link" data-photo="remove" style="align-self:flex-start">Bỏ ảnh</button>' : '') + '</div></div><span class="hint">Ảnh được tự thu nhỏ để tiết kiệm bộ nhớ.</span></div>';
  }
  function locButton(id, locId, label) {
    return '<div class="field"><span class="flabel">' + (label || 'Vị trí cất') + '</span><button type="button" class="pick" data-act="pickloc" data-target="' + id + '">' + ic('pin') + '<span class="p">' + esc(L(locId)) + '</span>' + ic('chev', 'chev') + '</button></div>';
  }
  function locOptions(itemId, selected, name) {
    const st = D.stock[itemId] || {};
    const ids = Object.keys(st).filter(k => st[k] > 0).sort((a, b) => st[b] - st[a]);
    const it = S.items[itemId];
    return '<div class="card">' + ids.map(l => '<button type="button" class="loc-opt' + (selected === l ? ' on' : '') + '" data-' + name + '="' + l + '">' + ic('pin') + '<span class="p">' + esc(L(l)) + '<small>Đang có ' + K.fmtQty(st[l]) + ' ' + esc(unitOf(it)) + '</small></span>' + (selected === l ? ic('check', 'ck') : '') + '</button>').join('') + '</div>';
  }
  function itemCard(it, changeAct, locId) {
    return '<div class="sel-item">' + thumb(it) + '<div class="mid"><div class="t">' + esc(it.name) + '</div><div class="s">Hiện có: <b class="num">' + K.fmtQty(D.total[it.id]) + ' ' + esc(unitOf(it)) + '</b></div><div class="s">' + esc(locId ? L(locId) : locShort(it)) + '</div></div>' + (changeAct ? '<button type="button" class="pill" data-act="' + changeAct + '">Đổi</button>' : '') + '</div>';
  }


  /* ---------- chọn vị trí ---------- */
  function pickLocation(o) {
    const sh = openSheet({ title: o.title || 'Chọn vị trí', full: true, foot: false });
    let q = '', creating = false;
    const levelVals = k => Array.from(new Set(Object.values(S.locations).map(l => (l[k] || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
    const draw = () => {
      const all = sortedLocations().filter(l => !o.exclude || l.id !== o.exclude);
      const nq = K.norm(q);
      const list = all.filter(l => !nq || K.norm(K.locPath(l)).includes(nq));
      const stock = o.itemId ? (D.stock[o.itemId] || {}) : {};
      const opt = l => '<button type="button" class="loc-opt' + (o.current === l.id ? ' on' : '') + '" data-pickloc="' + l.id + '">' + ic('pin') + '<span class="p">' + esc(K.locPath(l)) + (stock[l.id] ? '<small>Mặt hàng này đang có ' + K.fmtQty(stock[l.id]) + '</small>' : '') + '</span>' + (o.current === l.id ? ic('check', 'ck') : '') + '</button>';
      sh.body.innerHTML =
        '<div class="card" style="padding:14px;display:flex;flex-direction:column;gap:10px"><div class="flabel">Tạo vị trí mới <span class="opt">không cần đủ 4 cấp</span></div>' +
        '<div class="grid2">' + [['kho', 'Kho', 'Kho nhà'], ['ke', 'Kệ', 'Kệ A'], ['tang', 'Tầng', 'Tầng 2'], ['hop', 'Hộp', 'Hộp 03']].map(([k, lab, ph]) =>
          '<div class="field"><label for="nl-' + k + '">' + lab + '</label><input class="inp" id="nl-' + k + '" list="dl-' + k + '" placeholder="' + ph + '" autocomplete="off"><datalist id="dl-' + k + '">' + levelVals(k).map(v => '<option value="' + esc(v) + '">').join('') + '</datalist></div>').join('') + '</div>' +
        '<div class="ferr" hidden></div><button type="button" class="btn sec" data-act="newloc">' + ic('plus') + 'Dùng vị trí này</button></div>' +
        (all.length > 6 ? '<input class="inp" id="loc-q" type="search" placeholder="Tìm vị trí đã có…" value="' + esc(q) + '" autocomplete="off">' : '') +
        '<div class="flabel">Vị trí đã có</div><div class="card">' +
        (o.exclude === K.NONE_LOC ? '' : opt(S.locations[K.NONE_LOC])) + list.map(opt).join('') + '</div>' +
        (!list.length && all.length ? '<p class="hint">Không có vị trí khớp “' + esc(q) + '”.</p>' : '');
      const lq = $('#loc-q', sh.body);
      if (lq && creating === 'focus') { lq.focus(); creating = false; }
    };
    draw();
    sh.body.addEventListener('input', e => { if (e.target.id === 'loc-q') { q = e.target.value; const pos = e.target.selectionStart; creating = 'focus'; draw(); const n = $('#loc-q', sh.body); if (n) n.setSelectionRange(pos, pos); } });
    sh.body.addEventListener('click', async e => {
      const p = e.target.closest('[data-pickloc]');
      if (p) { sh.close(); o.onPick(p.dataset.pickloc); return; }
      if (e.target.closest('[data-act="newloc"]')) {
        const v = {}; ['kho', 'ke', 'tang', 'hop'].forEach(k => v[k] = $('#nl-' + k, sh.body).value.trim());
        if (!v.kho && !v.ke && !v.tang && !v.hop) return sh.err('Hãy nhập ít nhất một cấp, ví dụ tên kho.');
        if (o.exclude) { const ex = K.findLocation(S, v); if (ex && ex.id === o.exclude) return sh.err('Vị trí đích phải khác vị trí nguồn.'); }
        let loc = K.findLocation(S, v);
        if (!loc) {
          loc = Object.assign({ id: K.uid('loc'), createdAt: new Date().toISOString() }, v);
          if (await safe(() => commit({ locations: [loc] })) === false) return;
        }
        sh.close(); o.onPick(loc.id);
      }
    });
  }

  /* ================= NHẬP KHO ================= */
  function sheetNhap(prefItemId) {
    const sh = openSheet({ title: prefItemId ? 'Nhập thêm' : 'Nhập kho', full: true });
    const startItem = prefItemId && S.items[prefItemId] ? prefItemId : null;
    const f = {
      itemId: startItem, name: '', code: K.nextCode(S), categoryId: '', unitId: S.meta.lastUnitId && S.units[S.meta.lastUnitId] ? S.meta.lastUnitId : (Object.values(S.units)[0] || {}).id,
      photo: null, itemNote: '', qty: '1', price: '', date: K.todayISO(), note: '', forceNew: false,
      locId: (startItem && mainLoc(startItem)) || (S.meta.lastLocId && S.locations[S.meta.lastLocId] ? S.meta.lastLocId : K.NONE_LOC)
    };
    const lastPrice = id => { const b = S.movements.filter(m => m.type === 'nhap' && m.itemId === id && m.price != null && !D.undone[m.id]).pop(); return b ? b.price : null; };
    if (startItem && lastPrice(startItem) != null) f.price = fmtPriceInput(lastPrice(startItem));

    const draw = () => {
      const it = f.itemId ? S.items[f.itemId] : null;
      let h = '';
      if (it) h += '<div class="field"><span class="flabel">Mặt hàng</span>' + itemCard(it, prefItemId ? '' : 'n-change') + '</div>';
      else {
        h += '<div class="field"><label for="n-name">Tên mặt hàng</label><input class="inp" id="n-name" value="' + esc(f.name) + '" placeholder="Ví dụ: Pin AA Panasonic" autocomplete="off" autocapitalize="sentences"><div id="n-sugg"></div></div>';
        h += photoBlock(f.photo && f.photo.thumb);
        h += '<div class="field"><span class="flabel">Đơn vị tính</span>' + chipsSelect('units', f.unitId) + '</div>';
        h += '<div class="field"><span class="flabel">Loại hàng <span class="opt">không bắt buộc</span></span>' + chipsSelect('categories', f.categoryId, true) + '</div>';
        h += '<div class="field"><label for="n-code">Mã hàng <span class="opt">tự tạo, sửa được</span></label><input class="inp num" id="n-code" value="' + esc(f.code) + '" autocomplete="off" autocapitalize="characters"></div>' + dateInput('n-date', 'Ngày nhập', f.date);
        h += '<div class="field"><label for="n-inote">Ghi chú mặt hàng <span class="opt">không bắt buộc</span></label><textarea class="inp" id="n-inote" rows="2" placeholder="Model, màu sắc, bảo hành…">' + esc(f.itemNote) + '</textarea></div>';
        h += '<div class="flabel" style="margin-top:4px;border-top:1px solid var(--line);padding-top:14px">Đợt nhập này</div>';
      }
      const unit = it ? unitOf(it) : (S.units[f.unitId] || {}).name || '';
      h += '<div class="field"><span class="flabel">Số lượng nhập <span class="opt" id="n-unit">' + esc(unit) + '</span></span>' + stepper('n-qty', f.qty) + '</div>';
      h += '<div class="field"><label for="n-price">Giá ước tính / ' + esc(unit || 'đơn vị') + ' <span class="opt">không bắt buộc</span></label><div class="ifield">' + ic('coin') + '<input class="inp num" id="n-price" inputmode="numeric" value="' + esc(f.price) + '" placeholder="Chưa biết thì để trống" autocomplete="off"></div><span class="hint">Tính bằng VNĐ. Để trống sẽ hiện “Chưa có giá”, không tính là 0 đồng.</span></div>';
      if (it) h += dateInput('n-date', 'Ngày nhập', f.date);
      h += locButton('n-loc', f.locId);
      h += '<div class="field"><label for="n-note">Ghi chú đợt nhập <span class="opt">không bắt buộc</span></label><input class="inp" id="n-note" value="' + esc(f.note) + '" placeholder="Mua ở đâu, ai tặng…" autocomplete="off"></div>';
      sh.body.innerHTML = h;
      sh.foot.innerHTML = '<div class="ferr" hidden></div><div class="btn-row"><button class="btn sec" data-act="n-save-more" style="flex:0 0 42%;font-size:.9375rem">Lưu &amp; nhập tiếp</button><button class="btn pri" data-act="n-save">' + ic('check') + 'Lưu nhập kho</button></div>';
    };
    const sugg = () => {
      const box = $('#n-sugg', sh.body); if (!box) return;
      const r = K.suggestItems(S, f.name, 5);
      box.innerHTML = r.length ? '<div class="suggest"><div class="head">Đã có trong kho · chọn để nhập thêm</div>' + r.map(x => '<button type="button" class="row" data-choose="' + x.item.id + '">' + thumb(x.item) + '<div class="mid"><div class="t">' + esc(x.item.name) + '</div><div class="s num">Mã ' + esc(x.item.code) + ' · ' + esc(locSummary(x.item)) + '</div></div><div class="end"><div class="qty">' + qu(D.total[x.item.id], x.item) + '</div>' + badge(x.item.id) + '</div></button>').join('') + '</div>' : '';
    };
    draw();
    bindSteppers(sh.body, () => { f.qty = $('#n-qty', sh.body).value; });
    sh.body.addEventListener('input', e => {
      const t = e.target;
      if (t.id === 'n-name') { f.name = t.value; f.forceNew = false; sugg(); }
      else if (t.id === 'n-code') f.code = t.value;
      else if (t.id === 'n-inote') f.itemNote = t.value;
      else if (t.id === 'n-qty') f.qty = t.value;
      else if (t.id === 'n-price') { t.value = fmtPriceInput(t.value); f.price = t.value; }
      else if (t.id === 'n-date') f.date = t.value;
      else if (t.id === 'n-note') f.note = t.value;
    });
    sh.body.addEventListener('change', e => { if (e.target.id === 'n-date') f.date = e.target.value; });
    sh.body.addEventListener('click', async e => {
      const ch = e.target.closest('[data-choose]');
      if (ch) { f.itemId = ch.dataset.choose; const ml = mainLoc(f.itemId); if (ml) f.locId = ml; const lp = lastPrice(f.itemId); if (lp != null && !f.price) f.price = fmtPriceInput(lp); draw(); return; }
      if (e.target.closest('[data-act="n-change"]')) { f.itemId = null; draw(); return; }
      const pk = e.target.closest('[data-pick]');
      if (pk) { if (pk.dataset.pick === 'units') f.unitId = pk.dataset.v; else f.categoryId = pk.dataset.v; draw(); return; }
      const al = e.target.closest('[data-addlist]');
      if (al) { const id = await addListEntry(al.dataset.addlist); if (id) { if (al.dataset.addlist === 'units') f.unitId = id; else f.categoryId = id; } draw(); return; }
      const ph = e.target.closest('[data-photo]');
      if (ph) {
        if (ph.dataset.photo === 'remove') { f.photo = null; draw(); return; }
        const r = await getPhotoFromUser(ph.dataset.photo); if (r) { f.photo = r; draw(); } return;
      }
      if (e.target.closest('[data-act="pickloc"]')) pickLocation({ current: f.locId, itemId: f.itemId, onPick: id => { f.locId = id; draw(); } });
    });
    sh.foot.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'n-save' || b.dataset.act === 'n-save-more') save(b.dataset.act === 'n-save-more', b);
    });
    async function save(more, btn) {
      sh.err('');
      let item = f.itemId ? S.items[f.itemId] : null, newItem = null;
      if (!item) {
        const name = f.name.trim();
        if (!name) { sh.err('Hãy nhập tên mặt hàng.'); $('#n-name', sh.body).classList.add('err'); return; }
        const exact = K.suggestItems(S, name, 3).find(x => x.exact);
        if (exact && !f.forceNew) {
          const r = await confirmBox({ title: 'Mặt hàng đã có', msg: '“' + exact.item.name + '” (mã ' + exact.item.code + ') đã có trong kho, hiện còn ' + K.fmtQty(D.total[exact.item.id]) + ' ' + unitOf(exact.item) + '.\nBạn muốn nhập thêm vào mặt hàng này?', ok: 'Nhập thêm vào mặt hàng có sẵn', extra: 'Vẫn tạo mặt hàng mới', cancel: 'Quay lại' });
          if (r === 'ok') { f.itemId = exact.item.id; const ml = mainLoc(f.itemId); if (ml) f.locId = ml; draw(); return; }
          if (r !== 'extra') return;
          f.forceNew = true;
        }
        const now = new Date().toISOString();
        newItem = { id: K.uid('it'), code: f.code.trim(), name, categoryId: f.categoryId || '', unitId: f.unitId, note: f.itemNote.trim(), thumb: f.photo ? f.photo.thumb : null, createdAt: now, updatedAt: now };
        const ve = K.validateItem(S, newItem); if (ve) return sh.err(ve);
        item = newItem;
      }
      if (newItem) S.items[newItem.id] = newItem;
      const res = K.ops.nhap(S, D, { itemId: item.id, locId: f.locId, qty: f.qty, price: f.price, date: f.date, note: f.note });
      if (newItem) delete S.items[newItem.id];
      if (!res.ok) return sh.err(res.error);
      btn.disabled = true;
      const meta = { lastLocId: f.locId, lastUnitId: item.unitId };
      if (newItem) { const mm = /^MH(\d+)$/i.exec(newItem.code); if (mm) meta.codeSeq = Math.max(S.meta.codeSeq || 0, Number(mm[1])); }
      const ok = await safe(() => commit({ items: newItem ? [newItem] : [], movements: [res.movement], photos: newItem && f.photo ? { [newItem.id]: f.photo.full } : null, meta }));
      btn.disabled = false;
      if (ok === false) return;
      DB.persist();
      const wasOut = !newItem && D.total[item.id] === res.movement.qty;
      toast('Đã nhập ' + K.fmtQty(res.movement.qty) + ' ' + unitOf(item) + ' “' + item.name + '”' + (wasOut ? ' · chuyển lại Còn hàng' : ''));
      refresh();
      if (more) {
        Object.assign(f, { itemId: prefItemId && S.items[prefItemId] ? prefItemId : null, name: '', code: K.nextCode(S), photo: null, itemNote: '', qty: '1', price: '', note: '', forceNew: false, categoryId: '' });
        draw(); sh.body.scrollTop = 0;
        const n = $('#n-name', sh.body); if (n) n.focus();
      } else sh.close();
    }
  }

  /* ================= XUẤT KHO ================= */
  function sheetXuat(prefItemId) {
    const sh = openSheet({ title: 'Xuất kho', full: true });
    const f = { itemId: prefItemId && S.items[prefItemId] && D.total[prefItemId] > 0 ? prefItemId : null, locId: null, qty: '', reason: 'su_dung', recipient: '', date: K.todayISO(), note: '', q: '' };
    const locsOf = () => { const s = D.stock[f.itemId] || {}; return Object.keys(s).filter(k => s[k] > 0); };
    const autoLoc = () => { const ids = locsOf(); f.locId = ids.length === 1 ? ids[0] : (ids.includes(f.locId) ? f.locId : null); };
    if (f.itemId) autoLoc();
    const chooser = () => {
      const res = K.filterItems(S, D, { q: f.q, status: 'con', sort: 'name' });
      return res.length ? '<div class="rows">' + res.slice(0, 60).map(it => '<button type="button" class="row" data-choose="' + it.id + '">' + thumb(it) + '<div class="mid"><div class="t">' + esc(it.name) + '</div><div class="s">' + ic('pin') + esc(locShort(it)) + '</div></div><div class="end"><div class="qty">' + qu(D.total[it.id], it) + '</div></div>' + ic('chev', 'chev') + '</button>').join('') + '</div>'
        : '<div class="card"><div class="empty"><div class="eic">' + ic('box') + '</div><h3>' + (Object.keys(S.items).length ? 'Không có hàng phù hợp' : 'Kho đang trống') + '</h3><p>' + (Object.keys(S.items).length ? 'Chỉ hàng còn trong kho mới xuất được.' : 'Hãy nhập kho trước khi xuất.') + '</p></div></div>';
    };
    const recLabel = () => f.reason === 'cho_muon' ? 'Người mượn' : f.reason === 'chuyen_di' ? 'Nơi nhận' : 'Người nhận';
    const draw = () => {
      const it = f.itemId ? S.items[f.itemId] : null;
      if (!it) {
        sh.body.innerHTML = '<div class="field"><label for="x-q">Chọn mặt hàng cần xuất</label><div class="ifield">' + ic('search') + '<input class="inp" id="x-q" type="search" placeholder="Tìm tên hàng, vị trí…" value="' + esc(f.q) + '" autocomplete="off"></div></div><div id="x-list">' + chooser() + '</div>';
        sh.foot.innerHTML = '<div class="why">' + ic('info') + '<span>Chọn một mặt hàng để tiếp tục</span></div>';
        return;
      }
      const many = locsOf().length > 1;
      sh.body.innerHTML = itemCard(it, prefItemId ? '' : 'x-change', many ? null : f.locId) +
        (many ? '<div class="field"><span class="flabel">Lấy từ vị trí</span>' + locOptions(it.id, f.locId, 'xloc') + '</div>' : '') +
        '<div class="field"><div class="flabel"><span>Số lượng xuất</span><button type="button" class="pill" data-act="x-all">Xuất hết</button></div>' + stepper('x-qty', f.qty) + '<div class="after" id="x-after" aria-live="polite"></div></div>' +
        dateInput('x-date', 'Ngày xuất', f.date) +
        '<div class="field"><span class="flabel">Lý do xuất</span><div class="wrapchips" role="radiogroup" aria-label="Lý do xuất">' + Object.entries(K.REASONS).map(([k, l]) => '<button type="button" role="radio" aria-checked="' + (f.reason === k) + '" class="chip' + (f.reason === k ? ' on' : '') + '" data-reason="' + k + '">' + l + '</button>').join('') + '</div>' +
        (f.reason === 'cho_muon' ? '<span class="hint">Hàng cho mượn được trừ khỏi kho và hiện ở mục “Đang cho mượn” cho đến khi bạn nhận lại.</span>' : '') +
        (f.reason === 'chuyen_di' ? '<span class="hint">“Chuyển đi” là đưa ra khỏi kho. Để đổi chỗ cất trong kho, dùng “Chuyển vị trí”.</span>' : '') + '</div>' +
        '<div class="field"><label for="x-rec">' + recLabel() + ' <span class="opt">không bắt buộc</span></label><div class="ifield">' + ic('user') + '<input class="inp" id="x-rec" value="' + esc(f.recipient) + '" autocomplete="off" enterkeyhint="next" placeholder="Nhập tên ' + recLabel().toLowerCase() + '…"></div></div>' +
        '<div class="field"><label for="x-note">Ghi chú <span class="opt">không bắt buộc</span></label><div class="ifield">' + ic('note') + '<textarea class="inp" id="x-note" rows="2" placeholder="Nhập ghi chú…">' + esc(f.note) + '</textarea></div></div>';
      sh.foot.innerHTML = '<div class="ferr" hidden></div><div class="why" id="x-why" hidden></div><button class="btn pri" data-act="x-save">' + ic('out') + '<span id="x-btn">Xác nhận xuất</span></button>';
      preview();
    };
    const block = (btn, why, label) => {
      btn.disabled = true; $('#x-btn').textContent = label || 'Xác nhận xuất';
      const w = $('#x-why', sh.foot); w.hidden = false; w.innerHTML = ic('info') + '<span>' + esc(why) + '</span>';
    };
    const preview = () => {
      const it = S.items[f.itemId]; if (!it) return;
      const box = $('#x-after', sh.body), btn = $('[data-act="x-save"]', sh.foot), w = $('#x-why', sh.foot);
      const q = K.parseQty(f.qty), u = esc(unitOf(it));
      if (!f.locId) { box.innerHTML = ''; return block(btn, 'Chọn vị trí lấy hàng ở trên.'); }
      const have = K.qtyAt(D, it.id, f.locId), T = D.total[it.id], many = locsOf().length > 1;
      if (!Number.isFinite(q) || q <= 0) {
        box.className = 'after'; box.innerHTML = '<span>Đang có ' + (many ? 'tại vị trí này ' : '') + '<b class="num">' + K.fmtQty(have) + ' ' + u + '</b></span>';
        return block(btn, f.qty === '' ? 'Nhập số lượng cần xuất.' : 'Số lượng phải lớn hơn 0.');
      }
      if (q > have + 1e-9) {
        box.className = 'after bad'; box.innerHTML = ic('alert') + '<span>Vượt quá số đang có: ' + (many ? 'vị trí này ' : '') + 'chỉ còn ' + K.fmtQty(have) + ' ' + u + '</span>';
        return block(btn, 'Giảm số lượng xuống tối đa ' + K.fmtQty(have) + ' ' + unitOf(it) + '.', 'Không đủ hàng');
      }
      const left = K.r6(T - q);
      box.className = 'after';
      box.innerHTML = '<span>Sau khi xuất: còn <b class="num">' + K.fmtQty(left) + ' ' + u + '</b></span>' +
        (many ? '<span class="sub2">Tại vị trí này còn ' + K.fmtQty(K.r6(have - q)) + ' ' + u + '</span>' : '') +
        (left === 0 ? '<span class="sub2">Mặt hàng sẽ chuyển sang “Đã xuất hết” và vẫn giữ trong lịch sử</span>' : '') +
        (f.reason === 'cho_muon' ? '<span class="sub2">Đang cho mượn sau khi xuất: ' + K.fmtQty(K.r6((D.loaned[it.id] || 0) + q)) + ' ' + u + '</span>' : '');
      btn.disabled = false; w.hidden = true;
      $('#x-btn').textContent = 'Xác nhận xuất ' + K.fmtQty(q) + ' ' + unitOf(it);
    };
    draw();
    bindSteppers(sh.body, () => { f.qty = $('#x-qty', sh.body).value; preview(); });
    sh.body.addEventListener('input', e => {
      const t = e.target;
      if (t.id === 'x-q') { f.q = t.value; $('#x-list', sh.body).innerHTML = chooser(); }
      else if (t.id === 'x-qty') { f.qty = t.value; preview(); }
      else if (t.id === 'x-rec') f.recipient = t.value;
      else if (t.id === 'x-date') f.date = t.value;
      else if (t.id === 'x-note') f.note = t.value;
    });
    sh.body.addEventListener('change', e => { if (e.target.id === 'x-date') f.date = e.target.value; });
    sh.body.addEventListener('click', e => {
      const ch = e.target.closest('[data-choose]'); if (ch) { f.itemId = ch.dataset.choose; f.locId = null; f.qty = ''; autoLoc(); draw(); return; }
      if (e.target.closest('[data-act="x-change"]')) { f.itemId = null; draw(); return; }
      const lo = e.target.closest('[data-xloc]'); if (lo) { f.locId = lo.dataset.xloc; draw(); return; }
      const rs = e.target.closest('[data-reason]'); if (rs) { f.reason = rs.dataset.reason; draw(); return; }
      if (e.target.closest('[data-act="x-all"]')) { if (!f.locId) return sh.err('Hãy chọn vị trí lấy hàng trước.'); f.qty = String(K.qtyAt(D, f.itemId, f.locId)); $('#x-qty', sh.body).value = f.qty; preview(); }
    });
    sh.foot.addEventListener('click', async e => {
      const b = e.target.closest('[data-act="x-save"]'); if (!b || b.disabled) return;
      const res = K.ops.xuat(S, D, { itemId: f.itemId, locId: f.locId, qty: f.qty, reason: f.reason, recipient: f.recipient, date: f.date, note: f.note });
      if (!res.ok) return sh.err(res.error);
      const ok = await safe(() => commit({ movements: [res.movement] }));
      if (ok === false) return;
      const it = S.items[f.itemId], m = res.movement;
      sh.close(); refresh();
      toast('Đã xuất ' + K.fmtQty(m.qty) + ' ' + unitOf(it) + ' “' + it.name + '”' + (D.total[it.id] === 0 ? ' · Đã xuất hết' : ''), 'ok', { label: 'Hoàn tác', run: () => undoMovement(m.id, true) });
    });
  }

  /* ================= HOÀN TÁC ================= */
  async function undoMovement(id, skipConfirm) {
    const m = S.movements.find(x => x.id === id); if (!m) return;
    const it = S.items[m.itemId];
    const pre = K.ops.hoanTac(S, D, { refId: id });
    if (!pre.ok) return toast(pre.error, 'err');
    S.meta.seq--; // chỉ kiểm tra trước, chưa tạo bản ghi
    if (!skipConfirm) {
      const r = await confirmBox({ title: 'Hoàn tác ' + (m.type === 'xuat' ? 'lần xuất' : 'lần nhập') + '?', msg: (m.type === 'xuat' ? 'Trả lại ' : 'Trừ bớt ') + K.fmtQty(m.qty) + ' ' + unitOf(it) + ' “' + it.name + '” tại ' + L(m.locId) + '.\nGiao dịch gốc vẫn hiện trong lịch sử, có đánh dấu đã hoàn tác.', ok: 'Hoàn tác' });
      if (r !== 'ok') return;
    }
    const res = K.ops.hoanTac(S, D, { refId: id });
    if (!res.ok) return toast(res.error, 'err');
    if (await safe(() => commit({ movements: [res.movement] })) === false) return;
    closeAllSheets(); refresh();
    toast('Đã hoàn tác. Tồn “' + it.name + '”: ' + K.fmtQty(D.total[it.id]) + ' ' + unitOf(it));
  }

  /* ================= CHUYỂN VỊ TRÍ ================= */
  function sheetChuyen(itemId) {
    const it = S.items[itemId]; if (!it) return;
    const sh = openSheet({ title: 'Chuyển vị trí', full: true });
    const f = { from: mainLoc(itemId), to: null, qty: '', date: K.todayISO(), note: '' };
    const s0 = D.stock[itemId] || {}; if (Object.keys(s0).filter(k => s0[k] > 0).length !== 1) f.from = null;
    if (!f.from) { const ids = Object.keys(s0).filter(k => s0[k] > 0); if (ids.length) f.from = ids[0]; }
    const draw = () => {
      sh.body.innerHTML = itemCard(it) +
        '<div class="notice info">' + ic('info') + '<div>Chuyển vị trí chỉ đổi chỗ cất trong kho, tổng tồn không đổi. Muốn đưa hàng ra ngoài, dùng Xuất kho → “Chuyển đi”.</div></div>' +
        '<div class="field"><span class="flabel">Từ vị trí</span>' + locOptions(itemId, f.from, 'cfrom') + '</div>' +
        '<div class="field"><span class="flabel">Đến vị trí</span><button type="button" class="pick" data-act="pickto">' + ic('pin') + '<span class="p">' + (f.to ? esc(L(f.to)) : '<span style="color:var(--muted)">Chọn hoặc tạo vị trí đích</span>') + '</span>' + ic('chev', 'chev') + '</button></div>' +
        '<div class="field"><div class="flabel"><span>Số lượng chuyển <span class="opt">' + esc(unitOf(it)) + '</span></span><button type="button" class="pill" data-act="c-all">Chuyển tất cả</button></div>' + stepper('c-qty', f.qty) + '</div>' +
        dateInput('c-date', 'Ngày', f.date) + '<div class="field"><label for="c-note">Ghi chú <span class="opt">không bắt buộc</span></label><div class="ifield">' + ic('note') + '<input class="inp" id="c-note" value="' + esc(f.note) + '" autocomplete="off" placeholder="Nhập ghi chú…"></div></div><div id="c-prev"></div>';
      sh.foot.innerHTML = '<div class="ferr" hidden></div><button class="btn pri" data-act="c-save">' + ic('move') + 'Xác nhận chuyển</button>';
      preview();
    };
    const preview = () => {
      const box = $('#c-prev', sh.body), btn = $('[data-act="c-save"]', sh.foot), q = K.parseQty(f.qty), u = esc(unitOf(it));
      if (!f.from || !f.to || !Number.isFinite(q) || q <= 0) { box.innerHTML = ''; btn.disabled = true; return; }
      const a = K.qtyAt(D, itemId, f.from), b = K.qtyAt(D, itemId, f.to), bad = q > a + 1e-9;
      box.innerHTML = '<div class="preview' + (bad ? ' bad' : '') + '">' + (bad ? '<span class="k" style="grid-column:1/-1;color:var(--danger);font-weight:650">Vị trí nguồn chỉ còn ' + K.fmtQty(a) + ' ' + u + '.</span>' :
        '<span class="k">Vị trí nguồn</span><span class="v num">' + K.fmtQty(a) + ' <span class="arrow">→</span> ' + K.fmtQty(K.r6(a - q)) + '</span><span class="k">Vị trí đích</span><span class="v num">' + K.fmtQty(b) + ' <span class="arrow">→</span> ' + K.fmtQty(K.r6(b + q)) + '</span><span class="k">Tổng tồn</span><span class="v num">' + K.fmtQty(D.total[itemId]) + ' ' + u + ' (không đổi)</span>') + '</div>';
      btn.disabled = bad;
    };
    draw();
    bindSteppers(sh.body, () => { f.qty = $('#c-qty', sh.body).value; preview(); });
    sh.body.addEventListener('input', e => { const t = e.target; if (t.id === 'c-qty') { f.qty = t.value; preview(); } else if (t.id === 'c-date') f.date = t.value; else if (t.id === 'c-note') f.note = t.value; });
    sh.body.addEventListener('change', e => { if (e.target.id === 'c-date') f.date = e.target.value; });
    sh.body.addEventListener('click', e => {
      const fr = e.target.closest('[data-cfrom]'); if (fr) { f.from = fr.dataset.cfrom; if (f.to === f.from) f.to = null; draw(); return; }
      if (e.target.closest('[data-act="pickto"]')) { if (!f.from) return sh.err('Hãy chọn vị trí nguồn trước.'); pickLocation({ title: 'Chọn vị trí đích', current: f.to, exclude: f.from, itemId, onPick: id => { f.to = id; draw(); } }); return; }
      if (e.target.closest('[data-act="c-all"]')) { if (!f.from) return; f.qty = String(K.qtyAt(D, itemId, f.from)); $('#c-qty', sh.body).value = f.qty; preview(); }
    });
    sh.foot.addEventListener('click', async e => {
      const b = e.target.closest('[data-act="c-save"]'); if (!b) return;
      const res = K.ops.chuyen(S, D, { itemId, fromLocId: f.from, toLocId: f.to, qty: f.qty, date: f.date, note: f.note });
      if (!res.ok) return sh.err(res.error);
      if (await safe(() => commit({ movements: [res.movement], meta: { lastLocId: f.to } })) === false) return;
      sh.close(); refresh();
      toast('Đã chuyển ' + K.fmtQty(res.movement.qty) + ' ' + unitOf(it) + ' sang ' + L(f.to));
    });
  }

  /* ================= KIỂM KÊ ================= */
  function sheetKiemKe(itemId) {
    const it = S.items[itemId]; if (!it) return;
    const sh = openSheet({ title: 'Kiểm kê', full: true });
    const f = { locId: mainLoc(itemId) || (S.meta.lastLocId && S.locations[S.meta.lastLocId] ? S.meta.lastLocId : K.NONE_LOC), actual: '', reason: '', note: '', date: K.todayISO() };
    const QR = ['Đếm lại', 'Hư hỏng', 'Thất lạc', 'Tìm thấy thêm', 'Đã dùng mà chưa ghi'];
    const draw = () => {
      const sys = K.qtyAt(D, itemId, f.locId);
      sh.body.innerHTML = itemCard(it) +
        '<div class="field"><span class="flabel">Vị trí kiểm kê</span>' + (Object.keys(D.stock[itemId] || {}).length ? locOptions(itemId, f.locId, 'kloc') : '') +
        '<button type="button" class="pick" data-act="kpick">' + ic('pin') + '<span class="p">' + (Object.keys(D.stock[itemId] || {}).includes(f.locId) ? 'Vị trí khác…' : esc(L(f.locId))) + '</span>' + ic('chev', 'chev') + '</button></div>' +
        '<div class="preview"><span class="k">Theo dữ liệu</span><span class="v num">' + K.fmtQty(sys) + ' ' + esc(unitOf(it)) + '</span></div>' +
        '<div class="field"><span class="flabel">Số lượng thực tế đếm được</span>' + stepper('k-act', f.actual) + '</div><div id="k-diff"></div>' +
        '<div class="field"><label for="k-reason">Lý do điều chỉnh</label><div class="wrapchips">' + QR.map(r => '<button type="button" class="chip' + (f.reason === r ? ' on' : '') + '" data-kr="' + esc(r) + '">' + r + '</button>').join('') + '</div><input class="inp" id="k-reason" value="' + esc(f.reason) + '" placeholder="Hoặc tự ghi lý do" autocomplete="off"></div>' +
        '<div class="field"><label for="k-note">Ghi chú <span class="opt">không bắt buộc</span></label><input class="inp" id="k-note" value="' + esc(f.note) + '" autocomplete="off"></div>';
      sh.foot.innerHTML = '<div class="ferr" hidden></div><button class="btn pri" data-act="k-save">' + ic('count') + '<span id="k-btn">Xác nhận kiểm kê</span></button>';
      diff();
    };
    const diff = () => {
      const sys = K.qtyAt(D, itemId, f.locId), a = K.parseQty(f.actual), box = $('#k-diff', sh.body), u = esc(unitOf(it));
      const btn = $('[data-act="k-save"]', sh.foot);
      if (!Number.isFinite(a) || a < 0) { box.innerHTML = ''; btn.disabled = true; return; }
      const dl = K.r6(a - sys);
      btn.disabled = false;
      box.innerHTML = '<div class="preview' + (dl ? '' : '') + '"><span class="k">Chênh lệch</span><span class="v num" style="color:' + (dl > 0 ? 'var(--in)' : dl < 0 ? 'var(--out)' : 'var(--ink)') + '">' + (dl > 0 ? '+' : dl < 0 ? '−' : '') + K.fmtQty(Math.abs(dl)) + ' ' + u + (dl ? '' : ' (khớp)') + '</span>' +
        (dl ? '<span class="k">Tồn tại vị trí sau điều chỉnh</span><span class="v num">' + K.fmtQty(sys) + ' <span class="arrow">→</span> ' + K.fmtQty(a) + '</span>' : '') + '</div>';
      $('#k-btn').textContent = dl ? 'Xác nhận điều chỉnh' : 'Ghi nhận kiểm kê khớp';
    };
    draw();
    bindSteppers(sh.body, () => { f.actual = $('#k-act', sh.body).value; diff(); });
    sh.body.addEventListener('input', e => { const t = e.target; if (t.id === 'k-act') { f.actual = t.value; diff(); } else if (t.id === 'k-reason') { f.reason = t.value; $$('[data-kr]', sh.body).forEach(c => c.classList.toggle('on', c.dataset.kr === f.reason)); } else if (t.id === 'k-note') f.note = t.value; });
    sh.body.addEventListener('click', e => {
      const lo = e.target.closest('[data-kloc]'); if (lo) { f.locId = lo.dataset.kloc; draw(); return; }
      const kr = e.target.closest('[data-kr]'); if (kr) { f.reason = kr.dataset.kr; $('#k-reason', sh.body).value = f.reason; $$('[data-kr]', sh.body).forEach(c => c.classList.toggle('on', c === kr)); return; }
      if (e.target.closest('[data-act="kpick"]')) pickLocation({ current: f.locId, itemId, onPick: id => { f.locId = id; draw(); } });
    });
    sh.foot.addEventListener('click', async e => {
      const b = e.target.closest('[data-act="k-save"]'); if (!b) return;
      const res = K.ops.kiemke(S, D, { itemId, locId: f.locId, actual: f.actual, reason: f.reason, note: f.note, date: f.date });
      if (!res.ok) { sh.err(res.error); if (/lý do/.test(res.error)) $('#k-reason', sh.body).classList.add('err'); return; }
      if (await safe(() => commit({ movements: [res.movement] })) === false) return;
      sh.close(); refresh();
      const m = res.movement, dl = K.r6(m.after - m.before);
      toast(dl ? 'Đã điều chỉnh ' + K.fmtQty(m.before) + ' → ' + K.fmtQty(m.after) + ' ' + unitOf(it) : 'Đã ghi nhận kiểm kê: số lượng khớp');
    });
  }

  /* ================= NHẬN LẠI ================= */
  function sheetNhanLai(loanId) {
    const loan = D.loans[loanId]; if (!loan) return;
    const it = S.items[loan.itemId];
    const sh = openSheet({ title: 'Nhận lại hàng cho mượn' });
    const f = { qty: String(loan.outstanding), locId: S.locations[loan.locId] ? loan.locId : K.NONE_LOC, date: K.todayISO(), note: '' };
    const draw = () => {
      sh.body.innerHTML = itemCard(it) +
        '<div class="preview"><span class="k">Người mượn</span><span class="v">' + esc(loan.recipient || 'Chưa ghi') + '</span><span class="k">Ngày mượn</span><span class="v num">' + K.fmtDate(loan.date) + '</span><span class="k">Còn đang giữ</span><span class="v num" style="color:var(--loan)">' + K.fmtQty(loan.outstanding) + ' ' + esc(unitOf(it)) + '</span></div>' +
        '<div class="field"><div class="flabel"><span>Số lượng nhận lại</span><button type="button" class="pill" data-act="r-all">Nhận đủ</button></div>' + stepper('r-qty', f.qty) + '</div>' +
        locButton('r-loc', f.locId, 'Cất lại vào vị trí') +
        dateInput('r-date', 'Ngày nhận', f.date) + '<div class="field"><label for="r-note">Ghi chú <span class="opt">không bắt buộc</span></label><div class="ifield">' + ic('note') + '<input class="inp" id="r-note" value="' + esc(f.note) + '" autocomplete="off" placeholder="Nhập ghi chú…"></div></div><div id="r-prev"></div>';
      sh.foot.innerHTML = '<div class="ferr" hidden></div><button class="btn pri" data-act="r-save">' + ic('ret') + 'Xác nhận nhận lại</button>';
      preview();
    };
    const preview = () => {
      const q = K.parseQty(f.qty), box = $('#r-prev', sh.body), btn = $('[data-act="r-save"]', sh.foot), u = esc(unitOf(it));
      if (!Number.isFinite(q) || q <= 0) { box.innerHTML = ''; btn.disabled = true; return; }
      const bad = q > loan.outstanding + 1e-9; btn.disabled = bad;
      box.innerHTML = '<div class="preview' + (bad ? ' bad' : '') + '">' + (bad ? '<span class="k" style="grid-column:1/-1;color:var(--danger);font-weight:650">Chỉ còn ' + K.fmtQty(loan.outstanding) + ' ' + u + ' đang cho mượn.</span>' :
        '<span class="k">Tổng tồn</span><span class="v num">' + K.fmtQty(D.total[it.id]) + ' <span class="arrow">→</span> ' + K.fmtQty(K.r6(D.total[it.id] + q)) + ' ' + u + '</span><span class="k">Lượt mượn này còn</span><span class="v num">' + K.fmtQty(K.r6(loan.outstanding - q)) + ' ' + u + '</span>') + '</div>';
    };
    draw();
    bindSteppers(sh.body, () => { f.qty = $('#r-qty', sh.body).value; preview(); });
    sh.body.addEventListener('input', e => { const t = e.target; if (t.id === 'r-qty') { f.qty = t.value; preview(); } else if (t.id === 'r-date') f.date = t.value; else if (t.id === 'r-note') f.note = t.value; });
    sh.body.addEventListener('change', e => { if (e.target.id === 'r-date') f.date = e.target.value; });
    sh.body.addEventListener('click', e => {
      if (e.target.closest('[data-act="r-all"]')) { f.qty = String(loan.outstanding); $('#r-qty', sh.body).value = f.qty; preview(); }
      if (e.target.closest('[data-act="pickloc"]')) pickLocation({ current: f.locId, itemId: it.id, onPick: id => { f.locId = id; draw(); } });
    });
    sh.foot.addEventListener('click', async e => {
      if (!e.target.closest('[data-act="r-save"]')) return;
      const res = K.ops.nhanLai(S, D, { loanId, qty: f.qty, locId: f.locId, date: f.date, note: f.note });
      if (!res.ok) return sh.err(res.error);
      if (await safe(() => commit({ movements: [res.movement] })) === false) return;
      sh.close(); refresh();
      toast('Đã nhận lại ' + K.fmtQty(res.movement.qty) + ' ' + unitOf(it) + (D.loans[loanId].outstanding > 0 ? ' · còn mượn ' + K.fmtQty(D.loans[loanId].outstanding) : ''));
    });
  }

  /* ================= CHI TIẾT GIAO DỊCH ================= */
  function sheetMovement(id) {
    const m = S.movements.find(x => x.id === id); if (!m) return;
    const ds = K.describe(S, D, m), it = S.items[m.itemId];
    const sh = openSheet({ title: ds.title });
    const canUndo = (m.type === 'xuat' || m.type === 'nhap') && !ds.undone;
    const draw = () => {
      sh.body.innerHTML = (it ? itemCard(it) : '') +
        '<div class="card kv"><div class="k">Ngày</div><div class="v num">' + K.fmtDate(m.date) + '</div>' +
        '<div class="k">Ghi lúc</div><div class="v num">' + new Date(m.createdAt).toLocaleString('vi-VN') + '</div>' +
        '<div class="k">Số lượng</div><div class="v num">' + (ds.sign === '⇄' ? '' : ds.sign) + K.fmtQty(ds.qty) + ' ' + esc(ds.unit) + '</div>' +
        '<div class="k">Vị trí</div><div class="v">' + esc(ds.where) + '</div>' +
        ds.extra.map(x => { const i = x.indexOf(': '); return i > 0 ? '<div class="k">' + esc(x.slice(0, i)) + '</div><div class="v">' + esc(x.slice(i + 2)) + '</div>' : '<div class="k">Chi tiết</div><div class="v">' + esc(x) + '</div>'; }).join('') +
        (m.note ? '<div class="k">Ghi chú</div><div class="v">' + esc(m.note) + '</div>' : '') +
        (ds.undone ? '<div class="k">Trạng thái</div><div class="v" style="color:var(--danger)">Đã hoàn tác</div>' : '') + '</div>' +
        (m.type === 'nhap' && !ds.undone ? '<div class="field"><label for="mv-price">Giá ước tính mỗi ' + esc(ds.unit) + ' của đợt này (VNĐ)</label><div class="btn-row"><input class="inp num" id="mv-price" inputmode="numeric" value="' + (m.price == null ? '' : fmtPriceInput(m.price)) + '" placeholder="Chưa có giá" autocomplete="off"><button class="btn sec" style="width:auto" data-act="mv-price">Lưu giá</button></div><span class="hint">Sửa giá không làm thay đổi số lượng tồn.</span></div>' : '') +
        (m.type === 'xuat' && m.reason === 'cho_muon' && D.loans[m.id] && D.loans[m.id].outstanding > 0 ? '<button class="btn sec" data-act="mv-return">' + ic('ret') + 'Nhận lại hàng</button>' : '');
      sh.foot.innerHTML = '<div class="ferr" hidden></div>' + (canUndo ? '<button class="btn danger-ghost" data-act="mv-undo">' + ic('undo') + 'Hoàn tác ' + (m.type === 'xuat' ? 'lần xuất' : 'lần nhập') + ' này</button>' : '') +
        (it && !ui.detail ? '<button class="btn ghost" data-act="mv-open">Mở mặt hàng</button>' : (!canUndo ? '<button class="btn ghost" data-act="close">Đóng</button>' : ''));
    };
    draw();
    sh.body.addEventListener('input', e => { if (e.target.id === 'mv-price') e.target.value = fmtPriceInput(e.target.value); });
    sh.el.addEventListener('click', async e => {
      const a = e.target.closest('[data-act]'); if (!a) return;
      if (a.dataset.act === 'mv-undo') undoMovement(m.id);
      else if (a.dataset.act === 'mv-open') openItem(m.itemId);
      else if (a.dataset.act === 'mv-return') { sh.close(); sheetNhanLai(m.id); }
      else if (a.dataset.act === 'mv-price') {
        const p = K.parsePrice($('#mv-price', sh.body).value);
        if (Number.isNaN(p)) return sh.err('Giá không hợp lệ.');
        const nm = Object.assign({}, m, { price: p, priceEditedAt: new Date().toISOString() });
        if (await safe(() => commit({ movements: [nm] })) === false) return;
        sh.close(); refresh(); toast(p == null ? 'Đã bỏ giá của đợt nhập' : 'Đã cập nhật giá đợt nhập');
      }
    });
  }

  /* ================= SỬA MẶT HÀNG ================= */
  function sheetEditItem(id) {
    const it = S.items[id]; if (!it) return;
    const sh = openSheet({ title: 'Sửa thông tin', full: true });
    const f = { name: it.name, code: it.code, categoryId: it.categoryId || '', unitId: it.unitId, note: it.note || '', photo: undefined, thumb: it.thumb };
    const draw = () => {
      sh.body.innerHTML = photoBlock(f.thumb) +
        '<div class="field"><label for="e-name">Tên mặt hàng</label><input class="inp" id="e-name" value="' + esc(f.name) + '" autocomplete="off"></div>' +
        '<div class="field"><label for="e-code">Mã hàng</label><input class="inp num" id="e-code" value="' + esc(f.code) + '" autocomplete="off" autocapitalize="characters"></div>' +
        '<div class="field"><span class="flabel">Loại hàng</span>' + chipsSelect('categories', f.categoryId, true) + '</div>' +
        '<div class="field"><span class="flabel">Đơn vị tính</span>' + chipsSelect('units', f.unitId) + (f.unitId !== it.unitId ? '<span class="hint" style="color:var(--warn)">Đổi đơn vị chỉ đổi tên gọi, số lượng không được quy đổi.</span>' : '') + '</div>' +
        '<div class="field"><label for="e-note">Ghi chú riêng</label><textarea class="inp" id="e-note" rows="3">' + esc(f.note) + '</textarea></div>' +
        '<div class="notice info">' + ic('info') + '<div>Số lượng không sửa trực tiếp ở đây. Dùng Nhập thêm, Xuất kho hoặc Kiểm kê để mọi thay đổi đều có lịch sử.</div></div>' +
        '<button class="btn danger-ghost" data-act="e-del">' + ic('trash') + 'Xóa vĩnh viễn mặt hàng này</button>';
      sh.foot.innerHTML = '<div class="ferr" hidden></div><button class="btn pri" data-act="e-save">' + ic('check') + 'Lưu thay đổi</button>';
    };
    draw();
    sh.body.addEventListener('input', e => { const t = e.target; if (t.id === 'e-name') f.name = t.value; else if (t.id === 'e-code') f.code = t.value; else if (t.id === 'e-note') f.note = t.value; });
    sh.body.addEventListener('click', async e => {
      const pk = e.target.closest('[data-pick]'); if (pk) { if (pk.dataset.pick === 'units') f.unitId = pk.dataset.v; else f.categoryId = pk.dataset.v; draw(); return; }
      const al = e.target.closest('[data-addlist]'); if (al) { const nid = await addListEntry(al.dataset.addlist); if (nid) { if (al.dataset.addlist === 'units') f.unitId = nid; else f.categoryId = nid; } draw(); return; }
      const ph = e.target.closest('[data-photo]');
      if (ph) { if (ph.dataset.photo === 'remove') { f.photo = null; f.thumb = null; draw(); return; } const r = await getPhotoFromUser(ph.dataset.photo); if (r) { f.photo = r; f.thumb = r.thumb; draw(); } return; }
      if (e.target.closest('[data-act="e-del"]')) {
        const n = S.movements.filter(m => m.itemId === id).length;
        const r = await confirmBox({ title: 'Xóa vĩnh viễn “' + it.name + '”?', msg: 'Mặt hàng, ảnh và toàn bộ ' + n + ' dòng lịch sử của nó sẽ bị xóa và không khôi phục được (trừ khi bạn có bản sao lưu).\nNếu chỉ là hàng đã hết, không cần xóa: mặt hàng sẽ tự chuyển sang “Đã xuất hết”.', ok: 'Xóa vĩnh viễn', danger: true });
        if (r !== 'ok') return;
        if (await safe(() => commit({ delItems: [id], delMovements: S.movements.filter(m => m.itemId === id).map(m => m.id), photos: { [id]: null } })) === false) return;
        closeAllSheets(); ui.detail = null; render(); toast('Đã xóa mặt hàng');
      }
    });
    sh.foot.addEventListener('click', async e => {
      if (!e.target.closest('[data-act="e-save"]')) return;
      const upd = Object.assign({}, it, { name: f.name.trim(), code: f.code.trim(), categoryId: f.categoryId, unitId: f.unitId, note: f.note.trim(), thumb: f.thumb || null, updatedAt: new Date().toISOString() });
      const ve = K.validateItem(S, upd, id); if (ve) return sh.err(ve);
      const photos = f.photo === undefined ? null : { [id]: f.photo ? f.photo.full : null };
      if (await safe(() => commit({ items: [upd], photos })) === false) return;
      sh.close(); refresh(); toast('Đã lưu thông tin mặt hàng');
    });
  }

  /* ================= BỘ LỌC ================= */
  function pickOption(o) {
    const sh = openSheet({ title: o.title, foot: false });
    sh.body.innerHTML = o.options.length ? '<div class="card opt-list">' + o.options.map(([v, l, sub]) => '<button type="button" class="loc-opt' + (o.current === v ? ' on' : '') + '" data-ov="' + esc(v) + '">' + ic(o.icon || 'tag') + '<span class="p">' + esc(l) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' + (o.current === v ? ic('check', 'ck') : '') + '</button>').join('') + '</div>' + (o.options.length < 2 && o.empty ? '<p class="hint">' + esc(o.empty) + '</p>' : '') : '';
    sh.body.addEventListener('click', e => { const b = e.target.closest('[data-ov]'); if (!b) return; sh.close(); o.onPick(b.dataset.ov); });
  }
  function dateRangeChips() {
    return '<div class="wrapchips">' + [['7', '7 ngày'], ['30', '30 ngày'], ['m', 'Tháng này'], ['y', 'Năm nay']].map(([k, l]) => '<button type="button" class="chip" data-range="' + k + '">' + l + '</button>').join('') + '</div>';
  }
  function bindDateRange(sh, fromId, toId) {
    sh.body.addEventListener('click', e => {
      const r = e.target.closest('[data-range]'); if (!r) return;
      const now = new Date(); let from;
      if (r.dataset.range === 'm') from = new Date(now.getFullYear(), now.getMonth(), 1);
      else if (r.dataset.range === 'y') from = new Date(now.getFullYear(), 0, 1);
      else from = new Date(Date.now() - (Number(r.dataset.range) - 1) * 864e5);
      $('#' + fromId, sh.body).value = K.todayISO(from); $('#' + toId, sh.body).value = K.todayISO(now);
      $$('[data-range]', sh.body).forEach(c => c.classList.toggle('on', c === r));
    });
  }
  function dateInput(id, label, val) {
    return '<div class="field"><label for="' + id + '">' + label + '</label><div class="ifield date">' + ic('cal') + '<input class="inp" type="date" id="' + id + '" value="' + (val || '') + '"></div></div>';
  }
  function sheetItemFilter() {
    const sh = openSheet({ title: 'Lọc theo ngày nhập' });
    const f = ui.items;
    sh.body.innerHTML = '<p class="hint" style="margin:0">Hiện các mặt hàng có ít nhất một đợt nhập trong khoảng này.</p>' + dateRangeChips() +
      dateInput('ff-from', 'Từ ngày', f.from) + dateInput('ff-to', 'Đến ngày', f.to);
    sh.foot.innerHTML = '<div class="btn-row"><button class="btn ghost" data-act="ff-clear" style="flex:0 0 40%">Bỏ lọc ngày</button><button class="btn pri" data-act="ff-apply">Áp dụng</button></div>';
    bindDateRange(sh, 'ff-from', 'ff-to');
    sh.foot.addEventListener('click', e => {
      const a = e.target.closest('[data-act]'); if (!a) return;
      if (a.dataset.act === 'ff-clear') Object.assign(ui.items, { from: '', to: '' });
      else {
        const from = $('#ff-from', sh.body).value, to = $('#ff-to', sh.body).value;
        if (from && to && from > to) return toast('Ngày bắt đầu phải trước ngày kết thúc.', 'err');
        Object.assign(ui.items, { from, to });
      }
      sh.close(); refresh();
    });
  }
  function sheetHistFilter() {
    const sh = openSheet({ title: 'Lọc lịch sử' });
    const items = Object.values(S.items).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    const f = ui.hist;
    sh.body.innerHTML = '<div class="field"><label for="hf-item">Mặt hàng</label><select class="inp" id="hf-item"><option value="">Tất cả mặt hàng</option>' + items.map(i => '<option value="' + i.id + '"' + (f.itemId === i.id ? ' selected' : '') + '>' + esc(i.name) + ' (' + esc(i.code) + ')</option>').join('') + '</select></div>' +
      '<div class="flabel">Khoảng thời gian</div>' + dateRangeChips() +
      dateInput('hf-from', 'Từ ngày', f.from) + dateInput('hf-to', 'Đến ngày', f.to);
    sh.foot.innerHTML = '<div class="btn-row"><button class="btn ghost" data-act="hf-clear" style="flex:0 0 40%">Xóa bộ lọc</button><button class="btn pri" data-act="hf-apply">Áp dụng</button></div>';
    bindDateRange(sh, 'hf-from', 'hf-to');
    sh.foot.addEventListener('click', e => {
      const a = e.target.closest('[data-act]'); if (!a) return;
      if (a.dataset.act === 'hf-clear') Object.assign(ui.hist, { itemId: '', from: '', to: '' });
      else {
        const from = $('#hf-from', sh.body).value, to = $('#hf-to', sh.body).value;
        if (from && to && from > to) return toast('Ngày bắt đầu phải trước ngày kết thúc.', 'err');
        Object.assign(ui.hist, { itemId: $('#hf-item', sh.body).value, from, to });
      }
      ui.histLimit = 120; sh.close(); refresh();
    });
  }

  /* ================= QUẢN LÝ DANH MỤC ================= */
  function sheetManageSimple(kind) {
    const isUnit = kind === 'units', label = isUnit ? 'đơn vị tính' : 'loại hàng';
    const sh = openSheet({ title: isUnit ? 'Đơn vị tính' : 'Loại hàng', foot: false, full: true });
    const field = isUnit ? 'unitId' : 'categoryId';
    const draw = () => {
      const list = Object.values(S[kind]).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'vi'));
      sh.body.innerHTML = '<button class="btn sec" data-act="mg-add">' + ic('plus') + 'Thêm ' + label + '</button><div class="card">' + list.map(x => {
        const n = Object.values(S.items).filter(i => i[field] === x.id).length;
        return '<div class="mg-row"><div class="p">' + esc(x.name) + '<small>' + (n ? n + ' mặt hàng' : 'Chưa dùng') + '</small></div><button data-ren="' + x.id + '" aria-label="Đổi tên">' + ic('edit') + '</button><button class="del" data-del="' + x.id + '" aria-label="Xóa"' + (n ? ' disabled title="Đang được dùng"' : '') + '>' + ic('trash') + '</button></div>';
      }).join('') + '</div><p class="hint">Chỉ xóa được ' + label + ' chưa có mặt hàng nào dùng. Đổi tên sẽ áp dụng cho mọi mặt hàng.</p>';
    };
    draw();
    sh.body.addEventListener('click', async e => {
      if (e.target.closest('[data-act="mg-add"]')) { if (await addListEntry(kind)) draw(); return; }
      const rn = e.target.closest('[data-ren]');
      if (rn) {
        const x = S[kind][rn.dataset.ren];
        const v = await promptBox({ title: 'Đổi tên ' + label, value: x.name, ok: 'Lưu', validate: v => !v ? 'Hãy nhập tên.' : Object.values(S[kind]).some(y => y.id !== x.id && K.norm(y.name) === K.norm(v)) ? 'Tên này đã có.' : null });
        if (!v) return;
        if (await safe(() => commit({ [kind]: [Object.assign({}, x, { name: v.trim() })] })) === false) return;
        draw(); refresh(); toast('Đã đổi tên'); return;
      }
      const dl = e.target.closest('[data-del]');
      if (dl && !dl.disabled) {
        const x = S[kind][dl.dataset.del];
        if (isUnit && Object.keys(S.units).length <= 1) return toast('Cần giữ lại ít nhất một đơn vị tính.', 'err');
        if (await confirmBox({ title: 'Xóa “' + x.name + '”?', ok: 'Xóa', danger: true }) !== 'ok') return;
        if (await safe(() => commit({ [isUnit ? 'delUnits' : 'delCategories']: [x.id] })) === false) return;
        draw(); toast('Đã xóa ' + label);
      }
    });
  }
  function sheetManageLocations() {
    const sh = openSheet({ title: 'Vị trí cất', foot: false, full: true });
    const draw = () => {
      const list = sortedLocations();
      sh.body.innerHTML = '<div class="notice info">' + ic('info') + '<div>Vị trí gồm 4 cấp Kho → Kệ → Tầng → Hộp, không cần nhập đủ. Có thể tạo nhanh ngay khi nhập kho.</div></div><button class="btn sec" data-act="lc-add">' + ic('plus') + 'Thêm vị trí</button>' +
        (list.length ? '<div class="card">' + list.map(l => {
          const used = S.movements.filter(m => m.locId === l.id || m.fromLocId === l.id || m.toLocId === l.id).length;
          const items = Object.keys(S.items).filter(i => (D.stock[i] || {})[l.id] > 0).length;
          return '<div class="mg-row"><div class="p">' + esc(K.locPath(l)) + '<small>' + (items ? items + ' mặt hàng đang cất' : used ? 'Đang trống · có trong lịch sử' : 'Chưa dùng') + '</small></div><button data-ed="' + l.id + '" aria-label="Sửa">' + ic('edit') + '</button><button class="del" data-del="' + l.id + '" aria-label="Xóa"' + (used ? ' disabled' : '') + '>' + ic('trash') + '</button></div>';
        }).join('') + '</div><p class="hint">Vị trí đã có trong lịch sử không xóa được, nhưng có thể đổi tên.</p>' : '<div class="card"><div class="empty"><div class="eic">' + ic('pin') + '</div><h3>Chưa có vị trí</h3><p>Ví dụ: Kho nhà → Kệ A → Tầng 2 → Hộp 03.</p></div></div>');
    };
    const editLoc = l => {
      const s2 = openSheet({ title: l ? 'Sửa vị trí' : 'Thêm vị trí' });
      s2.body.innerHTML = '<div class="grid2">' + [['kho', 'Kho', 'Kho nhà'], ['ke', 'Kệ', 'Kệ A'], ['tang', 'Tầng', 'Tầng 2'], ['hop', 'Hộp', 'Hộp 03']].map(([k, lab, ph]) => '<div class="field"><label for="le-' + k + '">' + lab + '</label><input class="inp" id="le-' + k + '" value="' + esc(l ? l[k] || '' : '') + '" placeholder="' + ph + '" autocomplete="off"></div>').join('') + '</div>';
      s2.foot.innerHTML = '<div class="ferr" hidden></div><button class="btn pri" data-act="le-save">Lưu vị trí</button>';
      s2.foot.addEventListener('click', async e => {
        if (!e.target.closest('[data-act="le-save"]')) return;
        const v = {}; ['kho', 'ke', 'tang', 'hop'].forEach(k => v[k] = $('#le-' + k, s2.body).value.trim());
        if (!v.kho && !v.ke && !v.tang && !v.hop) return s2.err('Hãy nhập ít nhất một cấp.');
        const ex = K.findLocation(S, v); if (ex && (!l || ex.id !== l.id)) return s2.err('Vị trí này đã có.');
        const rec = Object.assign({}, l || { id: K.uid('loc'), createdAt: new Date().toISOString() }, v);
        if (await safe(() => commit({ locations: [rec] })) === false) return;
        s2.close(); draw(); refresh(); toast(l ? 'Đã sửa vị trí' : 'Đã thêm vị trí');
      });
    };
    draw();
    sh.body.addEventListener('click', async e => {
      if (e.target.closest('[data-act="lc-add"]')) return editLoc(null);
      const ed = e.target.closest('[data-ed]'); if (ed) return editLoc(S.locations[ed.dataset.ed]);
      const dl = e.target.closest('[data-del]');
      if (dl && !dl.disabled) {
        const l = S.locations[dl.dataset.del];
        if (await confirmBox({ title: 'Xóa vị trí?', msg: K.locPath(l), ok: 'Xóa', danger: true }) !== 'ok') return;
        if (await safe(() => commit({ delLocations: [l.id] })) === false) return;
        draw(); toast('Đã xóa vị trí');
      }
    });
  }

  /* ================= SAO LƯU / KHÔI PHỤC / XUẤT ================= */
  function stamp() { const d = new Date(), p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes()); }
  function fmtBytes(n) { return n > 1048576 ? (n / 1048576).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
  async function deliverFile(file) {
    try {
      if (navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: file.name });
        return 'shared';
      }
    } catch (e) { if (e && e.name === 'AbortError') return 'cancel'; }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return 'downloaded';
  }
  function sheetBackup() {
    const sh = openSheet({ title: 'Sao lưu dữ liệu' });
    let file = null;
    sh.body.innerHTML = '<div class="prose"><p>Tệp sao lưu chứa <b>toàn bộ</b> mặt hàng, ảnh, loại hàng, đơn vị, vị trí và lịch sử. Hãy lưu vào ứng dụng <b>Tệp</b> (chọn iCloud Drive nếu muốn có bản trên mây).</p></div><div id="bk-info" class="preview"><span class="k">Đang chuẩn bị tệp…</span><span></span></div>' +
      '<div class="prose"><h4>Cách lưu trên iPhone</h4><ol><li>Nhấn “Lưu tệp sao lưu”.</li><li>Trong bảng chia sẻ, chọn <b>Lưu vào Tệp</b>.</li><li>Chọn thư mục, ví dụ iCloud Drive → Kho Của Tôi, rồi nhấn Lưu.</li></ol></div>';
    sh.foot.innerHTML = '<div class="ferr" hidden></div><button class="btn pri" data-act="bk-go" disabled>' + ic('save') + 'Lưu tệp sao lưu</button>';
    (async () => {
      try {
        const photos = await DB.allPhotos();
        const json = JSON.stringify(K.makeBackup(S, photos));
        file = new File([json], 'KhoCuaToi_saoluu_' + stamp() + '.json', { type: 'application/json' });
        $('#bk-info', sh.body).innerHTML = '<span class="k">Mặt hàng</span><span class="v num">' + Object.keys(S.items).length + '</span><span class="k">Ảnh</span><span class="v num">' + Object.keys(photos).length + '</span><span class="k">Dòng lịch sử</span><span class="v num">' + S.movements.length + '</span><span class="k">Dung lượng tệp</span><span class="v num">' + fmtBytes(file.size) + '</span>';
        $('[data-act="bk-go"]', sh.foot).disabled = false;
      } catch (e) { sh.err('Không tạo được tệp sao lưu: ' + e.message); }
    })();
    sh.foot.addEventListener('click', async e => {
      if (!e.target.closest('[data-act="bk-go"]') || !file) return;
      const r = await deliverFile(file);
      if (r === 'cancel') return;
      await safe(() => commit({ meta: { lastBackup: new Date().toISOString() } }));
      sh.close(); refresh();
      toast(r === 'shared' ? 'Đã tạo tệp sao lưu. Hãy chắc chắn bạn đã chọn “Lưu vào Tệp”.' : 'Đã tải tệp sao lưu xuống.');
    });
  }
  async function startRestore() {
    const file = await pickFile('f-restore');
    if (!file) return;
    let text;
    try { text = await file.text(); } catch (e) { return toast('Không đọc được tệp.', 'err'); }
    const r = K.readBackup(text);
    if (!r.ok) return dialog({ title: 'Không thể khôi phục', msg: r.error + '\nDữ liệu hiện tại vẫn được giữ nguyên.', ok: 'Đã hiểu', cancel: false });
    const when = r.exportedAt ? new Date(r.exportedAt).toLocaleString('vi-VN') : 'không rõ';
    const ans = await confirmBox({
      title: 'Thay thế toàn bộ dữ liệu?', danger: true, ok: 'Thay thế bằng bản sao lưu',
      msg: 'Tệp hợp lệ, tạo lúc ' + when + ':\n• ' + r.counts.items + ' mặt hàng, ' + r.counts.photos + ' ảnh, ' + r.counts.movements + ' dòng lịch sử.\n\nDữ liệu đang có trên máy (' + Object.keys(S.items).length + ' mặt hàng, ' + S.movements.length + ' dòng lịch sử) sẽ bị XÓA và thay bằng nội dung trong tệp. Nếu chưa chắc, hãy hủy và sao lưu dữ liệu hiện tại trước.'
    });
    if (ans !== 'ok') return;
    if (await safe(async () => { await DB.replaceAll(r.state, r.photos); const l = await DB.loadAll(); S = l.state; D = K.derive(S); }) === false) return;
    closeAllSheets(); ui.detail = null; render();
    toast('Đã khôi phục ' + r.counts.items + ' mặt hàng và ' + r.counts.movements + ' dòng lịch sử');
  }
  function sheetExport() {
    const sh = openSheet({ title: 'Xuất dữ liệu', foot: false });
    sh.body.innerHTML = '<div class="prose"><p>Xuất danh sách để xem, in hoặc gửi đi. Tệp giữ đúng tiếng Việt. Đây không phải bản sao lưu (không có ảnh, không khôi phục lại được).</p></div><div class="card">' +
      '<button class="setting" data-ex="xlsx"><span class="act-ic t-nhap">' + ic('table') + '</span><div class="mid"><div class="t">Excel (.xlsx)</div><div class="s">2 trang tính: Tồn kho và Lịch sử</div></div>' + ic('chev', 'chev') + '</button>' +
      '<button class="setting" data-ex="csv-ton"><span class="act-ic t-chuyen">' + ic('table') + '</span><div class="mid"><div class="t">CSV · Tồn kho</div><div class="s">Mở được bằng Excel, Numbers, Google Sheets</div></div>' + ic('chev', 'chev') + '</button>' +
      '<button class="setting" data-ex="csv-ls"><span class="act-ic t-chuyen">' + ic('clock') + '</span><div class="mid"><div class="t">CSV · Lịch sử</div><div class="s">Toàn bộ nhập, xuất, điều chỉnh</div></div>' + ic('chev', 'chev') + '</button></div>';
    sh.body.addEventListener('click', async e => {
      const b = e.target.closest('[data-ex]'); if (!b) return;
      let file;
      if (b.dataset.ex === 'xlsx') file = new File([KhoXLSX.build([{ name: 'Tồn kho', rows: K.stockRows(S, D) }, { name: 'Lịch sử', rows: K.historyRows(S, D) }])], 'KhoCuaToi_' + stamp() + '.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      else if (b.dataset.ex === 'csv-ton') file = new File([K.toCSV(K.stockRows(S, D))], 'KhoCuaToi_TonKho_' + stamp() + '.csv', { type: 'text/csv' });
      else file = new File([K.toCSV(K.historyRows(S, D))], 'KhoCuaToi_LichSu_' + stamp() + '.csv', { type: 'text/csv' });
      const r = await deliverFile(file);
      if (r !== 'cancel') toast('Đã tạo tệp ' + file.name);
    });
  }
  async function sheetStorage() {
    const sh = openSheet({ title: 'Bộ nhớ trên máy', foot: false });
    const est = await DB.estimate();
    const persisted = await DB.persist();
    sh.body.innerHTML = '<div class="card kv"><div class="k">Đang dùng</div><div class="v num">' + (est && est.usage != null ? fmtBytes(est.usage) : 'Không rõ') + '</div>' +
      '<div class="k">Hạn mức trình duyệt cho phép</div><div class="v num">' + (est && est.quota ? fmtBytes(est.quota) : 'Không rõ') + '</div>' +
      '<div class="k">Chế độ lưu bền</div><div class="v">' + (persisted ? 'Đã bật' : 'Chưa được cấp') + '</div>' +
      '<div class="k">Chạy như ứng dụng</div><div class="v">' + (navigator.standalone || matchMedia('(display-mode: standalone)').matches ? 'Có (từ màn hình chính)' : 'Không (đang mở trong trình duyệt)') + '</div></div>' +
      '<div class="prose"><h4>Dữ liệu được giữ ở đâu?</h4><p>Toàn bộ nằm trong bộ nhớ riêng của ứng dụng trên iPhone này, dùng được khi không có mạng. Đóng hay mở lại ứng dụng không làm mất dữ liệu.</p><h4>Khi nào có thể mất?</h4><ul><li>Xóa biểu tượng Kho Của Tôi khỏi màn hình chính.</li><li>Vào Cài đặt → Safari → Xóa lịch sử và dữ liệu trang web.</li><li>Đổi sang iPhone khác hoặc mở ứng dụng từ địa chỉ web khác.</li></ul><p>Vì vậy hãy sao lưu định kỳ vào ứng dụng Tệp hoặc iCloud Drive. Ứng dụng sẽ nhắc nếu quá 14 ngày chưa sao lưu.</p></div>';
  }
  function sheetGuide() {
    const sh = openSheet({ title: 'Hướng dẫn sử dụng', full: true, foot: false });
    sh.body.innerHTML = '<div class="prose">' +
      '<h4>Nhập kho</h4><p>Nhấn <b>Nhập kho</b>. Gõ tên: nếu món đó đã có, ứng dụng gợi ý để bạn nhập thêm thay vì tạo trùng. Món mới thì chụp ảnh, chọn đơn vị, loại hàng, số lượng, giá (có thể để trống) và vị trí cất. Mỗi lần nhập là một đợt riêng trong lịch sử.</p>' +
      '<h4>Xuất kho</h4><p>Nhấn <b>Xuất kho</b>, chọn món và vị trí lấy hàng, nhập số lượng (hoặc nút <b>Xuất hết</b>), chọn lý do. Ứng dụng hiện số còn lại trước khi bạn xác nhận và không cho xuất quá số đang có. Xuất nhầm thì nhấn <b>Hoàn tác</b> ngay trên thông báo, hoặc mở dòng lịch sử đó để hoàn tác.</p>' +
      '<h4>Cho mượn và nhận lại</h4><p>Chọn lý do <b>Cho mượn</b> khi xuất. Hàng được trừ khỏi kho và hiện ở mục “Đang cho mượn”. Khi được trả, mở mặt hàng → <b>Nhận lại</b>, nhận một phần hoặc đủ.</p>' +
      '<h4>Chuyển vị trí và kiểm kê</h4><p><b>Chuyển vị trí</b> chỉ đổi chỗ cất trong kho, tổng không đổi. <b>Kiểm kê</b> để sửa số lượng theo thực tế: nhập số đếm được, ghi lý do, ứng dụng lưu số trước và sau. Số lượng không sửa trực tiếp được ở chỗ nào khác.</p>' +
      '<h4>Tìm kiếm</h4><p>Gõ tên, mã, ghi chú hoặc vị trí, có dấu hay không dấu đều được (“ke a” tìm ra “Kệ A”). Danh sách mặc định chỉ hiện hàng còn; chọn <b>Tất cả</b> để thấy cả hàng đã xuất hết.</p>' +
      '<h4>Giá trị ước tính được tính thế nào?</h4><p>Giá mỗi đơn vị = <b>bình quân gia quyền</b> giá của các đợt nhập có ghi giá. Giá trị = số lượng còn × giá bình quân. Đợt nhập không ghi giá không bị tính là 0 đồng. Mặt hàng chưa đợt nào có giá hiện “Chưa có giá” và không cộng vào tổng; Trang chủ ghi rõ còn bao nhiêu mặt hàng như vậy. Có thể bổ sung giá sau bằng cách mở dòng nhập trong lịch sử.</p>' +
      '<h4>Sao lưu và khôi phục</h4><p>Cài đặt → <b>Sao lưu</b> → Lưu vào Tệp (iCloud Drive). Khi cần lấy lại, Cài đặt → <b>Khôi phục</b> → chọn tệp. Ứng dụng kiểm tra tệp trước và hỏi lại vì thao tác này thay thế dữ liệu hiện có.</p>' +
      '</div>';
  }
  async function wipeAll() {
    const v = await promptBox({ title: 'Xóa toàn bộ dữ liệu?', msg: 'Mọi mặt hàng, ảnh, vị trí và lịch sử trên máy này sẽ bị xóa. Gõ XOA để xác nhận.', value: '', placeholder: 'XOA', ok: 'Xóa toàn bộ', danger: true, validate: v => K.norm(v) === 'xoa' ? null : 'Hãy gõ đúng XOA.' });
    if (!v) return;
    const st = K.seedDefaults(K.emptyState());
    if (await safe(async () => { await DB.replaceAll(st, {}); S = st; D = K.derive(S); }) === false) return;
    ui.detail = null; go('home'); toast('Đã xóa toàn bộ dữ liệu');
  }

  /* ================= khởi động ================= */
  async function boot() {
    try {
      const r = await DB.loadAll();
      S = r.state;
      if (r.empty) { S = K.seedDefaults(K.emptyState()); await DB.replaceAll(S, {}); }
      if (!S.locations[K.NONE_LOC]) S.locations[K.NONE_LOC] = { id: K.NONE_LOC, kho: '', ke: '', tang: '', hop: '', system: true };
      D = K.derive(S);
      if (D.errors.length) console.warn('Dữ liệu có điểm bất thường', D.errors);
    } catch (e) {
      $('#view').innerHTML = '<div class="wrap" style="padding-top:calc(var(--sat) + 40px)"><div class="notice danger">' + ic('alert') + '<div><b>Không mở được bộ nhớ của ứng dụng.</b><br>' + esc(e.message || e) + '<br>Nếu đang dùng chế độ Duyệt web riêng tư, hãy mở bằng tab thường hoặc từ màn hình chính.</div></div></div>';
      return;
    }
    bindUX();
    bindGlobal();
    render();
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      const hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register('sw.js').catch(() => { });
      // Khi có phiên bản mới: tải lại nếu không có biểu mẫu đang mở, nếu không thì hỏi
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController) return;
        if (!sheets.length) location.reload();
        else toast('Đã có bản cập nhật giao diện', 'ok', { label: 'Tải lại', run: () => location.reload() });
      });
    }
    if (Object.keys(S.items).length) DB.persist();
  }
  window.__kho = { get S() { return S; }, get D() { return D; } }; // phục vụ kiểm thử
  boot();
})();

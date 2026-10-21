/* Kho Của Tôi — lưu trữ IndexedDB trên thiết bị.
 * Mỗi kho là một cơ sở dữ liệu riêng (tách biệt hoàn toàn). Kho đầu tiên dùng đúng tên cũ "kho-cua-toi"
 * nên dữ liệu từ các phiên bản trước giữ nguyên. Danh sách các kho nằm trong cơ sở dữ liệu "kho-cua-toi-danh-sach". */
(function (root) {
  'use strict';
  const MAIN_DB = 'kho-cua-toi';
  const REG_DB = 'kho-cua-toi-danh-sach';
  const VER = 1;
  const STORES = ['meta', 'items', 'movements', 'categories', 'units', 'locations', 'photos'];
  let NAME = MAIN_DB;
  let dbp = null, regp = null;

  function req2p(r) { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
  function done(tx) {
    return new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error || new Error('Giao dịch bị hủy')); });
  }
  function all(store) { return req2p(store.getAll()); }

  /* ---------- cơ sở dữ liệu của kho đang mở ---------- */
  function openNamed(name) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(name, VER);
      req.onupgradeneeded = () => {
        const db = req.result;
        for (const s of STORES) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: s === 'meta' || s === 'photos' ? 'key' : 'id' });
      };
      req.onsuccess = () => { const db = req.result; db.onversionchange = () => db.close(); resolve(db); };
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('Cơ sở dữ liệu đang bị khóa. Hãy đóng các tab khác của ứng dụng.'));
    });
  }
  function open() { if (!dbp) dbp = openNamed(NAME); return dbp; }
  /** Chuyển sang cơ sở dữ liệu của kho khác */
  async function use(name) {
    if (name === NAME && dbp) return;
    if (dbp) { try { (await dbp).close(); } catch (e) { } }
    NAME = name; dbp = null;
  }
  function current() { return NAME; }

  async function loadAll() {
    const db = await open();
    const tx = db.transaction(['meta', 'items', 'movements', 'categories', 'units', 'locations'], 'readonly');
    const [meta, items, movements, categories, units, locations] = await Promise.all(
      ['meta', 'items', 'movements', 'categories', 'units', 'locations'].map(s => all(tx.objectStore(s))));
    const st = { items: {}, movements, locations: {}, categories: {}, units: {}, meta: { seq: 0, codeSeq: 0 } };
    const m = meta.find(x => x.key === 'meta'); if (m) st.meta = m.value;
    items.forEach(x => st.items[x.id] = x);
    categories.forEach(x => st.categories[x.id] = x);
    units.forEach(x => st.units[x.id] = x);
    locations.forEach(x => st.locations[x.id] = x);
    movements.sort((a, b) => a.seq - b.seq);
    return { state: st, empty: !m };
  }

  /** Ghi nhiều thay đổi trong MỘT giao dịch: put = {store: [records]}, del = {store: [keys]} */
  async function write(put, del, meta) {
    const db = await open();
    const tx = db.transaction(STORES, 'readwrite');
    for (const s of Object.keys(put || {})) for (const r of put[s]) tx.objectStore(s).put(r);
    for (const s of Object.keys(del || {})) for (const k of del[s]) tx.objectStore(s).delete(k);
    if (meta) tx.objectStore('meta').put({ key: 'meta', value: meta });
    await done(tx);
  }

  async function getPhoto(itemId) {
    const db = await open();
    const r = await req2p(db.transaction('photos').objectStore('photos').get(itemId));
    return r ? r.data : null;
  }
  async function allPhotos() {
    const db = await open();
    const rows = await all(db.transaction('photos').objectStore('photos'));
    const out = {}; rows.forEach(r => out[r.key] = r.data); return out;
  }

  /** Thay toàn bộ dữ liệu của kho đang mở (khôi phục) trong một giao dịch */
  async function replaceAll(state, photos) { return replaceIn(await open(), state, photos); }
  async function replaceIn(db, state, photos) {
    const tx = db.transaction(STORES, 'readwrite');
    for (const s of STORES) tx.objectStore(s).clear();
    tx.objectStore('meta').put({ key: 'meta', value: state.meta });
    Object.values(state.items).forEach(x => tx.objectStore('items').put(x));
    state.movements.forEach(x => tx.objectStore('movements').put(x));
    Object.values(state.categories).forEach(x => tx.objectStore('categories').put(x));
    Object.values(state.units).forEach(x => tx.objectStore('units').put(x));
    Object.values(state.locations).forEach(x => tx.objectStore('locations').put(x));
    Object.keys(photos || {}).forEach(k => tx.objectStore('photos').put({ key: k, data: photos[k] }));
    await done(tx);
  }
  /** Ghi dữ liệu vào một kho KHÁC kho đang mở (tạo kho mới, khôi phục thành kho mới) */
  async function writeTo(name, state, photos) {
    const db = await openNamed(name);
    try { await replaceIn(db, state, photos); } finally { db.close(); }
  }
  /** Đọc toàn bộ một kho KHÁC kho đang mở (sao lưu tất cả các kho) */
  async function loadFrom(name) {
    if (name === NAME) { const r = await loadAll(); return { state: r.state, photos: await allPhotos() }; }
    const db = await openNamed(name);
    try {
      const tx = db.transaction(STORES, 'readonly');
      const [meta, items, movements, categories, units, locations, photos] = await Promise.all(STORES.map(s => all(tx.objectStore(s))));
      const st = { items: {}, movements, locations: {}, categories: {}, units: {}, meta: { seq: 0, codeSeq: 0 } };
      const m = meta.find(x => x.key === 'meta'); if (m) st.meta = m.value;
      items.forEach(x => st.items[x.id] = x); categories.forEach(x => st.categories[x.id] = x);
      units.forEach(x => st.units[x.id] = x); locations.forEach(x => st.locations[x.id] = x);
      movements.sort((a, b) => a.seq - b.seq);
      const ph = {}; photos.forEach(r => ph[r.key] = r.data);
      return { state: st, photos: ph };
    } finally { db.close(); }
  }
  /** Cập nhật vài trường meta của một kho khác (ví dụ mốc sao lưu) */
  async function patchMeta(name, patch) {
    const db = await openNamed(name);
    try {
      const tx = db.transaction('meta', 'readwrite'); const st = tx.objectStore('meta');
      const cur = await req2p(st.get('meta'));
      st.put({ key: 'meta', value: Object.assign({}, cur ? cur.value : { seq: 0, codeSeq: 0 }, patch) });
      await done(tx);
    } finally { db.close(); }
  }
  /** Xóa hẳn cơ sở dữ liệu của một kho (không phải kho đang mở) */
  function dropDb(name) {
    return new Promise((res, rej) => {
      const r = indexedDB.deleteDatabase(name);
      r.onsuccess = () => res(); r.onerror = () => rej(r.error);
      r.onblocked = () => rej(new Error('Kho đang được mở ở nơi khác. Hãy đóng các tab khác của ứng dụng rồi thử lại.'));
    });
  }

  /* ---------- danh sách các kho ---------- */
  function openReg() {
    if (regp) return regp;
    regp = new Promise((resolve, reject) => {
      const req = indexedDB.open(REG_DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('khos')) db.createObjectStore('khos', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return regp;
  }
  async function listKhos() {
    const db = await openReg();
    const rows = await all(db.transaction('khos').objectStore('khos'));
    return rows.sort((a, b) => (a.order || 0) - (b.order || 0) || String(a.createdAt).localeCompare(String(b.createdAt)));
  }
  async function putKho(k) { const db = await openReg(); const tx = db.transaction('khos', 'readwrite'); tx.objectStore('khos').put(k); await done(tx); }
  async function removeKho(id) { const db = await openReg(); const tx = db.transaction('khos', 'readwrite'); tx.objectStore('khos').delete(id); await done(tx); }
  async function getSetting(key) { const db = await openReg(); const r = await req2p(db.transaction('settings').objectStore('settings').get(key)); return r ? r.value : undefined; }
  async function setSetting(key, value) { const db = await openReg(); const tx = db.transaction('settings', 'readwrite'); tx.objectStore('settings').put({ key, value }); await done(tx); }
  /** Kho cũ (trước khi có nhiều kho) đã có dữ liệu chưa */
  async function mainHasData() {
    try {
      if (indexedDB.databases) {
        const list = await indexedDB.databases();
        if (!list.some(d => d.name === MAIN_DB)) return false;
      }
      const db = await openNamed(MAIN_DB);
      try { const m = await req2p(db.transaction('meta').objectStore('meta').get('meta')); return !!m; } finally { db.close(); }
    } catch (e) { return false; }
  }

  async function persist() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        if (await navigator.storage.persisted()) return true;
        return await navigator.storage.persist();
      }
    } catch (e) { }
    return false;
  }
  async function estimate() {
    try { if (navigator.storage && navigator.storage.estimate) return await navigator.storage.estimate(); } catch (e) { }
    return null;
  }

  root.KhoDB = {
    MAIN_DB, use, current, loadAll, write, getPhoto, allPhotos, replaceAll, writeTo, dropDb, loadFrom, patchMeta,
    listKhos, putKho, removeKho, getSetting, setSetting, mainHasData, persist, estimate
  };
})(self);

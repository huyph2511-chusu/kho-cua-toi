/* Kho Của Tôi — lưu trữ IndexedDB trên thiết bị */
(function (root) {
  'use strict';
  const NAME = 'kho-cua-toi';
  const VER = 1;
  const STORES = ['meta', 'items', 'movements', 'categories', 'units', 'locations', 'photos'];
  let dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(NAME, VER);
      req.onupgradeneeded = () => {
        const db = req.result;
        for (const s of STORES) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: s === 'meta' || s === 'photos' ? 'key' : 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('Cơ sở dữ liệu đang bị khóa. Hãy đóng các tab khác của ứng dụng.'));
    });
    return dbp;
  }
  function done(tx) {
    return new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error || new Error('Giao dịch bị hủy')); });
  }
  function all(store) {
    return new Promise((res, rej) => { const r = store.getAll(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  }

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
    return new Promise((res, rej) => {
      const r = db.transaction('photos').objectStore('photos').get(itemId);
      r.onsuccess = () => res(r.result ? r.result.data : null); r.onerror = () => rej(r.error);
    });
  }
  async function allPhotos() {
    const db = await open();
    const rows = await all(db.transaction('photos').objectStore('photos'));
    const out = {}; rows.forEach(r => out[r.key] = r.data); return out;
  }

  /** Thay toàn bộ dữ liệu (khôi phục) trong một giao dịch */
  async function replaceAll(state, photos) {
    const db = await open();
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

  root.KhoDB = { loadAll, write, getPhoto, allPhotos, replaceAll, persist, estimate };
})(self);

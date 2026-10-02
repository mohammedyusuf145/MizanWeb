// ============================================================================
//  idb — tiny IndexedDB wrapper. One database PER USER ("proof-<uid>"), so a
//  different account on the same browser can never see another user's cache.
// ============================================================================

const STORES = ['profiles', 'projects', 'stages', 'tasks', 'subtasks', 'reminders', 'meta'];

export class UserDB {
  constructor(uid) { this.name = `proof-${uid}`; this.db = null; }

  open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.name, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        for (const s of STORES) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: s === 'meta' ? 'k' : 'id' });
        if (!db.objectStoreNames.contains('queue')) db.createObjectStore('queue', { keyPath: 'seq', autoIncrement: true });
      };
      req.onsuccess = () => { this.db = req.result; this.db.onversionchange = () => this.db.close(); resolve(this); };
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('idb blocked'));
    });
  }

  _tx(stores, mode, fn) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(stores, mode);
      let out;
      tx.oncomplete = () => resolve(out);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
      out = fn(tx);
    });
  }
  _req(r) { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }

  getAll(store) { return this._req(this.db.transaction(store).objectStore(store).getAll()); }
  put(store, value) { return this._tx(store, 'readwrite', (tx) => { tx.objectStore(store).put(value); }); }
  putMany(store, values) { return this._tx(store, 'readwrite', (tx) => { const s = tx.objectStore(store); values.forEach((v) => s.put(v)); }); }
  del(store, id) { return this._tx(store, 'readwrite', (tx) => { tx.objectStore(store).delete(id); }); }
  clear(store) { return this._tx(store, 'readwrite', (tx) => { tx.objectStore(store).clear(); }); }
  count(store) { return this._req(this.db.transaction(store).objectStore(store).count()); }

  async getMeta(k) { const r = await this._req(this.db.transaction('meta').objectStore('meta').get(k)); return r ? r.v : undefined; }
  setMeta(k, v) { return this.put('meta', { k, v }); }

  /** Replace the contents of a table store in one transaction. */
  replaceAll(store, rows) {
    return this._tx(store, 'readwrite', (tx) => { const s = tx.objectStore(store); s.clear(); rows.forEach((r) => s.put(r)); });
  }

  // --- mutation queue (ordered by auto-increment seq) ---
  enqueue(op) { return this._req(this.db.transaction('queue', 'readwrite').objectStore('queue').add(op)); }
  queueAll() { return this.getAll('queue'); }
  queueDelete(seq) { return this.del('queue', seq); }
  queuePut(op) { return this.put('queue', op); }

  close() { try { this.db?.close(); } catch { /* already closed */ } }

  static destroy(uid) {
    return new Promise((resolve) => {
      const req = indexedDB.deleteDatabase(`proof-${uid}`);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
  }
}

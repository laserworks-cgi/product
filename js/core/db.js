import { DB_NAME, DB_VERSION, STORE } from "./config.js";

let db;

export const openDatabase = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
  req.onsuccess = () => { db = req.result; resolve(db); };
  req.onerror = () => reject(req.error);
});

const run = (mode, fn) => new Promise((resolve, reject) => {
  const req = fn(db.transaction(STORE, mode).objectStore(STORE));
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

export const dbAll = () => run("readonly", (s) => s.getAll());
export const dbGet = (id) => run("readonly", (s) => s.get(Number(id)));
export const dbAdd = (item) => run("readwrite", (s) => s.add(item));
export const dbSave = (item) => run("readwrite", (s) => s.put(item));
export const dbDelete = (id) => run("readwrite", (s) => s.delete(Number(id)));

// Impor massal dalam satu transaksi. Item tidak boleh membawa id (id dibuat otomatis).
export const dbImport = (items, replace = false) => new Promise((resolve, reject) => {
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  if (replace) store.clear();
  items.forEach((item) => store.add(item));
  tx.oncomplete = () => resolve(items.length);
  tx.onerror = tx.onabort = () => reject(tx.error);
});

import { PROCESS_LIST } from "./config.js";
import { MONTHS, SHORT_MONTHS, defaultDeadline, isValidDate, sanitizeHTML } from "./utils.js";

/* ===== Pembuatan & normalisasi data ===== */
export function newItem({ name, qty, img = "" }) {
  return {
    name,
    qty: Number(qty),
    img,
    description: "",
    subtasks: [],
    completed: false,
    completedAt: null,
    deadline: defaultDeadline(), // hari ini jam 16:00
    process: "Ditulis",
    attachments: [],
    createdAt: new Date().toISOString(),
  };
}

// Dipakai saat memuat dari DB dan saat impor JSON: menjamin semua field ada dan bertipe benar
export function normalizeItem(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const item = {
    name: String(r.name ?? "").trim() || "Tanpa nama",
    qty: Math.max(1, Math.floor(Number(r.qty)) || 1),
    img: typeof r.img === "string" ? r.img : "",
    description: typeof r.description === "string" ? sanitizeHTML(r.description) : "",
    subtasks: Array.isArray(r.subtasks)
      ? r.subtasks.map((t) => ({ text: String(t?.text ?? "").trim(), done: Boolean(t?.done) })).filter((t) => t.text)
      : [],
    completed: Boolean(r.completed),
    completedAt: r.completed && isValidDate(r.completedAt) ? r.completedAt : null,
    deadline: isValidDate(r.deadline) ? r.deadline : defaultDeadline(),
    process: PROCESS_LIST.includes(r.process) ? r.process : "Ditulis",
    attachments: Array.isArray(r.attachments)
      ? r.attachments
          .filter((a) => a && a.name)
          .map((a) => ({ name: String(a.name), size: String(a.size ?? ""), type: String(a.type ?? ""), data: typeof a.data === "string" ? a.data : "" }))
      : [],
    createdAt: isValidDate(r.createdAt) ? r.createdAt : new Date().toISOString(),
  };
  return r.id != null ? { id: r.id, ...item } : item;
}

/* ===== Pengurutan =====
   1. Belum selesai: deadline paling dekat di depan
   2. Selesai: di belakang, yang paling baru selesai di depan daftar selesai */
const time = (v) => { const t = new Date(v).getTime(); return isNaN(t) ? Infinity : t; };

export function sortItems(items) {
  const open = items
    .filter((i) => !i.completed)
    .sort((a, b) => (time(a.deadline) - time(b.deadline)) || (a.id - b.id));
  const done = items
    .filter((i) => i.completed)
    .sort((a, b) => (time(b.completedAt || b.createdAt) - time(a.completedAt || a.createdAt)) || (b.id - a.id));
  return [...open, ...done];
}

/* ===== Teks pencarian (nama, jumlah, deadline) ===== */
export function searchText(item) {
  const name = (item.name || "").toLowerCase();
  const qtyStr = `${item.qty} pcs`;
  const qtyFmtStr = `${Number(item.qty).toLocaleString("id-ID")} pcs`;

  let deadlineStr = "";
  if (isValidDate(item.deadline)) {
    const dt = new Date(item.deadline);
    const d = dt.getDate();
    const mFull = MONTHS[dt.getMonth()].toLowerCase();
    const mShort = SHORT_MONTHS[dt.getMonth()].toLowerCase();
    const y = dt.getFullYear();
    deadlineStr = `${d} ${mFull} ${d} ${mShort} ${mFull} ${mShort} ${d} ${mFull} ${y} ${d} ${mShort} ${y}`;
  }
  return `${name} | ${qtyStr} | ${qtyFmtStr} | ${deadlineStr}`;
}

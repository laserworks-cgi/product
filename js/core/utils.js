import { DEFAULT_IMAGE, DEFAULT_DEADLINE_HOUR } from "./config.js";

export const $ = (id) => document.getElementById(id);
export const icons = () => window.lucide?.createIcons();

export const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
export const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export const pad = (n) => String(n).padStart(2, "0");
export const fmtQty = (q) => `${Number(q).toLocaleString("id-ID")} pcs`;
export const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ===== Sanitasi HTML deskripsi: hanya tag format dasar, atribut dibuang ===== */
const ALLOWED_TAGS = new Set(["B", "I", "U", "STRONG", "EM", "BR", "DIV", "P", "SPAN", "UL", "OL", "LI"]);
export function sanitizeHTML(html) {
  if (typeof document === "undefined") return String(html ?? "");
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const clean = (node) => [...node.children].forEach((el) => {
    clean(el);
    if (!ALLOWED_TAGS.has(el.tagName)) {
      if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED"].includes(el.tagName)) el.remove();
      else el.replaceWith(...el.childNodes);
    } else [...el.attributes].forEach((a) => el.removeAttribute(a.name));
  });
  clean(tpl.content);
  return tpl.innerHTML;
}

/* ===== Foto ===== */
// Data lama menyimpan URL placeholder; anggap sebagai "tanpa foto"
export const hasPhoto = (item) => Boolean(item?.img) && !String(item.img).includes("placehold.co");
export const imgSrc = (item) => (hasPhoto(item) ? item.img : DEFAULT_IMAGE);

/* ===== File ===== */
export const fileToBase64 = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => resolve("");
  reader.readAsDataURL(file);
});

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ===== Tanggal & deadline ===== */
// Format simpan: "YYYY-MM-DDTHH:mm" (waktu lokal)
export const toLocalIso = (y, m, d, h, mi) => `${y}-${pad(m + 1)}-${pad(d)}T${pad(h)}:${pad(mi)}`;
export const isValidDate = (v) => Boolean(v) && !isNaN(new Date(v).getTime());

export function defaultDeadline(now = new Date()) {
  return toLocalIso(now.getFullYear(), now.getMonth(), now.getDate(), DEFAULT_DEADLINE_HOUR, 0);
}

export const fmtParts = (y, m, d, h, mi) => `${d} ${MONTHS[m]} ${y} | ${pad(h)}:${pad(mi)} WIB`;
export const fmtShortParts = (y, m, d, h, mi) => `${d} ${SHORT_MONTHS[m]} ${pad(h)}:${pad(mi)}`;

const safeDate = (iso) => (isValidDate(iso) ? new Date(iso) : new Date(defaultDeadline()));
export const fmtDeadline = (iso) => {
  const dt = safeDate(iso);
  return fmtParts(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes());
};
export const fmtShortDeadline = (iso) => {
  const dt = safeDate(iso);
  return fmtShortParts(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes());
};

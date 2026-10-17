import { $ } from "../core/utils.js";

const KINDS = {
  info: "bg-gray-900 text-white",
  success: "bg-emerald-600 text-white",
  error: "bg-rose-600 text-white",
};
let timer;

export function toast(message, kind = "info") {
  const el = $("toast");
  if (!el) return;
  el.textContent = message;
  el.className = `fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-lg px-4 py-2 text-xs font-semibold shadow-lg pointer-events-none transition-opacity duration-200 opacity-100 ${KINDS[kind] || KINDS.info}`;
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.replace("opacity-100", "opacity-0"), 3200);
}

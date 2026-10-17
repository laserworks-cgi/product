import { PROCESS_LIST } from "../../core/config.js";
import { $, icons } from "../../core/utils.js";
import { toggleModal, bindModal } from "../../ui/modal.js";

// Tahapan proses: klik untuk memilih, atau scroll roda mouse pada kartu untuk berpindah tahap
export function init(ctx) {
  const { item } = ctx;
  const modal = $("modal-process-picker");
  const list = $("process-options-list");
  const display = $("header-process-display");
  const card = $("header-process-card");

  display.textContent = item.process;

  function renderModal() {
    list.innerHTML = PROCESS_LIST.map((p) => {
      const current = item.process === p;
      return `
        <button type="button" data-process="${p}" class="btn-select-proc flex items-center justify-between p-2 rounded-xl border text-left transition ${current ? "border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-200" : "border-gray-200 hover:border-gray-300 bg-gray-50/60 hover:bg-white text-gray-800"}">
          <span class="text-xs font-bold">${p}</span>
          ${current ? '<i data-lucide="check" class="h-3.5 w-3.5 text-rose-600"></i>' : ""}
        </button>`;
    }).join("");
    icons();
  }

  async function setProcess(name) {
    item.process = name;
    display.textContent = name;
    await ctx.save();
  }

  list.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-select-proc");
    if (!btn) return;
    await setProcess(btn.dataset.process);
    toggleModal(modal, false);
  });

  card.addEventListener("click", () => { renderModal(); toggleModal(modal, true); });
  bindModal(modal, $("btn-close-process-modal"));

  card.addEventListener("wheel", async (e) => {
    e.preventDefault();
    const idx = Math.max(0, PROCESS_LIST.indexOf(item.process));
    const next = Math.max(0, Math.min(PROCESS_LIST.length - 1, idx + (e.deltaY > 0 ? 1 : -1)));
    if (next !== idx) await setProcess(PROCESS_LIST[next]);
  }, { passive: false });
}

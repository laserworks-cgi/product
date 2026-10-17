import { $, icons } from "../../core/utils.js";

// Checklist subtask
export function init(ctx) {
  const { item } = ctx;
  const box = $("subtasks-container");

  function updateCounters() {
    const list = item.subtasks;
    const done = list.filter((s) => s.done).length;
    $("header-subtask-display").textContent = `${done}/${list.length} Selesai`;
    $("subtask-progress-label").textContent = `${done}/${list.length} selesai`;
  }

  function render() {
    const list = item.subtasks;
    updateCounters();

    if (!list.length) {
      box.innerHTML = `
        <div class="flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 my-auto">
          <i data-lucide="check-square" class="h-6 w-6 text-gray-300 mb-1.5"></i>
          <p class="text-xs font-medium text-gray-500">Belum ada checklist subtask</p>
          <p class="text-[10px] text-gray-400">Tambahkan langkah seperti potong bahan, poles, grafir, atau perakitan.</p>
        </div>`;
    } else {
      box.innerHTML = list.map((t, i) => `
        <div class="flex items-center justify-between gap-2 p-2 rounded-lg border transition-all ${t.done ? "bg-emerald-50/50 border-emerald-200 text-emerald-900" : "bg-gray-50/70 border-gray-200 text-gray-800 hover:bg-gray-50"}">
          <label class="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none">
            <input type="checkbox" data-index="${i}" ${t.done ? "checked" : ""} class="subtask-checkbox h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
            <span class="text-xs font-medium truncate ${t.done ? "line-through text-gray-400" : "text-gray-700"}"></span>
          </label>
          <button type="button" data-index="${i}" class="btn-delete-subtask text-gray-400 hover:text-red-500 p-1 rounded transition" title="Hapus subtask">
            <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
          </button>
        </div>`).join("");
      box.querySelectorAll("label span").forEach((el, i) => { el.textContent = list[i].text; });
    }
    icons();
  }

  const saveAndRender = async () => {
    render();
    await ctx.save();
  };

  box.addEventListener("change", (e) => {
    if (!e.target.matches(".subtask-checkbox")) return;
    item.subtasks[Number(e.target.dataset.index)].done = e.target.checked;
    saveAndRender();
  });
  box.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-delete-subtask");
    if (!btn) return;
    item.subtasks.splice(Number(btn.dataset.index), 1);
    saveAndRender();
  });
  $("form-add-subtask").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("input-new-subtask");
    const text = input.value.trim();
    if (!text) return;
    item.subtasks.push({ text, done: false });
    input.value = "";
    saveAndRender();
  });

  render();
}

import { $, esc, fileToBase64, icons } from "../../core/utils.js";
import { toggleModal, bindModal } from "../../ui/modal.js";
import { openImagePreview } from "../../ui/imagePreview.js";

// Lampiran berkas (disimpan sebagai data URL di IndexedDB)
export function init(ctx) {
  const { item } = ctx;
  const modal = $("modal-attachment-manager");
  const listEl = $("attachment-list-container");
  const display = $("header-attachment-display");

  const updateDisplay = () => { display.textContent = `${item.attachments.length} File`; };
  updateDisplay();

  const isImage = (f) =>
    (f.type && f.type.startsWith("image/")) || (f.data && f.data.startsWith("data:image/")) || /\.(png|jpe?g|webp|svg|gif|bmp|ico)$/i.test(f.name);

  function render() {
    const files = item.attachments;
    if (!files.length) {
      listEl.innerHTML = `
        <div class="flex flex-col items-center justify-center p-4 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60">
          <i data-lucide="file-question" class="h-5 w-5 text-gray-300 mb-1"></i>
          <p class="text-xs font-semibold text-gray-500">Belum ada file lampiran</p>
          <p class="text-[10px] text-gray-400">Gunakan tombol "Pilih File" di bawah untuk melampirkan berkas.</p>
        </div>`;
    } else {
      listEl.innerHTML = files.map((file, idx) => {
        const img = isImage(file);
        return `
          <div class="flex items-center justify-between gap-2 p-2 rounded-lg border border-gray-200 bg-gray-50/80 hover:bg-white transition">
            <div class="flex items-center gap-2 min-w-0 flex-1 ${img ? "cursor-pointer hover:text-blue-600" : ""}" data-preview-index="${img ? idx : ""}">
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${img ? "bg-blue-100 text-blue-700" : "bg-sky-100 text-sky-700"}">
                <i data-lucide="${img ? "image" : "file"}" class="h-4 w-4"></i>
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-xs font-bold text-gray-800 truncate" title="${esc(file.name)}">${esc(file.name)}</span>
                <span class="text-[10px] text-gray-400">${esc(file.size || "Berkas")} ${img ? "• Gambar" : ""}</span>
              </div>
            </div>
            <div class="flex items-center gap-1">
              ${img ? `<button type="button" data-index="${idx}" class="btn-preview-attachment p-1 rounded text-gray-500 hover:text-blue-600 transition" title="Preview Gambar"><i data-lucide="eye" class="h-3.5 w-3.5"></i></button>` : ""}
              ${file.data ? `<a href="${file.data}" download="${esc(file.name)}" class="p-1 rounded text-gray-500 hover:text-sky-600 transition" title="Unduh berkas"><i data-lucide="download" class="h-3.5 w-3.5"></i></a>` : ""}
              <button type="button" data-index="${idx}" class="btn-delete-attachment p-1 rounded text-gray-400 hover:text-red-500 transition" title="Hapus lampiran">
                <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
              </button>
            </div>
          </div>`;
      }).join("");
    }
    icons();
  }

  listEl.addEventListener("click", async (e) => {
    const del = e.target.closest(".btn-delete-attachment");
    if (del) {
      item.attachments.splice(Number(del.dataset.index), 1);
      render();
      updateDisplay();
      await ctx.save();
      return;
    }
    const target = e.target.closest(".btn-preview-attachment, [data-preview-index]");
    const idx = target?.dataset.index ?? target?.dataset.previewIndex;
    if (idx === undefined || idx === "") return;
    const f = item.attachments[Number(idx)];
    if (f?.data) openImagePreview(f.data, f.name);
  });

  $("header-attachment-card").addEventListener("click", () => { render(); toggleModal(modal, true); });
  bindModal(modal, $("btn-close-attachment-modal"), $("btn-done-attachment"));

  const fileInput = $("input-attachment-file");
  $("btn-trigger-upload-attachment").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    for (const file of files) {
      item.attachments.push({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        data: await fileToBase64(file),
      });
    }
    render();
    updateDisplay();
    await ctx.save();
    e.target.value = "";
  });
}

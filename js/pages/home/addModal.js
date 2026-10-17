import { $, fileToBase64 } from "../../core/utils.js";
import { toggleModal, bindModal } from "../../ui/modal.js";

// Modal "Tambah Data". onCreate({ name, qty, img }) dipanggil saat form disimpan.
export function initAddModal({ onCreate }) {
  const modal = $("modal-add-card");
  const dropzone = $("dropzone"), fileInput = $("file-input");
  const prompt = $("dropzone-prompt"), preview = $("dropzone-preview");
  const inputName = $("input-item-name"), inputQty = $("input-item-qty");
  let photo = "";

  function setPreview(dataUrl = "", filename = "foto-produk") {
    photo = dataUrl;
    if (!dataUrl) fileInput.value = "";
    $("preview-img-tag").src = dataUrl;
    $("preview-filename").textContent = filename;
    prompt.classList.toggle("hidden", !!dataUrl);
    preview.classList.toggle("hidden", !dataUrl);
    preview.classList.toggle("flex", !!dataUrl);
  }

  async function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const data = await fileToBase64(file);
    if (data) setPreview(data, file.name);
  }

  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
  ["dragenter", "dragover", "dragleave", "drop"].forEach((type) => dropzone.addEventListener(type, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.toggle("dragover", type === "dragenter" || type === "dragover");
    if (type === "drop") handleFile(e.dataTransfer.files[0]);
  }));
  $("btn-remove-file").addEventListener("click", (e) => { e.stopPropagation(); setPreview(); });

  $("btn-add-card").addEventListener("click", () => {
    inputName.value = "";
    inputQty.value = "";
    setPreview();
    toggleModal(modal, true);
    setTimeout(() => inputName.focus(), 50);
  });
  bindModal(modal, $("btn-close-modal"), $("btn-cancel-modal"));

  $("form-add-card").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = inputName.value.trim(), qty = inputQty.value.trim();
    if (!name || !qty) return;
    // Tanpa foto: img dibiarkan kosong, tampilan memakai image/default-image.svg
    await onCreate({ name, qty: Number(qty), img: photo });
    toggleModal(modal, false);
  });
}

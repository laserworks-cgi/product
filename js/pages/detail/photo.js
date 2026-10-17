import { $, hasPhoto, imgSrc, resizeImage } from "../../core/utils.js";
import { openImagePreview } from "../../ui/imagePreview.js";
import { toast } from "../../ui/toast.js";

// Foto produk di halaman detail:
// - bingkai kosong: klik (atau seret gambar ke bingkai) untuk unggah
// - sudah ada foto: klik untuk preview, tombol kecil untuk ganti / hapus
export function init(ctx) {
  const { item } = ctx;
  const frame = $("btn-preview-main-img");
  const img = $("full-panel-img");
  const input = $("input-photo-file");
  const hint = $("photo-empty-hint");
  const overlay = $("photo-preview-overlay");
  const actions = $("photo-actions");

  const show = (el, on) => {
    el.classList.toggle("hidden", !on);
    el.classList.toggle("flex", on);
  };

  function render() {
    const has = hasPhoto(item);
    img.src = imgSrc(item);
    frame.classList.toggle("photo-empty", !has);
    frame.title = has ? "Klik untuk memperbesar & preview foto produk" : "Klik untuk unggah foto produk";
    show(hint, !has);
    show(actions, has);
    overlay.classList.toggle("hidden", !has);
  }

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Pilih berkas gambar (PNG, JPG, WebP)", "error");
      return;
    }
    try {
      item.img = await resizeImage(file);
      await ctx.save();
      render();
      toast("Foto disimpan", "success");
    } catch (err) {
      console.error(err);
      toast("Foto gagal diproses", "error");
    }
  }

  // Klik bingkai: kosong -> pilih file, berisi -> preview
  frame.addEventListener("click", () => {
    if (hasPhoto(item)) openImagePreview(item.img, item.name);
    else input.click();
  });

  input.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    await handleFile(file);
  });

  // Seret gambar langsung ke bingkai
  frame.addEventListener("dragover", (e) => e.preventDefault());
  frame.addEventListener("drop", (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  });

  $("btn-change-photo").addEventListener("click", (e) => {
    e.stopPropagation();
    input.click();
  });

  $("btn-remove-photo").addEventListener("click", async (e) => {
    e.stopPropagation();
    if (!confirm("Hapus foto produk ini?")) return;
    item.img = "";
    await ctx.save();
    render();
    toast("Foto dihapus");
  });

  render();
}
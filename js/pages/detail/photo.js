import { DEFAULT_IMAGE } from "../../core/config.js";
import { $, hasPhoto } from "../../core/utils.js";
import { openImagePreview } from "../../ui/imagePreview.js";

// Klik foto produk -> preview zoom & pan
export function init(ctx) {
  const { item } = ctx;
  $("btn-preview-main-img").addEventListener("click", () => {
    if (hasPhoto(item)) openImagePreview(item.img, item.name);
    else openImagePreview(DEFAULT_IMAGE, `${item.name} (Tanpa Foto)`);
  });
}

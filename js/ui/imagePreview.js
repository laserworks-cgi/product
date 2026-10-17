import { $ } from "../core/utils.js";
import { toggleModal } from "./modal.js";

// Preview gambar global (zoom & pan). Dipakai oleh halaman mana pun lewat openImagePreview().
let modal, img, stage, viewport, zoomText;
let zoom = 1, panX = 0, panY = 0;
let panning = false, startX = 0, startY = 0, initX = 0, initY = 0;

export const isPreviewOpen = () => !modal.classList.contains("pointer-events-none");

function update() {
  stage.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  zoomText.textContent = `${Math.round(zoom * 100)}%`;
}
const setZoom = (v) => { zoom = Math.max(0.2, Math.min(6, v)); update(); };
const reset = () => { zoom = 1; panX = 0; panY = 0; update(); };

function fit() {
  const vw = viewport.clientWidth - 48;
  const vh = viewport.clientHeight - 48;
  const w = img.naturalWidth || 800;
  const h = img.naturalHeight || 600;
  zoom = Math.min(1, vw / w, vh / h);
  panX = panY = 0;
  update();
}

export function openImagePreview(url, title = "Preview Gambar") {
  if (!url) return;
  img.src = url;
  $("image-preview-title").textContent = title;
  reset();
  toggleModal(modal, true);
  img.onload = () => {
    fit();
    $("image-preview-info").textContent = `${img.naturalWidth} × ${img.naturalHeight} px • Format Gambar`;
  };
}

export function closeImagePreview() {
  toggleModal(modal, false);
  setTimeout(() => { img.src = ""; reset(); }, 200);
}

export function initImagePreview() {
  modal = $("modal-image-preview");
  img = $("image-preview-img");
  stage = $("image-preview-stage");
  viewport = $("image-preview-viewport");
  zoomText = $("zoom-level-text");

  $("btn-close-image-preview").addEventListener("click", closeImagePreview);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeImagePreview(); });

  $("btn-zoom-in").addEventListener("click", () => setZoom(zoom + 0.25));
  $("btn-zoom-out").addEventListener("click", () => setZoom(zoom - 0.25));
  $("btn-zoom-reset").addEventListener("click", reset);
  $("btn-zoom-fit").addEventListener("click", fit);

  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    setZoom(zoom + (e.deltaY < 0 ? 0.15 : -0.15));
  }, { passive: false });

  viewport.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    panning = true;
    startX = e.clientX; startY = e.clientY;
    initX = panX; initY = panY;
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!panning) return;
    panX = initX + (e.clientX - startX);
    panY = initY + (e.clientY - startY);
    update();
  });
  viewport.addEventListener("pointerup", (e) => {
    panning = false;
    try { viewport.releasePointerCapture(e.pointerId); } catch (_) {}
  });
  viewport.addEventListener("pointercancel", () => { panning = false; });

  viewport.addEventListener("dblclick", () => {
    if (Math.abs(zoom - 1) < 0.05) setZoom(1.8);
    else fit();
  });
}

// Helper modal: semua modal memakai pola yang sama (elemen luar = backdrop, anak pertama = kotak).
export function toggleModal(modal, open) {
  const box = modal.firstElementChild;
  modal.classList.toggle("opacity-0", !open);
  modal.classList.toggle("pointer-events-none", !open);
  box.classList.toggle("scale-95", !open);
  box.classList.toggle("scale-100", open);
}

export function bindModal(modal, ...closeBtns) {
  const close = () => toggleModal(modal, false);
  closeBtns.forEach((b) => b.addEventListener("click", close));
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
}

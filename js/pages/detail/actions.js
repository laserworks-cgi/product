import { dbDelete, dbSave } from "../../core/db.js";
import { $ } from "../../core/utils.js";
import { setActive } from "../../core/state.js";
import { toggleModal, bindModal } from "../../ui/modal.js";

// Tombol "Selesaikan Pekerjaan" (toggle) dan "Hapus"
export function init(ctx) {
  const { item } = ctx;
  const btn = $("btn-footer-complete");
  const modalDelete = $("modal-delete-warning");

  function renderComplete(done) {
    const [on, off] = done ? ["amber", "emerald"] : ["emerald", "amber"];
    btn.classList.remove(`border-${off}-300`, `bg-${off}-500`, `hover:bg-${off}-600`, `active:bg-${off}-700`);
    btn.classList.add(`border-${on}-300`, `bg-${on}-500`, `hover:bg-${on}-600`, `active:bg-${on}-700`);
    $("btn-footer-complete-text").textContent = done ? "Batalkan Selesai" : "Selesaikan Pekerjaan";
  }
  renderComplete(item.completed);

  btn.addEventListener("click", async () => {
    item.completed = !item.completed;
    // Waktu selesai dipakai untuk mengurutkan daftar selesai (terbaru di depan)
    item.completedAt = item.completed ? new Date().toISOString() : null;
    renderComplete(item.completed);
    await ctx.save();
  });

  $("btn-footer-delete").addEventListener("click", () => {
    $("delete-warning-item-name").textContent = `"${item.name}"`;
    toggleModal(modalDelete, true);
  });
  bindModal(modalDelete, $("btn-cancel-delete"));

  $("btn-confirm-delete").addEventListener("click", async () => {
    await dbDelete(item.id);
    toggleModal(modalDelete, false);
    setActive(null);
    ctx.navigate("/");
  });
}

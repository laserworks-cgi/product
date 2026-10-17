import { $, debounce, fmtQty } from "../../core/utils.js";

// Jumlah pcs: ketik langsung, atau scroll mouse (Shift = ±10)
export function init(ctx) {
  const { item } = ctx;
  const input = $("full-panel-pcs-input");
  const badge = $("full-panel-badge-img");
  const headerQty = $("header-qty-display");

  const save = debounce(() => ctx.save(), 350);

  function placeCaretAtEnd() {
    setTimeout(() => {
      const len = String(input.value || "").length;
      input.setSelectionRange?.(len, len);
    }, 10);
  }

  function apply(value) {
    const clean = String(value).replace(/[^0-9]/g, "");
    const qty = Math.max(1, parseInt(clean, 10) || 1);
    item.qty = qty;
    input.value = qty;
    badge.textContent = fmtQty(qty);
    headerQty.textContent = fmtQty(qty);
    save();
  }

  input.addEventListener("focus", placeCaretAtEnd);
  input.addEventListener("click", placeCaretAtEnd);
  input.addEventListener("input", (e) => { apply(e.target.value); placeCaretAtEnd(); });

  $("pcs-stepper-box").addEventListener("wheel", (e) => {
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;
    const cur = parseInt(input.value, 10) || 1;
    apply(cur + (e.deltaY < 0 ? step : -step));
    placeCaretAtEnd();
  }, { passive: false });

  $("header-qty-card").addEventListener("click", () => { input.focus(); placeCaretAtEnd(); });
}

import { $ } from "../../core/utils.js";

// Edit nama produk secara inline lewat kartu biru
export function init(ctx) {
  const { item } = ctx;
  const heading = $("full-panel-title");
  const input = $("full-panel-title-input");
  const target = $("full-panel-target-name");

  async function exit(save = true) {
    if (input.classList.contains("hidden")) return;
    const name = input.value.trim();
    input.classList.add("hidden");
    heading.classList.remove("hidden");

    if (save && name && name !== item.name) {
      item.name = name;
      heading.textContent = target.textContent = name;
      await ctx.save();
    }
  }

  $("name-card").addEventListener("click", () => {
    if (!input.classList.contains("hidden")) return;
    input.value = item.name;
    heading.classList.add("hidden");
    input.classList.remove("hidden");
    input.focus();
    input.select();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== "Escape") return;
    e.preventDefault();
    exit(e.key === "Enter");
  });
  input.addEventListener("blur", () => exit(true));
}

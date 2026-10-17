import { routes } from "../routes.js";
import { $, esc, icons } from "../core/utils.js";
import { on } from "../core/state.js";

export function initSidebar() {
  const sidebar = $("sidebar");
  const toggle = $("btn-sidebar-toggle");

  // Menu dibuat otomatis dari routes.js (entri dengan nav: true)
  $("sidebar-nav-items").innerHTML = routes
    .filter((r) => r.nav)
    .map((r) => `
      <a href="#${r.path}" data-menu="${r.id}" title="${esc(r.title)}"
        class="menu-btn nav-page-btn text-gray-900 hover:text-blue-600 transition-colors duration-150">
        <i data-lucide="${r.icon}" class="menu-icon h-5 w-5"></i>
        <span class="menu-label text-xs font-medium">${esc(r.title)}</span>
      </a>`)
    .join("");
  icons();

  const setSidebar = (open) => {
    sidebar.classList.toggle("expanded", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setSidebar(!sidebar.classList.contains("expanded")));
  $("btn-extra-app-launcher").addEventListener("click", (e) => { e.stopPropagation(); setSidebar(false); });

  on("route:change", ({ route }) => {
    const key = route.parent || route.id;
    document.querySelectorAll(".nav-page-btn").forEach((b) => {
      const active = b.dataset.menu === key;
      b.classList.toggle("text-blue-600", active);
      b.classList.toggle("text-gray-900", !active);
    });
  });
}

import { routes } from "../routes.js";
import { $, fmtQty, fmtShortDeadline } from "../core/utils.js";
import { on, setSearch, state } from "../core/state.js";
import { currentRoute, navigate } from "../core/router.js";

let searchBar, searchInput, btnToggle, btnClear;
let routeNow = null;

export const isSearchOpen = () => !searchBar.classList.contains("hidden");

export function closeSearch() {
  searchInput.value = "";
  btnClear.classList.add("hidden");
  searchBar.classList.add("hidden");
  searchBar.classList.remove("flex");
  btnToggle.classList.remove("hidden");
  setSearch("");
}

function renderMeta() {
  const meta = $("header-active-meta");
  const item = state.active;
  const inHomeGroup = routeNow && (routeNow.id === "home" || routeNow.parent === "home");

  if (!item || !inHomeGroup) {
    meta.classList.add("hidden");
    meta.classList.remove("flex");
    return;
  }
  meta.classList.remove("hidden");
  meta.classList.add("flex");

  const subtasks = item.subtasks || [];
  $("header-card-title").textContent = item.name;
  $("header-meta-qty").textContent = fmtQty(item.qty || 1);
  $("header-meta-deadline").textContent = fmtShortDeadline(item.deadline);
  $("header-meta-subtask").textContent = `${subtasks.filter((s) => s.done).length}/${subtasks.length} Selesai`;
  $("header-meta-process").textContent = item.process || "Ditulis";
  $("header-meta-attachment").textContent = `${(item.attachments || []).length} File`;
}

export function initHeader() {
  searchBar = $("header-search-bar");
  searchInput = $("header-search-input");
  btnToggle = $("btn-header-search-toggle");
  btnClear = $("btn-clear-search");

  $("header-page-title-btn").addEventListener("click", () => navigate("/"));

  on("route:change", ({ route }) => {
    routeNow = route;
    const group = routes.find((r) => r.id === (route.parent || route.id)) || route;
    $("header-page-title-btn").textContent = group.title;
    renderMeta();
  });
  on("active:change", renderMeta);

  btnToggle.addEventListener("click", () => {
    btnToggle.classList.add("hidden");
    searchBar.classList.remove("hidden");
    searchBar.classList.add("flex");
    if ((currentRoute() || routeNow)?.id !== "home") navigate("/");
    setTimeout(() => { searchInput.focus(); searchInput.select(); }, 50);
  });

  searchInput.addEventListener("input", () => {
    btnClear.classList.toggle("hidden", !searchInput.value.trim());
    setSearch(searchInput.value);
  });

  btnClear.addEventListener("click", () => {
    searchInput.value = "";
    btnClear.classList.add("hidden");
    setSearch("");
    searchInput.focus();
  });

  $("btn-close-search").addEventListener("click", closeSearch);
}

import { dbAll, dbAdd } from "../core/db.js";
import { DEFAULT_IMAGE } from "../core/config.js";
import { $, icons, fmtQty, fmtShortDeadline, imgSrc } from "../core/utils.js";
import { newItem, normalizeItem, searchText, sortItems } from "../core/items.js";
import { on, setActive, state } from "../core/state.js";
import { navigate } from "../core/router.js";
import { initAddModal } from "./home/addModal.js";

let items = [];
let offSearch, offActive;
let container;

export async function mount() {
  container = $("cards-container");
  items = (await dbAll()).map(normalizeItem);

  // Pertahankan kartu aktif (objek baru dari DB) atau lepaskan jika sudah tidak ada
  if (state.active) {
    const fresh = items.find((i) => i.id === state.active.id);
    setActive(fresh || null);
  }

  renderCards();

  initAddModal({
    onCreate: async (data) => {
      const item = newItem(data);
      item.id = await dbAdd(item);
      items.push(item);
      setActive(item);
      renderCards();
      container.querySelector(`[data-card-id="${item.id}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    },
  });

  offSearch = on("search:change", applyFilter);
  offActive = on("active:change", highlightActive);
}

export function unmount() {
  offSearch?.();
  offActive?.();
}

/* ===== Render ===== */
function renderCards() {
  container.querySelectorAll(".stat-card-item").forEach((c) => c.remove());
  sortItems(items).forEach((item) => container.append(createCard(item)));
  highlightActive();
  applyFilter();
  icons();
}

function createCard(item) {
  const card = document.createElement("div");
  card.className = `stat-card-item group ${item.completed ? "is-completed" : ""}`;
  card.dataset.cardId = item.id;
  card.dataset.searchable = searchText(item);

  card.innerHTML = `
    <div class="card-frame shadow-xs">
      ${item.completed ? `<div class="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white">
         <i data-lucide="check" class="h-3.5 w-3.5 stroke-[3]"></i>
       </div>
       <div class="absolute inset-0 bg-emerald-500/15 pointer-events-none z-[5]"></div>` : ""}
      <img alt="" class="card-img h-full w-full object-cover" />
      <div class="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm backdrop-blur-xs flex items-center gap-1 border border-white/20 z-10">
        <span class="card-qty-badge"></span>
      </div>
    </div>
    <div class="card-meta-outside mt-1 space-y-0.5">
      <div class="flex items-center gap-1 min-w-0">
        ${item.completed ? '<span class="inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>' : ""}
        <p class="card-meta-name truncate text-xs font-bold text-gray-800"></p>
      </div>
      <div class="flex items-center justify-between text-[11px]">
        <span class="card-meta-qty font-extrabold ${item.completed ? "text-emerald-600" : "text-blue-600"}"></span>
        <span class="card-meta-process text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200"></span>
      </div>
      <div class="text-[10px] text-gray-500 flex items-center justify-between pt-0.5 border-t border-gray-100">
        <span class="card-meta-deadline truncate text-amber-700 font-medium"></span>
        <span class="card-meta-subtask font-semibold text-emerald-700"></span>
      </div>
    </div>`;

  const subtasks = item.subtasks || [];
  const img = card.querySelector(".card-img");
  img.src = imgSrc(item);
  img.alt = item.name;
  img.onerror = () => { img.onerror = null; img.src = DEFAULT_IMAGE; };

  card.querySelectorAll(".card-qty-badge, .card-meta-qty").forEach((el) => { el.textContent = fmtQty(item.qty); });
  card.querySelector(".card-meta-name").textContent = item.name;
  card.querySelector(".card-meta-process").textContent = item.process || "Ditulis";
  card.querySelector(".card-meta-deadline").textContent = fmtShortDeadline(item.deadline);
  card.querySelector(".card-meta-subtask").textContent = `${subtasks.filter((t) => t.done).length}/${subtasks.length}`;

  // Klik pertama memilih kartu; klik pada kartu yang sudah aktif (atau klik ganda) membuka detail
  card.addEventListener("click", () => {
    if (state.active?.id === item.id) return navigate(`/item/${item.id}`);
    setActive(item);
  });
  card.addEventListener("dblclick", () => navigate(`/item/${item.id}`));
  return card;
}

function highlightActive() {
  container?.querySelectorAll(".stat-card-item").forEach((c) => {
    c.classList.toggle("card-active", Boolean(state.active) && Number(c.dataset.cardId) === Number(state.active.id));
  });
}

/* ===== Pencarian ===== */
function applyFilter() {
  const query = state.search.trim().toLowerCase();
  let visible = 0;

  container.querySelectorAll(".stat-card-item").forEach((card) => {
    const match = !query || (card.dataset.searchable || "").includes(query);
    card.classList.toggle("hidden", !match);
    if (match) visible++;
  });

  let empty = $("search-no-results");
  if (query && visible === 0) {
    if (!empty) {
      empty = document.createElement("div");
      empty.id = "search-no-results";
      empty.className = "col-span-full py-10 flex flex-col items-center justify-center text-center text-gray-400";
      container.append(empty);
    }
    empty.innerHTML = `
      <i data-lucide="search-x" class="h-8 w-8 mb-2 text-gray-300"></i>
      <p class="text-xs font-semibold text-gray-600">Tidak ada pekerjaan yang cocok</p>
      <p class="text-[11px] text-gray-400 mt-0.5">Cari berdasarkan nama, jumlah (17 pcs), atau deadline (17 Oktober).</p>`;
    icons();
  } else if (empty) {
    empty.remove();
  }
}

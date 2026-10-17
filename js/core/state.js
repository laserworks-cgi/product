// State global + event bus sederhana untuk komunikasi antar modul.
const bus = new EventTarget();

export const state = {
  active: null, // pekerjaan yang sedang dipilih (kartu aktif)
  search: "",   // teks pencarian di header
};

export const emit = (name, detail) => bus.dispatchEvent(new CustomEvent(name, { detail }));

// Mengembalikan fungsi untuk berhenti mendengarkan
export const on = (name, fn) => {
  const handler = (e) => fn(e.detail);
  bus.addEventListener(name, handler);
  return () => bus.removeEventListener(name, handler);
};

export function setActive(item) {
  state.active = item || null;
  emit("active:change", state.active);
}

export function setSearch(text) {
  state.search = text || "";
  emit("search:change", state.search);
}

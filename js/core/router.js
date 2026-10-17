import { routes } from "../routes.js";
import { emit } from "./state.js";
import { icons } from "./utils.js";

// Router berbasis hash: "#/", "#/item/12", "#/settings", dst.
// Tambah halaman baru cukup lewat js/routes.js.

const compiled = routes.map((route) => {
  const keys = [];
  const source = route.path.replace(/:([A-Za-z_]+)/g, (_, k) => { keys.push(k); return "([^/]+)"; });
  return { route, keys, re: new RegExp(`^${source}$`) };
});

const htmlCache = new Map();
let current = null;
let token = 0;

export function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [pathPart, qs] = raw.split("?");
  const path = ("/" + pathPart.replace(/^\/+|\/+$/g, "")) || "/";
  return { path, query: Object.fromEntries(new URLSearchParams(qs || "")) };
}

function match(path) {
  for (const c of compiled) {
    const m = c.re.exec(path);
    if (m) {
      const params = {};
      c.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { route: c.route, params };
    }
  }
  return null;
}

export const navigate = (path) => {
  const target = `#${path}`;
  if (location.hash === target) resolve();
  else location.hash = target;
};

export const currentRoute = () => current?.route || null;

async function loadView(url) {
  if (!htmlCache.has(url)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Gagal memuat ${url} (${res.status})`);
    htmlCache.set(url, await res.text());
  }
  return htmlCache.get(url);
}

async function resolve() {
  const view = document.getElementById("view");
  const mine = ++token;
  const { path, query } = parseHash();
  const hit = match(path);

  if (!hit) return navigate("/");

  try {
    if (current?.mod?.unmount) await current.mod.unmount();
  } catch (err) {
    console.error("Gagal unmount halaman:", err);
  }

  try {
    const { route, params } = hit;
    const [html, mod] = await Promise.all([loadView(route.view), route.load()]);
    if (mine !== token) return;

    view.innerHTML = html;
    view.classList.remove("page-animated");
    void view.offsetWidth;
    view.classList.add("page-animated");

    current = { route, mod };
    icons();
    await mod.mount?.({ route, params, query, navigate });
    if (mine !== token) return;
    icons();
    emit("route:change", { route, params });
  } catch (err) {
    console.error(err);
    current = null;
    view.innerHTML = `<div class="m-auto text-center text-xs text-gray-500">
      <p class="font-semibold text-gray-700">Halaman gagal dimuat</p>
      <p class="mt-1">${String(err.message || err)}</p>
    </div>`;
  }
}

export function startRouter() {
  window.addEventListener("hashchange", resolve);
  resolve();
}

// Service worker LaserWorks.
// - Precache: seluruh file aplikasi (agar langsung jalan offline setelah instal).
// - Runtime: file lain dari origin yang sama dan CDN (Tailwind, Lucide) disimpan saat pertama dimuat,
//   dan diperbarui di latar belakang (stale-while-revalidate).
// Naikkan VERSION setiap kali daftar PRECACHE berubah atau ingin memaksa cache lama dibuang.
const VERSION = "v1";
const CACHE = `laserworks-${VERSION}`;

const PRECACHE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/app.css",
  "image/default-image.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "js/main.js",
  "js/routes.js",
  "js/core/config.js",
  "js/core/db.js",
  "js/core/items.js",
  "js/core/router.js",
  "js/core/state.js",
  "js/core/utils.js",
  "js/ui/header.js",
  "js/ui/imagePreview.js",
  "js/ui/modal.js",
  "js/ui/sidebar.js",
  "js/ui/toast.js",
  "js/pages/home.js",
  "js/pages/home/addModal.js",
  "js/pages/notifications.js",
  "js/pages/settings.js",
  "js/pages/detail/index.js",
  "js/pages/detail/actions.js",
  "js/pages/detail/attachments.js",
  "js/pages/detail/deadline.js",
  "js/pages/detail/description.js",
  "js/pages/detail/photo.js",
  "js/pages/detail/process.js",
  "js/pages/detail/qty.js",
  "js/pages/detail/subtasks.js",
  "js/pages/detail/title.js",
  "pages/home.html",
  "pages/detail.html",
  "pages/notifications.html",
  "pages/settings.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("laserworks-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!url.protocol.startsWith("http")) return;

  // Navigasi: coba jaringan dulu, jatuh ke index.html di cache saat offline
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("index.html", { ignoreSearch: true }))
    );
    return;
  }

  // Lainnya: stale-while-revalidate
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

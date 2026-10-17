// Naikkan angka versi ini setiap kali Anda mengubah file aplikasi agar cache lama dibuang.
const CACHE = "laserworks-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
const CDN = ["https://cdn.tailwindcss.com", "https://unpkg.com/lucide@latest/dist/umd/lucide.js"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    // Library CDN disimpan juga supaya aplikasi bisa dibuka saat offline
    await Promise.allSettled(CDN.map(async (url) => {
      const req = new Request(url, { mode: "no-cors" });
      await cache.put(req, await fetch(req));
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith("http")) return;

  // Halaman: ambil dari jaringan dulu (agar update cepat sampai), cadangan dari cache saat offline
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("./index.html")));
    return;
  }

  // Aset lain: pakai cache, sambil diam-diam diperbarui dari jaringan
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((res) => {
      if (res.ok || res.type === "opaque") caches.open(CACHE).then((c) => c.put(req, res.clone()));
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});

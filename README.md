# LaserWorks

Dashboard pekerjaan (PWA). Data tersimpan di IndexedDB peramban; tidak butuh server selain untuk menyajikan file statis.

## Menjalankan

Service worker dan ES module butuh `http://` atau `https://` (tidak bisa dibuka lewat `file://`).

```bash
cd laserworks
python3 -m http.server 8080     # atau: npx serve .
```

Buka `http://localhost:8080`. Di Chrome/Edge muncul tombol "Instal" di address bar; di Android/iOS pakai "Tambahkan ke layar utama".
Kunjungan pertama harus online agar Tailwind dan Lucide (CDN) tersimpan di cache; setelah itu aplikasi jalan offline.

## Struktur

```
index.html              shell: sidebar, header, <main id="view">, preview gambar global
manifest.webmanifest    manifest PWA
sw.js                   service worker (precache + runtime cache)
css/app.css             gaya kustom
image/default-image.svg gambar untuk data tanpa foto
icons/                  ikon PWA
pages/*.html            satu file HTML per halaman (dimuat ke #view oleh router)
js/main.js              titik masuk
js/routes.js            DAFTAR RUTE
js/core/                config, db (IndexedDB), router, state/event bus, items (sort/normalisasi), utils
js/ui/                  komponen global: sidebar, header+pencarian, modal, toast, preview gambar
js/pages/               satu modul per halaman: export mount(ctx) dan opsional unmount()
js/pages/detail/        halaman detail dipecah per fitur (title, qty, deadline, subtasks, ...)
```

## Menambah halaman baru

1. Buat `pages/laporan.html`.
2. Buat `js/pages/laporan.js`:
   ```js
   export async function mount({ params, query, navigate }) { /* ... */ }
   export function unmount() { /* lepas listener global jika ada */ }
   ```
3. Tambahkan satu entri di `js/routes.js`:
   ```js
   { id: "laporan", path: "/laporan", title: "Laporan", icon: "bar-chart-3", nav: true,
     view: "pages/laporan.html", load: () => import("./pages/laporan.js") },
   ```
   Dengan `nav: true` menu sidebar muncul otomatis. Rute berparameter: `path: "/klien/:id"` lalu baca `params.id`.
4. (Opsional) Tambahkan dua file baru ke `PRECACHE` di `sw.js` dan naikkan `VERSION` agar langsung tersedia offline sejak instal.
   Tanpa itu pun, halaman tetap di-cache otomatis setelah pertama kali dibuka.

## Menambah fitur di halaman detail

Buat modul `js/pages/detail/fitur.js` dengan `export function init(ctx)`, impor di `js/pages/detail/index.js`, tambahkan ke `FEATURES`.
`ctx.item` adalah data pekerjaan; ubah lalu panggil `await ctx.save()` (menyimpan ke DB dan menyegarkan header).

## Pengaturan data

- Urutan kartu: belum selesai menurut deadline terdekat, lalu selesai (yang paling baru selesai di depan) — lihat `sortItems` di `js/core/items.js`.
- Deadline bawaan data baru: hari ini pukul 16:00 — `DEFAULT_DEADLINE_HOUR` di `js/core/config.js`.
- Impor/ekspor JSON: halaman Settings (`js/pages/settings.js`).

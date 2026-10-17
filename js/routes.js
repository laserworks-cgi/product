// Daftar rute aplikasi.
//
// Menambah halaman baru:
//   1. Buat file HTML di pages/<nama>.html
//   2. Buat modul di js/pages/<nama>.js  (export async function mount(ctx), opsional unmount())
//   3. Tambahkan satu entri di bawah. Jika `nav: true`, menu sidebar dibuat otomatis.
//
// Field:
//   id      nama unik rute
//   path    pola URL setelah "#", boleh berparameter (/item/:id)
//   title   judul untuk sidebar dan breadcrumb
//   icon    nama ikon Lucide (hanya untuk menu sidebar)
//   nav     true = tampil di sidebar
//   parent  id rute induk (breadcrumb dan menu aktif mengikuti induk)
//   view    file HTML halaman
//   load    impor dinamis modul halaman
export const routes = [
  {
    id: "home",
    path: "/",
    title: "Home",
    icon: "home",
    nav: true,
    view: "pages/home.html",
    load: () => import("./pages/home.js"),
  },
  {
    id: "detail",
    path: "/item/:id",
    title: "Detail Pekerjaan",
    parent: "home",
    view: "pages/detail.html",
    load: () => import("./pages/detail/index.js"),
  },
  {
    id: "notifications",
    path: "/notifications",
    title: "Notifications",
    icon: "bell",
    nav: true,
    view: "pages/notifications.html",
    load: () => import("./pages/notifications.js"),
  },
  {
    id: "settings",
    path: "/settings",
    title: "Settings",
    icon: "settings",
    nav: true,
    view: "pages/settings.html",
    load: () => import("./pages/settings.js"),
  },
];

import { openDatabase } from "./core/db.js";
import { startRouter } from "./core/router.js";
import { $ } from "./core/utils.js";
import { initSidebar } from "./ui/sidebar.js";
import { initHeader, isSearchOpen, closeSearch } from "./ui/header.js";
import { initImagePreview, isPreviewOpen, closeImagePreview } from "./ui/imagePreview.js";
import { toast } from "./ui/toast.js";

async function boot() {
  initSidebar();
  initHeader();
  initImagePreview();

  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (isPreviewOpen()) closeImagePreview();
    else if (isSearchOpen()) closeSearch();
  });

  try {
    await openDatabase();
  } catch (err) {
    console.error("Gagal membuka DB:", err);
    $("db-status-dot").classList.replace("bg-emerald-500", "bg-red-500");
    $("db-status-text").textContent = "IndexedDB Error";
    toast("Database lokal tidak dapat dibuka", "error");
    return;
  }

  startRouter();
}

boot();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(console.error));
}

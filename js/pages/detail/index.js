import { dbGet, dbSave } from "../../core/db.js";
import { DEFAULT_IMAGE } from "../../core/config.js";
import { $, fmtQty, imgSrc } from "../../core/utils.js";
import { normalizeItem } from "../../core/items.js";
import { setActive } from "../../core/state.js";
import { toast } from "../../ui/toast.js";

import * as title from "./title.js";
import * as qty from "./qty.js";
import * as deadline from "./deadline.js";
import * as description from "./description.js";
import * as subtasks from "./subtasks.js";
import * as process from "./process.js";
import * as attachments from "./attachments.js";
import * as actions from "./actions.js";
import * as photo from "./photo.js";

// Setiap fitur di halaman detail adalah satu modul dengan export init(ctx).
// Untuk fitur baru: buat modul, impor di sini, tambahkan ke daftar FEATURES.
const FEATURES = [title, qty, deadline, description, subtasks, process, attachments, photo, actions];

export async function mount({ params, navigate }) {
  const raw = await dbGet(params.id);
  if (!raw) {
    toast("Pekerjaan tidak ditemukan", "error");
    navigate("/");
    return;
  }

  const item = normalizeItem(raw);
  setActive(item);

  const ctx = {
    item,
    navigate,
    // Simpan ke DB dan segarkan header (metadata pekerjaan aktif)
    save: async () => {
      await dbSave(item);
      setActive(item);
    },
  };

  $("full-panel-title").textContent = item.name;
  $("full-panel-target-name").textContent = item.name;
  $("full-panel-pcs-input").value = item.qty;
  $("full-panel-badge-img").textContent = fmtQty(item.qty);
  $("header-qty-display").textContent = fmtQty(item.qty);
  $("full-panel-img").src = imgSrc(item);
  $("full-panel-img").onerror = (e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; };

  $("btn-back-to-home").addEventListener("click", () => navigate("/"));

  FEATURES.forEach((f) => f.init(ctx));
}

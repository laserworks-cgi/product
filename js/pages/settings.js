import { EXPORT_VERSION } from "../core/config.js";
import { dbAll, dbImport } from "../core/db.js";
import { normalizeItem } from "../core/items.js";
import { setActive } from "../core/state.js";
import { $, downloadBlob, pad } from "../core/utils.js";
import { toast } from "../ui/toast.js";

async function refreshCount() {
  const total = (await dbAll()).length;
  $("settings-count").textContent = `${total} pekerjaan`;
}

async function exportData() {
  const items = (await dbAll()).map(normalizeItem);
  const now = new Date();
  const payload = {
    app: "laserworks",
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    count: items.length,
    items,
  };
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  downloadBlob(new Blob([JSON.stringify(payload)], { type: "application/json" }), `laserworks-backup-${stamp}.json`);
  toast(`${items.length} pekerjaan diekspor`, "success");
}

async function importData(e) {
  const input = e.target;
  const file = input.files?.[0];
  if (!file) return;

  try {
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      return toast("File bukan JSON yang valid", "error");
    }

    const list = Array.isArray(data) ? data : data?.items;
    if (!Array.isArray(list)) return toast("Format cadangan tidak dikenali (field items tidak ada)", "error");
    if (!list.length) return toast("File tidak berisi pekerjaan", "error");

    // id dibuang agar database memberi id baru
    const incoming = list.map(normalizeItem).map(({ id, ...rest }) => rest);
    const mode = document.querySelector('input[name="import-mode"]:checked')?.value || "merge";

    if (mode === "replace" && !confirm(`Semua data saat ini akan dihapus dan diganti dengan ${incoming.length} pekerjaan dari file. Lanjutkan?`)) return;

    let toAdd = incoming;
    if (mode === "merge") {
      const existing = new Set((await dbAll()).map((i) => `${i.name}|${i.createdAt}`));
      toAdd = incoming.filter((i) => !existing.has(`${i.name}|${i.createdAt}`));
    }

    await dbImport(toAdd, mode === "replace");
    if (mode === "replace") setActive(null);

    const skipped = incoming.length - toAdd.length;
    toast(`${toAdd.length} pekerjaan diimpor${skipped ? `, ${skipped} dilewati (sudah ada)` : ""}`, "success");
    await refreshCount();
  } catch (err) {
    console.error(err);
    toast("Impor gagal: " + (err.message || err), "error");
  } finally {
    input.value = "";
  }
}

export async function mount() {
  await refreshCount();
  $("btn-export-json").addEventListener("click", exportData);
  $("btn-trigger-import").addEventListener("click", () => $("input-import-json").click());
  $("input-import-json").addEventListener("change", importData);
}

export function unmount() {}

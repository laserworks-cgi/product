import { $, sanitizeHTML } from "../../core/utils.js";
import { toggleModal, bindModal } from "../../ui/modal.js";

// Deskripsi & catatan: editor rich text sederhana (B/I/U, bullet otomatis)
export function init(ctx) {
  const { item } = ctx;
  const modal = $("modal-edit-desc");
  const editor = $("modal-desc-editor");
  const display = $("full-panel-desc-display");

  function render() {
    display.innerHTML = item.description?.trim()
      ? sanitizeHTML(item.description)
      : '<span class="italic text-gray-400">Belum ada deskripsi & catatan pekerjaan. Klik tombol <strong>Edit</strong> untuk menambahkan instruksi kerja.</span>';
  }
  render();

  $("btn-open-edit-desc").addEventListener("click", () => {
    editor.innerHTML = sanitizeHTML(item.description || "");
    toggleModal(modal, true);
    setTimeout(() => editor.focus(), 60);
  });
  bindModal(modal, $("btn-close-edit-desc"), $("btn-cancel-edit-desc"));

  const format = (cmd) => () => { document.execCommand(cmd, false, null); editor.focus(); };
  $("btn-format-bold").addEventListener("click", format("bold"));
  $("btn-format-italic").addEventListener("click", format("italic"));
  $("btn-format-underline").addEventListener("click", format("underline"));
  $("btn-format-bullet").addEventListener("click", () => { insertBullet(); editor.focus(); });

  function insertBullet() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const node = document.createTextNode("• ");
    range.insertNode(node);
    range.setStartAfter(node);
    range.setEndAfter(node);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // Enter pada baris bullet melanjutkan bullet; Enter pada bullet kosong mengakhirinya
  editor.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    const textBefore = node.nodeType === 3 ? node.textContent.slice(0, range.startOffset) : "";
    const lineText = textBefore.split(/\r?\n/).pop() || "";

    if (lineText.trim().startsWith("•")) {
      e.preventDefault();
      if (lineText.trim() === "•") {
        document.execCommand("delete", false, null);
        document.execCommand("insertLineBreak", false, null);
      } else {
        document.execCommand("insertLineBreak", false, null);
        document.execCommand("insertText", false, "• ");
      }
    }
  });

  // Ketik "- " di awal baris -> "• "
  editor.addEventListener("keyup", (e) => {
    if (e.key !== " " && e.key !== "Spacebar") return;
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType !== 3) return;

    const text = node.textContent;
    const before = text.slice(0, range.startOffset);
    if (/(?:^|[\r\n])-\s$/.test(before)) {
      const replaced = before.replace(/(?:^|[\r\n])-\s$/, (m) => (m.startsWith("-") ? "• " : m.slice(0, 1) + "• "));
      node.textContent = replaced + text.slice(range.startOffset);
      const r = document.createRange();
      r.setStart(node, replaced.length);
      r.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r);
    }
  });

  $("btn-save-edit-desc").addEventListener("click", async () => {
    item.description = sanitizeHTML(editor.innerHTML);
    await ctx.save();
    render();
    toggleModal(modal, false);
  });
}

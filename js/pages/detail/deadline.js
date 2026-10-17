import { $, MONTHS, fmtDeadline, fmtParts, pad, toLocalIso } from "../../core/utils.js";
import { toggleModal, bindModal } from "../../ui/modal.js";

const MAX_MIN = 23 * 60 + 45;

// Picker deadline: kalender + jam (kelipatan 15 menit, tidak boleh lewat dari sekarang)
export function init(ctx) {
  const { item } = ctx;
  const modal = $("modal-deadline-picker");
  const display = $("deadline-display");
  display.textContent = fmtDeadline(item.deadline);

  let pick = { y: 0, m: 0, d: 0, h: 0, min: 0 };
  let view = { y: 0, m: 0 };

  function getMinAllowedMinutes(isToday) {
    if (!isToday) return 0;
    const n = new Date();
    const rounded = Math.ceil((n.getHours() * 60 + n.getMinutes()) / 15) * 15;
    return Math.min(rounded, MAX_MIN);
  }
  const setPickTime = (mins) => { pick.h = Math.floor(mins / 60); pick.min = mins % 60; };
  const isPickToday = () => {
    const n = new Date();
    return pick.y === n.getFullYear() && pick.m === n.getMonth() && pick.d === n.getDate();
  };

  /* ----- peringatan ----- */
  const warnBox = $("time-warning-box");
  let warnTimer;
  const setWarning = (on) => {
    warnBox.classList.toggle("hidden", !on);
    warnBox.classList.toggle("flex", on);
  };
  function showTimeWarning(text) {
    $("time-warning-text").textContent = text;
    setWarning(true);
    clearTimeout(warnTimer);
    warnTimer = setTimeout(() => setWarning(false), 3000);
  }

  /* ----- jam ----- */
  function renderTime() {
    $("display-picker-hour").textContent = pad(pick.h);
    $("display-picker-min").textContent = pad(pick.min);
    $("modal-deadline-preview").textContent = fmtParts(pick.y, pick.m, pick.d, pick.h, pick.min);
  }

  function modifyTime(delta) {
    const today = isPickToday();
    const minAllowed = getMinAllowedMinutes(today);
    const target = pick.h * 60 + pick.min + delta;

    if (today && target < minAllowed) {
      setPickTime(minAllowed);
      showTimeWarning(`Waktu minimal saat ini adalah ${pad(Math.floor(minAllowed / 60))}:${pad(minAllowed % 60)} WIB (kelipatan 15 menit ke atas)!`);
    } else if (target < 0) {
      setPickTime(0);
    } else if (target > MAX_MIN) {
      setPickTime(MAX_MIN);
    } else {
      setPickTime(target);
      setWarning(false);
    }
    renderTime();
  }

  $("time-scroll-box").addEventListener("wheel", (e) => {
    e.preventDefault();
    const step = e.shiftKey ? 60 : 15;
    modifyTime(e.deltaY < 0 ? step : -step);
  }, { passive: false });

  Object.entries({ "btn-step-minus-60": -60, "btn-step-minus-15": -15, "btn-step-plus-15": 15, "btn-step-plus-60": 60 })
    .forEach(([id, delta]) => $(id).addEventListener("click", () => modifyTime(delta)));

  /* ----- kalender ----- */
  function renderCalendar() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    $("cal-month-year-label").textContent = `${MONTHS[view.m]} ${view.y}`;
    $("cal-prev-month").disabled = view.y * 12 + view.m <= now.getFullYear() * 12 + now.getMonth();

    const grid = $("cal-days-grid");
    grid.innerHTML = "";
    const firstWeekday = new Date(view.y, view.m, 1).getDay();
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    for (let i = 0; i < firstWeekday; i++) grid.insertAdjacentHTML("beforeend", '<div class="h-8"></div>');

    for (let d = 1; d <= daysInMonth; d++) {
      const time = new Date(view.y, view.m, d).getTime();
      const isPast = time < today, isToday = time === today;
      const isSelected = view.y === pick.y && view.m === pick.m && d === pick.d;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = d;
      btn.className = isPast ? "h-8 w-full rounded-lg text-xs font-medium text-gray-300 bg-gray-50/50 cursor-not-allowed select-none"
        : isSelected ? "cal-day-btn h-8 w-full rounded-lg text-xs font-bold bg-amber-500 text-white shadow-sm ring-2 ring-amber-300/70 select-none scale-105 transition"
        : isToday ? "cal-day-btn h-8 w-full rounded-lg text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 hover:bg-amber-200 select-none transition"
        : "cal-day-btn h-8 w-full rounded-lg text-xs font-medium text-gray-700 hover:bg-amber-100 hover:text-amber-950 select-none transition";
      btn.disabled = isPast;
      if (!isPast) btn.addEventListener("click", () => {
        Object.assign(pick, { y: view.y, m: view.m, d });
        const todayPicked = isPickToday();
        const minAllowed = getMinAllowedMinutes(todayPicked);
        if (todayPicked && pick.h * 60 + pick.min < minAllowed) {
          setPickTime(minAllowed);
          showTimeWarning(`Jam disesuaikan ke minimal ${pad(Math.floor(minAllowed / 60))}:${pad(minAllowed % 60)} WIB (kelipatan 15 menit ke atas).`);
        }
        renderCalendar();
        renderTime();
      });
      grid.appendChild(btn);
    }
  }

  const shiftMonth = (delta) => {
    const dt = new Date(view.y, view.m + delta, 1);
    view = { y: dt.getFullYear(), m: dt.getMonth() };
    renderCalendar();
  };
  $("cal-prev-month").addEventListener("click", () => shiftMonth(-1));
  $("cal-next-month").addEventListener("click", () => shiftMonth(1));
  $("cal-btn-today").addEventListener("click", () => {
    const now = new Date();
    Object.assign(pick, { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() });
    view = { y: pick.y, m: pick.m };
    const minAllowed = getMinAllowedMinutes(true);
    if (pick.h * 60 + pick.min < minAllowed) setPickTime(minAllowed);
    renderCalendar();
    renderTime();
  });

  /* ----- buka & simpan ----- */
  $("deadline-card").addEventListener("click", () => {
    const now = new Date();
    let dt = item.deadline ? new Date(item.deadline) : now;
    if (isNaN(dt.getTime())) dt = now;

    pick = { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate(), h: dt.getHours(), min: dt.getMinutes() };
    setPickTime(Math.min(Math.ceil((pick.h * 60 + pick.min) / 15) * 15, MAX_MIN));

    const today = isPickToday();
    const minAllowed = getMinAllowedMinutes(today);
    if (today && pick.h * 60 + pick.min < minAllowed) setPickTime(minAllowed);

    view = { y: pick.y, m: pick.m };
    renderCalendar();
    renderTime();
    setWarning(false);
    toggleModal(modal, true);
  });
  bindModal(modal, $("btn-close-deadline-modal"), $("btn-cancel-deadline-modal"));

  $("btn-save-deadline").addEventListener("click", async () => {
    const today = isPickToday();
    const minAllowed = getMinAllowedMinutes(today);
    if (today && pick.h * 60 + pick.min < minAllowed) {
      return showTimeWarning(`Batas waktu minimal adalah ${pad(Math.floor(minAllowed / 60))}:${pad(minAllowed % 60)} WIB!`);
    }
    item.deadline = toLocalIso(pick.y, pick.m, pick.d, pick.h, pick.min);
    display.textContent = fmtDeadline(item.deadline);
    await ctx.save();
    toggleModal(modal, false);
  });
}

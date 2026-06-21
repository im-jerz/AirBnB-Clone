const SHORT_DATE = { month: "short", day: "numeric" };
const SHORT_DATE_YEAR = { month: "short", day: "numeric", year: "numeric" };

export function formatShortDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-PH", SHORT_DATE);
}

export function formatFullDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-PH", SHORT_DATE_YEAR);
}

export function formatDateRange(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "—";
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  if (sameMonth) {
    return `${a.toLocaleDateString("en-PH", { month: "short" })} ${a.getDate()}–${b.getDate()}, ${b.getFullYear()}`;
  }
  return `${formatShortDate(checkIn)} – ${formatFullDate(checkOut)}`;
}

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/** Returns a short relative string like "3h left" / "Overdue" / "in 2 days" — used for response-due countdowns. */
export function relativeFromNow(value) {
  if (!value) return "";
  const diffMs = new Date(value) - new Date();
  const abs = Math.abs(diffMs);
  const hrs = Math.round(abs / (1000 * 60 * 60));
  if (diffMs <= 0) return "Overdue";
  if (hrs < 1) return "Due soon";
  if (hrs < 24) return `${hrs}h left`;
  const days = Math.round(hrs / 24);
  return `${days}d left`;
}

export function isPast(value) {
  if (!value) return false;
  return new Date(value) < new Date();
}
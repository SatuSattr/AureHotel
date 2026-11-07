export function todayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function sameDay(a, b) {
  return (
    Boolean(a) &&
    Boolean(b) &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatShort(date, locale = "en", reference = new Date()) {
  const options = {
    day: "numeric",
    month: "short",
  };

  if (date.getFullYear() !== reference.getFullYear()) {
    options.year = "numeric";
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatMonthYear(date, locale = "en") {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function nightsBetween(checkIn, checkOut) {
  return Math.round((checkOut - checkIn) / 86400000);
}

export const MAX_STAY_NIGHTS = 30;

export function addDays(date, amount) {
  const copy = startOfDay(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

export function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function getMonthCells(view) {
  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const leading = Array.from({ length: firstWeekday }, () => null);
  const days = Array.from(
    { length: daysInMonth },
    (_, index) => new Date(year, month, index + 1)
  );

  return [...leading, ...days];
}

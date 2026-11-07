import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useDismiss } from "../hooks/useDismiss.js";
import {
  addMonths,
  formatMonthYear,
  formatShort,
  getMonthCells,
  nightsBetween,
  sameDay,
  startOfDay,
  todayStart,
} from "../utils/date.js";

const FALLBACK_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DateRangePicker({ value, onChange }) {
  const { checkIn, checkOut } = value;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const start = todayStart();
    return new Date(start.getFullYear(), start.getMonth(), 1);
  });

  const containerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const { t, i18n } = useTranslation();

  useDismiss(containerRef, () => setOpen(false), open);

  useEffect(
    () => () => {
      window.clearTimeout(closeTimerRef.current);
    },
    []
  );

  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const today = useMemo(() => todayStart(), []);
  const cells = useMemo(() => getMonthCells(view), [view]);
  const weekdayLabelsRaw = t("calendar.weekdays", { returnObjects: true });
  const weekdayLabels = Array.isArray(weekdayLabelsRaw)
    ? weekdayLabelsRaw
    : FALLBACK_WEEKDAYS;

  const isCurrentMonth =
    view.getFullYear() === today.getFullYear() &&
    view.getMonth() === today.getMonth();
  const monthsAhead =
    (view.getFullYear() - today.getFullYear()) * 12 +
    (view.getMonth() - today.getMonth());

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const displayValue = checkIn
    ? checkOut
      ? `${formatShort(checkIn, locale, today)} – ${formatShort(checkOut, locale, today)}`
      : formatShort(checkIn, locale, today)
    : t("booking.selectDate");

  const hint = !checkIn
    ? t("calendar.selectCheckIn")
    : !checkOut
      ? t("calendar.selectCheckOut")
      : t("calendar.nightsSelected", { count: nights });

  const toggleOpen = () => {
    if (!open && checkIn) {
      setView(new Date(checkIn.getFullYear(), checkIn.getMonth(), 1));
    }
    setOpen((current) => !current);
  };

  const pickDate = (date) => {
    const picked = startOfDay(date);

    if (!checkIn || (checkIn && checkOut) || picked <= checkIn) {
      onChange({ checkIn: picked, checkOut: null });
      return;
    }

    onChange({ checkIn, checkOut: picked });
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 220);
  };

  return (
    <div
      ref={containerRef}
      className="field field--date relative flex min-w-0 flex-col gap-2"
      id="dateField"
    >
      <span
        className="field__label pl-0.5 text-[13px] font-bold text-ink"
        id="dateLabel"
      >
        {t("booking.dateLabel")}
      </span>

      <button
        className="field__control flex h-[46px] w-full items-center gap-2.5 rounded-xl border border-[#ece6df] bg-field px-3.5 text-left text-sm font-medium text-[#a49a91] transition duration-200 hover:border-[#ded5cc] hover:bg-[#f1ede8]"
        id="dateToggle"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby="dateLabel dateValue"
        onClick={toggleOpen}
      >
        <Calendar className="icon icon-sm" aria-hidden="true" />
        <span
          className={`field__value truncate${
            checkIn ? "" : " is-placeholder"
          }`}
          id="dateValue"
        >
          {displayValue}
        </span>
        <ChevronDown
          className="icon icon-xs caret ml-auto opacity-75 transition-transform"
          aria-hidden="true"
        />
      </button>

      <div
        className={`popover popover--calendar${open ? " is-open" : ""}`}
        role="dialog"
        aria-label={t("calendar.chooseDates")}
        hidden={!open}
      >
        <div className="cal__head">
          <button
            className="cal__nav"
            type="button"
            aria-label={t("calendar.previousMonth")}
            disabled={isCurrentMonth}
            onClick={() => setView(addMonths(view, -1))}
          >
            <ChevronLeft className="icon icon-sm" aria-hidden="true" />
          </button>
          <span className="cal__month">{formatMonthYear(view, locale)}</span>
          <button
            className="cal__nav"
            type="button"
            aria-label={t("calendar.nextMonth")}
            disabled={monthsAhead >= 18}
            onClick={() => setView(addMonths(view, 1))}
          >
            <ChevronRight className="icon icon-sm" aria-hidden="true" />
          </button>
        </div>

        <div className="cal__weekdays" aria-hidden="true">
          {weekdayLabels.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>

        <div className="cal__grid">
          {cells.map((date, index) => {
            if (!date) {
              return <span key={`blank-${index}`} aria-hidden="true" />;
            }

            const classNames = [
              "cal__day",
              sameDay(date, today) && "is-today",
              sameDay(date, checkIn) && "is-start",
              sameDay(date, checkOut) && "is-end",
              checkIn && checkOut && date > checkIn && date < checkOut
                ? "is-inrange"
                : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={date.getTime()}
                className={classNames}
                type="button"
                disabled={date < today}
                aria-label={date.toLocaleDateString(locale, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                onClick={() => pickDate(date)}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="cal__foot">
          <span>{hint}</span>
          <button
            className="cal__clear"
            type="button"
            onClick={() => onChange({ checkIn: null, checkOut: null })}
          >
            {t("calendar.clear")}
          </button>
        </div>
      </div>
    </div>
  );
}

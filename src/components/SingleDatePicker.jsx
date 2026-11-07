import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useDismiss } from "../hooks/useDismiss.js";
import {
  addMonths,
  formatMonthYear,
  getMonthCells,
  sameDay,
  startOfDay,
  todayStart,
} from "../utils/date.js";

const FALLBACK_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDdMmYyyy(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}/${month}/${date.getFullYear()}`;
}

export default function SingleDatePicker({
  value,
  onChange,
  label,
  invalid,
  describedBy,
  onClose,
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const start = value ?? todayStart();
    return new Date(start.getFullYear(), start.getMonth(), 1);
  });

  const containerRef = useRef(null);
  const { t, i18n } = useTranslation();

  useDismiss(
    containerRef,
    () => {
      setOpen(false);
      onClose?.();
    },
    open
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

  const displayValue = value
    ? formatDdMmYyyy(value)
    : t("booking.form.datePlaceholder");
  const hint = value
    ? t("booking.form.calendar.selected", { date: displayValue })
    : t("booking.form.calendar.select");

  const toggleOpen = () => {
    if (open) {
      setOpen(false);
      onClose?.();
      return;
    }

    if (value) {
      setView(new Date(value.getFullYear(), value.getMonth(), 1));
    }
    setOpen(true);
  };

  const pickDate = (date) => {
    onChange(startOfDay(date));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        className={`flex h-[52px] w-full items-center gap-2.5 rounded-[14px] border bg-white px-4 text-left text-[13.5px] font-medium transition duration-200 hover:border-[#ded5cc] ${
          invalid ? "border-red-400" : "border-line"
        } ${open ? "border-[#cdbfb2] shadow-[0_0_0_3px_rgba(176,138,99,0.14)]" : ""}`}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={invalid}
        aria-describedby={invalid ? describedBy : undefined}
        aria-label={`${label}: ${displayValue}`}
        onClick={toggleOpen}
      >
        <Calendar
          className="h-[18px] w-[18px] shrink-0 text-ink-soft"
          aria-hidden="true"
        />
        <span
          className={`truncate ${value ? "text-ink" : "text-[#a49a91]"}`}
        >
          {displayValue}
        </span>
        <ChevronDown
          className={`ml-auto h-4 w-4 shrink-0 text-ink-soft transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`popover popover--calendar popover--down${
          open ? " is-open" : ""
        }`}
        role="dialog"
        aria-label={t("booking.form.calendar.choose")}
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
              sameDay(date, value) && "is-start is-end",
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
                aria-pressed={sameDay(date, value)}
                onClick={() => pickDate(date)}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="cal__foot">
          <span>{hint}</span>
          {value ? (
            <button
              className="cal__clear"
              type="button"
              onClick={() => onChange(null)}
            >
              {t("calendar.clear")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

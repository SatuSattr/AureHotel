import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ROOMS } from "../data/rooms.js";
import { useCurrency } from "../hooks/useCurrency.jsx";
import { formatPrice } from "../utils/currency.js";

const BREAKFAST_PER_NIGHT = 80000;
const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;

const STEPPER_BUTTON_CLASSES =
  "flex h-5 w-6 items-center justify-center rounded-md text-ink-soft transition hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

export default function RoomRateTable({ onHoverRoom }) {
  const [nights, setNights] = useState(1);
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();
  const locale = i18n.resolvedLanguage || i18n.language || "en";

  const money = (amount) => formatPrice(amount, currency, locale);
  const nightsLabel = t("stay.rates.nights", { count: nights });

  const changeNights = (step) =>
    setNights((current) =>
      Math.min(MAX_NIGHTS, Math.max(MIN_NIGHTS, current + step))
    );

  return (
    <div className="mt-[clamp(40px,5.5vw,72px)] overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_28px_60px_-46px_rgba(38,26,19,0.45)]">
      <div className="flex flex-col gap-4 border-b border-line px-[clamp(16px,2.4vw,28px)] py-[clamp(16px,2vw,22px)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[clamp(1.05rem,1.6vw,1.3rem)] font-bold tracking-[-0.02em] text-ink">
            {t("stay.rates.title")}
          </h3>
          <p className="mt-1 text-[12.5px] leading-[1.5] text-ink-soft">
            {t("stay.rates.lede")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
            {t("stay.rates.duration")}
          </span>
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-field py-1 pl-3.5 pr-1">
            <span
              className="min-w-[70px] text-center text-[13px] font-bold text-ink"
              aria-live="polite"
            >
              {nightsLabel}
            </span>
            <span className="flex flex-col">
              <button
                className={STEPPER_BUTTON_CLASSES}
                type="button"
                aria-label={t("stay.rates.increase")}
                disabled={nights >= MAX_NIGHTS}
                onClick={() => changeNights(1)}
              >
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                className={STEPPER_BUTTON_CLASSES}
                type="button"
                aria-label={t("stay.rates.decrease")}
                disabled={nights <= MIN_NIGHTS}
                onClick={() => changeNights(-1)}
              >
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="thin-scrollbar overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="bg-field/60 text-[10.5px] uppercase tracking-[0.07em] text-ink-soft">
                <th
                  className="px-[clamp(16px,2.4vw,28px)] py-3 font-semibold"
                  scope="col"
                >
                  {t("stay.rates.room")}
                </th>
                <th className="px-3 py-3 text-center font-semibold" scope="col">
                  {t("stay.rates.guests")}
                </th>
                <th className="px-3 py-3 text-center font-semibold" scope="col">
                  {t("stay.rates.duration")}
                </th>
                <th className="px-3 py-3 font-semibold" scope="col">
                  {t("stay.rates.roomOnly")}
                </th>
                <th
                  className="px-[clamp(16px,2.4vw,28px)] py-3 font-semibold"
                  scope="col"
                >
                  {t("stay.rates.breakfast")}
                </th>
              </tr>
            </thead>

            <tbody>
              {ROOMS.map((room, index) => {
                const withBreakfast = room.price + BREAKFAST_PER_NIGHT;

                return (
                  <tr
                    className="border-t border-line/80 align-middle transition-colors hover:bg-field/50"
                    key={room.id}
                    onMouseEnter={() => onHoverRoom?.(index)}
                  >
                    <td className="px-[clamp(16px,2.4vw,28px)] py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          className="h-11 w-14 shrink-0 rounded-lg object-cover"
                          src={room.image}
                          alt=""
                        />
                        <div className="min-w-0">
                          <div className="truncate text-[13.5px] font-bold text-ink">
                            {t(room.titleKey)}
                          </div>
                          <div className="text-[11px] font-medium text-ink-soft">
                            {room.size}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 text-center text-[13px] font-semibold text-ink">
                      {room.guests}
                    </td>

                    <td className="px-3 py-3.5 text-center text-[13px] font-medium text-ink-soft">
                      {nightsLabel}
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="text-[13.5px] font-bold text-ink">
                        {money(room.price * nights)}
                      </div>
                    </td>

                    <td className="px-[clamp(16px,2.4vw,28px)] py-3.5">
                      <div className="text-[13.5px] font-bold text-ink">
                        {money(withBreakfast * nights)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/70 to-transparent sm:hidden"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line bg-paper/60 px-[clamp(16px,2.4vw,28px)] py-3">
        <p className="text-[11.5px] leading-[1.5] text-ink-soft">
          {t("stay.rates.breakfastNote", {
            price: money(BREAKFAST_PER_NIGHT),
          })}
        </p>
        {nights >= MAX_NIGHTS ? (
          <span className="ml-auto text-right text-[11.5px] font-semibold text-red-600">
            {t("stay.rates.maxNights", { count: MAX_NIGHTS })}
          </span>
        ) : null}
      </div>
    </div>
  );
}

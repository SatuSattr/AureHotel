import { useTranslation } from "react-i18next";
import { useBookingFlow } from "../hooks/useBookingFlow.jsx";
import { useCurrency } from "../hooks/useCurrency.jsx";
import { formatPrice } from "../utils/currency.js";

export default function RoomCard({ room, direction }) {
  const { t, i18n } = useTranslation();
  const { highlightBookButtons, selectRoom } = useBookingFlow();
  const { currency } = useCurrency();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const title = t(room.titleKey);

  return (
    <article
      className={`room-card relative w-full overflow-hidden rounded-[22px] bg-white p-1.5 shadow-[0_34px_70px_-42px_rgba(38,26,19,0.65)] ${
        direction > 0 ? "room-card--next" : "room-card--prev"
      }`}
    >
      <div className="relative aspect-[1.38] w-full overflow-hidden rounded-[17px] max-[760px]:aspect-[4/5]">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={room.image}
          alt={title}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#140d09]/90 via-[#140d09]/25 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute right-3 top-3 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 px-3.5 py-1.5 text-[11.5px] shadow-[0_8px_20px_-10px_rgba(0,0,0,0.5)] backdrop-blur">
          <span className="font-medium text-ink-soft">{t("stay.from")}</span>
          <strong className="font-bold text-ink">
            {formatPrice(room.price, currency, locale)}
          </strong>
          <span className="font-medium text-ink-soft">{t("stay.perNight")}</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-[clamp(16px,2.2vw,24px)] text-white">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
              {room.guests}
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
              {room.size}
            </span>
          </div>

          <h3 className="max-w-[95%] text-[clamp(1.1rem,1.7vw,1.45rem)] font-semibold leading-[1.2] tracking-[-0.01em]">
            {title}
          </h3>

          <p className="mt-2 max-w-[95%] text-[clamp(11.5px,0.95vw,12.5px)] leading-[1.5] text-white/80 line-clamp-3">
            {t(room.descriptionKey)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <a
              className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white backdrop-blur transition hover:bg-white/20"
              href="#booking"
            >
              {t("stay.request")}
            </a>
            <button
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-[12px] font-semibold transition ${
                highlightBookButtons
                  ? "book-pulse bg-white text-brown hover:bg-white/90"
                  : "bg-brown text-white hover:bg-brown-deep"
              }`}
              type="button"
              aria-label={`${t("stay.book")} ${title}`}
              onClick={() => selectRoom(room.id)}
            >
              {t("stay.book")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

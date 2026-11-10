import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { HOTEL_CONTACT } from "../data/hotel.js";
import { countryName } from "../data/countries.js";
import { fetchInvoice, invoicePath } from "../utils/api.js";
import { formatPrice } from "../utils/currency.js";

const MUTED = "text-ink-soft";
const ROW_LABEL = "text-[11.5px] text-ink-soft";
const ROW_VALUE = "text-right text-[11.5px] font-semibold text-ink";

function formatBookingDate(value, locale) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatIssuedAt(value, locale) {
  if (!value) return "—";

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function ReceiptRow({ label, children, mono = false }) {
  return (
    <>
      <dt className={ROW_LABEL}>{label}</dt>
      <dd className={`${ROW_VALUE}${mono ? " break-all font-mono text-[10px]" : ""}`}>
        {children}
      </dd>
    </>
  );
}

function SummaryRow({ label, value, accent = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 text-[11.5px] ${
        accent ? "text-emerald-700" : ""
      }`}
    >
      <span className={accent ? "" : MUTED}>{label}</span>
      <span className={`font-semibold ${accent ? "" : "text-ink"}`}>
        {value}
      </span>
    </div>
  );
}

export default function InvoicePage({ hashId }) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState({ status: "loading", data: null });
  const [attempt, setAttempt] = useState(0);

  const locale = i18n.resolvedLanguage || i18n.language || "en";

  useEffect(() => {
    document.title = `${t("invoice.title")} — AureHotel`;
  }, [t, i18n.resolvedLanguage]);

  useEffect(() => {
    const controller = new AbortController();

    setState({ status: "loading", data: null });

    fetchInvoice(hashId, controller.signal)
      .then((data) => setState({ status: "ready", data }))
      .catch((error) => {
        if (controller.signal.aborted) return;

        setState({
          status: error?.status === 404 ? "missing" : "error",
          data: null,
        });
      });

    return () => controller.abort();
  }, [hashId, attempt]);

  if (state.status !== "ready") {
    const missing = state.status === "missing";

    return (
      <main className="invoice-page flex min-h-screen items-start justify-center bg-[#efe5d9] px-4 py-10 text-ink sm:py-16">
        <section className="w-full max-w-[400px] rounded-[24px] border border-[#e6dbcf] bg-white px-7 py-10 text-center shadow-[0_30px_70px_-40px_rgba(38,26,19,0.45)]">
          {missing ? (
            <>
              <h1 className="text-[20px] font-bold tracking-[-0.02em]">
                {t("invoice.notFoundTitle")}
              </h1>
              <p className={`mt-2 text-[12.5px] leading-[1.6] ${MUTED}`}>
                {t("invoice.notFoundBody")}
              </p>
            </>
          ) : state.status === "error" ? (
            <>
              <h1 className="text-[20px] font-bold tracking-[-0.02em]">
                {t("invoice.loadErrorTitle")}
              </h1>
              <p className={`mt-2 text-[12.5px] leading-[1.6] ${MUTED}`}>
                {t("invoice.loadErrorBody")}
              </p>
              <button
                className="mt-5 inline-flex items-center justify-center rounded-full bg-brown px-6 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-brown-deep"
                type="button"
                onClick={() => setAttempt((current) => current + 1)}
              >
                {t("invoice.retry")}
              </button>
            </>
          ) : (
            <>
              <span
                className="mx-auto block h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-brown"
                aria-hidden="true"
              />
              <p className={`mt-4 text-[12.5px] font-medium ${MUTED}`} role="status">
                {t("invoice.loading")}
              </p>
            </>
          )}

          <a
            className="mt-6 inline-block text-[11.5px] font-semibold text-brown underline-offset-4 hover:underline"
            href="/"
          >
            {t("invoice.backHome")}
          </a>
        </section>
      </main>
    );
  }

  const booking = state.data;
  const money = (amount) => formatPrice(amount, "IDR", locale);
  const isInternational = booking.guest_origin === "international";
  const qrValue =
    typeof window !== "undefined"
      ? `${window.location.origin}${invoicePath(booking.hash_id)}`
      : invoicePath(booking.hash_id);

  return (
    <main className="invoice-page flex min-h-screen items-start justify-center bg-[#efe5d9] px-4 py-8 text-ink sm:py-14">
      <article className="invoice-receipt relative w-full max-w-[430px] overflow-hidden rounded-[24px] border border-[#e6dbcf] bg-white shadow-[0_34px_80px_-44px_rgba(38,26,19,0.5)]">
        <header className="relative px-7 pb-6 pt-9 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-brown text-white">
            <span className="text-[17px] font-bold">A</span>
          </div>
          <p className="mt-3 text-[9.5px] font-bold uppercase tracking-[0.4em] text-ink-soft">
            AureHotel
          </p>
          <h1 className="mt-1 text-[21px] font-bold tracking-[-0.02em]">
            {t("invoice.title")}
          </h1>
          <p className="mx-auto mt-2 max-w-[260px] text-[10.5px] leading-[1.55] text-ink-soft">
            {HOTEL_CONTACT.address}
          </p>
          <p className="text-[10.5px] text-ink-soft">
            {HOTEL_CONTACT.phone} · {HOTEL_CONTACT.email}
          </p>

          <span className="absolute right-5 top-6 -rotate-6 rounded-md border-2 border-emerald-600/70 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.18em] text-emerald-600/80">
            {t("invoice.paid")}
          </span>
        </header>

        <div className="relative mx-5 border-t border-dashed border-[#e3d8cc]">
          <span className="absolute -left-8 -top-2.5 h-5 w-5 rounded-full bg-[#efe5d9]" />
          <span className="absolute -right-8 -top-2.5 h-5 w-5 rounded-full bg-[#efe5d9]" />
        </div>

        <section className="px-7 py-5">
          <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2">
            <ReceiptRow label={t("invoice.invoiceNo")}>
              {booking.reference}
            </ReceiptRow>
            <ReceiptRow label={t("invoice.hash")} mono>
              {booking.hash_id}
            </ReceiptRow>
            <ReceiptRow label={t("invoice.issued")}>
              {formatIssuedAt(booking.created_at, locale)}
            </ReceiptRow>
            <ReceiptRow label={t("invoice.status")}>
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                {t("invoice.paid")}
              </span>
            </ReceiptRow>
          </dl>
        </section>

        <div className="border-t border-dashed border-[#e3d8cc]" />

        <section className="px-7 py-5">
          <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2">
            <ReceiptRow label={t("invoice.guest")}>
              {booking.guest_name}
            </ReceiptRow>
            <ReceiptRow label={t("invoice.origin")}>
              {isInternational
                ? t("invoice.originInternational")
                : t("invoice.originLocal")}
            </ReceiptRow>
            {isInternational ? (
              <ReceiptRow label={t("invoice.nationality")}>
                {countryName(booking.nationality, locale)}
              </ReceiptRow>
            ) : null}
            <ReceiptRow label={t("invoice.email")}>{booking.email}</ReceiptRow>
            <ReceiptRow label={t("invoice.phone")}>{booking.phone}</ReceiptRow>
            <ReceiptRow label={t("invoice.identity")}>
              {booking.identity_number}
            </ReceiptRow>
          </dl>
        </section>

        <div className="border-t border-dashed border-[#e3d8cc]" />

        <section className="px-7 py-5">
          <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2">
            <ReceiptRow label={t("invoice.room")}>
              {booking.room_name}
            </ReceiptRow>
            <ReceiptRow label={t("invoice.bookingDate")}>
              {formatBookingDate(booking.booking_date, locale)}
            </ReceiptRow>
            <ReceiptRow label={t("invoice.nights")}>
              {t("invoice.nightsValue", { count: booking.nights })}
            </ReceiptRow>
            <ReceiptRow label={t("invoice.breakfast")}>
              {booking.breakfast
                ? t("invoice.included")
                : t("invoice.notIncluded")}
            </ReceiptRow>
          </dl>
        </section>

        <div className="border-t border-dashed border-[#e3d8cc]" />

        <section className="px-7 py-5">
          <h2 className="text-[9.5px] font-bold uppercase tracking-[0.3em] text-ink-soft/80">
            {t("invoice.summary")}
          </h2>
          <div className="mt-3 grid gap-2">
            <SummaryRow
              label={t("invoice.roomLine", { count: booking.nights })}
              value={money(booking.room_subtotal)}
            />
            {booking.discount > 0 ? (
              <SummaryRow
                label={t("invoice.discount")}
                value={`-${money(booking.discount)}`}
                accent
              />
            ) : null}
            {booking.breakfast_total > 0 ? (
              <SummaryRow
                label={t("invoice.breakfastLine", { count: booking.nights })}
                value={money(booking.breakfast_total)}
              />
            ) : null}
          </div>

          <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#eee5da] pt-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
              {t("invoice.total")}
            </span>
            <span className="text-[19px] font-extrabold tracking-[-0.02em] text-ink">
              {money(booking.total)}
            </span>
          </div>
        </section>

        <div className="border-t border-dashed border-[#e3d8cc]" />

        <section className="flex flex-col items-center px-7 py-6">
          <div className="rounded-xl border border-[#ece2d7] bg-white p-2.5">
            <QRCode
              value={qrValue}
              size={122}
              level="M"
              bgColor="#ffffff"
              fgColor="#4a3a33"
            />
          </div>
          <p className={`mt-2.5 text-[10.5px] font-medium ${MUTED}`}>
            {t("invoice.qrCaption")}
          </p>
        </section>

        <footer className="border-t border-dashed border-[#e3d8cc] bg-[#fbf7f2] px-7 py-5 text-center">
          <p className="text-[12px] font-semibold text-ink">
            {t("invoice.thankYou")}
          </p>
          <p className="mx-auto mt-1.5 max-w-[290px] text-[10px] leading-[1.6] text-ink-soft/80">
            {t("invoice.footnote")}
          </p>
        </footer>
      </article>
    </main>
  );
}

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, CircleDollarSign, Search } from "lucide-react";
import { CURRENCIES } from "../data/hotel.js";
import { useCurrency } from "../hooks/useCurrency.jsx";
import { useDismiss } from "../hooks/useDismiss.js";
import { useToast } from "../hooks/useToast.jsx";
import { currencyName } from "../utils/currency.js";

export default function CurrencySwitcher() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const { t, i18n } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const showToast = useToast();

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useDismiss(containerRef, close, open);

  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const normalizedQuery = query.trim().toLowerCase();
  const currentName = currencyName(currency, locale);

  // The active currency is pinned as the first row, so it is excluded from the
  // searchable list to avoid showing it twice.
  const options = CURRENCIES.filter((code) => code !== currency)
    .map((code) => ({ code, name: currencyName(code, locale) }))
    .filter(({ code, name }) => {
      if (!normalizedQuery) return true;

      return (
        code.toLowerCase().includes(normalizedQuery) ||
        name.toLowerCase().includes(normalizedQuery)
      );
    });

  const currentMatchesQuery =
    !normalizedQuery ||
    currency.toLowerCase().includes(normalizedQuery) ||
    currentName.toLowerCase().includes(normalizedQuery);

  const toggle = () => {
    if (!open) setQuery("");
    setOpen((current) => !current);
  };

  const choose = (code) => {
    if (code !== currency) {
      setCurrency(code);
      showToast(t("currency.changed", { currency: code }));
    }

    close();
  };

  return (
    <div
      ref={containerRef}
      className={`currency relative${open ? " is-open" : ""}`}
    >
      <button
        className="currency__toggle flex items-center gap-[9px] bg-transparent py-1.5 text-[15px] font-medium text-ink max-[760px]:text-sm"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("currency.choose")}
        onClick={toggle}
      >
        <CircleDollarSign
          className="icon icon-sm max-[760px]:hidden"
          aria-hidden="true"
        />
        <span className="tracking-[0.02em]">{currency}</span>
        <ChevronDown
          className="icon icon-xs caret ml-0.5 opacity-75 transition-transform"
          aria-hidden="true"
        />
      </button>

      <div
        className="currency__menu absolute -left-3 top-[calc(100%+12px)] z-[60] w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-white p-2 shadow-[0_24px_50px_-22px_rgba(38,26,19,0.35)] max-[760px]:-left-[56px] max-[760px]:w-[calc(100vw-2rem)]"
        role="dialog"
        aria-label={t("currency.choose")}
      >
        <div className="relative mb-1.5">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft/70"
            aria-hidden="true"
          />
          <input
            className="h-9 w-full rounded-[10px] border border-line bg-field pl-8 pr-2.5 text-[13px] font-medium text-ink placeholder:text-ink-soft/60 focus:border-[#d8cec4] focus:bg-white focus:outline-none"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("currency.search")}
            aria-label={t("currency.search")}
          />
        </div>

        <div
          className="thin-scrollbar max-h-[160px] overflow-y-auto overscroll-contain pr-0.5"
          role="listbox"
          aria-label={t("currency.listAria")}
        >
          <button
            className="flex h-10 w-full items-center justify-between gap-2 rounded-[10px] bg-field px-2.5 text-left text-[13px]"
            type="button"
            role="option"
            aria-selected="true"
            onClick={() => choose(currency)}
          >
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="w-9 shrink-0 font-bold tracking-[0.02em] text-ink">
                {currency}
              </span>
              <span className="truncate font-medium text-ink-soft">
                {currentName}
              </span>
            </span>
            <Check className="h-4 w-4 shrink-0 text-brown" aria-hidden="true" />
          </button>

          {options.map(({ code, name }) => (
            <button
              key={code}
              className="flex h-10 w-full items-center justify-between gap-2 rounded-[10px] px-2.5 text-left text-[13px] transition-colors hover:bg-field"
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => choose(code)}
            >
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="w-9 shrink-0 font-bold tracking-[0.02em] text-ink">
                  {code}
                </span>
                <span className="truncate font-medium text-ink-soft">
                  {name}
                </span>
              </span>
            </button>
          ))}
        </div>

        {normalizedQuery && !currentMatchesQuery && options.length === 0 ? (
          <p
            className="px-2.5 pb-1 pt-2 text-[13px] font-medium text-ink-soft"
            role="status"
          >
            {t("currency.noResults")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

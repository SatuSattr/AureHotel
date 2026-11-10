import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Globe2, Search } from "lucide-react";
import { countryName, countryOptions } from "../data/countries.js";
import { useDismiss } from "../hooks/useDismiss.js";

/**
 * Renders a flag only once its row is close to the visible area. Rows that stay
 * off-screen never create an <img>, so opening the menu does not trigger 200+
 * network requests at once.
 */
function LazyFlag({ code, alt }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "96px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const slug = code.toLowerCase();

  return (
    <span
      ref={ref}
      className="inline-flex h-[15px] w-5 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-field"
    >
      {visible ? (
        <img
          className="h-full w-full object-cover"
          src={`https://flagcdn.com/w20/${slug}.png`}
          srcSet={`https://flagcdn.com/w20/${slug}.png 1x, https://flagcdn.com/w40/${slug}.png 2x`}
          width="20"
          height="15"
          alt={alt}
          loading="lazy"
          decoding="async"
        />
      ) : null}
    </span>
  );
}

export default function NationalityPicker({
  value,
  onChange,
  placeholder,
  invalid = false,
  describedBy,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const { t, i18n } = useTranslation();

  const locale = i18n.resolvedLanguage || i18n.language || "en";

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useDismiss(containerRef, close, open);

  const countries = useMemo(() => countryOptions(locale), [locale]);
  const normalizedQuery = query.trim().toLowerCase();

  const options = useMemo(
    () =>
      countries.filter(({ code, name }) => {
        if (!normalizedQuery) return code !== value;

        return (
          code.toLowerCase().includes(normalizedQuery) ||
          name.toLowerCase().includes(normalizedQuery)
        );
      }),
    [countries, normalizedQuery, value]
  );

  const selected = value ? { code: value, name: countryName(value, locale) } : null;

  const toggle = () => {
    if (!open) setQuery("");
    setOpen((current) => !current);
  };

  const choose = (code) => {
    onChange(code);
    close();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        className={`flex h-[52px] w-full items-center justify-between gap-3 rounded-[14px] border bg-white px-4 text-left text-[13.5px] shadow-[0_1px_0_rgba(38,26,19,0.02)] outline-none transition focus:border-[#c9b8a8] focus:shadow-[0_0_0_4px_rgba(176,138,99,0.12)] ${
          invalid ? "border-red-400" : "border-line"
        }`}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={toggle}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {selected ? (
            <LazyFlag code={selected.code} alt={selected.name} />
          ) : (
            <Globe2
              className="h-[18px] w-[18px] shrink-0 text-ink-soft/70"
              aria-hidden="true"
            />
          )}
          <span
            className={`truncate font-medium ${
              selected ? "text-ink" : "text-[#a49a91]"
            }`}
          >
            {selected ? selected.name : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-[60] w-full min-w-[260px] rounded-2xl border border-line bg-white p-2 shadow-[0_24px_50px_-22px_rgba(38,26,19,0.35)]"
          role="dialog"
          aria-label={placeholder}
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
              placeholder={t("booking.form.nationalitySearch")}
              aria-label={t("booking.form.nationalitySearch")}
              autoFocus
            />
          </div>

          <div
            className="thin-scrollbar max-h-[220px] overflow-y-auto overscroll-contain pr-0.5"
            role="listbox"
            aria-label={t("booking.form.nationality")}
          >
            {selected && !normalizedQuery ? (
              <button
                className="flex h-10 w-full items-center justify-between gap-2 rounded-[10px] bg-field px-2.5 text-left text-[13px]"
                type="button"
                role="option"
                aria-selected="true"
                onClick={() => choose(selected.code)}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <LazyFlag code={selected.code} alt={selected.name} />
                  <span className="truncate font-semibold text-ink">
                    {selected.name}
                  </span>
                </span>
                <Check className="h-4 w-4 shrink-0 text-brown" aria-hidden="true" />
              </button>
            ) : null}

            {options.map(({ code, name }) => (
              <button
                key={code}
                className="flex h-10 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[13px] transition-colors hover:bg-field"
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => choose(code)}
              >
                <LazyFlag code={code} alt={name} />
                <span className="min-w-0 flex-1 truncate font-medium text-ink-soft">
                  {name}
                </span>
                <span className="shrink-0 text-[11px] font-semibold tracking-[0.04em] text-ink-soft/60">
                  {code}
                </span>
              </button>
            ))}
          </div>

          {options.length === 0 ? (
            <p
              className="px-2.5 pb-1 pt-2 text-[13px] font-medium text-ink-soft"
              role="status"
            >
              {t("booking.form.nationalityNoResults")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

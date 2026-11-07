const FALLBACK_NAMES = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  SGD: "Singapore Dollar",
  MYR: "Malaysian Ringgit",
  THB: "Thai Baht",
  HKD: "Hong Kong Dollar",
  KRW: "South Korean Won",
  INR: "Indian Rupee",
  AED: "UAE Dirham",
  IDR: "Indonesian Rupiah",
};

const displayNamesCache = new Map();

function getDisplayNames(locale) {
  if (!displayNamesCache.has(locale)) {
    try {
      displayNamesCache.set(
        locale,
        new Intl.DisplayNames([locale], { type: "currency" })
      );
    } catch {
      displayNamesCache.set(locale, null);
    }
  }

  return displayNamesCache.get(locale);
}

/**
 * Returns the localized full name for a currency code, falling back to a
 * static English label when Intl.DisplayNames is unavailable.
 */
export function currencyName(code, locale = "en") {
  const displayNames = getDisplayNames(locale);
  const localized = displayNames?.of(code);

  return localized && localized !== code
    ? localized
    : FALLBACK_NAMES[code] || code;
}

// Approximate IDR conversion rates for the fictional room prices. All base
// prices are stored in Indonesian Rupiah and converted for display only.
// Replace with a live rates API when real pricing is needed.
const IDR_PER_UNIT = {
  IDR: 1,
  USD: 17500,
  EUR: 19000,
  GBP: 22200,
  JPY: 113,
  AUD: 11500,
  CAD: 12700,
  CHF: 19800,
  CNY: 2420,
  SGD: 13000,
  MYR: 3750,
  THB: 500,
  HKD: 2250,
  KRW: 12.7,
  INR: 210,
  AED: 4760,
};

/**
 * Converts an IDR amount to `currency` and formats it for `locale`.
 */
export function formatPrice(amountIdr, currency = "IDR", locale = "en") {
  const value = amountIdr / (IDR_PER_UNIT[currency] ?? 1);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: value >= 1000 ? 0 : undefined,
  }).format(value);
}


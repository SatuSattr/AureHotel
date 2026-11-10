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

// Static IDR rates used as a safety net while the live rates are loading or if
// every rates endpoint is unreachable. Values are IDR per one unit of currency.
export const FALLBACK_IDR_RATES = {
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

// Primary endpoint first, then the project's mirror. Fetching IDR-based rates
// means every supported currency can be derived with a single request.
export const CURRENCY_RATE_URLS = [
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/idr.json",
  "https://latest.currency-api.pages.dev/v1/currencies/idr.json",
];

function normalizeRates(payload) {
  const idr = payload?.idr;
  if (!idr || typeof idr !== "object") {
    throw new Error("Invalid currency rates payload");
  }

  const rates = { ...FALLBACK_IDR_RATES };

  for (const code of Object.keys(FALLBACK_IDR_RATES)) {
    const rate = Number(idr[code.toLowerCase()]);

    // The API returns "units of currency per 1 IDR", so invert it to get
    // "IDR per one unit of currency" which is what formatPrice expects.
    if (Number.isFinite(rate) && rate > 0) {
      rates[code] = 1 / rate;
    }
  }

  return rates;
}

/**
 * Fetches live IDR exchange rates, trying the primary endpoint and then the
 * fallback. Rejects when both endpoints fail so callers can keep the static
 * fallback rates.
 */
export async function fetchIdrRates(signal) {
  let lastError;

  for (const url of CURRENCY_RATE_URLS) {
    try {
      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new Error(`Currency rates request failed (${response.status})`);
      }

      return normalizeRates(await response.json());
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to fetch currency rates");
}

/**
 * Converts an IDR amount to `currency` and formats it for `locale`.
 */
export function formatPrice(
  amountIdr,
  currency = "IDR",
  locale = "en",
  rates = FALLBACK_IDR_RATES
) {
  const idrPerUnit = rates?.[currency] ?? FALLBACK_IDR_RATES[currency] ?? 1;
  const value = amountIdr / idrPerUnit;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: value >= 1000 ? 0 : undefined,
  }).format(value);
}

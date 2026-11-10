import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CURRENCIES, DEFAULT_CURRENCY } from "../data/hotel.js";
import { FALLBACK_IDR_RATES, fetchIdrRates } from "../utils/currency.js";

const STORAGE_KEY = "aurehotel.currency";
const CurrencyContext = createContext(null);

function getInitialCurrency() {
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (CURRENCIES.includes(saved)) return saved;
    } catch {
      // localStorage can be unavailable (private mode, blocked storage).
    }
  }

  return DEFAULT_CURRENCY;
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(getInitialCurrency);
  const [rates, setRates] = useState(FALLBACK_IDR_RATES);

  useEffect(() => {
    const controller = new AbortController();

    fetchIdrRates(controller.signal)
      .then(setRates)
      .catch(() => {
        // Keep the static fallback rates when both endpoints are unavailable.
      });

    return () => controller.abort();
  }, []);

  const setCurrency = useCallback((code) => {
    if (!CURRENCIES.includes(code)) return;

    setCurrencyState(code);

    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Ignore storage failures; the currency still changes for this session.
    }
  }, []);

  const value = useMemo(
    () => ({ currency, setCurrency, rates }),
    [currency, setCurrency, rates]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }

  return context;
}

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import id from "./locales/id.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";

export const SUPPORTED_LANGUAGES = ["en", "id", "zh", "ja"];
export const LANGUAGE_STORAGE_KEY = "aurehotel.language";

function detectLanguage() {
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (SUPPORTED_LANGUAGES.includes(saved)) return saved;
    } catch {
      // localStorage can be unavailable (private mode, blocked storage).
    }
  }

  if (typeof navigator !== "undefined") {
    const browserLanguage = navigator.language?.split("-")[0];
    if (SUPPORTED_LANGUAGES.includes(browserLanguage)) return browserLanguage;
  }

  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id },
    zh: { translation: zh },
    ja: { translation: ja },
  },
  lng: detectLanguage(),
  fallbackLng: "en",
  supportedLngs: SUPPORTED_LANGUAGES,
  load: "languageOnly",
  initImmediate: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

function syncDocumentLanguage(language) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
}

syncDocumentLanguage(i18n.language);

i18n.on("languageChanged", (language) => {
  syncDocumentLanguage(language);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage failures; the language still changes for this session.
    }
  }
});

export default i18n;

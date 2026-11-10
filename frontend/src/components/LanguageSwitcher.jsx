import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LANGUAGES } from "../data/hotel.js";
import { useDismiss } from "../hooks/useDismiss.js";
import { useToast } from "../hooks/useToast.jsx";

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();

  useDismiss(containerRef, () => setOpen(false), open);

  const currentCode = i18n.resolvedLanguage || i18n.language;
  const currentLanguage =
    LANGUAGES.find((item) => item.code === currentCode) ?? LANGUAGES[0];

  const selectLanguage = async (code, label) => {
    if (code !== currentCode) {
      await i18n.changeLanguage(code);
    }
    setOpen(false);
    showToast(i18n.t("language.changed", { language: label }));
  };

  return (
    <div
      ref={containerRef}
      className={`lang relative${open ? " is-open" : ""}`}
    >
      <button
        className="lang__toggle flex items-center gap-[9px] bg-transparent py-1.5 text-[15px] font-medium text-ink max-[760px]:text-sm"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("nav.changeLanguage")}
        onClick={() => setOpen((current) => !current)}
      >
        <Globe className="icon icon-sm" aria-hidden="true" />
        <span className="max-[1320px]:hidden">{currentLanguage.label}</span>
        <ChevronDown
          className="icon icon-xs caret ml-0.5 opacity-75 transition-transform"
          aria-hidden="true"
        />
      </button>

      <div
        className="lang__menu absolute -left-3 top-[calc(100%+12px)] z-[60] min-w-[196px] rounded-2xl border border-line bg-white p-2 shadow-[0_24px_50px_-22px_rgba(38,26,19,0.35)]"
        role="menu"
      >
        {LANGUAGES.map((item) => (
          <button
            key={item.code}
            type="button"
            role="menuitemradio"
            aria-checked={currentCode === item.code}
            onClick={() => selectLanguage(item.code, item.label)}
          >
            <span>{item.label}</span>
            {currentCode === item.code ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { LANGUAGES } from "../data/hotel.js";
import { useDismiss } from "../hooks/useDismiss.js";
import { useToast } from "../hooks/useToast.jsx";

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const containerRef = useRef(null);
  const showToast = useToast();

  useDismiss(containerRef, () => setOpen(false), open);

  const chooseLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setOpen(false);
    showToast(`Language switched to ${nextLanguage}`);
  };

  return (
    <div
      ref={containerRef}
      className={`lang relative${open ? " is-open" : ""}`}
    >
      <button
        className="lang__toggle flex items-center gap-[9px] bg-transparent py-1.5 text-[15px] font-medium text-ink max-[760px]:text-sm"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((current) => !current)}
      >
        <Globe className="icon icon-sm" aria-hidden="true" />
        <span className="max-[760px]:hidden">{language}</span>
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
            key={item}
            type="button"
            role="menuitem"
            onClick={() => chooseLanguage(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

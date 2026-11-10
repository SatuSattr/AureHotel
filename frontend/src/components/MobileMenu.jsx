import { useTranslation } from "react-i18next";
import { NAV_LINKS } from "../data/hotel.js";

export default function MobileMenu({ open, onNavigate }) {
  const { t } = useTranslation();

  return (
    <div
      className="mobile-menu absolute left-[var(--gutter)] right-[var(--gutter)] top-[calc(100%-6px)] z-[55] rounded-[18px] border border-line bg-white p-2.5 shadow-[0_30px_60px_-24px_rgba(38,26,19,0.35)]"
      id="mobileMenu"
      aria-hidden={!open}
    >
      {NAV_LINKS.map((link) => (
        <a
          key={link.key}
          className="rounded-[10px] px-3.5 py-[13px] text-[15px] font-medium hover:bg-field"
          href={link.href}
          onClick={onNavigate}
        >
          {t(link.key)}
        </a>
      ))}
      <a
        className="rounded-[10px] px-3.5 py-[13px] text-[15px] font-medium hover:bg-field"
        href="#about"
        onClick={onNavigate}
      >
        {t("nav.contact")}
      </a>
      <a
        className="mt-1.5 inline-flex items-center justify-center rounded-xl bg-brown px-5 py-3.5 text-[15px] font-semibold text-white hover:bg-brown-deep"
        href="#request"
        onClick={onNavigate}
      >
        {t("nav.bookNow")}
      </a>
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { BRAND, HOTEL_CONTACT } from "../data/hotel.js";
import { useToast } from "../hooks/useToast.jsx";

const FOOTER_LINKS = [
  { key: "footer.links.home", href: "#home" },
  { key: "footer.links.about", href: "#about" },
  { key: "footer.links.rooms", href: "#offer" },
  { key: "footer.links.gallery", href: "#images" },
  { key: "footer.links.contact", href: "#about" },
];

const HEADING_CLASSES = "text-[13px] font-semibold text-white";
const LINK_CLASSES =
  "text-[13px] text-white/65 transition-colors duration-200 hover:text-white";
const MUTED_CLASSES = "text-[12.5px] leading-[1.65] text-white/65";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { t } = useTranslation();
  const { showToast } = useToast();
  const year = new Date().getFullYear();

  const handleSubmit = (event) => {
    event.preventDefault();

    const value = email.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    showToast(
      t(
        isValid
          ? "footer.newsletter.success"
          : "footer.newsletter.invalid"
      )
    );

    if (isValid) setEmail("");
  };

  return (
    <footer className="px-[var(--gutter)] pb-[clamp(24px,4vw,44px)] pt-[clamp(8px,1.5vw,20px)]">
      <div className="mx-auto max-w-[1120px] rounded-[clamp(24px,3vw,36px)] bg-brown px-[clamp(24px,4.5vw,56px)] py-[clamp(32px,4.5vw,52px)] text-white shadow-[0_36px_80px_-60px_rgba(38,26,19,0.65)]">
        <div className="grid gap-[clamp(28px,4vw,48px)] sm:grid-cols-2 lg:grid-cols-[0.8fr_1.25fr_1.45fr]">
          <div>
            <h3 className={HEADING_CLASSES}>{t("footer.information")}</h3>
            <ul className="mt-4 grid gap-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.key}>
                  <a className={LINK_CLASSES} href={link.href}>
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={HEADING_CLASSES}>{t("footer.newsletter.title")}</h3>
            <p className={`${MUTED_CLASSES} mt-4 max-w-[300px]`}>
              {t("footer.newsletter.text")}
            </p>

            <form
              className="mt-5 flex w-full max-w-[320px] items-center gap-2 rounded-full border border-white/25 bg-white/[0.05] py-1 pl-4 pr-1 transition-colors focus-within:border-white/50"
              noValidate
              onSubmit={handleSubmit}
            >
              <input
                className="h-9 min-w-0 flex-1 bg-transparent text-[12.5px] text-white outline-none placeholder:text-white/45"
                type="email"
                value={email}
                placeholder={t("footer.newsletter.emailPlaceholder")}
                aria-label={t("footer.newsletter.emailAria")}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#efe4d6] text-brown transition duration-200 hover:bg-white"
                type="submit"
                aria-label={t("footer.newsletter.subscribe")}
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>

          <div className="sm:col-span-2 lg:col-span-1 lg:pl-[clamp(0px,1.5vw,20px)]">
            <div className="flex flex-col items-center text-center">
              <span className="text-[9px] font-medium uppercase tracking-[0.28em] text-white/50">
                {t("brand.kicker")}
              </span>
              <span className="mt-1 whitespace-nowrap border-b border-white/60 pb-1 text-[18px] font-semibold tracking-[0.22em] [text-indent:0.22em]">
                {BRAND.name}
              </span>
              <span className="mt-2 flex gap-1" aria-hidden="true">
                {BRAND.swatches.map((color) => (
                  <i
                    key={color}
                    className="h-[7px] w-[7px] rounded-[1px] border border-white/25"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
            </div>

            <h3 className={`${HEADING_CLASSES} mt-[clamp(22px,3vw,32px)]`}>
              {t("footer.contact")}
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-[1.15fr_1fr]">
              <address className={`${MUTED_CLASSES} not-italic`}>
                {HOTEL_CONTACT.address}
              </address>
              <div className={`${MUTED_CLASSES} grid gap-1`}>
                <a
                  className="transition-colors duration-200 hover:text-white"
                  href={HOTEL_CONTACT.phoneHref}
                >
                  {HOTEL_CONTACT.phone}
                </a>
                <a
                  className="break-all transition-colors duration-200 hover:text-white"
                  href={`mailto:${HOTEL_CONTACT.email}`}
                >
                  {HOTEL_CONTACT.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[clamp(28px,4vw,44px)] border-t border-white/15 pt-[clamp(18px,2.5vw,24px)] text-center">
          <p className="text-[12px] text-white/60">
            {t("footer.copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}

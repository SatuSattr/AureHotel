import { Trans, useTranslation } from "react-i18next";
import { Mail, MapPin, Phone } from "lucide-react";
import { HOTEL_CONTACT } from "../data/hotel.js";

const ICON_WRAP_CLASSES =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-field text-brown";

const LABEL_CLASSES =
  "text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft";

const VALUE_CLASSES =
  "mt-0.5 text-[13.5px] font-medium leading-[1.55] text-ink";

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <section
      className="px-[var(--gutter)] pb-[clamp(64px,8vw,110px)] pt-[clamp(4px,1vw,12px)]"
      id="about"
      aria-labelledby="about-title"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="text-center">
          <h2
            className="mx-auto max-w-[620px] text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.14] tracking-[-0.03em] text-ink"
            id="about-title"
          >
            <Trans i18nKey="about.title" components={{ br: <br /> }} />
          </h2>
          <p className="mx-auto mt-[clamp(12px,1.6vw,18px)] max-w-[480px] text-[clamp(13px,1.15vw,14.5px)] leading-[1.65] text-ink-soft">
            {t("about.subtitle")}
          </p>
        </div>

        <div className="mt-[clamp(28px,4vw,48px)] grid gap-[clamp(28px,4vw,60px)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="max-w-[540px] text-justify text-[clamp(13px,1.1vw,14.5px)] leading-[1.7] text-ink-soft">
              <Trans
                components={{
                  strong: <strong className="font-bold text-ink" />,
                }}
                i18nKey="about.description"
              />
            </p>
            <p className="mt-3 max-w-[540px] text-justify text-[clamp(13px,1.1vw,14.5px)] leading-[1.7] text-ink-soft">
              <Trans
                components={{
                  strong: <strong className="font-bold text-ink" />,
                }}
                i18nKey="about.description2"
              />
            </p>
          </div>

          <div className="rounded-[26px] border border-line bg-white p-[clamp(20px,3vw,34px)] shadow-[0_28px_60px_-52px_rgba(38,26,19,0.45)]">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink">
              {t("about.contactTitle")}
            </h3>

            <ul className="mt-5 grid gap-4">
              <li className="flex items-start gap-3.5">
                <span className={ICON_WRAP_CLASSES}>
                  <MapPin className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className={LABEL_CLASSES}>{t("about.addressLabel")}</p>
                  <p className={VALUE_CLASSES}>{HOTEL_CONTACT.address}</p>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className={ICON_WRAP_CLASSES}>
                  <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className={LABEL_CLASSES}>{t("about.phoneLabel")}</p>
                  <a
                    className={`${VALUE_CLASSES} inline-block transition-colors hover:text-brown`}
                    href={HOTEL_CONTACT.phoneHref}
                  >
                    {HOTEL_CONTACT.phone}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className={ICON_WRAP_CLASSES}>
                  <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className={LABEL_CLASSES}>{t("about.emailLabel")}</p>
                  <a
                    className={`${VALUE_CLASSES} inline-block break-all transition-colors hover:text-brown`}
                    href={`mailto:${HOTEL_CONTACT.email}`}
                  >
                    {HOTEL_CONTACT.email}
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useTranslation } from "react-i18next";
import logoIpsum from "../assets/logo/logoipsum-311.svg";
import logoLoqo from "../assets/logo/logoipsum-289.svg";
import logoChain from "../assets/logo/logoipsum-408.svg";
import logoStandard from "../assets/logo/logoipsum-214.svg";
import logoLeaf from "../assets/logo/logoipsum-435.svg";

// Each logo keeps its own aspect ratio; the CSS filter below flattens every
// colour to the same grey so the strip reads as one monochrome row.
const LOGOS = [
  { key: "ipsum", label: "IPSUM", src: logoIpsum, height: 32 },
  { key: "loqo", label: "LOQO", src: logoLoqo, height: 34 },
  { key: "chain", label: "Logoipsum", src: logoChain, height: 30 },
  {
    key: "logoipsum-standard",
    label: "Logoipsum Brand Standard",
    src: logoStandard,
    height: 60,
  },
  { key: "logoipsum-leaf", label: "Logoipsum", src: logoLeaf, height: 32 },
];

export default function TrustedBy() {
  const { t } = useTranslation();

  return (
    <section
      className="mt-6 trusted px-[var(--gutter)] pb-[clamp(52px,7vw,90px)] pt-[clamp(18px,3vw,34px)]"
      id="trusted"
      aria-labelledby="trusted-title"
    >
      <div className="mx-auto flex max-w-[2040px] flex-col items-center text-center">
        <h2
          className="m-0 mb-5 text-[clamp(1.8rem,2.9vw,2.4rem)] font-bold leading-[1.32] tracking-[-0.02em]"
          id="trusted-title"
        >
          <span className="block text-ink">{t("trusted.title")}</span>
          <span className="block text-[#9a9a9a]">{t("trusted.subtitle")}</span>
        </h2>

        <ul
          className="mt-[clamp(28px,4vw,44px)] flex w-full flex-wrap items-center justify-center gap-x-[clamp(28px,5.4vw,74px)] gap-y-7"
          aria-label={t("trusted.logosAria")}
        >
          {LOGOS.map(({ key, label, src, height }) => (
            <li key={key} className="flex items-center justify-center">
              <span className="sr-only">{label}</span>
              <img
                className="w-auto transition-opacity duration-200 hover:opacity-70"
                src={src}
                alt=""
                height={height}
                style={{
                  height,
                  filter: "contrast(0) brightness(1.2)",
                }}
                loading="lazy"
                decoding="async"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { useTranslation } from "react-i18next";
import diningTerrace from "../assets/gallery/dining-terrace.jpg";
import poolDusk from "../assets/gallery/pool-dusk.jpg";
import vineyard from "../assets/gallery/vineyard.jpg";
import hotelRoom from "../assets/gallery/hotel-room.jpg";
import aerialResort from "../assets/gallery/aerial-resort.jpg";
import lavenderField from "../assets/gallery/lavender-field.jpg";

const ROWS = [
  [
    { key: "dining", src: diningTerrace },
    { key: "pool", src: poolDusk },
    { key: "vineyard", src: vineyard, wide: true },
  ],
  [
    { key: "room", src: hotelRoom },
    { key: "aerial", src: aerialResort },
    { key: "lavender", src: lavenderField, wide: true },
  ],
];

const ROW_COLUMNS = [
  "md:grid-cols-[45fr_38fr_17fr]",
  "md:grid-cols-[22fr_45fr_33fr]",
];

const TILE_CLASSES =
  "group relative aspect-[4/3] overflow-hidden rounded-[clamp(14px,1.5vw,20px)] bg-field md:aspect-auto md:h-[clamp(190px,23vw,290px)]";

export default function GallerySection() {
  const { t } = useTranslation();

  return (
    <section
      className="px-[var(--gutter)] pb-[clamp(60px,8vw,110px)] pt-[clamp(8px,1.5vw,20px)]"
      id="images"
      aria-labelledby="gallery-title"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="text-center">
          <h2
            className="mx-auto max-w-[620px] text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.14] tracking-[-0.03em] text-ink"
            id="gallery-title"
          >
            {t("gallery.title")}
          </h2>

          <p className="mx-auto mt-[clamp(12px,1.6vw,18px)] max-w-[520px] text-[clamp(13px,1.15vw,14.5px)] leading-[1.65] text-ink-soft">
            {t("gallery.subtitle")}
          </p>
        </div>

        <div className="mt-[clamp(28px,4vw,48px)] grid gap-[clamp(8px,1vw,14px)]">
          {ROWS.map((row, rowIndex) => (
            <div
              className={`grid grid-cols-2 gap-[clamp(8px,1vw,14px)] ${ROW_COLUMNS[rowIndex]}`}
              key={`gallery-row-${rowIndex}`}
            >
              {row.map((item) => (
                <figure
                  className={`${TILE_CLASSES} ${
                    item.wide
                      ? "col-span-2 aspect-[16/9] md:col-span-1 md:aspect-auto"
                      : ""
                  }`}
                  key={item.key}
                >
                  <img
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                    src={item.src}
                    alt={t(`gallery.items.${item.key}.alt`)}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

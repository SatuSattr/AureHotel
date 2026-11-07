import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { DEFAULT_REVIEW_INDEX, REVIEWS } from "../data/reviews.js";

const QUOTE_MARK_CLASSES =
  "pointer-events-none absolute hidden select-none font-serif text-[clamp(64px,8vw,100px)] leading-none text-[#ece7e1] sm:block";

export default function ReviewsSection() {
  const [active, setActive] = useState(DEFAULT_REVIEW_INDEX);
  const { t } = useTranslation();
  const review = REVIEWS[active];

  return (
    <section
      className="px-[var(--gutter)] pb-[clamp(40px,6vw,80px)] pt-[clamp(8px,1.5vw,20px)]"
      aria-label={t("reviews.aria")}
    >
      <div className="mx-auto max-w-[1120px] rounded-[clamp(24px,3.5vw,40px)] bg-white px-[clamp(20px,4vw,56px)] py-[clamp(40px,5.5vw,68px)] shadow-[0_30px_80px_-60px_rgba(38,26,19,0.45)]">
        <div className="relative mx-auto max-w-[660px]">
          <span
            className={`${QUOTE_MARK_CLASSES} -left-16 -top-6`}
            aria-hidden="true"
          >
            &ldquo;
          </span>

          <div className="review-fade" key={review.id}>
            <blockquote className="text-center text-[clamp(15px,1.45vw,19px)] font-medium leading-[1.6] text-ink-soft">
              <Trans
                components={{
                  strong: <strong className="font-bold text-ink" />,
                }}
                i18nKey={`reviews.items.${review.id}.quote`}
              />
            </blockquote>

            <p className="mt-5 text-center text-[13px] leading-[1.5]">
              <span className="font-bold text-ink">{review.name}.</span>{" "}
              <span className="font-medium text-ink-soft">
                {t(`reviews.items.${review.id}.location`)}
              </span>
            </p>
          </div>

          <span
            className={`${QUOTE_MARK_CLASSES} -right-16 bottom-4`}
            aria-hidden="true"
          >
            &rdquo;
          </span>
        </div>

        <div className="mt-[clamp(28px,4vw,44px)] flex items-center justify-center gap-[clamp(8px,1.4vw,14px)]">
          {REVIEWS.map((item, index) => {
            const isActive = index === active;

            return (
              <button
                className={`rounded-[14px] p-1 transition duration-300 ${
                  isActive
                    ? "scale-105 bg-white shadow-[0_12px_26px_-16px_rgba(38,26,19,0.65)]"
                    : "opacity-70 hover:opacity-100"
                }`}
                type="button"
                key={item.id}
                aria-label={t("reviews.show", { name: item.name })}
                aria-pressed={isActive}
                onClick={() => setActive(index)}
              >
                <img
                  className="h-12 w-12 rounded-[10px] object-cover sm:h-[52px] sm:w-[52px]"
                  src={item.avatar}
                  alt=""
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

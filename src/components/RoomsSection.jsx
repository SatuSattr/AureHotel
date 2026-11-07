import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ROOMS } from "../data/rooms.js";
import RoomRateTable from "./RoomRateTable.jsx";
import RoomsCarousel from "./RoomsCarousel.jsx";

export default function RoomsSection() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const { t } = useTranslation();

  const navigate = (step) => {
    setDirection(step);
    setActive((current) => (current + step + ROOMS.length) % ROOMS.length);
  };

  const showRoom = (index) => {
    if (index === active) return;

    setDirection(index > active ? 1 : -1);
    setActive(index);
  };

  return (
    <section
      className="px-[var(--gutter)] pb-[clamp(60px,8vw,110px)] pt-[clamp(28px,4vw,56px)]"
      id="offer"
      aria-labelledby="stay-title"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="text-center">
          <h2
            className="mx-auto max-w-[620px] text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.14] tracking-[-0.03em] text-ink"
            id="stay-title"
          >
            <Trans i18nKey="stay.title" components={{ br: <br /> }} />
          </h2>

          <p className="mx-auto mt-[clamp(12px,1.6vw,18px)] max-w-[440px] text-[clamp(13px,1.15vw,14.5px)] leading-[1.65] text-ink-soft">
            {t("stay.lede")}
          </p>
        </div>

        <RoomsCarousel
          active={active}
          direction={direction}
          onNavigate={navigate}
        />
        <RoomRateTable onHoverRoom={showRoom} />
      </div>
    </section>
  );
}

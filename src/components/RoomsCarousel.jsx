import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ROOMS } from "../data/rooms.js";
import RoomCard from "./RoomCard.jsx";

const SIDE_CARD_CLASSES =
  "relative hidden h-[clamp(240px,28vw,330px)] w-[clamp(150px,17vw,200px)] shrink-0 overflow-hidden rounded-[20px] border-[5px] border-white bg-white shadow-[0_20px_50px_-30px_rgba(38,26,19,0.5)] transition-transform duration-300 hover:-translate-y-1 lg:block";

const ARROW_CLASSES =
  "absolute top-1/2 z-40 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#8b8178]/80 text-white shadow-[0_12px_28px_-14px_rgba(0,0,0,0.7)] backdrop-blur transition duration-200 hover:bg-[#6f665e] max-[760px]:h-9 max-[760px]:w-9";

export default function RoomsCarousel({ active, direction, onNavigate }) {
  const { t } = useTranslation();

  const total = ROOMS.length;
  const activeRoom = ROOMS[active];
  const prevRoom = ROOMS[(active - 1 + total) % total];
  const nextRoom = ROOMS[(active + 1) % total];

  const go = (step) => onNavigate(step);

  return (
    <div className="relative mx-auto mt-[clamp(32px,5vw,56px)] max-w-[1040px]">
      <div className="flex items-center justify-center gap-[clamp(10px,1.2vw,16px)] lg:justify-between lg:px-6">
        <button
          className={SIDE_CARD_CLASSES}
          type="button"
          aria-label={t("stay.previous")}
          onClick={() => go(-1)}
        >
          <img
            className="h-full w-full rounded-[15px] object-cover"
            src={prevRoom.image}
            alt=""
          />
        </button>

        <div className="relative w-full max-w-[560px]">
          <RoomCard
            key={activeRoom.id}
            room={activeRoom}
            direction={direction}
          />

          <button
            className={`${ARROW_CLASSES} left-2 flex lg:hidden`}
            type="button"
            aria-label={t("stay.previous")}
            onClick={() => go(-1)}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            className={`${ARROW_CLASSES} right-2 flex lg:hidden`}
            type="button"
            aria-label={t("stay.next")}
            onClick={() => go(1)}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <button
          className={SIDE_CARD_CLASSES}
          type="button"
          aria-label={t("stay.next")}
          onClick={() => go(1)}
        >
          <img
            className="h-full w-full rounded-[15px] object-cover"
            src={nextRoom.image}
            alt=""
          />
        </button>
      </div>

      <button
        className={`${ARROW_CLASSES} left-0 hidden lg:flex`}
        type="button"
        aria-label={t("stay.previous")}
        onClick={() => go(-1)}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        className={`${ARROW_CLASSES} right-0 hidden lg:flex`}
        type="button"
        aria-label={t("stay.next")}
        onClick={() => go(1)}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

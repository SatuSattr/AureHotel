import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BedDouble, ChevronDown } from "lucide-react";
import { ROOMS } from "../data/rooms.js";
import { useDismiss } from "../hooks/useDismiss.js";

export default function RoomTypePicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { t } = useTranslation();

  useDismiss(containerRef, () => setOpen(false), open);

  const selected = ROOMS.find((room) => room.id === value) ?? ROOMS[0];
  const selectedName = t(selected.titleKey);

  const choose = (roomId) => {
    onChange(roomId);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        className={`flex h-[52px] w-full items-center gap-2.5 rounded-[14px] border bg-white px-4 text-left text-[13.5px] font-medium text-ink transition duration-200 hover:border-[#ded5cc] ${
          open
            ? "border-[#cdbfb2] bg-[#f1ede8] shadow-[0_0_0_3px_rgba(176,138,99,0.14)]"
            : "border-line"
        }`}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${selectedName}`}
        onClick={() => setOpen((current) => !current)}
      >
        <BedDouble
          className="h-[18px] w-[18px] shrink-0 text-ink-soft"
          aria-hidden="true"
        />
        <span className="truncate">{selectedName}</span>
        <ChevronDown
          className={`ml-auto h-4 w-4 shrink-0 text-ink-soft transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`popover popover--guest popover--down${
          open ? " is-open" : ""
        } w-full`}
        role="listbox"
        aria-label={label}
        hidden={!open}
      >
        {ROOMS.map((room) => (
          <button
            key={room.id}
            type="button"
            role="option"
            aria-selected={room.id === value}
            onClick={() => choose(room.id)}
          >
            {t(room.titleKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

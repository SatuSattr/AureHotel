import { useRef, useState } from "react";
import { ChevronDown, User } from "lucide-react";
import { GUEST_OPTIONS } from "../data/hotel.js";
import { useDismiss } from "../hooks/useDismiss.js";

export default function GuestPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useDismiss(containerRef, () => setOpen(false), open);

  const label = value
    ? `${value} ${value === 1 ? "Guest" : "Guests"}`
    : "Select Number";

  const selectGuest = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="field field--guest relative flex min-w-0 flex-col gap-2"
      id="guestField"
    >
      <label
        className="field__label pl-0.5 text-[13px] font-bold text-ink"
        htmlFor="guestToggle"
      >
        Guest
      </label>

      <button
        className="field__control flex h-[46px] w-full items-center gap-2.5 rounded-xl border border-[#ece6df] bg-field px-3.5 text-left text-sm font-medium text-[#a49a91] transition duration-200 hover:border-[#ded5cc] hover:bg-[#f1ede8]"
        id="guestToggle"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <User className="icon icon-sm" aria-hidden="true" />
        <span
          className={`field__value truncate${
            value ? "" : " is-placeholder"
          }`}
        >
          {label}
        </span>
        <ChevronDown
          className="icon icon-xs caret ml-auto opacity-75 transition-transform"
          aria-hidden="true"
        />
      </button>

      <div
        className={`popover popover--guest${open ? " is-open" : ""}`}
        role="listbox"
        aria-label="Number of guests"
      >
        {GUEST_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={value === option}
            onClick={() => selectGuest(option)}
          >
            {option} {option === 1 ? "Guest" : "Guests"}
          </button>
        ))}
      </div>
    </div>
  );
}

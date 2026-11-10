import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useBookingFlow } from "../hooks/useBookingFlow.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { MAX_STAY_NIGHTS, nightsBetween } from "../utils/date.js";
import DateRangePicker from "./DateRangePicker.jsx";
import GuestPicker from "./GuestPicker.jsx";

const EMPTY_RANGE = { checkIn: null, checkOut: null };

export default function BookingBar() {
  const [guests, setGuests] = useState(null);
  const [range, setRange] = useState(EMPTY_RANGE);
  const { t } = useTranslation();
  const { startFromCta } = useBookingFlow();
  const { showToast } = useToast();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!guests && !range.checkIn) {
      showToast(t("booking.errors.missingBoth"));
      return;
    }

    if (!range.checkIn || !range.checkOut) {
      showToast(t("booking.errors.missingDates"));
      return;
    }

    if (!guests) {
      showToast(t("booking.errors.missingGuests"));
      return;
    }

    const nights = nightsBetween(range.checkIn, range.checkOut);

    if (nights < 1 || nights > MAX_STAY_NIGHTS) {
      showToast(
        t("booking.errors.maxNights", { count: MAX_STAY_NIGHTS })
      );
      return;
    }

    startFromCta({
      guests,
      checkIn: range.checkIn,
      checkOut: range.checkOut,
    });
  };

  return (
    <form
      className="booking relative mx-auto grid w-full max-w-[1010px] grid-cols-[1fr_1fr_1.32fr] items-end gap-[clamp(14px,1.6vw,20px)] rounded-[clamp(18px,1.8vw,22px)] bg-white px-[clamp(16px,1.9vw,25px)] py-[clamp(16px,1.7vw,22px)] shadow-[0_30px_70px_-34px_rgba(38,26,19,0.55)] max-[960px]:grid-cols-2 max-[760px]:grid-cols-1 max-[760px]:gap-3.5 max-[760px]:rounded-[18px] max-[760px]:p-4"
      id="booking"
      autoComplete="off"
      noValidate
      onSubmit={handleSubmit}
    >
      <GuestPicker value={guests} onChange={setGuests} />
      <DateRangePicker value={range} onChange={setRange} />

      <button
        className="btn--cta h-[74px] rounded-[15px] bg-brown px-[22px] text-[clamp(14px,1.2vw,16px)] font-semibold tracking-[0.005em] text-white shadow-[0_16px_30px_-18px_rgba(52,36,26,0.9)] transition duration-200 hover:-translate-y-px hover:bg-brown-deep hover:shadow-[0_20px_34px_-18px_rgba(52,36,26,0.95)] active:translate-y-0 max-[960px]:col-span-2 max-[960px]:h-[58px] max-[760px]:col-span-1 max-[760px]:mt-0.5 max-[760px]:h-[54px]"
        type="submit"
      >
        {t("booking.cta")}
      </button>
    </form>
  );
}

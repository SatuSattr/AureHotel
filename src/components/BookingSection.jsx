import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReceiptText } from "lucide-react";
import { ROOMS } from "../data/rooms.js";
import { useBookingFlow } from "../hooks/useBookingFlow.jsx";
import { useCurrency } from "../hooks/useCurrency.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { formatPrice } from "../utils/currency.js";
import { MAX_STAY_NIGHTS } from "../utils/date.js";
import RoomTypePicker from "./RoomTypePicker.jsx";
import SingleDatePicker from "./SingleDatePicker.jsx";

const BREAKFAST_PER_NIGHT = 80000;
const DISCOUNT_RATE = 0.1;
const DISCOUNT_MIN_NIGHTS = 4;
const MIN_NAME_LENGTH = 3;

const LABEL_CLASSES = "mb-2 block text-[12.5px] font-bold text-ink";

const FIELD_CLASSES =
  "h-[52px] w-full rounded-[14px] border bg-white px-4 text-[13.5px] font-medium text-ink shadow-[0_1px_0_rgba(38,26,19,0.02)] outline-none transition placeholder:text-[#a49a91] focus:border-[#c9b8a8] focus:shadow-[0_0_0_4px_rgba(176,138,99,0.12)]";

const ERROR_CLASSES = "mt-1.5 text-[11.5px] font-medium text-red-600";

const GENDER_OPTIONS = ["male", "female"];

function getNameError(value) {
  const trimmed = value.trim();

  if (!trimmed) return "booking.form.errors.name";
  if (trimmed.length < MIN_NAME_LENGTH) return "booking.form.errors.nameMin";

  return null;
}

function getIdentityError(value) {
  return /^\d{16}$/.test(value.trim())
    ? null
    : "booking.form.errors.identity";
}

function getNightsError(value) {
  const trimmed = value.trim();

  if (!/^\d+$/.test(trimmed) || Number(trimmed) < 1) {
    return "booking.form.errors.nights";
  }

  if (Number(trimmed) > MAX_STAY_NIGHTS) {
    return "booking.form.errors.nightsMax";
  }

  return null;
}

function buildSummary(roomPrice, stay, withBreakfast) {
  const roomSubtotal = roomPrice * stay;
  const discount =
    stay >= DISCOUNT_MIN_NIGHTS ? roomSubtotal * DISCOUNT_RATE : 0;
  const breakfastTotal = withBreakfast ? BREAKFAST_PER_NIGHT * stay : 0;

  return {
    nights: stay,
    roomSubtotal,
    discount,
    breakfast: breakfastTotal,
    total: roomSubtotal - discount + breakfastTotal,
  };
}

export default function BookingSection() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [identity, setIdentity] = useState("");
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [date, setDate] = useState(null);
  const [nights, setNights] = useState("");
  const [breakfast, setBreakfast] = useState(false);
  const [errors, setErrors] = useState({});
  const [summary, setSummary] = useState(null);
  const { t, i18n } = useTranslation();
  const { ctaPreset, roomSelection } = useBookingFlow();
  const { currency } = useCurrency();
  const showToast = useToast();
  const locale = i18n.resolvedLanguage || i18n.language || "en";

  const room = ROOMS.find((item) => item.id === roomId) ?? ROOMS[0];
  const money = (amount) => formatPrice(amount, currency, locale);

  useEffect(() => {
    if (!ctaPreset) return;

    const stay = ctaPreset.nights;
    const selectedRoom =
      ROOMS.find((item) => item.id === ctaPreset.roomId) ?? ROOMS[0];

    setDate(ctaPreset.date);
    setNights(String(stay));
    setRoomId(selectedRoom.id);
    setErrors({});
    setSummary(
      stay >= 1 && stay <= MAX_STAY_NIGHTS
        ? buildSummary(selectedRoom.price, stay, breakfast)
        : null
    );
  }, [ctaPreset]);

  useEffect(() => {
    if (!roomSelection) return;

    const selectedRoom =
      ROOMS.find((item) => item.id === roomSelection.roomId) ?? ROOMS[0];

    setRoomId(selectedRoom.id);
    setErrors({});
    setSummary(null);
  }, [roomSelection]);

  const setFieldError = (key, message) =>
    setErrors((current) => {
      if (message ? current[key] === message : !current[key]) return current;

      const next = { ...current };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });

  const clearError = (key) => setFieldError(key, null);

  const validateName = () => setFieldError("name", getNameError(name));
  const validateIdentity = () =>
    setFieldError("identity", getIdentityError(identity));
  const validateNights = () => setFieldError("nights", getNightsError(nights));
  const validateGender = () =>
    setFieldError(
      "gender",
      gender ? null : "booking.form.errors.gender"
    );
  const validateDate = () =>
    setFieldError("date", date ? null : "booking.form.errors.date");

  const resetTotal = () => setSummary(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    const nameError = getNameError(name);
    const identityError = getIdentityError(identity);
    const nightsError = getNightsError(nights);

    if (nameError) nextErrors.name = nameError;
    if (!gender) nextErrors.gender = "booking.form.errors.gender";
    if (identityError) nextErrors.identity = identityError;
    if (!date) nextErrors.date = "booking.form.errors.date";
    if (nightsError) nextErrors.nights = nightsError;

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSummary(null);
      return;
    }

    const stay = Number(nights);
    const summary = buildSummary(room.price, stay, breakfast);

    setSummary(summary);
    showToast(t("booking.form.calculated", { total: money(summary.total) }));
  };

  return (
    <section
      className="px-[var(--gutter)] pb-[clamp(64px,8vw,110px)] pt-[clamp(4px,1vw,12px)]"
      id="request"
      aria-labelledby="booking-title"
    >
      <div className="mx-auto max-w-[880px]">
        <div className="text-center">
          <h2
            className="mx-auto max-w-[620px] text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.14] tracking-[-0.03em] text-ink"
            id="booking-title"
          >
            {t("booking.form.title")}
          </h2>
          <p className="mx-auto mt-[clamp(12px,1.6vw,18px)] max-w-[500px] text-[clamp(13px,1.15vw,14.5px)] leading-[1.65] text-ink-soft">
            {t("booking.form.subtitle")}
          </p>
        </div>

        <form
          className="mt-[clamp(28px,4vw,44px)] rounded-[28px] border border-line bg-white p-[clamp(20px,3.4vw,40px)] shadow-[0_32px_70px_-56px_rgba(38,26,19,0.5)]"
          autoComplete="off"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="grid gap-[clamp(16px,2vw,22px)]">
            <div>
              <label className={LABEL_CLASSES} htmlFor="booking-name">
                {t("booking.form.name")}
              </label>
              <input
                className={`${FIELD_CLASSES} ${
                  errors.name ? "border-red-400" : "border-line"
                }`}
                id="booking-name"
                type="text"
                value={name}
                placeholder={t("booking.form.namePlaceholder")}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "booking-name-error" : undefined}
                onChange={(event) => {
                  setName(event.target.value);
                  clearError("name");
                }}
                onBlur={validateName}
              />
              {errors.name ? (
                <p className={ERROR_CLASSES} id="booking-name-error">
                  {t(errors.name)}
                </p>
              ) : null}
            </div>

            <fieldset
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  validateGender();
                }
              }}
            >
              <legend className={LABEL_CLASSES}>
                {t("booking.form.gender")}
              </legend>
              <div className="flex flex-wrap gap-2.5">
                {GENDER_OPTIONS.map((option) => {
                  const selected = gender === option;

                  return (
                    <label
                      className={`inline-flex h-11 cursor-pointer items-center rounded-full border px-6 text-[13px] font-semibold transition ${
                        selected
                          ? "border-brown bg-brown text-white shadow-[0_10px_22px_-16px_rgba(58,42,32,0.9)]"
                          : errors.gender
                            ? "border-red-400 bg-white text-ink-soft hover:border-red-400 hover:text-ink"
                            : "border-line bg-white text-ink-soft hover:border-[#d8ccc0] hover:text-ink"
                      }`}
                      key={option}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="gender"
                        value={option}
                        checked={selected}
                        onChange={() => {
                          setGender(option);
                          clearError("gender");
                        }}
                      />
                      {t(`booking.form.${option}`)}
                    </label>
                  );
                })}
              </div>
              {errors.gender ? (
                <p className={ERROR_CLASSES}>{t(errors.gender)}</p>
              ) : null}
            </fieldset>

            <div>
              <label className={LABEL_CLASSES} htmlFor="booking-identity">
                {t("booking.form.identity")}
              </label>
              <input
                className={`${FIELD_CLASSES} ${
                  errors.identity ? "border-red-400" : "border-line"
                }`}
                id="booking-identity"
                type="text"
                inputMode="numeric"
                maxLength={16}
                value={identity}
                placeholder={t("booking.form.identityPlaceholder")}
                aria-invalid={Boolean(errors.identity)}
                aria-describedby={
                  errors.identity ? "booking-identity-error" : undefined
                }
                onChange={(event) => {
                  setIdentity(event.target.value);
                  clearError("identity");
                }}
                onBlur={validateIdentity}
              />
              {errors.identity ? (
                <p className={ERROR_CLASSES} id="booking-identity-error">
                  {t(errors.identity)}
                </p>
              ) : null}
            </div>

            <div className="grid gap-[clamp(16px,2vw,22px)] sm:grid-cols-2">
              <div>
                <span className={LABEL_CLASSES} id="booking-room-label">
                  {t("booking.form.roomType")}
                </span>
                <RoomTypePicker
                  value={roomId}
                  label={t("booking.form.roomType")}
                  onChange={(nextRoomId) => {
                    setRoomId(nextRoomId);
                    resetTotal();
                  }}
                />
              </div>

              <div>
                <label className={LABEL_CLASSES} htmlFor="booking-price">
                  {t("booking.form.pricePerNight")}
                </label>
                <input
                  className={`${FIELD_CLASSES} cursor-default border-line bg-field font-semibold`}
                  id="booking-price"
                  type="text"
                  value={money(room.price)}
                  readOnly
                />
              </div>
            </div>

            <div className="grid gap-[clamp(16px,2vw,22px)] sm:grid-cols-2">
              <div>
                <span className={LABEL_CLASSES} id="booking-date-label">
                  {t("booking.form.date")}
                </span>
                <SingleDatePicker
                  value={date}
                  label={t("booking.form.date")}
                  invalid={Boolean(errors.date)}
                  describedBy="booking-date-error"
                  onClose={validateDate}
                  onChange={(nextDate) => {
                    setDate(nextDate);
                    clearError("date");
                  }}
                />
                {errors.date ? (
                  <p className={ERROR_CLASSES} id="booking-date-error">
                    {t(errors.date)}
                  </p>
                ) : null}
              </div>

              <div>
                <label className={LABEL_CLASSES} htmlFor="booking-nights">
                  {t("booking.form.duration")}
                </label>
                <input
                  className={`${FIELD_CLASSES} ${
                    errors.nights ? "border-red-400" : "border-line"
                  }`}
                  id="booking-nights"
                  type="text"
                  inputMode="numeric"
                  maxLength={3}
                  value={nights}
                  placeholder={t("booking.form.durationPlaceholder")}
                  aria-invalid={Boolean(errors.nights)}
                  aria-describedby={
                    errors.nights ? "booking-nights-error" : undefined
                  }
                  onChange={(event) => {
                    setNights(event.target.value);
                    clearError("nights");
                    resetTotal();
                  }}
                  onBlur={validateNights}
                />
                {errors.nights ? (
                  <p className={ERROR_CLASSES} id="booking-nights-error">
                    {t(errors.nights)}
                  </p>
                ) : null}
              </div>
            </div>

            <label className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-[14px] border border-line bg-white px-4 py-3.5 transition hover:border-[#d8ccc0]">
              <input
                className="h-[18px] w-[18px] cursor-pointer accent-[#4a3a33]"
                type="checkbox"
                checked={breakfast}
                onChange={(event) => {
                  setBreakfast(event.target.checked);
                  resetTotal();
                }}
              />
              <span className="text-[13.5px] font-semibold text-ink">
                {t("booking.form.breakfast")}
              </span>
              <span className="ml-auto text-[11.5px] font-medium text-ink-soft">
                {t("booking.form.breakfastHint", {
                  price: money(BREAKFAST_PER_NIGHT),
                })}
              </span>
            </label>

            <div>
              <label className={LABEL_CLASSES} htmlFor="booking-total">
                {t("booking.form.total")}
              </label>
              <input
                className={`${FIELD_CLASSES} cursor-default border-line bg-field text-[15px] font-bold`}
                id="booking-total"
                type="text"
                value={summary ? money(summary.total) : ""}
                placeholder={t("booking.form.totalPlaceholder")}
                readOnly
                aria-live="polite"
              />

              {summary ? (
                <dl className="mt-3 grid gap-1.5 rounded-[14px] border border-line/70 bg-field/50 px-4 py-3 text-[12px]">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-ink-soft">
                      {t("booking.form.roomLine", { count: summary.nights })}
                    </dt>
                    <dd className="font-semibold text-ink">
                      {money(summary.roomSubtotal)}
                    </dd>
                  </div>

                  {summary.discount > 0 ? (
                    <div className="flex items-center justify-between gap-4 text-emerald-700">
                      <dt>{t("booking.form.discount")}</dt>
                      <dd className="font-semibold">
                        -{money(summary.discount)}
                      </dd>
                    </div>
                  ) : null}

                  {summary.breakfast > 0 ? (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-ink-soft">
                        {t("booking.form.breakfastLine", {
                          count: summary.nights,
                        })}
                      </dt>
                      <dd className="font-semibold text-ink">
                        {money(summary.breakfast)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
            </div>

            <div className="mt-1 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-[400px] text-[11.5px] leading-[1.55] text-ink-soft">
                {t("booking.form.note")}
              </p>
              <button
                className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-brown px-7 py-3.5 text-[13.5px] font-semibold text-white shadow-[0_16px_30px_-18px_rgba(52,36,26,0.9)] transition duration-200 hover:-translate-y-px hover:bg-brown-deep hover:shadow-[0_20px_34px_-18px_rgba(52,36,26,0.95)] active:translate-y-0 sm:self-auto"
                type="submit"
              >
                <ReceiptText className="h-4 w-4" aria-hidden="true" />
                {t("booking.form.calculate")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

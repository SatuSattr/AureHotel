import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, CreditCard, ReceiptText, XCircle } from "lucide-react";
import { ROOMS } from "../data/rooms.js";
import { useBookingFlow } from "../hooks/useBookingFlow.jsx";
import { useCurrency } from "../hooks/useCurrency.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { formatPrice } from "../utils/currency.js";
import {
  API_BASE_URL,
  API_KEY,
  BOOKING_REQUEST_HEADER,
  BOOKING_REQUEST_HEADER_VALUE,
  invoicePath,
} from "../utils/api.js";
import { MAX_STAY_NIGHTS } from "../utils/date.js";
import NationalityPicker from "./NationalityPicker.jsx";
import RoomTypePicker from "./RoomTypePicker.jsx";
import SingleDatePicker from "./SingleDatePicker.jsx";

const BREAKFAST_PER_NIGHT = 80000;
const DISCOUNT_RATE = 0.1;
const DISCOUNT_MIN_NIGHTS = 4;
const MIN_NAME_LENGTH = 3;

const MIN_PAYMENT_LOADING_MS = 2000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formatApiDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

const LABEL_CLASSES = "mb-2 block text-[12.5px] font-bold text-ink";

const FIELD_CLASSES =
  "h-[52px] w-full rounded-[14px] border bg-white px-4 text-[13.5px] font-medium text-ink shadow-[0_1px_0_rgba(38,26,19,0.02)] outline-none transition placeholder:text-[#a49a91] focus:border-[#c9b8a8] focus:shadow-[0_0_0_4px_rgba(176,138,99,0.12)]";

const ERROR_CLASSES = "mt-1.5 text-[11.5px] font-medium text-red-600";

const GENDER_OPTIONS = ["male", "female"];
const GUEST_ORIGIN_OPTIONS = ["local", "international"];
const MAX_IDENTITY_LENGTH = 25;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s()-]+$/;
const NAME_DIGIT_PATTERN = /\p{Nd}/u;
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

function getNameError(value) {
  const trimmed = value.trim();

  if (!trimmed) return "booking.form.errors.name";
  if (trimmed.length < MIN_NAME_LENGTH) return "booking.form.errors.nameMin";
  if (NAME_DIGIT_PATTERN.test(trimmed)) return "booking.form.errors.nameNoDigits";

  return null;
}

function getEmailError(value) {
  const trimmed = value.trim();

  if (!trimmed) return "booking.form.errors.email";
  if (!EMAIL_PATTERN.test(trimmed)) return "booking.form.errors.emailInvalid";

  return null;
}

function getPhoneError(value) {
  const trimmed = value.trim();

  if (!trimmed) return "booking.form.errors.phone";

  const digits = trimmed.replace(/\D/g, "");
  if (
    !PHONE_PATTERN.test(trimmed) ||
    digits.length < MIN_PHONE_DIGITS ||
    digits.length > MAX_PHONE_DIGITS
  ) {
    return "booking.form.errors.phoneInvalid";
  }

  return null;
}

function getIdentityError(value, origin) {
  const trimmed = value.trim();

  if (origin === "international") {
    return /^[A-Za-z0-9]{4,25}$/.test(trimmed)
      ? null
      : "booking.form.errors.identityInternational";
  }

  return /^\d{16}$/.test(trimmed) ? null : "booking.form.errors.identity";
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
  const [guestOrigin, setGuestOrigin] = useState("local");
  const [nationality, setNationality] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [date, setDate] = useState(null);
  const [nights, setNights] = useState("");
  const [breakfast, setBreakfast] = useState(false);
  const [errors, setErrors] = useState({});
  const [summary, setSummary] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [paymentError, setPaymentError] = useState("");
  const [bookingHash, setBookingHash] = useState("");
  const payButtonRef = useRef(null);
  const { t, i18n } = useTranslation();
  const { ctaPreset, roomSelection } = useBookingFlow();
  const { currency, rates } = useCurrency();
  const { hideToast } = useToast();
  const locale = i18n.resolvedLanguage || i18n.language || "en";

  const room = ROOMS.find((item) => item.id === roomId) ?? ROOMS[0];
  const money = (amount) => formatPrice(amount, currency, locale, rates);

  useEffect(() => {
    if (!ctaPreset) return;

    const stay = ctaPreset.nights;
    const selectedRoom =
      ROOMS.find((item) => item.id === ctaPreset.roomId) ?? ROOMS[0];

    setDate(ctaPreset.date);
    setNights(String(stay));
    setRoomId(selectedRoom.id);
    setErrors({});
    setIsCalculated(false);
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
    setIsCalculated(false);
    setSummary(null);
  }, [roomSelection]);

  useEffect(() => {
    if (!paymentOpen) return;

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        (paymentStatus === "success" || paymentStatus === "error")
      ) {
        closePaymentDialog();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [paymentOpen, paymentStatus]);

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
  const validateEmail = () => setFieldError("email", getEmailError(email));
  const validatePhone = () => setFieldError("phone", getPhoneError(phone));
  const validateIdentity = () =>
    setFieldError("identity", getIdentityError(identity, guestOrigin));
  const validateOrigin = () =>
    setFieldError(
      "origin",
      GUEST_ORIGIN_OPTIONS.includes(guestOrigin)
        ? null
        : "booking.form.errors.origin"
    );
  const validateNationality = () =>
    setFieldError(
      "nationality",
      guestOrigin === "international" && !nationality
        ? "booking.form.errors.nationality"
        : null
    );
  const validateNights = () => setFieldError("nights", getNightsError(nights));
  const validateGender = () =>
    setFieldError(
      "gender",
      gender ? null : "booking.form.errors.gender"
    );
  const validateDate = () =>
    setFieldError("date", date ? null : "booking.form.errors.date");

  const resetTotal = () => {
    setSummary(null);
    setIsCalculated(false);
  };

  const resetForm = () => {
    setName("");
    setGender("");
    setGuestOrigin("local");
    setNationality("");
    setEmail("");
    setPhone("");
    setIdentity("");
    setRoomId(ROOMS[0].id);
    setDate(null);
    setNights("");
    setBreakfast(false);
    setErrors({});
    setSummary(null);
    setIsCalculated(false);
    setPaymentStatus("idle");
    setBookingHash("");
  };

  const handleCancel = () => {
    hideToast?.();
    setPaymentOpen(false);
    setPaymentStatus("idle");
    setPaymentError("");
    setErrors({});
    resetTotal();
  };

  const handlePay = async () => {
    setPaymentStatus("loading");
    setPaymentError("");
    setPaymentOpen(true);

    const startedAt = Date.now();
    const payload = {
      name,
      gender,
      guestOrigin,
      nationality: guestOrigin === "international" ? nationality : "ID",
      email,
      phone,
      identity,
      roomId,
      bookingDate: date ? formatApiDate(date) : null,
      nights: Number(nights),
      breakfast,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [BOOKING_REQUEST_HEADER]: BOOKING_REQUEST_HEADER_VALUE,
          ...(API_KEY ? { "X-Api-Key": API_KEY } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || t("booking.form.paymentErrorBody")
        );
      }

      await wait(Math.max(0, MIN_PAYMENT_LOADING_MS - (Date.now() - startedAt)));
      setBookingHash(data.data?.hash_id || "");
      setPaymentStatus("success");
    } catch (error) {
      await wait(Math.max(0, MIN_PAYMENT_LOADING_MS - (Date.now() - startedAt)));
      setPaymentError(
        error instanceof Error
          ? error.message
          : t("booking.form.paymentErrorBody")
      );
      setPaymentStatus("error");
    }
  };

  const closePaymentDialog = () => {
    if (paymentStatus === "loading") return;

    setPaymentOpen(false);
    setPaymentError("");

    if (paymentStatus === "success") {
      setPaymentStatus("idle");
      resetForm();
      hideToast?.();
      return;
    }

    setPaymentStatus("idle");
    payButtonRef.current?.focus();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isCalculated) return;

    const nextErrors = {};
    const nameError = getNameError(name);
    const emailError = getEmailError(email);
    const phoneError = getPhoneError(phone);
    const identityError = getIdentityError(identity, guestOrigin);
    const nightsError = getNightsError(nights);

    if (nameError) nextErrors.name = nameError;
    if (!gender) nextErrors.gender = "booking.form.errors.gender";
    if (!GUEST_ORIGIN_OPTIONS.includes(guestOrigin)) {
      nextErrors.origin = "booking.form.errors.origin";
    }
    if (guestOrigin === "international" && !nationality) {
      nextErrors.nationality = "booking.form.errors.nationality";
    }
    if (emailError) nextErrors.email = emailError;
    if (phoneError) nextErrors.phone = phoneError;
    if (identityError) nextErrors.identity = identityError;
    if (!date) nextErrors.date = "booking.form.errors.date";
    if (nightsError) nextErrors.nights = nightsError;

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSummary(null);
      setIsCalculated(false);
      return;
    }

    const stay = Number(nights);
    const summary = buildSummary(room.price, stay, breakfast);

    setSummary(summary);
    setIsCalculated(true);
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

        <div className="mt-[clamp(28px,4vw,44px)] rounded-[28px] border border-line bg-white p-[clamp(20px,3.4vw,40px)] shadow-[0_32px_70px_-56px_rgba(38,26,19,0.5)]">
          <form
            id="booking-form"
            autoComplete="off"
            noValidate
            onSubmit={handleSubmit}
          >
          <fieldset
            className="grid min-w-0 gap-[clamp(16px,2vw,22px)] [&_button:disabled]:cursor-not-allowed [&_input:disabled]:cursor-not-allowed"
            disabled={isCalculated}
          >
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
                minLength={MIN_NAME_LENGTH}
                maxLength={120}
                value={name}
                placeholder={t("booking.form.namePlaceholder")}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "booking-name-error" : undefined}
                onChange={(event) => {
                  // Numbers are not allowed in guest names; strip them as the
                  // user types or pastes so the field never accepts one.
                  setName(event.target.value.replace(/\p{Nd}/gu, ""));
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

            <fieldset
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  validateOrigin();
                }
              }}
            >
              <legend className={LABEL_CLASSES}>
                {t("booking.form.guestOrigin")}
              </legend>
              <div className="flex flex-wrap gap-2.5">
                {GUEST_ORIGIN_OPTIONS.map((option) => {
                  const selected = guestOrigin === option;

                  return (
                    <label
                      className={`inline-flex h-11 cursor-pointer items-center rounded-full border px-6 text-[13px] font-semibold transition ${
                        selected
                          ? "border-brown bg-brown text-white shadow-[0_10px_22px_-16px_rgba(58,42,32,0.9)]"
                          : errors.origin
                            ? "border-red-400 bg-white text-ink-soft hover:border-red-400 hover:text-ink"
                            : "border-line bg-white text-ink-soft hover:border-[#d8ccc0] hover:text-ink"
                      }`}
                      key={option}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="guest-origin"
                        value={option}
                        checked={selected}
                        onChange={() => {
                          setGuestOrigin(option);
                          clearError("origin");
                          clearError("nationality");
                          if (option !== "international") setNationality("");
                        }}
                      />
                      {t(`booking.form.${option}`)}
                    </label>
                  );
                })}
              </div>
              {errors.origin ? (
                <p className={ERROR_CLASSES}>{t(errors.origin)}</p>
              ) : null}
            </fieldset>

            {guestOrigin === "international" ? (
              <div>
                <span
                  className={LABEL_CLASSES}
                  id="booking-nationality-label"
                >
                  {t("booking.form.nationality")}
                </span>
                <NationalityPicker
                  value={nationality}
                  placeholder={t("booking.form.nationalityPlaceholder")}
                  invalid={Boolean(errors.nationality)}
                  describedBy={
                    errors.nationality ? "booking-nationality-error" : undefined
                  }
                  onChange={(code) => {
                    setNationality(code);
                    clearError("nationality");
                  }}
                />
                {errors.nationality ? (
                  <p className={ERROR_CLASSES} id="booking-nationality-error">
                    {t(errors.nationality)}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-[clamp(16px,2vw,22px)] sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASSES} htmlFor="booking-email">
                  {t("booking.form.email")}
                </label>
                <input
                  className={`${FIELD_CLASSES} ${
                    errors.email ? "border-red-400" : "border-line"
                  }`}
                  id="booking-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  placeholder={t("booking.form.emailPlaceholder")}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "booking-email-error" : undefined
                  }
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError("email");
                  }}
                  onBlur={validateEmail}
                />
                {errors.email ? (
                  <p className={ERROR_CLASSES} id="booking-email-error">
                    {t(errors.email)}
                  </p>
                ) : null}
              </div>

              <div>
                <label className={LABEL_CLASSES} htmlFor="booking-phone">
                  {t("booking.form.phone")}
                </label>
                <input
                  className={`${FIELD_CLASSES} ${
                    errors.phone ? "border-red-400" : "border-line"
                  }`}
                  id="booking-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  placeholder={t("booking.form.phonePlaceholder")}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={
                    errors.phone ? "booking-phone-error" : undefined
                  }
                  onChange={(event) => {
                    setPhone(event.target.value);
                    clearError("phone");
                  }}
                  onBlur={validatePhone}
                />
                {errors.phone ? (
                  <p className={ERROR_CLASSES} id="booking-phone-error">
                    {t(errors.phone)}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label className={LABEL_CLASSES} htmlFor="booking-identity">
                {t("booking.form.identity")}
                {guestOrigin === "international"
                  ? ` (${t("booking.form.identityInternationalHint")})`
                  : ""}
              </label>
              <input
                className={`${FIELD_CLASSES} ${
                  errors.identity ? "border-red-400" : "border-line"
                }`}
                id="booking-identity"
                type="text"
                inputMode={guestOrigin === "international" ? "text" : "numeric"}
                maxLength={MAX_IDENTITY_LENGTH}
                value={identity}
                placeholder={
                  guestOrigin === "international"
                    ? t("booking.form.identityPlaceholderInternational")
                    : t("booking.form.identityPlaceholder")
                }
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
          </fieldset>
          </form>

          <div className="mt-1 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[400px] text-[11.5px] leading-[1.55] text-ink-soft">
              {t("booking.form.note")}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              {isCalculated ? (
                <button
                  key="cancel"
                  className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3.5 text-[13.5px] font-semibold text-ink-soft transition duration-200 hover:border-[#d8ccc0] hover:text-ink"
                  type="button"
                  onClick={handleCancel}
                >
                  {t("booking.form.cancel")}
                </button>
              ) : null}
              {isCalculated ? (
                <button
                  key="pay"
                  ref={payButtonRef}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brown px-7 py-3.5 text-[13.5px] font-semibold text-white shadow-[0_16px_30px_-18px_rgba(52,36,26,0.9)] transition duration-200 hover:-translate-y-px hover:bg-brown-deep hover:shadow-[0_20px_34px_-18px_rgba(52,36,26,0.95)] active:translate-y-0"
                  type="button"
                  onClick={handlePay}
                >
                  <CreditCard className="h-4 w-4" aria-hidden="true" />
                  {t("booking.form.pay")}
                </button>
              ) : null}
              {!isCalculated ? (
                <button
                  key="calculate"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brown px-7 py-3.5 text-[13.5px] font-semibold text-white shadow-[0_16px_30px_-18px_rgba(52,36,26,0.9)] transition duration-200 hover:-translate-y-px hover:bg-brown-deep hover:shadow-[0_20px_34px_-18px_rgba(52,36,26,0.95)] active:translate-y-0"
                  type="submit"
                  form="booking-form"
                >
                  <ReceiptText className="h-4 w-4" aria-hidden="true" />
                  {t("booking.form.calculate")}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {paymentOpen ? (
          <div
            className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(28,19,13,0.55)] p-4 backdrop-blur-sm"
            onClick={closePaymentDialog}
          >
            <div
              className="payment-dialog w-full max-w-[400px] rounded-[26px] bg-white p-7 text-center shadow-[0_40px_90px_-40px_rgba(28,19,13,0.6)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="payment-dialog-title"
              aria-describedby="payment-dialog-body"
              aria-busy={paymentStatus === "loading"}
              onClick={(event) => event.stopPropagation()}
            >
              {paymentStatus === "loading" ? (
                <>
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-field">
                    <span
                      className="h-7 w-7 animate-spin rounded-full border-[3px] border-line border-t-brown"
                      aria-hidden="true"
                    />
                  </span>
                  <h3
                    className="mt-4 text-[19px] font-bold tracking-[-0.02em] text-ink"
                    id="payment-dialog-title"
                  >
                    {t("booking.form.processingTitle")}
                  </h3>
                  <p
                    className="mt-2 text-[13px] leading-[1.6] text-ink-soft"
                    id="payment-dialog-body"
                  >
                    {t("booking.form.processingBody")}
                  </p>
                </>
              ) : paymentStatus === "error" ? (
                <>
                  <span className="payment-success-icon mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
                    <XCircle className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <div className="payment-success-text">
                    <h3
                      className="mt-4 text-[19px] font-bold tracking-[-0.02em] text-ink"
                      id="payment-dialog-title"
                    >
                      {t("booking.form.paymentErrorTitle")}
                    </h3>
                    <p
                      className="mt-2 text-[13px] leading-[1.6] text-ink-soft"
                      id="payment-dialog-body"
                    >
                      {paymentError || t("booking.form.paymentErrorBody")}
                    </p>
                  </div>
                  <button
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brown px-6 py-3 text-[13.5px] font-semibold text-white transition duration-200 hover:bg-brown-deep"
                    type="button"
                    autoFocus
                    onClick={closePaymentDialog}
                  >
                    {t("booking.form.close")}
                  </button>
                </>
              ) : (
                <>
                  <span className="payment-success-icon mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <div className="payment-success-text">
                    <h3
                      className="mt-4 text-[19px] font-bold tracking-[-0.02em] text-ink"
                      id="payment-dialog-title"
                    >
                      {t("booking.form.paymentSuccessTitle")}
                    </h3>
                    <p
                      className="mt-2 text-[13px] leading-[1.6] text-ink-soft"
                      id="payment-dialog-body"
                    >
                      {t("booking.form.paymentSuccessBody")}
                    </p>
                  </div>
                  {bookingHash ? (
                    <a
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-[13.5px] font-semibold text-ink transition duration-200 hover:border-[#d8ccc0]"
                      href={invoicePath(bookingHash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ReceiptText className="h-4 w-4" aria-hidden="true" />
                      {t("booking.form.viewInvoice")}
                    </a>
                  ) : null}
                  <button
                    className="mt-2.5 inline-flex w-full items-center justify-center rounded-full bg-brown px-6 py-3 text-[13.5px] font-semibold text-white transition duration-200 hover:bg-brown-deep"
                    type="button"
                    autoFocus
                    onClick={closePaymentDialog}
                  >
                    {t("booking.form.close")}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

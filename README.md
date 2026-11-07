# AureHotel — Jakarta

Navbar and hero section recreated from the reference screenshot and rebranded as **AureHotel**, a fictional boutique hotel in Menteng, Jakarta.

Migrated to **Vite + React 19 + Tailwind CSS v4**, with the UI split into small, reusable components.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # preview the production build
```

## Project structure

```
index.html
vite.config.js
src/
  main.jsx                  React entry point
  App.jsx                   Page shell + providers + document meta
  index.css                 Tailwind entry, theme tokens, component styles
  i18n.js                   i18next setup + language persistence
  locales/                  Translation dictionaries (en, id, zh, ja)
  assets/                   Hero image, reviewer avatars, partner logos
  assets/rooms/             Room photos used by the carousel
  assets/gallery/           Hotel gallery photos used by the moments grid
  assets/reviews/           Guest avatars used by the review selector
  data/hotel.js             Brand, nav links, languages, currencies, guests
  data/rooms.js             Room records, IDR base prices, image imports
  data/reviews.js           Guest names, avatars and default review
  utils/date.js             Date helpers for the range calendar
  utils/currency.js         Localized currency names + price formatting
  hooks/
    useDismiss.js           Close on outside click / Escape
    useCurrency.jsx         Currency context + localStorage persistence
    useToast.jsx            Toast context + provider
  components/
    Navbar.jsx              Desktop + mobile navigation shell
    Brand.jsx               Centered wordmark and colour swatches
    LanguageSwitcher.jsx    Language dropdown
    CurrencySwitcher.jsx    Searchable currency dropdown
    MobileMenu.jsx          Collapsible mobile menu
    Hero.jsx                Hero section layout
    HeroContent.jsx         Rating, headline and intro copy
    RatingBadge.jsx         Avatars, stars and "Top-rated" label
    TrustedBy.jsx           Monochrome partner logo strip
    ReviewsSection.jsx      Guest quote card + avatar selector
    RoomsSection.jsx        "Find your perfect stay" heading + carousel
    GallerySection.jsx      "Explore our moments" asymmetric photo grid
    RoomsCarousel.jsx       Active room, side previews and arrows
    RoomCard.jsx            Room photo, price pill, details and CTAs
    RoomRateTable.jsx       Rate comparison table + dynamic nights stepper
    RoomTypePicker.jsx      Styled room-type dropdown for the booking form
    SingleDatePicker.jsx    Single-date calendar for the booking form
    AboutSection.jsx        About copy + address, phone and email card
    BookingSection.jsx      Booking form with validation and total calculation
    BookingBar.jsx          Hero booking bar + validation
    Footer.jsx              Dark rounded footer, newsletter and contact details
    GuestPicker.jsx         Guest count dropdown
    DateRangePicker.jsx     Check-in / check-out range calendar
    ui/
      Toast.jsx             Toast presentation
```

## Internationalization

The site supports **English**, **Bahasa Indonesia**, **中文**, and **日本語**. Switching a language updates the whole UI (including calendar month/weekday names, date formatting, validation messages and document meta), and the choice is persisted in `localStorage` under `aurehotel.language`.

Translations live in `src/locales/*.json`. Add the same keys to every locale file, then use them in components:

```jsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

<h2>{t("rooms.title")}</h2>
<p>{t("rooms.intro", { count: 3 })}</p>
```

For inline markup, use `Trans`:

```jsx
import { Trans } from "react-i18next";

<Trans i18nKey="rooms.intro" components={{ strong: <strong /> }} />
```

Plural keys use i18next's `_one` / `_other` suffixes. For languages with a single plural form (Indonesian, Chinese, Japanese), only `_other` is needed. New sections should follow this pattern so they automatically work in every supported language.

## Currency

The navbar currency switcher offers 16 common currencies. The active code is persisted in `localStorage` under `aurehotel.currency`, pinned as the first row of the dropdown, and full currency names are localized with `Intl.DisplayNames`. Use the shared hook in future sections:

```jsx
import { useCurrency } from "./hooks/useCurrency.jsx";

const { currency, setCurrency } = useCurrency();
```

## Rooms carousel

The third section (`RoomsSection.jsx`) shows one active room at a time, with the previous and next room as side previews on desktop and circular arrow controls on smaller screens. Room records live in `src/data/rooms.js`; prices are stored in IDR and converted to the active navbar currency with `formatPrice()` from `src/utils/currency.js`. Copy and room names come from the `stay.*` keys in every locale.

Below the carousel, `RoomRateTable.jsx` compares all room types with dynamic stay prices. The duration stepper adjusts the number of nights and every price recalculates instantly; breakfast adds Rp 80,000 per night to every room type. Hovering a room row previews that room in the carousel above.

## Gallery

`GallerySection.jsx` sits directly after the rooms section at `#images` and shows six hotel photos in a two-row asymmetric grid (45/38/17 and 22/45/33 on desktop, two columns on mobile). Images live in `src/assets/gallery/` and are sourced from Unsplash; copy comes from the `gallery.*` keys in every locale.

## Booking form

`BookingSection.jsx` adds the non-binding inquiry form at `#request`, which is also the target of the navbar "Book Now" button. It validates the guest name, gender, 16-digit identity number, booking date (`dd/mm/yyyy`), and numeric length of stay. Clicking **Hitung Total Bayar** fills the read-only total from the selected room price, applies a 10% room discount for stays longer than 3 nights, and adds Rp 80,000 per night when breakfast is included. Room prices and the total follow the active navbar currency.

## Footer

`Footer.jsx` renders the dark rounded footer below the main content with quick links, a newsletter form, the AureHotel wordmark, and the hotel address, phone and email. The newsletter shows a toast for valid and invalid email submissions, and all copy comes from the `footer.*` keys in every locale.

## Notes

- All hotel details (AureHotel, Menteng, copy) are fictional.
- The guest picker and date-range calendar are functional.
- Icons come from [Lucide](https://lucide.dev) via `lucide-react`.
- Layout is responsive: the booking bar stacks on tablet/mobile and the navbar collapses into a menu.
- Tailwind is compiled by the official `@tailwindcss/vite` plugin — no separate CSS build step.

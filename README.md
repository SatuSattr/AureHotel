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
  App.jsx                   Page shell + ToastProvider + document meta
  index.css                 Tailwind entry, theme tokens, component styles
  i18n.js                   i18next setup + language persistence
  locales/                  Translation dictionaries (en, id, zh, ja)
  assets/                   Hero image, reviewer avatars, partner logos
  data/hotel.js             Brand, nav links, languages, guest options
  utils/date.js             Date helpers for the range calendar
  hooks/
    useDismiss.js           Close on outside click / Escape
    useToast.jsx            Toast context + provider
  components/
    Navbar.jsx              Desktop + mobile navigation shell
    Brand.jsx               Centered wordmark and colour swatches
    LanguageSwitcher.jsx    Language dropdown
    MobileMenu.jsx          Collapsible mobile menu
    Hero.jsx                Hero section layout
    HeroContent.jsx         Rating, headline and intro copy
    RatingBadge.jsx         Avatars, stars and "Top-rated" label
    TrustedBy.jsx           Monochrome partner logo strip
    BookingBar.jsx          Booking form + validation
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

## Notes

- All hotel details (AureHotel, Menteng, copy) are fictional.
- The guest picker and date-range calendar are functional.
- Icons come from [Lucide](https://lucide.dev) via `lucide-react`.
- Layout is responsive: the booking bar stacks on tablet/mobile and the navbar collapses into a menu.
- Tailwind is compiled by the official `@tailwindcss/vite` plugin — no separate CSS build step.

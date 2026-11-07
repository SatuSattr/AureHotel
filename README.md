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
  App.jsx                   Page shell + ToastProvider
  index.css                 Tailwind entry, theme tokens, component styles
  assets/                   Hero image + reviewer avatars
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
    BookingBar.jsx          Booking form + validation
    GuestPicker.jsx         Guest count dropdown
    DateRangePicker.jsx     Check-in / check-out range calendar
    ui/
      Toast.jsx             Toast presentation
```

## Notes

- All hotel details (AureHotel, Menteng, copy) are fictional.
- The guest picker and date-range calendar are functional.
- Icons come from [Lucide](https://lucide.dev) via `lucide-react`.
- Layout is responsive: the booking bar stacks on tablet/mobile and the navbar collapses into a menu.
- Tailwind is compiled by the official `@tailwindcss/vite` plugin — no separate CSS build step.

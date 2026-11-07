import { useRef, useState } from "react";
import { NAV_LINKS } from "../data/hotel.js";
import { useDismiss } from "../hooks/useDismiss.js";
import Brand from "./Brand.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import MobileMenu from "./MobileMenu.jsx";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  useDismiss(navRef, () => setMenuOpen(false), menuOpen);

  return (
    <header
      ref={navRef}
      className={`nav relative z-40 grid grid-cols-[1fr_auto_1fr] items-center gap-5 bg-paper px-[var(--gutter)] pb-[22px] pt-5 max-[960px]:py-4 max-[760px]:pb-4 max-[760px]:pt-3.5${
        menuOpen ? " is-open" : ""
      }`}
      id="nav"
    >
      <div className="flex items-center gap-[clamp(18px,2.4vw,34px)]">
        <LanguageSwitcher />

        <nav
          className="flex items-center gap-[clamp(18px,2.4vw,34px)] max-[960px]:hidden"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              className={`nav-link py-1 text-[15px] font-medium text-ink transition-opacity hover:opacity-70${
                link.active ? " is-active" : ""
              }`}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <Brand />

      <div className="flex items-center justify-end gap-[clamp(18px,2.4vw,34px)]">
        <a
          className="nav-link py-1 text-[15px] font-medium text-ink transition-opacity hover:opacity-70 max-[960px]:hidden"
          href="#request"
        >
          Request
        </a>
        <a
          className="inline-flex items-center justify-center rounded-full bg-brown px-[27px] py-[15px] text-[15px] font-semibold tracking-[0.01em] text-white shadow-[0_10px_24px_-14px_rgba(58,42,32,0.8)] transition duration-200 hover:-translate-y-px hover:bg-brown-deep hover:shadow-[0_16px_30px_-14px_rgba(58,42,32,0.85)] max-[760px]:px-5 max-[760px]:py-3 max-[760px]:text-sm max-[520px]:hidden"
          href="#booking"
        >
          Book Now
        </a>
        <button
          className="nav-toggle hidden h-11 w-11 place-items-center rounded-full border border-line bg-white p-0 max-[960px]:grid"
          id="navToggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobileMenu"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <MobileMenu open={menuOpen} onNavigate={() => setMenuOpen(false)} />
    </header>
  );
}

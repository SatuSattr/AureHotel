import { NAV_LINKS } from "../data/hotel.js";

export default function MobileMenu({ open, onNavigate }) {
  return (
    <div
      className="mobile-menu absolute left-[var(--gutter)] right-[var(--gutter)] top-[calc(100%-6px)] z-[55] rounded-[18px] border border-line bg-white p-2.5 shadow-[0_30px_60px_-24px_rgba(38,26,19,0.35)]"
      id="mobileMenu"
      aria-hidden={!open}
    >
      {NAV_LINKS.map((link) => (
        <a
          key={link.label}
          className="rounded-[10px] px-3.5 py-[13px] text-[15px] font-medium hover:bg-field"
          href={link.href}
          onClick={onNavigate}
        >
          {link.label}
        </a>
      ))}
      <a
        className="rounded-[10px] px-3.5 py-[13px] text-[15px] font-medium hover:bg-field"
        href="#request"
        onClick={onNavigate}
      >
        Request
      </a>
      <a
        className="mt-1.5 inline-flex items-center justify-center rounded-xl bg-brown px-5 py-3.5 text-[15px] font-semibold text-white hover:bg-brown-deep"
        href="#booking"
        onClick={onNavigate}
      >
        Book Now
      </a>
    </div>
  );
}

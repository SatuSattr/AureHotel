import { BRAND } from "../data/hotel.js";

export default function Brand() {
  return (
    <a
      className="inline-flex flex-col items-center gap-[3px] px-2 py-0.5 text-ink transition-opacity hover:opacity-75"
      href="#home"
      aria-label={`${BRAND.name} — home`}
    >
      <span className="whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.3em] text-[#a99b8f] max-[760px]:text-[8px] max-[760px]:tracking-[0.26em] max-[520px]:hidden">
        {BRAND.kicker}
      </span>
      <span className="whitespace-nowrap text-[17px] font-semibold leading-[1.15] tracking-[0.21em] [text-indent:0.21em] max-[760px]:text-[15px]">
        {BRAND.name}
      </span>
      <span className="mt-1 flex gap-[3px]" aria-hidden="true">
        {BRAND.swatches.map((color) => (
          <i
            key={color}
            className="h-2 w-2 rounded-[1.5px] max-[760px]:h-[7px] max-[760px]:w-[7px]"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
    </a>
  );
}

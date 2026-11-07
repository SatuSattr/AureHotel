import { Trans } from "react-i18next";
import RatingBadge from "./RatingBadge.jsx";

const richTextComponents = {
  strong: <strong className="font-bold tracking-[-0.028em]" />,
  br: <br />,
};

export default function HeroContent() {
  return (
    <div className="hero-content flex flex-1 flex-col items-center justify-center py-[clamp(30px,5vh,58px)] text-center text-white max-[760px]:px-1 max-[760px]:py-[30px]">
      <RatingBadge />

      <h1 className="m-0 text-balance text-[clamp(2.45rem,5.15vw,4.35rem)] font-light leading-[1.06] tracking-[-0.024em] text-white [text-shadow:0_2px_26px_rgba(20,12,8,0.28)] max-[760px]:text-[clamp(2.05rem,8.6vw,2.9rem)] max-[760px]:leading-[1.08]">
        <Trans i18nKey="hero.title" components={richTextComponents} />
      </h1>

      <p className="mt-[clamp(16px,2.4vh,24px)] max-w-[660px] text-[clamp(14.5px,1.45vw,18.5px)] font-normal leading-[1.55] tracking-[0.002em] text-white/[0.93] [text-shadow:0_2px_18px_rgba(20,12,8,0.35)] max-[760px]:max-w-[94%] max-[760px]:text-sm">
        <Trans
          i18nKey="hero.lede"
          components={{
            br: <br className="max-[760px]:hidden" />,
          }}
        />
      </p>
    </div>
  );
}

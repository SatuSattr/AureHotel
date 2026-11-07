import heroImage from "../assets/hero.jpg";
import BookingBar from "./BookingBar.jsx";
import HeroContent from "./HeroContent.jsx";

export default function Hero() {
  return (
    <section
      className="hero relative isolate mx-[var(--gutter)] mb-[clamp(26px,4vw,48px)] flex min-h-[clamp(620px,76vh,740px)] rounded-[clamp(22px,2.2vw,30px)] bg-[#3c2f27] shadow-[0_40px_80px_-60px_rgba(40,26,18,0.7)] max-[960px]:min-h-[clamp(580px,72vh,700px)] max-[760px]:min-h-0 max-[760px]:rounded-[22px]"
      id="home"
      aria-label="AureHotel Jakarta"
    >
      <img
        className="absolute inset-0 z-0 h-full w-full rounded-[inherit] object-cover object-[center_58%] max-[760px]:object-[58%_center]"
        src={heroImage}
        alt="A warm, wood-panelled suite at AureHotel Jakarta with a king bed, soft lamps and a view of the city"
      />
      <div
        className="hero-shade absolute inset-0 z-[1] rounded-[inherit]"
        aria-hidden="true"
      />

      <div className="relative z-[2] flex flex-1 flex-col px-[clamp(18px,4vw,56px)] pb-[clamp(22px,3vw,34px)] pt-[clamp(34px,5vw,58px)] max-[760px]:px-3.5 max-[760px]:pb-3.5 max-[760px]:pt-[22px]">
        <HeroContent />
        <BookingBar />
      </div>
    </section>
  );
}

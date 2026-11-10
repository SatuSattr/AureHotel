import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pause, Play } from "lucide-react";
import heroImage from "../assets/hero.jpg";
import heroVideo from "../assets/hero.webm";
import BookingBar from "./BookingBar.jsx";
import HeroContent from "./HeroContent.jsx";

export default function Hero() {
  const { t } = useTranslation();
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const userPausedRef = useRef(false);

  // Delay the 12 MB video request until after the first render so the hero
  // image can paint immediately, then let the browser fetch it in idle time.
  useEffect(() => {
    let idleId = null;
    let timeoutId = null;

    const startLoading = () => setVideoSrc(heroVideo);

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(startLoading, { timeout: 1800 });
    } else {
      timeoutId = window.setTimeout(startLoading, 200);
    }

    return () => {
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return;

    // Some browsers only honour autoplay when muted is already set on the
    // element, so make sure it is applied before the first play() attempt.
    video.muted = true;
    video.defaultMuted = true;

    const attemptPlay = () => {
      if (userPausedRef.current) return;
      video.play().catch(() => {});
    };

    attemptPlay();
    video.addEventListener("loadeddata", attemptPlay);
    video.addEventListener("canplay", attemptPlay);

    return () => {
      video.removeEventListener("loadeddata", attemptPlay);
      video.removeEventListener("canplay", attemptPlay);
    };
  }, [videoFailed, videoSrc]);

  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    setVideoReady(true);

    if (!userPausedRef.current) {
      video.play().catch(() => {});
    }
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  };

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
      {!videoFailed && videoSrc ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 z-0 h-full w-full rounded-[inherit] object-cover object-[center_58%] transition-opacity duration-700 max-[760px]:object-[58%_center] ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          src={videoSrc}
          poster={heroImage}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={handleCanPlay}
          onPlaying={() => {
            setVideoReady(true);
            setIsPlaying(true);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => {
            setVideoFailed(true);
            setVideoReady(false);
          }}
        />
      ) : null}
      <div
        className="hero-shade absolute inset-0 z-[1] rounded-[inherit]"
        aria-hidden="true"
      />
      {!videoFailed && videoReady ? (
        <button
          className="absolute right-[clamp(14px,2.2vw,26px)] top-[clamp(14px,2.2vw,26px)] z-[3] grid h-11 w-11 place-items-center rounded-full border border-white/35 bg-[rgba(28,19,13,0.4)] p-0 text-white backdrop-blur-sm transition duration-200 hover:bg-[rgba(28,19,13,0.62)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="button"
          aria-label={t(isPlaying ? "hero.pauseVideo" : "hero.playVideo")}
          aria-pressed={isPlaying}
          onClick={togglePlayback}
        >
          {isPlaying ? (
            <Pause className="icon" aria-hidden="true" />
          ) : (
            <Play className="icon" aria-hidden="true" />
          )}
        </button>
      ) : null}

      <div className="relative z-[2] flex flex-1 flex-col px-[clamp(18px,4vw,56px)] pb-[clamp(22px,3vw,34px)] pt-[clamp(34px,5vw,58px)] max-[760px]:px-3.5 max-[760px]:pb-3.5 max-[760px]:pt-[22px]">
        <HeroContent />
        <BookingBar />
      </div>
    </section>
  );
}

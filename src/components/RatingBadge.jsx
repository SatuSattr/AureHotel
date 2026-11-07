import { Plus, Star } from "lucide-react";
import avatar1 from "../assets/avatar-1.jpg";
import avatar2 from "../assets/avatar-2.jpg";
import avatar3 from "../assets/avatar-3.jpg";

const AVATARS = [avatar1, avatar2, avatar3];
const AVATAR_CLASSES =
  "avatar -ml-3 h-[42px] w-[42px] overflow-hidden rounded-full border-2 border-white/90 bg-[#f3ede6] shadow-[0_6px_14px_-8px_rgba(0,0,0,0.6)] first:ml-0 max-[760px]:-ml-2.5 max-[760px]:h-[34px] max-[760px]:w-[34px]";

export default function RatingBadge() {
  return (
    <div className="mb-[clamp(18px,2.4vh,26px)] flex items-center gap-3.5 max-[760px]:mb-5 max-[760px]:gap-[11px]">
      <div className="flex items-center pl-0.5" aria-hidden="true">
        {AVATARS.map((avatar, index) => (
          <span key={avatar} className={AVATAR_CLASSES}>
            <img
              className="h-full w-full object-cover"
              src={avatar}
              alt=""
            />
          </span>
        ))}
        <span
          className={`${AVATAR_CLASSES} flex items-center justify-center bg-white text-ink`}
        >
          <Plus
            className="h-4 w-4 max-[760px]:h-3.5 max-[760px]:w-3.5"
            strokeWidth={2.25}
            aria-hidden="true"
          />
        </span>
      </div>

      <div className="flex flex-col items-start gap-[5px]">
        <div
          className="stars flex gap-0.5 text-gold [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.25))]"
          aria-label="Rated 5 out of 5 stars"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} aria-hidden="true" />
          ))}
        </div>
        <span className="text-[13px] text-white/[0.94] max-[760px]:text-xs">
          Top-rated by visitors
        </span>
      </div>
    </div>
  );
}

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { roomForGuests } from "../data/rooms.js";
import { nightsBetween } from "../utils/date.js";

const BookingFlowContext = createContext(null);

function scrollToSection(id) {
  const target = document.getElementById(id);

  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({ top, behavior: "smooth" });
}

function scrollAfterRender(id) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => scrollToSection(id));
  });
}

export function BookingFlowProvider({ children }) {
  const [ctaPreset, setCtaPreset] = useState(null);
  const [roomSelection, setRoomSelection] = useState(null);
  const [roomFocus, setRoomFocus] = useState(null);
  const [highlightBookButtons, setHighlightBookButtons] = useState(false);
  const tokenRef = useRef(0);

  const nextToken = useCallback(() => {
    tokenRef.current += 1;
    return tokenRef.current;
  }, []);

  const startFromCta = useCallback(
    ({ guests, checkIn, checkOut }) => {
      const nights = nightsBetween(checkIn, checkOut);
      const room = roomForGuests(guests);

      setCtaPreset({
        token: nextToken(),
        date: checkIn,
        nights,
        roomId: room.id,
      });
      setRoomFocus({ token: nextToken(), roomId: room.id });
      setHighlightBookButtons(true);

      scrollAfterRender("offer");
    },
    [nextToken]
  );

  const selectRoom = useCallback(
    (roomId) => {
      setRoomSelection({ token: nextToken(), roomId });
      setRoomFocus(null);
      setHighlightBookButtons(false);

      scrollAfterRender("request");
    },
    [nextToken]
  );

  return (
    <BookingFlowContext.Provider
      value={{
        ctaPreset,
        roomSelection,
        roomFocus,
        highlightBookButtons,
        startFromCta,
        selectRoom,
      }}
    >
      {children}
    </BookingFlowContext.Provider>
  );
}

export function useBookingFlow() {
  const context = useContext(BookingFlowContext);

  if (!context) {
    throw new Error("useBookingFlow must be used within BookingFlowProvider");
  }

  return context;
}

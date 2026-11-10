import { useEffect } from "react";

/**
 * Closes a popover/menu when the user clicks outside `ref` or presses Escape.
 */
export function useDismiss(ref, onDismiss, active = true) {
  useEffect(() => {
    if (!active) return undefined;

    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onDismiss();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onDismiss();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, onDismiss, active]);
}

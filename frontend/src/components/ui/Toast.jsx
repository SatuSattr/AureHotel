export default function Toast({ message, visible, onDismiss }) {
  return (
    <div
      className={`toast${visible ? " is-visible" : ""}`}
      role="status"
      aria-live="polite"
      onClick={onDismiss}
    >
      {message}
    </div>
  );
}

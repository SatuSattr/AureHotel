import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Toast from "../components/ui/Toast.jsx";

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: "", visible: false });
  const timerRef = useRef(null);

  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }));
    }, 3600);
  }, []);

  const hideToast = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setToast((current) => ({ ...current, visible: false }));
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
    },
    []
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast
        message={toast.message}
        visible={toast.visible}
        onDismiss={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

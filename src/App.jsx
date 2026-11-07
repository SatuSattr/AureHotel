import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./i18n.js";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import { ToastProvider } from "./hooks/useToast.jsx";

export default function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t("meta.title");

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute("content", t("meta.description"));
    }
  }, [t, i18n.resolvedLanguage]);

  return (
    <ToastProvider>
      <Navbar />
      <main>
        <Hero />
      </main>
    </ToastProvider>
  );
}

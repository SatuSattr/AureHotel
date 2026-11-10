import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./i18n.js";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import AboutSection from "./components/AboutSection.jsx";
import BookingSection from "./components/BookingSection.jsx";
import InvoicePage from "./components/InvoicePage.jsx";
import RoomsSection from "./components/RoomsSection.jsx";
import GallerySection from "./components/GallerySection.jsx";
import ReviewsSection from "./components/ReviewsSection.jsx";
import TrustedBy from "./components/TrustedBy.jsx";
import Footer from "./components/Footer.jsx";
import { CurrencyProvider } from "./hooks/useCurrency.jsx";
import { BookingFlowProvider } from "./hooks/useBookingFlow.jsx";
import { ToastProvider } from "./hooks/useToast.jsx";

const INVOICE_ROUTE = /^\/invoice\/([^/]+)\/?$/;

function LandingPage() {
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
      <CurrencyProvider>
        <BookingFlowProvider>
          <Navbar />
          <main>
            <Hero />
            <TrustedBy />
            <ReviewsSection />
            <RoomsSection />
            <GallerySection />
            <AboutSection />
            <BookingSection />
          </main>
          <Footer />
        </BookingFlowProvider>
      </CurrencyProvider>
    </ToastProvider>
  );
}

export default function App() {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";
  const invoiceMatch = pathname.match(INVOICE_ROUTE);

  if (invoiceMatch) {
    return <InvoicePage hashId={invoiceMatch[1]} />;
  }

  return <LandingPage />;
}

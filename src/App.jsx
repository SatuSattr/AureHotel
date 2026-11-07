import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import { ToastProvider } from "./hooks/useToast.jsx";

export default function App() {
  return (
    <ToastProvider>
      <Navbar />
      <main>
        <Hero />
      </main>
    </ToastProvider>
  );
}

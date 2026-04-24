import { SiteHeader } from "./components/SiteHeader";
import { Hero } from "./components/Hero";
import {
  Benefits,
  Closing,
  Faq,
  SiteFooter,
  Steps,
} from "./components/Sections";
import { ChatWidget } from "./components/ChatWidget";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <SiteHeader />

      <main id="contenido">
        <Hero />
        <Steps />
        <Benefits />
        <Faq />
        <Closing />
      </main>

      <SiteFooter />

      <ChatWidget />
    </>
  );
}

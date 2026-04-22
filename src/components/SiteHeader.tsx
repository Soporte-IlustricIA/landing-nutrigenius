import { CtaButton } from "./CtaButton";

export function SiteHeader() {
  return (
    <header className="site-header" role="banner">
      <a className="brand" href="#" aria-label="Nutrigenius, inicio">
        <img
          className="brand__mark"
          src="/assets/logo-nutrigenius-sin-fondo.png"
          alt=""
          decoding="async"
        />
        <span className="brand__name">Nutrigenius</span>
      </a>
      <nav className="site-nav" aria-label="Principal">
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#beneficios">Beneficios</a>
        <a href="#faq">Preguntas</a>
      </nav>
      <CtaButton location="header" className="btn btn--primary btn--sm">
        Probar el agente
      </CtaButton>
    </header>
  );
}

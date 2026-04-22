import { ArrowIcon } from "./ArrowIcon";
import { CtaButton } from "./CtaButton";

export function Steps() {
  return (
    <section
      id="como-funciona"
      className="section section--steps"
      aria-labelledby="como-title"
    >
      <header className="section__head">
        <p className="eyebrow">Cómo funciona</p>
        <h2 id="como-title" className="section__title">
          Del objetivo al plan en tres pasos
        </h2>
      </header>
      <ol className="steps">
        <li className="step">
          <span className="step__num">01</span>
          <h3 className="step__title">Cuenta tu objetivo</h3>
          <p className="step__text">
            Bajar grasa, ganar masa, controlar glucosa, comer mejor. Escríbelo
            en tus palabras al agente.
          </p>
        </li>
        <li className="step">
          <span className="step__num">02</span>
          <h3 className="step__title">Nutrigenius razona</h3>
          <p className="step__text">
            El agente combina tus datos, preferencias y evidencia nutricional
            para proponer un plan equilibrado.
          </p>
        </li>
        <li className="step">
          <span className="step__num">03</span>
          <h3 className="step__title">Recibe tu plan</h3>
          <p className="step__text">
            Menús, porciones y compra. Ajústalo por chat cuando quieras, sin
            empezar de cero.
          </p>
        </li>
      </ol>
    </section>
  );
}

export function Benefits() {
  return (
    <section
      id="beneficios"
      className="section section--benefits"
      aria-labelledby="ben-title"
    >
      <header className="section__head">
        <p className="eyebrow">Beneficios</p>
        <h2 id="ben-title" className="section__title">
          Diseñado para durar, no para una semana
        </h2>
      </header>
      <div className="cards">
        <article className="card">
          <div className="card__icon" aria-hidden="true">
            ⏱
          </div>
          <h3 className="card__title">Rápido de verdad</h3>
          <p className="card__text">
            Tu primera recomendación llega en segundos. Sin cuestionarios
            interminables.
          </p>
        </article>
        <article className="card">
          <div className="card__icon" aria-hidden="true">
            ◎
          </div>
          <h3 className="card__title">Personalizado</h3>
          <p className="card__text">
            Se adapta a tus gustos, alergias y rutina. Pídele cambios en
            lenguaje natural.
          </p>
        </article>
        <article className="card">
          <div className="card__icon" aria-hidden="true">
            ✦
          </div>
          <h3 className="card__title">Con base en evidencia</h3>
          <p className="card__text">
            Nutrigenius razona sobre fuentes contrastadas, no sobre modas
            pasajeras.
          </p>
        </article>
        <article className="card">
          <div className="card__icon" aria-hidden="true">
            ◈
          </div>
          <h3 className="card__title">Privado</h3>
          <p className="card__text">
            Tus datos son tuyos. Puedes probar el agente sin crear cuenta.
          </p>
        </article>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="section section--faq" aria-labelledby="faq-title">
      <header className="section__head">
        <p className="eyebrow">Preguntas</p>
        <h2 id="faq-title" className="section__title">
          Lo que la gente quiere saber
        </h2>
      </header>
      <div className="faq">
        <details className="faq__item">
          <summary>¿Qué es exactamente Nutrigenius?</summary>
          <p>
            Un agente conversacional especializado en nutrición que construye
            planes personalizados y los ajusta contigo en tiempo real.
          </p>
        </details>
        <details className="faq__item">
          <summary>¿Necesito crear cuenta para probarlo?</summary>
          <p>
            No. Puedes abrir el agente desde esta página y empezar a chatear. Si
            quieres guardar tu plan, podrás registrarte al final.
          </p>
        </details>
        <details className="faq__item">
          <summary>¿Sustituye a un nutricionista?</summary>
          <p>
            No. Nutrigenius es una herramienta de apoyo. Para condiciones
            médicas, consulta siempre con un profesional.
          </p>
        </details>
        <details className="faq__item">
          <summary>¿Qué pasa con mis datos?</summary>
          <p>
            Sólo usamos lo necesario para darte una respuesta útil. Nunca
            vendemos información a terceros.
          </p>
        </details>
      </div>
    </section>
  );
}

export function Closing() {
  return (
    <section className="section section--closing" aria-label="Probar el agente">
      <div className="closing">
        <h2 className="closing__title">¿Listo para tu primer plan?</h2>
        <p className="closing__text">
          Cuéntale tu objetivo al agente. Recibirás una propuesta clara en
          segundos.
        </p>
        <CtaButton location="closing" className="btn btn--primary btn--lg">
          Probar el agente
          <ArrowIcon />
        </CtaButton>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" role="contentinfo">
      <p>© {year} Nutrigenius · Potenciado por OpenClaw</p>
      <nav aria-label="Legales">
        <a href="#">Privacidad</a>
        <a href="#">Términos</a>
      </nav>
    </footer>
  );
}

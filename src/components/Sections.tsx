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
          <h3 className="step__title">Define el objetivo</h3>
          <p className="step__text">
          Introduce los datos, objetivos y patologías de tu paciente en lenguaje natural. NutriGenius procesa la información para darte una base sólida de trabajo.
          </p>
        </li>
        <li className="step">
          <span className="step__num">02</span>
          <h3 className="step__title">Nutrigenius razona</h3>
          <p className="step__text">
          El asistente cruza requerimientos nutricionales y preferencias para proponer una estructura de menús coherente, ahorrándote horas de cálculos manuales.
          </p>
        </li>
        <li className="step">
          <span className="step__num">03</span>
          <h3 className="step__title">Entrega Profesional</h3>
          <p className="step__text">
          Revisa la propuesta, realiza ajustes por chat y exporta el plan final en PDF o DOCX con formato profesional, listo para entregar a tu cliente.
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
          Un asistente diseñado para durar
        </h2>
      </header>
      <div className="cards">
        <article className="card">
          <div className="card__icon" aria-hidden="true">
            ⏱
          </div>
          <h3 className="card__title">Productividad Radical</h3>
          <p className="card__text">
          Reduce el tiempo de creación de planes de horas a minutos. No sacrifiques la calidad ni tu tiempo personal.
          </p>
        </article>
        <article className="card">
          <div className="card__icon" aria-hidden="true">
            ◎
          </div>
          <h3 className="card__title">Flexibilidad</h3>
          <p className="card__text">
          Realiza cambios complejos sobre la marcha. Si tu paciente pide cambios de última hora, NutriGenius recalibra el plan completo al instante.
          </p>
        </article>
        <article className="card">
          <div className="card__icon" aria-hidden="true">
            ✦
          </div>
          <h3 className="card__title">Sin curvas de aprendizaje</h3>
          <p className="card__text">
          Una interfaz de chat intuitiva diseñada para que el profesional se centre en el criterio clínico, no en el software.
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
        <p className="eyebrow">Preguntas frecuentes</p>
        <h2 id="faq-title" className="section__title">
          Optimiza tu consulta con NutriGenius
        </h2>
      </header>
      <div className="faq">
        <details className="faq__item">
          <summary>¿Cómo ayuda NutriGenius a mi práctica profesional?</summary>
          <p>
            Actúa como tu asistente técnico 24/7. Se encarga de la elaboración de borradores de dietas, cálculos calóricos y ajustes de menús basados en tus indicaciones, permitiéndote centrarte en el diagnóstico y el trato con el paciente.
          </p>
        </details>
        
        <details className="faq__item">
          <summary>¿En qué formatos puedo descargar los planes?</summary>
          <p>
            NutriGenius genera documentos profesionales en <strong>PDF</strong> listos para entregar y archivos <strong>DOCX (Word)</strong> totalmente editables por si deseas añadir tu marca personal o realizar ajustes manuales de última hora.
          </p>
        </details>

        <details className="faq__item">
          <summary>¿Puedo personalizar los criterios nutricionales?</summary>
          <p>
            Sí. Al ser una interfaz conversacional, puedes darle instrucciones específicas como "ajusta la proteína a 2g/kg", "excluye alimentos ultraprocesados" o "diseña un menú basado en la dieta FODMAP". El asistente sigue tus reglas clínicas.
          </p>
        </details>

        <details className="faq__item">
          <summary>¿Es necesario instalar algún software?</summary>
          <p>
            No. Es una herramienta basada en la nube. Puedes acceder desde esta landing, y también integrarlo en tus canales de trabajo habituales como <strong>Telegram</strong> para una gestión más ágil.
          </p>
        </details>

        <details className="faq__item">
          <summary>¿Qué fiabilidad tienen los planes generados?</summary>
          <p>
            NutriGenius utiliza modelos de inteligencia avanzada entrenados para razonar sobre evidencias nutricionales actualizadas. No obstante, está diseñado para que tú, como profesional, valides y des el visto bueno final al plan antes de la entrega.
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
        </CtaButton>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" role="contentinfo">
      <p>© {year} Nutrigenius</p>
    </footer>
  );
}

import { useEffect, useRef } from "react";
import { CtaButton } from "./CtaButton";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = matchMedia("(max-width: 560px)").matches;
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const saveData =
      connection?.saveData === true ||
      /2g/.test(connection?.effectiveType ?? "");

    if (reduced || narrow || saveData) return;

    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      video.preload = "auto";
      const tryPlay = () => {
        const p = video.play();
        if (p && typeof p.then === "function") {
          p.then(() => video.classList.add("is-playing")).catch(() => {
            /* autoplay bloqueado: poster se queda visible */
          });
        } else {
          video.classList.add("is-playing");
        }
      };
      if (video.readyState >= 2) tryPlay();
      else video.addEventListener("loadeddata", tryPlay, { once: true });
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
    };
    let timeoutId: number | undefined;
    if (typeof win.requestIdleCallback === "function") {
      win.requestIdleCallback(start, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(start, 400);
    }

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section className="hero" aria-label="Presentación de Nutrigenius">
      <div className="hero__media" aria-hidden="true">
        <img
          className="hero__poster"
          src="/assets/hero-poster.svg"
          alt=""
          decoding="async"
          fetchPriority="high"
        />
        <video
          ref={videoRef}
          className="hero__video"
          poster="/assets/hero-poster.svg"
          muted
          playsInline
          loop
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/assets/loop-nutrigenius.mp4" type="video/mp4" />
        </video>
        <div className="hero__overlay" />
      </div>

      <div className="hero__content">
        <p className="eyebrow">Tu nutrición, evolucionada.</p>
        <h1 className="hero__title">
          Tu nutrición,
          <br />
          guiada por <span className="grad">Nutrigenius</span>.
        </h1>
        <p className="hero__lede">
        Habla con NutriGenius, el primer asistente inteligente que diseña tu alimentación en tiempo real. 
        Resuelve dudas, personaliza tu menú y genera tu plan profesional en PDF al instante. 
        Sin esperas, sin complicaciones.
        </p>
        <div className="hero__actions">
          <CtaButton location="hero" className="btn btn--primary btn--lg">
            Probar el agente
          </CtaButton>
          <a className="btn btn--link" href="#como-funciona">
            Ver cómo funciona
          </a>
        </div>
        <p className="hero__trust">
          <span aria-hidden="true">·</span> Respuesta rápida
          <span aria-hidden="true">·</span> Criterio profesional
          <span aria-hidden="true">·</span> Privacidad garantizada
        </p>
      </div>

      <a className="hero__scroll" href="#como-funciona" aria-label="Ver más abajo">
        <span aria-hidden="true" />
      </a>
    </section>
  );
}

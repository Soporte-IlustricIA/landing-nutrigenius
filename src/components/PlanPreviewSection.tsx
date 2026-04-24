import { useEffect, useRef, useState } from "react";
import { PLAN_PREVIEW_ALLOWED_HOSTS } from "../config";
import { resolvePlanPreview, type PlanPreviewResult } from "../lib/planPreview";

function errorMessage(result: Extract<PlanPreviewResult, { ok: false }>): string {
  switch (result.reason) {
    case "missing_param":
      return "";
    case "decode":
      return "El parámetro plan no es una URL codificada válida.";
    case "not_url":
      return "plan debe ser una URL absoluta (https://… o http://localhost…).";
    case "not_pdf":
      return "La URL debe apuntar a un archivo PDF.";
    case "protocol":
      return "Solo se permiten enlaces https:// o, en local, http://localhost (o 127.0.0.1).";
    case "no_hosts":
      return "Falta configurar VITE_PLAN_PREVIEW_ALLOWED_HOSTS (lista separada por comas, ej. tu-dominio.com,cdn.tu-dominio.com).";
    case "host_not_allowed":
      return "El dominio del PDF no está en la lista de hosts permitidos.";
    default:
      return "No se pudo cargar la vista previa.";
  }
}

export function PlanPreviewSection() {
  const [result, setResult] = useState<PlanPreviewResult>(() =>
    resolvePlanPreview(window.location.search, PLAN_PREVIEW_ALLOWED_HOSTS)
  );
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function read() {
      setResult(
        resolvePlanPreview(window.location.search, PLAN_PREVIEW_ALLOWED_HOSTS)
      );
    }
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  useEffect(() => {
    if (result.ok && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  if (!result.ok) {
    if (result.reason === "missing_param") return null;
    return (
      <section
        id="vista-previa-plan"
        ref={sectionRef}
        className="border-b border-[color:var(--c-line)] bg-[color:var(--c-bg-soft)] px-[var(--s-5)] py-[var(--s-7)] text-[color:var(--c-ink)]"
        aria-live="polite"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-xl font-semibold text-[color:var(--c-ink)] sm:text-2xl">
            Tu plan / Vista previa del PDF
          </h2>
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMessage(result)}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="vista-previa-plan"
      ref={sectionRef}
      className="border-b border-[color:var(--c-line)] bg-[color:var(--c-bg-soft)] px-[var(--s-5)] py-[var(--s-7)] text-[color:var(--c-ink)]"
    >
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-xl font-semibold text-[color:var(--c-ink)] sm:text-2xl">
            Tu plan / Vista previa del PDF
          </h2>
          <a
            href={result.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center rounded-full border border-[color:var(--c-line)] bg-[color:var(--c-surface)] px-4 py-2 text-sm font-medium text-[color:var(--c-accent)] transition hover:border-[color:var(--c-accent)]"
          >
            Descargar PDF
          </a>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[color:var(--c-line)] bg-[color:var(--c-surface)] shadow-[var(--sh-1)]">
          <iframe
            title="Vista previa del plan (PDF)"
            src={result.pdfUrl}
            loading="lazy"
            className="h-[min(75vh,42rem)] w-full min-h-[20rem] bg-[color:var(--c-bg)]"
          />
        </div>
        <p className="text-xs text-[color:var(--c-ink-soft)]">
          Si no ves el documento, el servidor del PDF puede estar bloqueando el embed (cabeceras de seguridad).
          Usa «Descargar PDF» o abre el enlace en una pestaña nueva.
        </p>
      </div>
    </section>
  );
}

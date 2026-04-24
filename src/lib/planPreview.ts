/**
 * Vista previa del plan vía `?plan=<encodeURIComponent(urlPdf)>` (solo hosts permitidos).
 */

export type PlanPreviewResult =
  | { ok: true; pdfUrl: string }
  | { ok: false; reason: "missing_param" | "decode" | "not_url" | "not_pdf" | "protocol" | "no_hosts" | "host_not_allowed" };

export function parseAllowedPlanHosts(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

function isLocalHttpHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
}

export function resolvePlanPreviewFromSearch(search: string): PlanPreviewResult {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  } catch {
    return { ok: false, reason: "decode" };
  }
  const raw = params.get("plan");
  if (!raw?.trim()) return { ok: false, reason: "missing_param" };

  let decoded: string;
  try {
    decoded = decodeURIComponent(raw.trim());
  } catch {
    return { ok: false, reason: "decode" };
  }

  let u: URL;
  try {
    u = new URL(decoded);
  } catch {
    return { ok: false, reason: "not_url" };
  }

  const pathAndQuery = `${u.pathname}${u.search}`;
  if (!/\.pdf($|[?#])/i.test(pathAndQuery)) {
    return { ok: false, reason: "not_pdf" };
  }

  const host = u.hostname.toLowerCase();
  if (u.protocol === "https:") {
    /* ok */
  } else if (u.protocol === "http:" && isLocalHttpHost(host)) {
    /* ok para desarrollo local */
  } else {
    return { ok: false, reason: "protocol" };
  }

  return { ok: true, pdfUrl: u.toString() };
}

export function isPlanHostAllowed(pdfUrl: string, allowedHosts: string[]): PlanPreviewResult {
  if (!allowedHosts.length) return { ok: false, reason: "no_hosts" };
  let u: URL;
  try {
    u = new URL(pdfUrl);
  } catch {
    return { ok: false, reason: "not_url" };
  }
  const host = u.hostname.toLowerCase();
  if (!allowedHosts.includes(host)) {
    return { ok: false, reason: "host_not_allowed" };
  }
  return { ok: true, pdfUrl: u.toString() };
}

export function resolvePlanPreview(
  search: string,
  allowedHosts: string[]
): PlanPreviewResult {
  const base = resolvePlanPreviewFromSearch(search);
  if (!base.ok) return base;
  return isPlanHostAllowed(base.pdfUrl, allowedHosts);
}

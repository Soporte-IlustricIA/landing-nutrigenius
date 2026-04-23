export const OPENCLAW_WS_URL =
  (import.meta.env.VITE_OPENCLAW_WS_URL as string | undefined) ??
  "wss://pruebas-openclaw-gateway.nvhqhw.easypanel.host";

export const OPENCLAW_HTTP_URL =
  (import.meta.env.VITE_OPENCLAW_HTTP_URL as string | undefined) ?? "";

export const OPENCLAW_API_KEY =
  (import.meta.env.VITE_OPENCLAW_API_KEY as string | undefined) ?? "";

export const OPENCLAW_AGENT_ID =
  (import.meta.env.VITE_OPENCLAW_AGENT_ID as string | undefined) ?? "";

export const OPENCLAW_SESSION_KEY =
  (import.meta.env.VITE_OPENCLAW_SESSION_KEY as string | undefined) ?? "";

/** Último segmento de `agent:<id>:<id>:direct:<este>` (p. ej. user id de Telegram). */
export const OPENCLAW_DIRECT_PEER_ID =
  (import.meta.env.VITE_OPENCLAW_DIRECT_PEER_ID as string | undefined) ?? "";

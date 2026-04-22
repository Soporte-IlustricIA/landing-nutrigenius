export const OPENCLAW_WS_URL =
  (import.meta.env.VITE_OPENCLAW_WS_URL as string | undefined) ??
  "wss://pruebas-openclaw-gateway.nvhqhw.easypanel.host";

export const OPENCLAW_API_KEY =
  (import.meta.env.VITE_OPENCLAW_API_KEY as string | undefined) ?? "";

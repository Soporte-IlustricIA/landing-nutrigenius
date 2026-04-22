/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENCLAW_WS_URL?: string;
  readonly VITE_OPENCLAW_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

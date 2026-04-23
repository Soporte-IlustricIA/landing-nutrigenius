/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENCLAW_WS_URL?: string;
  readonly VITE_OPENCLAW_HTTP_URL?: string;
  readonly VITE_OPENCLAW_API_KEY?: string;
  readonly VITE_OPENCLAW_AGENT_ID?: string;
  readonly VITE_OPENCLAW_SESSION_KEY?: string;
  readonly VITE_OPENCLAW_DIRECT_PEER_ID?: string;
  readonly VITE_OPENCLAW_WEBCHAT_TO?: string;
  readonly VITE_OPENCLAW_DOWNLOAD_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export type ChatRole = "user" | "bot" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: number;
};

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error"
  | "closed";

export type OutgoingPayload = {
  action: "sendMessage";
  text: string;
  userId: string;
  sessionId: string;
};

export type InitPayload = {
  action: "init";
  apiKey: string;
  userId: string;
  sessionId: string;
  client: "nutrigenius-landing";
};

export type IncomingEvent =
  | { type: "message"; text: string; role?: ChatRole }
  | { type: "typing"; isTyping: boolean }
  | { type: "ready" }
  | { type: "error"; message: string }
  | { type: "unknown"; raw: unknown };

export function parseIncomingEvent(raw: unknown): IncomingEvent {
  if (typeof raw === "string") {
    return { type: "message", text: raw, role: "bot" };
  }

  if (!raw || typeof raw !== "object") {
    return { type: "unknown", raw };
  }

  const data = raw as Record<string, unknown>;

  const explicitType = typeof data.type === "string" ? data.type : undefined;
  if (explicitType === "typing") {
    return { type: "typing", isTyping: data.isTyping !== false };
  }
  if (explicitType === "ready" || data.status === "ready") {
    return { type: "ready" };
  }
  if (explicitType === "error") {
    return {
      type: "error",
      message:
        typeof data.message === "string" ? data.message : "Error del servidor",
    };
  }

  const text =
    typeof data.text === "string"
      ? data.text
      : typeof data.message === "string"
        ? data.message
        : typeof data.content === "string"
          ? data.content
          : undefined;

  if (text) {
    const role = data.sender === "user" ? "user" : "bot";
    return { type: "message", text, role };
  }

  return { type: "unknown", raw };
}

export function createId(prefix = "msg"): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

const USER_STORAGE_KEY = "nutrigenius.userId";
const SESSION_STORAGE_KEY = "nutrigenius.sessionId";

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return createId("user");
  try {
    const existing = window.localStorage.getItem(USER_STORAGE_KEY);
    if (existing) return existing;
    const fresh = createId("user");
    window.localStorage.setItem(USER_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return createId("user");
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return createId("session");
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const fresh = createId("session");
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return createId("session");
  }
}

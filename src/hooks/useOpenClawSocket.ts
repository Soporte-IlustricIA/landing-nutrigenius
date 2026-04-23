import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ChatMessage,
  type ConnectionStatus,
  createId,
  getOrCreateSessionId,
  getOrCreateUserId,
} from "../lib/openclaw";

type UseOpenClawSocketOptions = {
  url: string;
  apiKey?: string;
  agentId?: string;
  sessionKey?: string;
  enabled: boolean;
  typingGraceMs?: number;
};

type UseOpenClawSocketResult = {
  status: ConnectionStatus;
  messages: ChatMessage[];
  isTyping: boolean;
  errorMessage: string | null;
  sendMessage: (text: string) => boolean;
  reconnect: () => void;
  userId: string;
  sessionId: string;
};

const RECONNECT_BASE_MS = 1200;
const RECONNECT_MAX_MS = 10_000;
const MAX_RECONNECT_ATTEMPTS = 5;
const CONNECT_REQUEST_ID = "gateway_connect";

type GatewayEventFrame = {
  type: "event";
  event: string;
  payload?: unknown;
};

type GatewayResponseFrame = {
  type: "res";
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: { message?: string };
};

function parseFrame(raw: unknown): GatewayEventFrame | GatewayResponseFrame | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  if (data.type === "event" && typeof data.event === "string") {
    return { type: "event", event: data.event, payload: data.payload };
  }
  if (
    data.type === "res" &&
    typeof data.id === "string" &&
    typeof data.ok === "boolean"
  ) {
    return {
      type: "res",
      id: data.id,
      ok: data.ok,
      payload: data.payload,
      error:
        data.error && typeof data.error === "object"
          ? (data.error as { message?: string })
          : undefined,
    };
  }
  return null;
}

function extractText(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return undefined;
  const data = value as Record<string, unknown>;
  const direct =
    typeof data.text === "string"
      ? data.text
      : typeof data.message === "string"
        ? data.message
        : typeof data.content === "string"
          ? data.content
          : undefined;
  if (direct) return direct;
  return extractText(data.payload);
}

export function useOpenClawSocket({
  url,
  apiKey,
  agentId,
  sessionKey,
  enabled,
  typingGraceMs = 8000,
}: UseOpenClawSocketOptions): UseOpenClawSocketResult {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const manuallyClosedRef = useRef(false);
  const gatewayReadyRef = useRef(false);

  const userIdRef = useRef(getOrCreateUserId());
  const sessionIdRef = useRef(getOrCreateSessionId());

  const clearTypingTimer = useCallback(() => {
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, []);

  const armTypingGrace = useCallback(() => {
    clearTypingTimer();
    typingTimerRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, typingGraceMs);
  }, [clearTypingTimer, typingGraceMs]);

  const resolveGatewaySession = useCallback(() => {
    if (sessionKey) return sessionKey;
    if (agentId) return `agent:${agentId}:${agentId}:direct:${userIdRef.current}`;
    return sessionIdRef.current;
  }, [agentId, sessionKey]);

  const openSocket = useCallback(() => {
    if (!enabled || !url) return;
    if (!apiKey) {
      setStatus("error");
      setErrorMessage(
        "Falta VITE_OPENCLAW_API_KEY en el entorno de despliegue (Vercel)."
      );
      return;
    }

    manuallyClosedRef.current = false;
    gatewayReadyRef.current = false;

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "No se pudo abrir el socket"
      );
      return;
    }

    socketRef.current = ws;
    setStatus(reconnectAttemptsRef.current > 0 ? "reconnecting" : "connecting");
    setErrorMessage(null);

    ws.onmessage = (event) => {
      let payload: unknown = event.data;
      if (typeof event.data === "string") {
        try {
          payload = JSON.parse(event.data);
        } catch {
          payload = event.data;
        }
      }

      const frame = parseFrame(payload);
      if (!frame) {
        const text = extractText(payload);
        if (text) {
          setMessages((prev) => [
            ...prev,
            { id: createId("bot"), role: "bot", text, timestamp: Date.now() },
          ]);
          setIsTyping(false);
          clearTypingTimer();
        }
        return;
      }

      if (frame.type === "event") {
        if (frame.event === "connect.challenge") {
          try {
            const nonce =
              frame.payload && typeof frame.payload === "object"
                ? (frame.payload as Record<string, unknown>).nonce
                : undefined;

            ws.send(
              JSON.stringify({
                type: "req",
                id: CONNECT_REQUEST_ID,
                method: "connect",
                params: {
                  minProtocol: 3,
                  maxProtocol: 3,
                  client: {
                    id: "webchat",
                    version: "0.1.0",
                    platform: "web",
                    mode: "webchat",
                  },
                  role: "operator",
                  scopes: ["operator.read", "operator.write"],
                  caps: [],
                  commands: [],
                  permissions: {},
                  auth: { token: apiKey },
                  locale: "es-ES",
                  userAgent: "nutrigenius-landing",
                  device: {
                    id: "webchat_" + crypto.randomUUID(),
                    nonce: typeof nonce === "string" ? nonce : undefined,
                    publicKey: "",
                    signature: "",
                    signedAt: new Date().toISOString(),
                  },
                },
              })
            );
          } catch (err) {
            setErrorMessage(
              err instanceof Error
                ? err.message
                : "No se pudo enviar el handshake"
            );
          }
          return;
        }

        if (frame.event === "chat" || frame.event === "sessions.message") {
          const text = extractText(frame.payload);
          if (text) {
            setMessages((prev) => [
              ...prev,
              { id: createId("bot"), role: "bot", text, timestamp: Date.now() },
            ]);
            setIsTyping(false);
            clearTypingTimer();
          }
        }
        return;
      }

      if (frame.id === CONNECT_REQUEST_ID) {
        if (frame.ok) {
          gatewayReadyRef.current = true;
          setStatus("connected");
          setErrorMessage(null);
        } else {
          const msg = frame.error?.message || "Handshake rechazado";
          setStatus("error");
          setErrorMessage(msg);
          try {
            ws.close(1000, "connect rejected");
          } catch {
            /* noop */
          }
        }
        return;
      }

      if (!frame.ok) {
        setErrorMessage(frame.error?.message || "Error del gateway");
        setIsTyping(false);
        clearTypingTimer();
        return;
      }

      const text = extractText(frame.payload);
      if (text) {
        setMessages((prev) => [
          ...prev,
          { id: createId("bot"), role: "bot", text, timestamp: Date.now() },
        ]);
        setIsTyping(false);
        clearTypingTimer();
      }
    };

    ws.onerror = () => {
      setErrorMessage("Error de conexión con el gateway");
    };

    ws.onclose = (event) => {
      socketRef.current = null;
      gatewayReadyRef.current = false;
      setIsTyping(false);
      clearTypingTimer();

      if (manuallyClosedRef.current) {
        setStatus("closed");
        return;
      }

      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setStatus("error");
        setErrorMessage(
          event.reason
            ? `Conexión cerrada por el gateway (${event.code}): ${event.reason}`
            : `Conexión cerrada por el gateway (${event.code})`
        );
        return;
      }

      const attempt = reconnectAttemptsRef.current + 1;
      reconnectAttemptsRef.current = attempt;
      const delay = Math.min(
        RECONNECT_BASE_MS * 2 ** (attempt - 1),
        RECONNECT_MAX_MS
      );
      setStatus("reconnecting");
      reconnectTimerRef.current = window.setTimeout(openSocket, delay);
    };
  }, [apiKey, clearTypingTimer, enabled, url]);

  useEffect(() => {
    if (!enabled) return;
    openSocket();

    return () => {
      manuallyClosedRef.current = true;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      clearTypingTimer();
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {
          /* noop */
        }
        socketRef.current = null;
      }
      gatewayReadyRef.current = false;
      reconnectAttemptsRef.current = 0;
      setStatus("idle");
    };
  }, [enabled, openSocket, clearTypingTimer]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;

      const ws = socketRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !gatewayReadyRef.current) {
        setErrorMessage(
          "El gateway aún no está listo. Intenta de nuevo en unos segundos."
        );
        return false;
      }

      const requestId = `chat_send_${Date.now().toString(36)}`;
      try {
        ws.send(
          JSON.stringify({
            type: "req",
            id: requestId,
            method: "chat.send",
            params: {
              session: resolveGatewaySession(),
              text: trimmed,
            },
          })
        );
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "No se pudo enviar el mensaje"
        );
        return false;
      }

      setMessages((prev) => [
        ...prev,
        { id: createId("user"), role: "user", text: trimmed, timestamp: Date.now() },
      ]);
      setIsTyping(true);
      armTypingGrace();
      return true;
    },
    [armTypingGrace, resolveGatewaySession]
  );

  const reconnect = useCallback(() => {
    manuallyClosedRef.current = false;
    gatewayReadyRef.current = false;
    reconnectAttemptsRef.current = 0;
    setErrorMessage(null);
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {
        /* noop */
      }
      socketRef.current = null;
    }
    openSocket();
  }, [openSocket]);

  return {
    status,
    messages,
    isTyping,
    errorMessage,
    sendMessage,
    reconnect,
    userId: userIdRef.current,
    sessionId: sessionIdRef.current,
  };
}

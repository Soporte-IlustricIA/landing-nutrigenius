import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ChatMessage,
  type ConnectionStatus,
  type InitPayload,
  type OutgoingPayload,
  createId,
  getOrCreateSessionId,
  getOrCreateUserId,
  parseIncomingEvent,
} from "../lib/openclaw";

type UseOpenClawSocketOptions = {
  url: string;
  apiKey?: string;
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

export function useOpenClawSocket({
  url,
  apiKey,
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

  const openSocket = useCallback(() => {
    if (!enabled || !url) return;

    manuallyClosedRef.current = false;

    let ws: WebSocket;
    try {
      if (apiKey) {
        ws = new WebSocket(url, [`openclaw.${apiKey}`, "openclaw.v1"]);
      } else {
        ws = new WebSocket(url);
      }
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

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setStatus("connected");

      if (apiKey) {
        const initPayload: InitPayload = {
          action: "init",
          apiKey,
          userId: userIdRef.current,
          sessionId: sessionIdRef.current,
          client: "nutrigenius-landing",
        };
        try {
          ws.send(JSON.stringify(initPayload));
        } catch (err) {
          console.warn("[openclaw] no se pudo enviar init", err);
        }
      }
    };

    ws.onmessage = (event) => {
      let payload: unknown = event.data;
      if (typeof event.data === "string") {
        try {
          payload = JSON.parse(event.data);
        } catch {
          payload = event.data;
        }
      }

      const parsed = parseIncomingEvent(payload);

      switch (parsed.type) {
        case "message": {
          setMessages((prev) => [
            ...prev,
            {
              id: createId("bot"),
              role: parsed.role ?? "bot",
              text: parsed.text,
              timestamp: Date.now(),
            },
          ]);
          setIsTyping(false);
          clearTypingTimer();
          break;
        }
        case "typing": {
          setIsTyping(parsed.isTyping);
          if (parsed.isTyping) armTypingGrace();
          else clearTypingTimer();
          break;
        }
        case "ready": {
          setStatus("connected");
          break;
        }
        case "error": {
          setErrorMessage(parsed.message);
          break;
        }
        default:
          break;
      }
    };

    ws.onerror = () => {
      setErrorMessage("Error de conexión con el agente");
    };

    ws.onclose = () => {
      socketRef.current = null;
      setIsTyping(false);
      clearTypingTimer();

      if (manuallyClosedRef.current) {
        setStatus("closed");
        return;
      }

      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setStatus("error");
        setErrorMessage(
          "No pudimos mantener la conexión. Intenta de nuevo más tarde."
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
  }, [apiKey, armTypingGrace, clearTypingTimer, enabled, url]);

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
      reconnectAttemptsRef.current = 0;
      setStatus("idle");
    };
  }, [enabled, openSocket, clearTypingTimer]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;

      const ws = socketRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        setErrorMessage(
          "Aún estamos conectando con el agente. Intenta de nuevo en un instante."
        );
        return false;
      }

      const payload: OutgoingPayload = {
        action: "sendMessage",
        text: trimmed,
        userId: userIdRef.current,
        sessionId: sessionIdRef.current,
      };

      try {
        ws.send(JSON.stringify(payload));
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "No se pudo enviar el mensaje"
        );
        return false;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: createId("user"),
          role: "user",
          text: trimmed,
          timestamp: Date.now(),
        },
      ]);
      setIsTyping(true);
      armTypingGrace();
      return true;
    },
    [armTypingGrace]
  );

  const reconnect = useCallback(() => {
    manuallyClosedRef.current = false;
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

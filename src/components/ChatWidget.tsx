import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  OPENCLAW_AGENT_ID,
  OPENCLAW_API_KEY,
  OPENCLAW_DIRECT_PEER_ID,
  OPENCLAW_SESSION_KEY,
  OPENCLAW_WEBCHAT_TO,
  OPENCLAW_WS_URL,
} from "../config";
import type { ChatMessage, ConnectionStatus } from "../lib/openclaw";
import { useOpenClawSocket } from "../hooks/useOpenClawSocket";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "bot",
  text: "¡Hola! Soy Nutrigenius. Cuéntame tu objetivo y te propongo un plan en segundos.",
  timestamp: Date.now(),
};

const STATUS_COPY: Record<ConnectionStatus, string> = {
  idle: "Listo",
  connecting: "Conectando…",
  connected: "En línea",
  reconnecting: "Reconectando…",
  error: "Sin conexión",
  closed: "Desconectado",
};

const STATUS_DOT: Record<ConnectionStatus, string> = {
  idle: "bg-chat-muted",
  connecting: "bg-chat-neon/60 animate-pulse",
  connected: "bg-chat-neon",
  reconnecting: "bg-chat-accent-2 animate-pulse",
  error: "bg-red-400",
  closed: "bg-chat-muted",
};

const OPEN_CHAT_EVENT = "nutrigenius:open-chat";
const CHAT_EXPANDED_KEY = "nutrigenius.chatExpanded";

function readExpandedPref(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(CHAT_EXPANDED_KEY) === "1";
  } catch {
    return false;
  }
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(readExpandedPref);
  const [input, setInput] = useState("");
  const audioCtxRef = useRef<AudioContext | null>(null);

  const {
    status,
    messages: liveMessages,
    isTyping,
    errorMessage,
    sendMessage,
    reconnect,
  } = useOpenClawSocket({
    url: OPENCLAW_WS_URL,
    apiKey: OPENCLAW_API_KEY || undefined,
    agentId: OPENCLAW_AGENT_ID || undefined,
    sessionKey: OPENCLAW_SESSION_KEY || undefined,
    directPeerId: OPENCLAW_DIRECT_PEER_ID || undefined,
    webchatTo: OPENCLAW_WEBCHAT_TO || undefined,
    enabled: isOpen,
  });

  const messages = useMemo<ChatMessage[]>(
    () => [WELCOME_MESSAGE, ...liveMessages],
    [liveMessages]
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const playOpenSound = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.17);
    } catch {
      // Si el navegador bloquea audio automático, no interrumpimos UX.
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 240);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (ev: globalThis.KeyboardEvent) => {
      if (ev.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    const openFromCta = () => setIsOpen(true);
    const openFromCtaWithSound = () => {
      playOpenSound();
      openFromCta();
    };
    window.addEventListener(OPEN_CHAT_EVENT, openFromCtaWithSound);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, openFromCtaWithSound);
  }, [playOpenSound]);

  const handleSubmit = useCallback(
    (ev?: FormEvent) => {
      ev?.preventDefault();
      if (!input.trim()) return;
      const ok = sendMessage(input);
      if (ok) setInput("");
    },
    [input, sendMessage]
  );

  const handleKeyDown = useCallback(
    (ev: KeyboardEvent<HTMLTextAreaElement>) => {
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const canSend =
    status === "connected" && input.trim().length > 0 && !isTyping;

  const toggleExpanded = useCallback(() => {
    setIsExpanded((v) => {
      const next = !v;
      try {
        window.sessionStorage.setItem(CHAT_EXPANDED_KEY, next ? "1" : "0");
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 font-sans">
      <div className="pointer-events-auto absolute bottom-6 right-6 flex flex-col items-end gap-4 sm:bottom-8 sm:right-8">
        {isOpen && (
          <section
            role="dialog"
            aria-modal="false"
            aria-label="Chat con Nutrigenius"
            className={[
              "origin-bottom-right animate-fade-in overflow-hidden rounded-3xl border border-chat-border bg-chat-bg text-chat-neon-soft shadow-panel backdrop-blur-xl",
              "flex flex-col",
              isExpanded
                ? "w-[min(96vw,44rem)] max-h-[min(92vh,40rem)] sm:max-h-[min(90vh,44rem)]"
                : "w-[min(94vw,28rem)] max-h-[min(88vh,36rem)]",
            ].join(" ")}
            style={{ backgroundColor: "#0b1410" }}
          >
            <WidgetHeader
              status={status}
              expanded={isExpanded}
              onToggleExpand={toggleExpanded}
              onClose={() => setIsOpen(false)}
              onReconnect={reconnect}
            />

            <div
              ref={scrollRef}
              className={[
                "space-y-3 overflow-y-auto overflow-x-hidden px-4 py-4",
                isExpanded
                  ? "min-h-0 flex-1 sm:min-h-[20rem]"
                  : "h-[26rem] shrink-0 sm:h-[30rem]",
              ].join(" ")}
            >
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isTyping && <TypingIndicator />}
            </div>

            {errorMessage && (
              <div className="border-t border-chat-border bg-red-500/10 px-4 py-2 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex shrink-0 items-end gap-2 border-t border-chat-border bg-chat-panel px-3 py-3"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Cuéntame tu objetivo…"
                disabled={status === "error"}
                className="max-h-32 flex-1 resize-none rounded-xl border border-chat-border bg-chat-surface px-3 py-2 text-sm leading-relaxed text-chat-neon-soft placeholder:text-chat-muted focus:border-chat-neon/60 focus:outline-none focus:ring-2 focus:ring-chat-neon/30 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Enviar mensaje"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-chat-neon text-chat-bg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-chat-neon/40 disabled:text-chat-bg/70 disabled:hover:scale-100"
              >
                <SendIcon />
              </button>
            </form>
          </section>
        )}

        <button
          type="button"
          onClick={() =>
            setIsOpen((v) => {
              const next = !v;
              if (next) playOpenSound();
              return next;
            })
          }
          aria-expanded={isOpen}
          aria-label={isOpen ? "Cerrar chat" : "Abrir chat con Nutrigenius"}
          className={[
            "group relative grid h-16 w-16 place-items-center rounded-full text-chat-bg shadow-neon transition-transform hover:scale-105 active:scale-95 sm:h-[4.5rem] sm:w-[4.5rem]",
            "bg-chat-neon",
            isOpen ? "" : "animate-pulse-neon",
          ].join(" ")}
        >
          <span className="sr-only">
            {isOpen ? "Cerrar chat" : "Abrir chat"}
          </span>
          {isOpen ? <CloseIconLarge /> : <ChatIconLarge />}
        </button>
      </div>
    </div>
  );
}

function WidgetHeader({
  status,
  expanded,
  onToggleExpand,
  onClose,
  onReconnect,
}: {
  status: ConnectionStatus;
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
  onReconnect: () => void;
}) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-chat-border bg-chat-panel px-4 py-3">
      <div
        aria-hidden="true"
        className="grid h-9 w-9 place-items-center rounded-full bg-chat-neon/15 text-chat-neon"
      >
        <SparkIcon />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-chat-neon-soft">Nutrigenius</p>
        <div className="flex items-center gap-1.5 text-xs text-chat-muted">
          <span
            className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`}
            aria-hidden="true"
          />
          <span>{STATUS_COPY[status]}</span>
        </div>
      </div>
      {status === "error" && (
        <button
          type="button"
          onClick={onReconnect}
          className="rounded-full border border-chat-border px-3 py-1 text-xs text-chat-neon-soft transition hover:border-chat-neon/60"
        >
          Reintentar
        </button>
      )}
      <button
        type="button"
        onClick={onToggleExpand}
        aria-pressed={expanded}
        aria-label={expanded ? "Reducir ventana del chat" : "Ampliar ventana del chat"}
        title={expanded ? "Vista compacta" : "Vista ampliada"}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-chat-muted transition hover:bg-chat-surface hover:text-chat-neon-soft"
      >
        {expanded ? <CollapsePanelIcon /> : <ExpandPanelIcon />}
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar chat"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-chat-muted transition hover:bg-chat-surface hover:text-chat-neon-soft"
      >
        <CloseIcon />
      </button>
    </header>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={[
        "flex animate-bubble-in",
        isUser ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      <div
        className={[
          "max-w-[85%] min-w-0 break-words whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
          isUser
            ? "rounded-br-md bg-chat-neon text-chat-bg"
            : "rounded-bl-md bg-chat-surface text-chat-neon-soft",
        ].join(" ")}
      >
        {message.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex animate-bubble-in justify-start" aria-live="polite">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-chat-surface px-4 py-3 text-chat-neon">
        <span className="sr-only">Nutrigenius está escribiendo…</span>
        <Dot delay="0ms" />
        <Dot delay="160ms" />
        <Dot delay="320ms" />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-1.5 w-1.5 rounded-full bg-chat-neon animate-typing"
      style={{ animationDelay: delay }}
    />
  );
}

function SendIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12l16-8-6 16-2.5-6.5L4 12z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity={0.15}
      />
    </svg>
  );
}

function ChatIconLarge() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H9l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity={0.15}
      />
      <circle cx="9" cy="9.5" r="1.2" fill="currentColor" />
      <circle cx="12" cy="9.5" r="1.2" fill="currentColor" />
      <circle cx="15" cy="9.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function CloseIconLarge() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExpandPanelIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CollapsePanelIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 14h6v6M14 4h6v6M10 14l4-4M14 10l-4 4"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


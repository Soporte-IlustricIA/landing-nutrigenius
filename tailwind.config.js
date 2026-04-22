/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0b1f16",
          "bg-soft": "#112a20",
          ink: "#0a1410",
          "ink-soft": "#425049",
          line: "#e6ebe7",
          accent: "#7bd389",
          "accent-2": "#ffd27a",
          "on-dark": "#f6f7f4",
          "on-dark-soft": "#c6cfc9",
        },
        chat: {
          bg: "#0b1410",
          panel: "#0f1c16",
          surface: "#142720",
          border: "#1e3428",
          neon: "#7ef4a0",
          "neon-soft": "#a7f7c0",
          muted: "#8ea79a",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: ["Fraunces", "Inter", "Georgia", "serif"],
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(126, 244, 160, 0.35), 0 12px 40px rgba(126, 244, 160, 0.18)",
        panel: "0 24px 60px rgba(0, 0, 0, 0.45)",
        soft: "0 1px 2px rgba(10, 20, 16, 0.06), 0 2px 8px rgba(10, 20, 16, 0.06)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        bubbleIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        typing: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-3px)", opacity: "1" },
        },
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(126, 244, 160, 0.55)" },
          "50%": { boxShadow: "0 0 0 12px rgba(126, 244, 160, 0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 260ms cubic-bezier(0.2, 0.7, 0.2, 1)",
        "bubble-in": "bubbleIn 180ms cubic-bezier(0.2, 0.7, 0.2, 1)",
        typing: "typing 1.2s ease-in-out infinite",
        "pulse-neon": "pulseNeon 2.2s ease-out infinite",
      },
    },
  },
  plugins: [],
};

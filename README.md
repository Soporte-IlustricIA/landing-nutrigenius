# Nutrigenius — Landing

Landing React + Vite + Tailwind con widget de chat flotante conectado por WebSocket al gateway de **OpenClaw**. Ligera, accesible y con tokens de diseño migrados del mockup original.

## Estructura

```
nutrigenius-landing/
├── index.html              Entry de Vite (inyecta /src/main.tsx)
├── public/assets/          Logos, video loop, poster, OG
├── src/
│   ├── main.tsx            Bootstrap React
│   ├── App.tsx             Layout (header, secciones, footer, ChatWidget)
│   ├── config.ts           Variables de entorno (URLs + API key)
│   ├── index.css           Tailwind directives
│   ├── styles/landing.css  Tokens y layout portados del diseño base
│   ├── components/         SiteHeader, Hero, Sections, ChatWidget, ...
│   ├── hooks/
│   │   └── useOpenClawSocket.ts   Conexión WebSocket con auth híbrida y reconexión
│   └── lib/openclaw.ts     Tipos y helpers de mensaje / sesión
├── tailwind.config.js      Paleta chat (neón) + animaciones (fade-in, typing, pulse)
├── postcss.config.js
├── tsconfig.json / tsconfig.node.json
└── vite.config.ts
```

## Servir en local

```bash
npm install
npm run dev        # http://localhost:5174
npm run build      # genera dist/
npm run preview    # sirve el build
```

## Configuración clave

- `VITE_OPENCLAW_WS_URL`: endpoint WebSocket de OpenClaw. Default: `wss://pruebas-openclaw-gateway.nvhqhw.easypanel.host`.
- `VITE_OPENCLAW_API_KEY`: opcional. Si está presente, el widget autentica vía **subprotocol** (`openclaw.<apiKey>`) y además envía un mensaje `init` como fallback.

Copia `.env.example` a `.env.local` y define lo que necesites.

## Widget de chat (`src/components/ChatWidget.tsx`)

- Burbuja flotante en esquina inferior derecha, estética oscura (`#0b1410`) con acento verde neón (`#7ef4a0`).
- Panel con animación `fade-in`, historial con animación `bubble-in` y auto-scroll al último mensaje.
- Indicador de escritura (tres puntos animados) mientras el agente está pensando.
- Estados visibles: `conectando`, `en línea`, `reconectando`, `sin conexión`. Botón **Reintentar** en caso de error.
- Atajo teclado: `Enter` envía, `Shift+Enter` salto de línea, `Escape` cierra.
- `userId` persistente en `localStorage` y `sessionId` efímero en `sessionStorage`.

### Protocolo de mensajes

- Envío: `{ action: "sendMessage", text, userId, sessionId }`.
- Init (si hay API key): `{ action: "init", apiKey, userId, sessionId, client }`.
- Recepción: admite strings planos, `{ text }`, `{ message }`, `{ content }`, además de `{ type: "typing" | "ready" | "error" }` para eventos de control.

## Handoff desde Stitch

Los tokens en `:root` de [`src/styles/landing.css`](src/styles/landing.css) replican lo que Stitch debería entregarte. Cuando tengas el export:

1. Reemplaza valores de color, tipografía y radios.
2. Mantén los nombres de variables (`--c-accent`, `--r-lg`, etc.) para no tocar los selectores.
3. Si cambian medidas del hero o breakpoints, ajústalos en `.hero` y los `@media`.
4. Sube fuentes locales a `assets/fonts/` y añade `@font-face` en la cabecera del CSS si quieres desacoplar de Google Fonts.

Tokens expuestos como CSS variables:

| Categoría    | Variables                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Color        | `--c-bg`, `--c-bg-soft`, `--c-surface`, `--c-ink`, `--c-ink-soft`, `--c-line`                     |
| Acento       | `--c-accent`, `--c-accent-2`, `--c-accent-ink`, `--g-brand`                                       |
| Sobre oscuro | `--c-on-dark`, `--c-on-dark-soft`                                                                 |
| Tipografía   | `--ff-sans`, `--ff-display`, `--fz-xs` … `--fz-3xl`                                               |
| Espacio      | `--s-1` … `--s-9`                                                                                 |
| Forma/motion | `--r-sm`, `--r-md`, `--r-lg`, `--r-pill`, `--sh-1`, `--sh-2`, `--ease`, `--dur-1`, `--dur-2`      |

## Video con Kling

Objetivo: un loop **lento, loopable y legible con overlay**, no un clip con acción. El texto fuerte siempre vive en HTML, nunca sobre el video.

### Prompt base (copia y adapta)

> Cinematic slow-motion close-up of fresh ingredients floating in soft diffused light: sliced avocado, leafy greens, blueberries, walnuts, a drop of olive oil landing on a matte ceramic surface. Subtle green and warm amber color palette, dark background with a soft top vignette. Ultra-slow parallax camera drift left to right. No text, no logos, no faces. Seamless loop, 10 seconds, 1080p.

### Variantes si quieres probar

- **Ciencia sutil**: “abstract flowing strands suggesting DNA dissolving into leafy greens, macro photography, teal and gold highlights, seamless loop”.
- **Preparación**: “hands out of frame assembling a vibrant bowl in slow motion, top-down view, natural light, minimal set, seamless loop”.
- **Atmósfera**: “morning light through a kitchen window, steam rising from a warm bowl, very slow push-in, no text”.

### Parámetros Kling recomendados

- Duración: 8–12 s (loop).
- Relación: 16:9 horizontal para hero full-bleed.
- Negative prompt: “text, watermark, logo, captions, fast cuts, shaky camera, distorted faces”.
- Pide explícitamente “seamless loop” y que la primera y última escena sean similares.

### Exportar para web

Flujo recomendado con `ffmpeg` tras descargar el MP4 de Kling:

```bash
# MP4 optimizado (H.264, ~1-2 MB para 10s a 1080p medio)
ffmpeg -i kling-source.mp4 -vf "scale=1920:-2,fps=24" \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p \
  -movflags +faststart -an assets/loop-nutrigenius.mp4

# WebM (VP9) opcional; si lo generas, añade un <source> antes del MP4 en index.html
ffmpeg -i kling-source.mp4 -vf "scale=1920:-2,fps=24" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -an assets/loop-nutrigenius.webm

# Poster JPG del primer frame
ffmpeg -i assets/loop-nutrigenius.mp4 -frames:v 1 -q:v 3 assets/hero-poster.jpg
```

Después, sustituye las referencias `"/assets/hero-poster.svg"` por `"/assets/hero-poster.jpg"` en [`index.html`](index.html) (preload) y en [`src/components/Hero.tsx`](src/components/Hero.tsx) (`<img>` poster y atributo `poster` del `<video>`).

## Accesibilidad y rendimiento

- Skip link, focus visible, jerarquía de encabezados correcta.
- Overlay del hero (`--g-hero-overlay`) garantiza contraste sobre cualquier frame del video.
- `prefers-reduced-motion: reduce` → se oculta el video y desaparecen animaciones.
- Ancho `max-width: 560px` → se oculta el video también, para ahorrar datos; siempre queda el poster.
- `navigator.connection.saveData` y redes 2G → el video ni siquiera se precarga.
- Video empieza tras `requestIdleCallback` para no pelear con la primera pintura.

## Analítica (opcional)

Si añades GA4/GTM, el CTA dispara automáticamente un evento `cta_click` en `dataLayer` con `cta_location` (header | hero | closing) y `cta_destination` (`chat_widget`).

## Checklist antes de publicar

- [ ] Definir `.env.local` con `VITE_OPENCLAW_WS_URL` y `VITE_OPENCLAW_API_KEY`.
- [ ] Reemplazar `hero-poster.svg` y `og-cover.svg` por JPG/PNG generados desde Kling y un editor.
- [ ] Comprimir `loop-nutrigenius.mp4` si pesa demasiado (y opcionalmente añadir `.webm`).
- [ ] Ajustar copy final en hero, beneficios y FAQ.
- [ ] Revisar Lighthouse en móvil con throttling 4G (objetivo: performance ≥ 90, accesibilidad 100).
- [ ] Verificar contraste del titular sobre el frame más claro del video.
# landing-nutrigenius

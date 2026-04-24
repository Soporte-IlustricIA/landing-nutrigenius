/**
 * Ejemplo mínimo: servir PDFs bajo /out/ con HTTPS y cabeceras razonables para iframe.
 * NO lo ejecutes en producción sin TLS, auth y límites de tasa.
 *
 * Uso (con Node 18+):
 *   npm i express
 *   node plan-preview.server.example.js
 *
 * Ajusta ROOT al directorio real de workspace/out en el host OpenClaw.
 */
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.PLAN_PREVIEW_ROOT ?? "/home/node/.openclaw/workspace/out";
const PORT = Number(process.env.PORT ?? 8787);

const app = express();

app.use(
  "/out",
  express.static(ROOT, {
    etag: true,
    maxAge: "1h",
    setHeaders(res, filePath) {
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        // Para embed desde otro origen (p. ej. Vercel), el PDF debe permitirse en frame.
        // Ajusta según tu política (más restrictivo en prod: solo tu dominio de landing).
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("X-Content-Type-Options", "nosniff");
      }
    },
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Plan preview static: http://localhost:${PORT}/out/<archivo>.pdf (ROOT=${ROOT})`);
});

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/landing.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("No se encontró el contenedor #root en el DOM");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);

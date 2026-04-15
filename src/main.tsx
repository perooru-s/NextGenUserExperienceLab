import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AccessGate } from "./AccessGate";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AccessGate>
      <App />
    </AccessGate>
  </StrictMode>
);

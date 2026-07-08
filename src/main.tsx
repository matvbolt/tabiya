import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { DialogProvider } from "./ui/DialogProvider";
import { I18nProvider } from "./i18n";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <DialogProvider>
            <App />
          </DialogProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>
);

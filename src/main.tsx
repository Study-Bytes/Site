import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppErrorBoundary } from "./components/system/AppErrorBoundary";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ColorModeProvider } from "./theme/ColorModeProvider";
import { I18nProvider } from "./i18n/I18nProvider";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ColorModeProvider>
            <I18nProvider>
                <BrowserRouter>
                    <AuthProvider>
                    <AppErrorBoundary>
                        <App />
                    </AppErrorBoundary>
                    </AuthProvider>
                </BrowserRouter>
            </I18nProvider>
        </ColorModeProvider>
    </React.StrictMode>
);

import type { PaletteMode } from "@mui/material";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { ColorModeContext } from "./colorModeContext";
import { createStudyBytesTheme } from "./theme";
const storageKey = "studybytes_theme_mode";

function getInitialMode(): PaletteMode {
    if (typeof window === "undefined") return "light";

    try {
        const storedMode = window.localStorage.getItem(storageKey);
        if (storedMode === "light" || storedMode === "dark") return storedMode;

        if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
    } catch {
        return "light";
    }

    return "light";
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<PaletteMode>(getInitialMode);

    const setMode = useCallback((nextMode: PaletteMode) => {
        setModeState(nextMode);

        try {
            window.localStorage.setItem(storageKey, nextMode);
        } catch {
            // Theme preference persistence is optional.
        }
    }, []);

    const toggleMode = useCallback(() => setMode(mode === "dark" ? "light" : "dark"), [mode, setMode]);

    const theme = useMemo(() => createStudyBytesTheme(mode), [mode]);
    const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode, setMode, toggleMode]);

    return (
        <ColorModeContext.Provider value={value}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

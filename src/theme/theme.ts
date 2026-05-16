import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

export const studyBytesLightColors = {
    surface: "#fcf8ff",
    surfaceContainer: "#f0ecf9",
    surfaceContainerLow: "#f5f2ff",
    surfaceContainerHigh: "#eae6f4",
    onSurface: "#1b1b24",
    onSurfaceVariant: "#464555",
    outline: "#777587",
    outlineVariant: "#c7c4d8",
    primary: "#3525cd",
    primaryContainer: "#4f46e5",
    secondary: "#712ae2",
    tertiary: "#003fac",
    error: "#ba1a1a",
    codeSurface: "#1e1e1e",
};

export const studyBytesDarkColors = {
    surface: "#13121b",
    surfaceContainer: "#1f1f28",
    surfaceContainerLow: "#1b1b24",
    surfaceContainerHigh: "#2a2933",
    onSurface: "#e4e1ee",
    onSurfaceVariant: "#c7c4d8",
    outline: "#918fa1",
    outlineVariant: "#464555",
    primary: "#c3c0ff",
    primaryContainer: "#4f46e5",
    secondary: "#bdc2ff",
    tertiary: "#3cddc7",
    error: "#ffb4ab",
    codeSurface: "#1e1e1e",
};

export const studyBytesColors = studyBytesLightColors;

export function getStudyBytesColors(mode: PaletteMode) {
    return mode === "dark" ? studyBytesDarkColors : studyBytesLightColors;
}

export function createStudyBytesTheme(mode: PaletteMode) {
    const colors = getStudyBytesColors(mode);
    const isDark = mode === "dark";

    return createTheme({
        palette: {
            mode,
            primary: {
                main: colors.primary,
                light: "#e2dfff",
                dark: isDark ? "#8f8aff" : "#0f0069",
                contrastText: isDark ? "#201a78" : "#ffffff",
            },
            secondary: {
                main: colors.secondary,
                light: isDark ? "#dfe0ff" : "#eaddff",
                dark: isDark ? "#8f96dd" : "#25005a",
                contrastText: isDark ? "#111b74" : "#ffffff",
            },
            info: {
                main: colors.tertiary,
            },
            error: {
                main: colors.error,
            },
            background: {
                default: colors.surface,
                paper: isDark ? colors.surfaceContainer : "#ffffff",
            },
            text: {
                primary: colors.onSurface,
                secondary: colors.onSurfaceVariant,
            },
            divider: colors.outlineVariant,
        },
        shape: {
            borderRadius: 8,
        },
        typography: {
            fontFamily: "Inter, Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            h1: {
                fontSize: "3.25rem",
                fontWeight: 800,
                lineHeight: 1.06,
                letterSpacing: "-0.04em",
            },
            h2: {
                fontSize: "2.25rem",
                fontWeight: 800,
                lineHeight: 1.14,
                letterSpacing: "-0.03em",
            },
            h3: {
                fontSize: "1.75rem",
                fontWeight: 800,
                lineHeight: 1.2,
            },
            h4: {
                fontSize: "1.5rem",
                fontWeight: 800,
                lineHeight: 1.25,
            },
            h5: {
                fontSize: "1.25rem",
                fontWeight: 800,
                lineHeight: 1.35,
            },
            h6: {
                fontSize: "1.05rem",
                fontWeight: 800,
                lineHeight: 1.4,
            },
            button: {
                textTransform: "none",
                fontWeight: 800,
            },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    ":root": {
                        "--sb-surface": colors.surface,
                        "--sb-surface-container": colors.surfaceContainer,
                        "--sb-surface-container-low": colors.surfaceContainerLow,
                        "--sb-surface-container-high": colors.surfaceContainerHigh,
                        "--sb-outline-variant": colors.outlineVariant,
                        "--sb-code-surface": colors.codeSurface,
                        colorScheme: mode,
                    },
                    body: {
                        backgroundColor: colors.surface,
                        color: colors.onSurface,
                    },
                    a: {
                        color: "inherit",
                        textDecoration: "none",
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        boxShadow: "none",
                    },
                    contained: {
                        boxShadow: isDark ? "0 4px 14px rgba(195,192,255,0.18)" : "0 4px 10px rgba(53,37,205,0.22)",
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none",
                        borderColor: colors.outlineVariant,
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none",
                        borderColor: colors.outlineVariant,
                    },
                },
            },
            MuiTextField: {
                defaultProps: {
                    variant: "outlined",
                },
            },
        },
    });
}

export const theme = createStudyBytesTheme("light");

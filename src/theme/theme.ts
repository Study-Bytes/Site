import { createTheme } from "@mui/material/styles";

export const studyBytesColors = {
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

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: studyBytesColors.primary,
            light: "#e2dfff",
            dark: "#0f0069",
            contrastText: "#ffffff",
        },
        secondary: {
            main: studyBytesColors.secondary,
            light: "#eaddff",
            dark: "#25005a",
            contrastText: "#ffffff",
        },
        info: {
            main: studyBytesColors.tertiary,
        },
        error: {
            main: studyBytesColors.error,
        },
        background: {
            default: studyBytesColors.surface,
            paper: "#ffffff",
        },
        text: {
            primary: studyBytesColors.onSurface,
            secondary: studyBytesColors.onSurfaceVariant,
        },
        divider: studyBytesColors.outlineVariant,
    },
    shape: {
        borderRadius: 16,
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
                body: {
                    backgroundColor: studyBytesColors.surface,
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
                    borderRadius: 999,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
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

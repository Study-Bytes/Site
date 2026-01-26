import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#5B5FC7" },
        secondary: { main: "#00A3FF" },

        background: {
            default: "#F6F7FB",
            paper: "#FFFFFF",
        },

        text: {
            primary: "#101828",
            secondary: "#475467",
        },
    },

    shape: {
        borderRadius: 16,
    },

    typography: {
        fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif",
    },
});

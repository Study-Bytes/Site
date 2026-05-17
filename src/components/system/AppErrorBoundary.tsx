import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

export type AppErrorBoundaryProps = {
    children: ReactNode;
};

type AppErrorBoundaryState = {
    error: Error | null;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
    state: AppErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Unhandled React error", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ error: null });
        window.location.assign("/");
    };

    isRu() {
        return localStorage.getItem("studybytes_locale") !== "en";
    }

    render() {
        if (!this.state.error) return this.props.children;
        const isRu = this.isRu();
        const details = `${this.state.error.name}: ${this.state.error.message}`;

        return (
            <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", p: 2 }}>
                <Container maxWidth="sm">
                    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
                        <Stack spacing={2.5} alignItems="flex-start">
                            <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 48 }} />
                            <Box>
                                <Typography variant="h4">{isRu ? "Страница не смогла загрузиться" : "Something went wrong"}</Typography>
                                <Typography sx={{ color: "text.secondary", mt: 1 }}>
                                    {isRu
                                        ? "Произошла ошибка в интерфейсе. Ниже указана техническая причина, чтобы было проще понять, что сломалось."
                                        : "The page crashed unexpectedly. The technical reason is shown below to make the issue easier to diagnose."}
                                </Typography>
                            </Box>
                            <Paper variant="outlined" sx={{ width: "100%", p: 1.5, borderRadius: 1.5, bgcolor: "background.default" }}>
                                <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mb: 0.5 }}>
                                    {isRu ? "Технические детали" : "Technical details"}
                                </Typography>
                                <Typography sx={{ fontFamily: "monospace", fontSize: 13, wordBreak: "break-word" }}>
                                    {details}
                                </Typography>
                            </Paper>
                            <Button variant="contained" onClick={this.handleReset}>
                                {isRu ? "На главную" : "Back to Home"}
                            </Button>
                        </Stack>
                    </Paper>
                </Container>
            </Box>
        );
    }
}

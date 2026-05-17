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

    render() {
        if (!this.state.error) return this.props.children;

        return (
            <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", p: 2 }}>
                <Container maxWidth="sm">
                    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
                        <Stack spacing={2.5} alignItems="flex-start">
                            <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 48 }} />
                            <Box>
                                <Typography variant="h4">Something went wrong</Typography>
                                <Typography sx={{ color: "text.secondary", mt: 1 }}>
                                    The page crashed unexpectedly. Go back to the home page and try the action again.
                                </Typography>
                            </Box>
                            <Button variant="contained" onClick={this.handleReset}>
                                Back to Home
                            </Button>
                        </Stack>
                    </Paper>
                </Container>
            </Box>
        );
    }
}

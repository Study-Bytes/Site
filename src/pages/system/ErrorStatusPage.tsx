import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { PageContainer } from "../../layouts/PageContainer";
import { useI18n } from "../../i18n/useI18n";

type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 500 | "maintenance";

const keys: Record<ErrorStatus, { title: Parameters<ReturnType<typeof useI18n>["t"]>[0]; description: Parameters<ReturnType<typeof useI18n>["t"]>[0]; chip: string }> = {
    400: { title: "errors.400.title", description: "errors.400.description", chip: "400" },
    401: { title: "errors.401.title", description: "errors.401.description", chip: "401" },
    403: { title: "errors.403.title", description: "errors.403.description", chip: "403" },
    404: { title: "errors.404.title", description: "errors.404.description", chip: "404" },
    409: { title: "errors.409.title", description: "errors.409.description", chip: "409" },
    500: { title: "errors.500.title", description: "errors.500.description", chip: "500" },
    maintenance: { title: "errors.maintenance.title", description: "errors.maintenance.description", chip: "MAINTENANCE" },
};

export default function ErrorStatusPage({ status }: { status: ErrorStatus }) {
    const { t } = useI18n();
    const config = keys[status];
    const requestId = new URLSearchParams(window.location.search).get("requestId");

    return (
        <PageContainer>
            <Box sx={{ display: "grid", placeItems: "center", minHeight: "58vh" }}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 2,
                        maxWidth: 760,
                        width: "100%",
                        background: (theme) => (theme.palette.mode === "dark" ? "rgba(31,31,40,0.9)" : "linear-gradient(135deg, #ffffff, #f7f4ff)"),
                    }}
                >
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }}>
                        <Box
                            sx={{
                                width: 84,
                                height: 84,
                                borderRadius: 2,
                                display: "grid",
                                placeItems: "center",
                                color: "error.main",
                                bgcolor: "rgba(186,26,26,0.1)",
                                flexShrink: 0,
                            }}
                        >
                            <ErrorOutlineRoundedIcon sx={{ fontSize: 48 }} />
                        </Box>
                        <Stack spacing={2.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
                            <Chip label={config.chip} color="error" sx={{ fontWeight: 900 }} />
                            <Box>
                                <Typography variant="h3">{t(config.title)}</Typography>
                                <Typography sx={{ color: "text.secondary", mt: 1, lineHeight: 1.65 }}>{t(config.description)}</Typography>
                            </Box>
                            {requestId ? (
                                <Paper variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: 1, bgcolor: "background.paper" }}>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>requestId: {requestId}</Typography>
                                </Paper>
                            ) : null}
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                <Button component={RouterLink} to="/" variant="contained" startIcon={<HomeRoundedIcon />}>{t("common.backHome")}</Button>
                                {status === 401 ? <Button component={RouterLink} to="/login" variant="outlined" startIcon={<LoginRoundedIcon />}>{t("nav.login")}</Button> : null}
                            </Stack>
                        </Stack>
                    </Stack>
                </Paper>
            </Box>
        </PageContainer>
    );
}

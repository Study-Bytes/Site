import { CircularProgress, Stack, Typography } from "@mui/material";
import { useI18n } from "../../i18n/useI18n";

export function LoadingState({ rows = 3, label }: { rows?: number; label?: string }) {
    const { t } = useI18n();

    return (
        <Stack
            role="status"
            aria-live="polite"
            spacing={1.5}
            alignItems="center"
            justifyContent="center"
            sx={{
                minHeight: rows >= 4 ? 220 : 132,
                py: rows >= 4 ? 5 : 3,
                color: "text.secondary",
            }}
        >
            <CircularProgress size={28} thickness={4} />
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {label ?? t("common.loading")}
            </Typography>
        </Stack>
    );
}

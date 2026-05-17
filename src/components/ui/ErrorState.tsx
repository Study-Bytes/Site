import { Alert, Button, Stack, Typography } from "@mui/material";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { useI18n } from "../../i18n/useI18n";

export function ErrorState({ message, onRetry, requestId }: { message: string; onRetry?: () => void; requestId?: string }) {
    const { t } = useI18n();

    return (
        <Stack spacing={2}>
            <Alert severity="error">
                <Stack spacing={0.5}>
                    <Typography variant="body2">{message}</Typography>
                    {requestId ? (
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            requestId: {requestId}
                        </Typography>
                    ) : null}
                </Stack>
            </Alert>
            {onRetry ? (
                <Button startIcon={<ReplayRoundedIcon />} onClick={onRetry} variant="outlined" sx={{ alignSelf: "flex-start" }}>
                    {t("common.retry")}
                </Button>
            ) : null}
        </Stack>
    );
}

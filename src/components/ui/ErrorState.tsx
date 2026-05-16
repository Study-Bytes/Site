import { Alert, Button, Stack } from "@mui/material";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <Stack spacing={2}>
            <Alert severity="error">{message}</Alert>
            {onRetry ? (
                <Button startIcon={<ReplayRoundedIcon />} onClick={onRetry} variant="outlined" sx={{ alignSelf: "flex-start" }}>
                    Retry
                </Button>
            ) : null}
        </Stack>
    );
}

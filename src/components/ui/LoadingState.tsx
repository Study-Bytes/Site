import { Skeleton, Stack } from "@mui/material";

export function LoadingState({ rows = 3 }: { rows?: number }) {
    return (
        <Stack spacing={2}>
            {Array.from({ length: rows }, (_, index) => (
                <Skeleton key={index} variant="rounded" height={96} sx={{ borderRadius: 1.25 }} />
            ))}
        </Stack>
    );
}

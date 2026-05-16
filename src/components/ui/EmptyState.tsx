import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function EmptyState(props: { title: string; description: string; action?: ReactNode }) {
    return (
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
                <Box sx={{ width: 56, height: 56, borderRadius: 999, bgcolor: "#e2dfff" }} />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {props.title}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", mt: 0.5 }}>{props.description}</Typography>
                </Box>
                {props.action ? <Box>{props.action}</Box> : null}
            </Stack>
        </Paper>
    );
}

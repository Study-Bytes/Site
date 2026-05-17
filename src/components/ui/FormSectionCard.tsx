import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function FormSectionCard(props: { id?: string; title: string; description?: string; children: ReactNode }) {
    return (
        <Paper id={props.id} variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 1.5, scrollMarginTop: 96 }}>
            <Stack spacing={2}>
                <Stack spacing={0.5}>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {props.title}
                    </Typography>
                    {props.description ? <Typography sx={{ color: "text.secondary" }}>{props.description}</Typography> : null}
                </Stack>
                {props.children}
            </Stack>
        </Paper>
    );
}

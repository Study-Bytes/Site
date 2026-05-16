import { Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageContainer } from "../../layouts/PageContainer";

export default function AccessDeniedPage() {
    return (
        <PageContainer>
            <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: 5, textAlign: "center" }}>
                <Stack spacing={2} alignItems="center">
                    <Typography variant="h2">403</Typography>
                    <Typography variant="h5">Access denied</Typography>
                    <Typography sx={{ color: "text.secondary" }}>You do not have permission to open this page.</Typography>
                    <Button component={RouterLink} to="/" variant="contained">
                        Go home
                    </Button>
                </Stack>
            </Paper>
        </PageContainer>
    );
}

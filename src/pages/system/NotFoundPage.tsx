import { Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageContainer } from "../../layouts/PageContainer";

export default function NotFoundPage() {
    return (
        <PageContainer>
            <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: 5, textAlign: "center" }}>
                <Stack spacing={2} alignItems="center">
                    <Typography variant="h2">404</Typography>
                    <Typography variant="h5">Page not found</Typography>
                    <Typography sx={{ color: "text.secondary" }}>The requested route does not exist.</Typography>
                    <Button component={RouterLink} to="/courses" variant="contained">
                        Browse courses
                    </Button>
                </Stack>
            </Paper>
        </PageContainer>
    );
}

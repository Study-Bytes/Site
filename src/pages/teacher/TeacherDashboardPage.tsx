import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageContainer } from "../../layouts/PageContainer";

export default function TeacherDashboardPage() {
    return (
        <PageContainer>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h2">Teacher Cabinet</Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1 }}>Course creation and editor flows are prepared for BFF teacher endpoints.</Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 5 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h5">Manage courses</Typography>
                            <Typography sx={{ color: "text.secondary" }}>Create drafts, edit modules/items, publish or archive courses.</Typography>
                        </Box>
                        <Button component={RouterLink} to="/teacher/courses" variant="contained">
                            Open courses
                        </Button>
                    </Stack>
                </Paper>
            </Stack>
        </PageContainer>
    );
}

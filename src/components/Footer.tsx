import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Footer() {
    return (
        <Box component="footer" sx={{ bgcolor: "#1b1b24", color: "#f3effc", mt: "auto" }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between">
                    <Box>
                        <Typography sx={{ fontWeight: 950, mb: 0.5 }}>StudyBytes</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.72 }}>
                            Interactive programming education platform.
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button component={RouterLink} to="/courses" size="small" sx={{ color: "inherit" }}>
                            Courses
                        </Button>
                        <Button component={RouterLink} to="/my-learning" size="small" sx={{ color: "inherit" }}>
                            My Learning
                        </Button>
                        <Button component={RouterLink} to="/teacher/courses" size="small" sx={{ color: "inherit" }}>
                            Teacher Cabinet
                        </Button>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.14)" }} />

                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                    Site communicates only with BFF. Backend service URLs are intentionally hidden from the frontend.
                </Typography>
            </Container>
        </Box>
    );
}

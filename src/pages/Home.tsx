import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import { Link as RouterLink } from "react-router-dom";

function FeatureCard({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
    return (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, height: "100%" }}>
            <Stack spacing={1.5}>
                <Box sx={{ color: "primary.main" }}>{icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                    {title}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>{text}</Typography>
            </Stack>
        </Paper>
    );
}

export default function Home() {
    return (
        <Box>
            <Box
                component="section"
                sx={{
                    pt: { xs: 12, md: 16 },
                    pb: { xs: 8, md: 12 },
                    background:
                        "radial-gradient(900px 420px at 20% 10%, rgba(53,37,205,0.16), transparent 60%), radial-gradient(720px 360px at 85% 20%, rgba(113,42,226,0.12), transparent 55%)",
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" },
                            gap: 5,
                            alignItems: "center",
                        }}
                    >
                        <Stack spacing={3}>
                            <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 950 }}>
                                StudyBytes platform
                            </Typography>
                            <Typography variant="h1">Learn programming through structured interactive courses.</Typography>
                            <Typography variant="h6" sx={{ color: "text.secondary", maxWidth: 680, lineHeight: 1.55 }}>
                                Theory, quizzes, coding tasks, SQL tasks and progress tracking in one clean learning workspace.
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Button component={RouterLink} to="/courses" size="large" variant="contained">
                                    Browse courses
                                </Button>
                                <Button component={RouterLink} to="/register" size="large" variant="outlined">
                                    Create account
                                </Button>
                            </Stack>
                        </Stack>

                        <Paper
                            variant="outlined"
                            sx={{ p: 2, borderRadius: 5, overflow: "hidden", background: "linear-gradient(145deg, #ffffff 0%, #f0ecf9 100%)" }}
                        >
                            <Box component="img" src="/hero-study.jpg" alt="Study workspace" sx={{ width: "100%", borderRadius: 4, display: "block" }} />
                        </Paper>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 3 }}>
                    <FeatureCard title="Structured courses" text="Modules and lessons are organized for predictable progress." icon={<SchoolRoundedIcon />} />
                    <FeatureCard title="Coding tasks" text="Practice through executable tasks prepared by teachers." icon={<CodeRoundedIcon />} />
                    <FeatureCard title="Quizzes" text="Check understanding before moving to harder tasks." icon={<FactCheckRoundedIcon />} />
                    <FeatureCard title="Progress tracking" text="LearningService will aggregate progress and attempts." icon={<TimelineRoundedIcon />} />
                </Box>
            </Container>
        </Box>
    );
}

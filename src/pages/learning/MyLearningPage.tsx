import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { Link as RouterLink } from "react-router-dom";
import { getErrorMessage } from "../../api/apiError";
import type { EnrollmentSummary } from "../../api/bffContracts";
import { learningApi } from "../../api/services";
import { useAuth } from "../../auth/useAuth";
import { AccessTypeBadge } from "../../components/ui/AccessTypeBadge";
import { DifficultyBadge } from "../../components/ui/DifficultyBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageContainer } from "../../layouts/PageContainer";
import { formatDuration } from "../../utils/courseFormat";

function LearningCourseCard({ enrollment }: { enrollment: EnrollmentSummary }) {
    const continuePath = enrollment.nextItemId ? `/learn/${enrollment.course.id}/items/${enrollment.nextItemId}` : `/learn/${enrollment.course.id}`;
    const isCompleted = enrollment.status === "COMPLETED";

    return (
        <Paper
            variant="outlined"
            sx={{
                p: { xs: 2.2, md: 2.8 },
                borderRadius: 2,
                height: "100%",
                transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "primary.main",
                    boxShadow: (theme) => (theme.palette.mode === "dark" ? "0 24px 60px rgba(0,0,0,0.28)" : "0 24px 60px rgba(53,37,205,0.12)"),
                },
            }}
        >
            <Stack spacing={2.2} sx={{ height: "100%" }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <DifficultyBadge difficulty={enrollment.course.difficulty} />
                    <AccessTypeBadge accessType={enrollment.course.accessType} />
                    <Chip
                        size="small"
                        icon={isCompleted ? <CheckCircleRoundedIcon /> : <PlayCircleOutlineRoundedIcon />}
                        label={enrollment.status}
                        color={isCompleted ? "success" : "primary"}
                        variant="outlined"
                        sx={{ fontWeight: 900 }}
                    />
                </Stack>

                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 950 }}>
                        {enrollment.course.title}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1, lineHeight: 1.6 }}>{enrollment.course.shortDescription}</Typography>
                </Box>

                <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Typography variant="body2" sx={{ fontWeight: 900 }}>
                            {enrollment.progressPercent}% complete
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {formatDuration(enrollment.course.estimatedMinutes)}
                        </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={enrollment.progressPercent} sx={{ height: 8, borderRadius: 999 }} />
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                    <Button component={RouterLink} to={`/learn/${enrollment.course.id}`} variant="outlined" fullWidth>
                        Course map
                    </Button>
                    <Button component={RouterLink} to={continuePath} variant="contained" endIcon={<ArrowForwardRoundedIcon />} fullWidth>
                        {isCompleted ? "Review" : "Continue"}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}

export default function MyLearningPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<EnrollmentSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            setItems(await learningApi.getMyCourses());
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Failed to load learning dashboard"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadItems();
    }, [loadItems]);

    const inProgress = useMemo(() => items.filter((item) => item.status !== "COMPLETED"), [items]);
    const completed = useMemo(() => items.filter((item) => item.status === "COMPLETED"), [items]);
    const averageProgress = useMemo(() => {
        if (items.length === 0) return 0;
        return Math.round(items.reduce((sum, item) => sum + item.progressPercent, 0) / items.length);
    }, [items]);
    const continueEnrollment = inProgress[0] ?? completed[0] ?? null;

    return (
        <PageContainer>
            <Stack spacing={4}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 2.5,
                        background: (theme) =>
                            theme.palette.mode === "dark"
                                ? "radial-gradient(640px 320px at 92% 0%, rgba(60,221,199,0.12), transparent 62%), linear-gradient(135deg, #1f1f28 0%, #13121b 100%)"
                                : "radial-gradient(640px 320px at 92% 0%, rgba(113,42,226,0.15), transparent 62%), linear-gradient(135deg, #ffffff 0%, #f3efff 100%)",
                    }}
                >
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 320px" }, gap: 3, alignItems: "center" }}>
                        <Stack spacing={2.5}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "primary.main" }}>
                                <AutoStoriesRoundedIcon />
                                <Typography variant="overline" sx={{ fontWeight: 950 }}>
                                    My Learning
                                </Typography>
                            </Stack>
                            <Box>
                                <Typography variant="h2">Continue building skill, {user?.fullName?.split(" ")[0] ?? "student"}.</Typography>
                                <Typography sx={{ color: "text.secondary", mt: 1.5, lineHeight: 1.7, maxWidth: 760 }}>
                                    Track enrolled courses, resume from the next item and review completed material from one workspace.
                                </Typography>
                            </Box>
                            {continueEnrollment ? (
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                    <Button component={RouterLink} to={`/learn/${continueEnrollment.course.id}${continueEnrollment.nextItemId ? `/items/${continueEnrollment.nextItemId}` : ""}`} variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
                                        Continue {continueEnrollment.course.title}
                                    </Button>
                                    <Button component={RouterLink} to="/courses" variant="outlined">
                                        Browse more courses
                                    </Button>
                                </Stack>
                            ) : null}
                        </Stack>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                background: (theme) => (theme.palette.mode === "dark" ? "rgba(31,31,40,0.78)" : "rgba(255,255,255,0.76)"),
                            }}
                        >
                            <Stack spacing={2}>
                                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                    Learning summary
                                </Typography>
                                <Stack spacing={1.2}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography sx={{ color: "text.secondary" }}>Enrolled</Typography>
                                        <Typography sx={{ fontWeight: 950 }}>{items.length}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography sx={{ color: "text.secondary" }}>In progress</Typography>
                                        <Typography sx={{ fontWeight: 950 }}>{inProgress.length}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography sx={{ color: "text.secondary" }}>Completed</Typography>
                                        <Typography sx={{ fontWeight: 950 }}>{completed.length}</Typography>
                                    </Stack>
                                </Stack>
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.7 }}>
                                        Average progress
                                    </Typography>
                                    <LinearProgress variant="determinate" value={averageProgress} sx={{ height: 9, borderRadius: 999 }} />
                                </Box>
                            </Stack>
                        </Paper>
                    </Box>
                </Paper>

                {isLoading ? <LoadingState rows={3} /> : null}
                {error ? <ErrorState message={error} onRetry={loadItems} /> : null}
                {!isLoading && !error && items.length === 0 ? (
                    <EmptyState
                        title="No enrolled courses"
                        description="Open the catalog and enroll in a course to start learning."
                        action={
                            <Button component={RouterLink} to="/courses" variant="contained">
                                Browse courses
                            </Button>
                        }
                    />
                ) : null}

                {!isLoading && !error && inProgress.length > 0 ? (
                    <Stack spacing={2.2}>
                        <Typography variant="h3">In progress</Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2.5 }}>
                            {inProgress.map((item) => (
                                <LearningCourseCard key={item.course.id} enrollment={item} />
                            ))}
                        </Box>
                    </Stack>
                ) : null}

                {!isLoading && !error && completed.length > 0 ? (
                    <Stack spacing={2.2}>
                        <Typography variant="h3">Completed</Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2.5 }}>
                            {completed.map((item) => (
                                <LearningCourseCard key={item.course.id} enrollment={item} />
                            ))}
                        </Box>
                    </Stack>
                ) : null}
            </Stack>
        </PageContainer>
    );
}

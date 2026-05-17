import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { Link as RouterLink } from "react-router-dom";
import { teacherApi } from "../../api/services";
import type { CourseStatus, TeacherCourseSummary } from "../../api/bffContracts";
import { getErrorMessage } from "../../api/apiError";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageContainer } from "../../layouts/PageContainer";
import { useAuth } from "../../auth/useAuth";

const statusLabels: Record<CourseStatus, string> = {
    DRAFT: "Drafts",
    PENDING_REVIEW: "Pending review",
    CHANGES_REQUESTED: "Changes requested",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
};

function StatCard(props: { title: string; value: number; description: string; icon: ReactNode }) {
    return (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
            <Stack spacing={2}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.5,
                        bgcolor: "primary.light",
                        color: "primary.main",
                        display: "grid",
                        placeItems: "center",
                    }}
                >
                    {props.icon}
                </Box>
                <Box>
                    <Typography variant="h4">{props.value}</Typography>
                    <Typography sx={{ fontWeight: 900 }}>{props.title}</Typography>
                    <Typography sx={{ color: "text.secondary", mt: 0.5 }}>{props.description}</Typography>
                </Box>
            </Stack>
        </Paper>
    );
}

export default function TeacherDashboardPage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<TeacherCourseSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCourses = async () => {
        setIsLoading(true);
        setError(null);
        try {
            setCourses(await teacherApi.listCourses({ size: 100 }));
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Failed to load teacher dashboard"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadCourses();
    }, []);

    const stats = useMemo(() => {
        const byStatus = courses.reduce<Record<CourseStatus, number>>(
            (acc, course) => {
                acc[course.status] += 1;
                return acc;
            },
            { DRAFT: 0, PENDING_REVIEW: 0, CHANGES_REQUESTED: 0, PUBLISHED: 0, ARCHIVED: 0 }
        );
        return { total: courses.length, ...byStatus };
    }, [courses]);

    const recentCourses = useMemo(() => courses.slice(0, 4), [courses]);

    return (
        <PageContainer>
            <Stack spacing={4}>
                <Paper
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 3,
                        color: "#ffffff",
                        background: "linear-gradient(135deg, #3525cd 0%, #712ae2 100%)",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "center" }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h2">Teacher Cabinet</Typography>
                            <Typography sx={{ opacity: 0.86, mt: 1, maxWidth: 720 }}>
                                Create course drafts, manage metadata, submit ready content for review, and prepare courses for StudyBytes students.
                            </Typography>
                            <Typography sx={{ opacity: 0.75, mt: 1 }}>
                                Signed in as {user?.fullName ?? user?.email ?? "teacher"}
                            </Typography>
                        </Box>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button component={RouterLink} to="/teacher/courses/new" variant="contained" color="secondary">
                                Create course
                            </Button>
                            <Button component={RouterLink} to="/teacher/courses" variant="outlined" sx={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.55)" }}>
                                Manage courses
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>

                {isLoading ? <LoadingState rows={3} /> : null}
                {error ? <ErrorState message={error} onRetry={loadCourses} /> : null}

                {!isLoading && !error ? (
                    <>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
                            <StatCard title="Total courses" value={stats.total} description="Courses visible to your teacher role." icon={<AutoStoriesRoundedIcon />} />
                            <StatCard title={statusLabels.DRAFT} value={stats.DRAFT} description="Work in progress before publication." icon={<EditNoteRoundedIcon />} />
                            <StatCard title={statusLabels.PENDING_REVIEW} value={stats.PENDING_REVIEW} description="Waiting for admin moderation." icon={<RateReviewRoundedIcon />} />
                            <StatCard title={statusLabels.PUBLISHED} value={stats.PUBLISHED} description="Available in the public catalog." icon={<SchoolRoundedIcon />} />
                        </Box>

                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                            <Stack spacing={2.5}>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h5">Recent courses</Typography>
                                        <Typography sx={{ color: "text.secondary", mt: 0.5 }}>Continue editing or submit the latest drafts for review.</Typography>
                                    </Box>
                                    <Button component={RouterLink} to="/teacher/courses" variant="outlined">
                                        View all
                                    </Button>
                                </Stack>

                                {recentCourses.length === 0 ? (
                                    <EmptyState
                                        title="No courses yet"
                                        description="Create your first course draft to start building StudyBytes content."
                                        action={
                                            <Button component={RouterLink} to="/teacher/courses/new" variant="contained">
                                                Create course
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <Stack spacing={1.5}>
                                        {recentCourses.map((course) => (
                                            <Paper key={course.id} variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                                                            <StatusBadge status={course.status} />
                                                            <Chip size="small" label={course.enrollmentEnabled ? "Enrollment open" : "Enrollment disabled"} />
                                                        </Stack>
                                                        <Typography sx={{ fontWeight: 900 }}>{course.title}</Typography>
                                                        <Typography sx={{ color: "text.secondary" }}>{course.shortDescription}</Typography>
                                                    </Box>
                                                    <Button component={RouterLink} to={`/teacher/courses/${course.id}/edit`} variant="outlined">
                                                        Edit
                                                    </Button>
                                                </Stack>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </Stack>
                        </Paper>
                    </>
                ) : null}
            </Stack>
        </PageContainer>
    );
}

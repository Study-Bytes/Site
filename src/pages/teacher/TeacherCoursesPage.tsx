import { useEffect, useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { bffClient } from "../../api/apiClient";
import type { TeacherCourseSummary } from "../../api/bffContracts";
import { AccessTypeBadge } from "../../components/ui/AccessTypeBadge";
import { DifficultyBadge } from "../../components/ui/DifficultyBadge";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PageContainer } from "../../layouts/PageContainer";
import { getErrorMessage } from "../../api/apiError";

export default function TeacherCoursesPage() {
    const [courses, setCourses] = useState<TeacherCourseSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCourses = async () => {
        setIsLoading(true);
        setError(null);
        try {
            setCourses(await bffClient.getTeacherCourses());
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Failed to load teacher courses"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadCourses();
    }, []);

    return (
        <PageContainer>
            <Stack spacing={4}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h2">Teacher courses</Typography>
                        <Typography sx={{ color: "text.secondary", mt: 1 }}>List endpoint contract: `GET /api/teacher/courses`.</Typography>
                    </Box>
                    <Button component={RouterLink} to="/teacher/courses/new" variant="contained">
                        Create course
                    </Button>
                </Stack>

                {isLoading ? <LoadingState rows={3} /> : null}
                {error ? <ErrorState message={error} onRetry={loadCourses} /> : null}
                <Stack spacing={2}>
                    {courses.map((course) => (
                        <Paper key={course.id} variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                                        <StatusBadge status={course.status} />
                                        <DifficultyBadge difficulty={course.difficulty} />
                                        <AccessTypeBadge accessType={course.accessType} />
                                        <Chip size="small" label={course.enrollmentEnabled ? "Enrollment open" : "Enrollment disabled"} />
                                    </Stack>
                                    <Typography variant="h5">{course.title}</Typography>
                                    <Typography sx={{ color: "text.secondary" }}>{course.shortDescription}</Typography>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                    <Button component={RouterLink} to={`/teacher/courses/${course.id}/edit`} variant="outlined">
                                        Edit
                                    </Button>
                                    <Button variant="contained">Publish</Button>
                                    <Button variant="outlined" color="error">
                                        Archive
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            </Stack>
        </PageContainer>
    );
}

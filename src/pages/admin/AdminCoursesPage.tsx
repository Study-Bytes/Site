import { useCallback, useEffect, useState } from "react";
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { adminApi } from "../../api/services";
import type { CourseStatus, TeacherCourseSummary } from "../../api/bffContracts";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PageContainer } from "../../layouts/PageContainer";

const statuses: Array<"" | CourseStatus> = ["", "DRAFT", "PENDING_REVIEW", "CHANGES_REQUESTED", "PUBLISHED", "ARCHIVED"];

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<TeacherCourseSummary[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"" | CourseStatus>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            setCourses(await adminApi.listCourses({ search: search.trim() || undefined, status: status || undefined, page: 0, size: 100 }));
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to load courses");
        } finally {
            setIsLoading(false);
        }
    }, [search, status]);

    useEffect(() => { void load(); }, [load]);

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h2">All courses</Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1 }}>Review all course statuses and open moderation details.</Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <TextField label="Search" value={search} onChange={(event) => setSearch(event.target.value)} sx={{ flexGrow: 1 }} />
                        <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value as "" | CourseStatus)} sx={{ minWidth: 220 }}>
                            {statuses.map((item) => <MenuItem key={item || "all"} value={item}>{item || "All statuses"}</MenuItem>)}
                        </TextField>
                        <Button variant="contained" onClick={() => void load()}>Apply</Button>
                    </Stack>
                </Paper>
                {isLoading ? <LoadingState rows={4} /> : null}
                {error ? <ErrorState message={error} onRetry={load} /> : null}
                {!isLoading && !error && courses.length === 0 ? <EmptyState title="No courses" description="No courses match the selected filters." /> : null}
                {!isLoading && !error && courses.map((course) => (
                    <Paper key={course.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}><StatusBadge status={course.status} /></Stack>
                                <Typography variant="h5">{course.title}</Typography>
                                <Typography sx={{ color: "text.secondary" }}>{course.shortDescription}</Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>Creator: {course.createdByUserFullName ?? course.createdByUserEmail ?? course.createdByUserId ?? "unknown"}</Typography>
                            </Box>
                            <Button component={RouterLink} to={`/admin/courses/${course.id}/review`} variant="outlined">Review</Button>
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </PageContainer>
    );
}

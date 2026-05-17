import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import { Link as RouterLink } from "react-router-dom";
import { ApiError, getErrorMessage } from "../../api/apiError";
import { teacherApi } from "../../api/services";
import type { CourseAccessType, CourseDifficulty, CourseStatus, TeacherCourseQuery, TeacherCourseSummary } from "../../api/bffContracts";
import { AccessTypeBadge } from "../../components/ui/AccessTypeBadge";
import { DifficultyBadge } from "../../components/ui/DifficultyBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PageContainer } from "../../layouts/PageContainer";
import { formatDuration } from "../../utils/courseFormat";
import { useI18n } from "../../i18n/useI18n";

const statusOptions: Array<"" | CourseStatus> = ["", "DRAFT", "PENDING_REVIEW", "CHANGES_REQUESTED", "PUBLISHED", "ARCHIVED"];
const difficultyOptions: Array<"" | CourseDifficulty> = ["", "BEGINNER", "INTERMEDIATE", "ADVANCED"];
const accessTypeOptions: Array<"" | CourseAccessType> = ["", "PUBLIC", "UNLISTED", "PRIVATE"];

type FilterState = {
    search: string;
    status: "" | CourseStatus;
    difficulty: "" | CourseDifficulty;
    accessType: "" | CourseAccessType;
};

const initialFilters: FilterState = { search: "", status: "", difficulty: "", accessType: "" };

function buildQuery(filters: FilterState): TeacherCourseQuery {
    return {
        search: filters.search.trim() || undefined,
        status: filters.status || undefined,
        difficulty: filters.difficulty || undefined,
        accessType: filters.accessType || undefined,
        page: 0,
        size: 50,
    };
}

function toSummary(course: TeacherCourseSummary): TeacherCourseSummary {
    return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        shortDescription: course.shortDescription,
        difficulty: course.difficulty,
        accessType: course.accessType,
        enrollmentEnabled: course.enrollmentEnabled,
        coverImageUrl: course.coverImageUrl,
        estimatedMinutes: course.estimatedMinutes,
        status: course.status,
        updatedAt: course.updatedAt,
        createdByUserId: course.createdByUserId,
    };
}

export default function TeacherCoursesPage() {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const [courses, setCourses] = useState<TeacherCourseSummary[]>([]);
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionCourseId, setActionCourseId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const hasActiveFilters = useMemo(() => Boolean(filters.search || filters.status || filters.difficulty || filters.accessType), [filters]);

    const loadCourses = async (nextFilters = filters) => {
        setIsLoading(true);
        setError(null);
        try {
            setCourses(await teacherApi.listCourses(buildQuery(nextFilters)));
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Failed to load teacher courses"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadCourses(initialFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateCourseInList = (updated: TeacherCourseSummary) => {
        setCourses((current) => current.map((course) => (course.id === updated.id ? toSummary({ ...course, ...updated }) : course)));
    };

    const runCourseAction = async (courseId: number, action: "submit" | "archive") => {
        setActionCourseId(courseId);
        setActionError(null);
        try {
            const updated = action === "submit" ? await teacherApi.submitCourseForReview(courseId) : await teacherApi.archiveCourse(courseId);
            updateCourseInList({ ...updated, updatedAt: updated.updatedAt });
        } catch (requestError) {
            const message = getErrorMessage(requestError, action === "submit" ? "Failed to submit course for review" : "Failed to archive course");
            setActionError(message);
            if (requestError instanceof ApiError && requestError.validationErrors.length > 0) {
                setActionError(`${message}: ${requestError.validationErrors.map((item) => item.message).join("; ")}`);
            }
        } finally {
            setActionCourseId(null);
        }
    };

    const applyFilters = () => void loadCourses(filters);

    const resetFilters = () => {
        setFilters(initialFilters);
        void loadCourses(initialFilters);
    };

    return (
        <PageContainer>
            <Stack spacing={4}>
                <Paper
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 3,
                        background: "linear-gradient(135deg, rgba(53,37,205,0.10), rgba(113,42,226,0.08))",
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h2">{isRu ? "Курсы преподавателя" : "Teacher courses"}</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1, maxWidth: 760 }}>
                                {isRu ? "Создавай черновики, отправляй готовые курсы на модерацию и архивируй устаревшие материалы." : "Manage drafts, submit ready courses for moderation and archive outdated materials."}
                            </Typography>
                        </Box>
                        <Button component={RouterLink} to="/teacher/courses/new" variant="contained" size="large">
                            {isRu ? "Создать курс" : "Create course"}
                        </Button>
                    </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                    <Stack spacing={2}>
                        <Typography variant="h5">{isRu ? "Фильтры" : "Filters"}</Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr repeat(3, 1fr)" }, gap: 2 }}>
                            <TextField
                                label={isRu ? "Поиск" : "Search"}
                                value={filters.search}
                                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                                placeholder={isRu ? "Название или описание курса" : "Course title or description"}
                            />
                            <TextField select label={isRu ? "Статус" : "Status"} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as FilterState["status"] }))}>
                                {statusOptions.map((value) => (
                                    <MenuItem key={value || "all"} value={value}>
                                        {value || (isRu ? "Все статусы" : "All statuses")}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label={isRu ? "Сложность" : "Difficulty"}
                                value={filters.difficulty}
                                onChange={(event) => setFilters((current) => ({ ...current, difficulty: event.target.value as FilterState["difficulty"] }))}
                            >
                                {difficultyOptions.map((value) => (
                                    <MenuItem key={value || "all"} value={value}>
                                        {value || (isRu ? "Любая сложность" : "All difficulties")}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField select label={isRu ? "Доступ" : "Access type"} value={filters.accessType} onChange={(event) => setFilters((current) => ({ ...current, accessType: event.target.value as FilterState["accessType"] }))}>
                                {accessTypeOptions.map((value) => (
                                    <MenuItem key={value || "all"} value={value}>
                                        {value || (isRu ? "Любой доступ" : "All access types")}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button variant="contained" onClick={applyFilters} disabled={isLoading}>
                                {isRu ? "Применить" : "Apply filters"}
                            </Button>
                            <Button variant="outlined" onClick={resetFilters} disabled={isLoading || !hasActiveFilters}>
                                {isRu ? "Сбросить" : "Reset"}
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>

                {actionError ? <Alert severity="error" onClose={() => setActionError(null)}>{actionError}</Alert> : null}
                {isLoading ? <LoadingState rows={4} /> : null}
                {error ? <ErrorState message={error} onRetry={() => loadCourses()} /> : null}

                {!isLoading && !error && courses.length === 0 ? (
                    <EmptyState
                        title={isRu ? "Курсы не найдены" : "No courses found"}
                        description={hasActiveFilters ? (isRu ? "Нет курсов по выбранным фильтрам." : "No courses match the selected filters.") : (isRu ? "Создай первый черновик курса, чтобы начать наполнение." : "Create your first course draft to start building content.")}
                        action={
                            <Button component={RouterLink} to="/teacher/courses/new" variant="contained">
                                {isRu ? "Создать курс" : "Create course"}
                            </Button>
                        }
                    />
                ) : null}

                {!isLoading && !error && courses.length > 0 ? (
                    <Stack spacing={2}>
                        {courses.map((course) => {
                            const isActionLoading = actionCourseId === course.id;
                            return (
                                <Paper key={course.id} variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                                    <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5} alignItems={{ lg: "center" }}>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.25 }}>
                                                <StatusBadge status={course.status} />
                                                <DifficultyBadge difficulty={course.difficulty} />
                                                <AccessTypeBadge accessType={course.accessType} />
                                                <Chip size="small" label={course.enrollmentEnabled ? (isRu ? "Запись открыта" : "Enrollment open") : (isRu ? "Запись закрыта" : "Enrollment disabled")} />
                                                <Chip size="small" label={formatDuration(course.estimatedMinutes)} />
                                            </Stack>
                                            <Typography variant="h5">{course.title}</Typography>
                                            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>{course.shortDescription}</Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                                                {isRu ? "Обновлено" : "Updated"} {new Date(course.updatedAt).toLocaleDateString()}
                                            </Typography>
                                            {course.reviewComment ? (
                                                <Alert severity={course.status === "CHANGES_REQUESTED" ? "warning" : "info"} sx={{ mt: 1.5 }}>
                                                    {isRu ? "Комментарий модератора" : "Admin review"}: {course.reviewComment}
                                                </Alert>
                                            ) : null}
                                        </Box>
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flexShrink: 0 }}>
                                            <Button component={RouterLink} to={`/teacher/courses/${course.id}/edit`} variant="outlined" startIcon={<EditRoundedIcon />}>
                                                {isRu ? "Редактировать" : "Edit"}
                                            </Button>
                                            <Button
                                                variant="contained"
                                                startIcon={<RateReviewRoundedIcon />}
                                                disabled={isActionLoading || course.status === "PUBLISHED" || course.status === "ARCHIVED" || course.status === "PENDING_REVIEW"}
                                                onClick={() => void runCourseAction(course.id, "submit")}
                                            >
                                                {isRu ? "На модерацию" : "Submit for review"}
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<ArchiveRoundedIcon />}
                                                disabled={isActionLoading || course.status === "ARCHIVED"}
                                                onClick={() => void runCourseAction(course.id, "archive")}
                                            >
                                                {isRu ? "Архивировать" : "Archive"}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                ) : null}
            </Stack>
        </PageContainer>
    );
}

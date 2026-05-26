import { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import LibraryBooksRoundedIcon from "@mui/icons-material/LibraryBooksRounded";
import { Link as RouterLink } from "react-router-dom";
import { adminApi } from "../../api/services";
import type { TeacherCourseSummary } from "../../api/bffContracts";
import { getErrorMessage } from "../../api/apiError";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useI18n } from "../../i18n/useI18n";
import { PageContainer } from "../../layouts/PageContainer";

export default function AdminDashboardPage() {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const [courses, setCourses] = useState<TeacherCourseSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            setCourses(await adminApi.listCourses({ page: 0, size: 50 }));
        } catch (requestError) {
            setError(getErrorMessage(requestError, isRu ? "Не удалось загрузить админ-панель" : "Failed to load admin dashboard"));
        } finally {
            setIsLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { void load(); }, []);

    const stats = useMemo(() => ({
        pending: courses.filter((course) => course.status === "PENDING_REVIEW").length,
        published: courses.filter((course) => course.status === "PUBLISHED").length,
        changes: courses.filter((course) => course.status === "CHANGES_REQUESTED").length,
        total: courses.length,
    }), [courses]);

    const recent = courses.slice(0, 4);

    return (
        <PageContainer>
            <Stack spacing={4}>
                <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, background: "linear-gradient(135deg, rgba(53,37,205,0.10), rgba(113,42,226,0.08))", border: "1px solid", borderColor: "divider" }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h2">{isRu ? "Админ-панель" : "Admin panel"}</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1, maxWidth: 760 }}>
                                {isRu ? "Модерируйте публикации курсов, проверяйте заявки и поддерживайте качество публичного каталога." : "Moderate course publication, review pending submissions, and keep public catalog quality stable."}
                            </Typography>
                        </Box>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button component={RouterLink} to="/admin/courses/moderation" variant="contained" startIcon={<RateReviewRoundedIcon />}>{isRu ? "Очередь модерации" : "Moderation queue"}</Button>
                            <Button component={RouterLink} to="/admin/courses" variant="outlined" startIcon={<LibraryBooksRoundedIcon />}>{isRu ? "Все курсы" : "All courses"}</Button>
                        </Stack>
                    </Stack>
                </Paper>

                {isLoading ? <LoadingState rows={3} /> : null}
                {error ? <ErrorState message={error} onRetry={load} /> : null}

                {!isLoading && !error ? (
                    <>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
                            {[
                                { label: isRu ? "На модерации" : "Pending review", value: stats.pending },
                                { label: isRu ? "Опубликовано" : "Published", value: stats.published },
                                { label: isRu ? "Нужны правки" : "Changes requested", value: stats.changes },
                                { label: isRu ? "Всего курсов" : "Total courses", value: stats.total },
                            ].map((item) => (
                                <Paper key={item.label} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                                    <Typography variant="h3">{item.value}</Typography>
                                    <Typography sx={{ color: "text.secondary" }}>{item.label}</Typography>
                                </Paper>
                            ))}
                        </Box>

                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                            <Stack spacing={2}>
                                <Typography variant="h5">{isRu ? "Последние курсы" : "Recent courses"}</Typography>
                                {recent.length === 0 ? <EmptyState title={isRu ? "Курсов пока нет" : "No courses yet"} description={isRu ? "Заявки на публикацию появятся здесь." : "Course submissions will appear here."} /> : null}
                                {recent.map((course) => (
                                    <Stack key={course.id} direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} sx={{ py: 1.2, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: 0 } }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography sx={{ fontWeight: 900 }}>{course.title}</Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>{course.createdByUserFullName ?? (isRu ? "Преподаватель не указан" : "Unknown teacher")}</Typography>
                                        </Box>
                                        <StatusBadge status={course.status} />
                                        {course.status === "PENDING_REVIEW" ? <Chip size="small" color="info" label={isRu ? "Нужна проверка" : "Needs review"} /> : null}
                                        <Button component={RouterLink} to={`/admin/courses/${course.id}/review`} size="small">{isRu ? "Открыть" : "Open"}</Button>
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>
                    </>
                ) : null}
            </Stack>
        </PageContainer>
    );
}

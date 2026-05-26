import { useEffect, useState } from "react";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
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

export default function AdminModerationQueuePage() {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const [courses, setCourses] = useState<TeacherCourseSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            setCourses(await adminApi.listModerationQueue({ status: "PENDING_REVIEW", page: 0, size: 50 }));
        } catch (requestError) {
            setError(getErrorMessage(requestError, isRu ? "Не удалось загрузить очередь модерации" : "Failed to load moderation queue"));
        } finally {
            setIsLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { void load(); }, []);

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, background: "linear-gradient(135deg, rgba(53,37,205,0.10), rgba(113,42,226,0.08))", border: "1px solid", borderColor: "divider" }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h2">{isRu ? "Модерация курсов" : "Course moderation"}</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1 }}>{isRu ? "Публикуйте готовые курсы или запрашивайте правки перед появлением в каталоге." : "Approve high-quality courses or request changes before public publication."}</Typography>
                        </Box>
                        <Button component={RouterLink} to="/admin/courses" variant="outlined">{isRu ? "Все курсы" : "All courses"}</Button>
                    </Stack>
                </Paper>
                {isLoading ? <LoadingState rows={4} /> : null}
                {error ? <ErrorState message={error} onRetry={load} /> : null}
                {!isLoading && !error && courses.length === 0 ? <EmptyState title={isRu ? "Очередь пуста" : "Queue is empty"} description={isRu ? "Сейчас нет курсов, ожидающих проверки." : "There are no courses waiting for review."} /> : null}
                {!isLoading && !error && courses.map((course) => (
                    <Paper key={course.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                                    <StatusBadge status={course.status} />
                                    {course.submittedForReviewAt ? <Alert severity="info" sx={{ py: 0 }}>{isRu ? "Отправлен" : "Submitted"} {new Date(course.submittedForReviewAt).toLocaleDateString(isRu ? "ru-RU" : "en-US")}</Alert> : null}
                                </Stack>
                                <Typography variant="h5">{course.title}</Typography>
                                <Typography sx={{ color: "text.secondary" }}>{course.shortDescription}</Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>{isRu ? "Преподаватель" : "Teacher"}: {course.createdByUserFullName ?? course.createdByUserEmail ?? (isRu ? "неизвестно" : "unknown")}</Typography>
                            </Box>
                            <Button component={RouterLink} to={`/admin/courses/${course.id}/review`} variant="contained" startIcon={<RateReviewRoundedIcon />}>{isRu ? "Проверить" : "Review"}</Button>
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </PageContainer>
    );
}

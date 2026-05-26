import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Link as RouterLink, useParams } from "react-router-dom";
import { adminApi } from "../../api/services";
import { getErrorMessage } from "../../api/apiError";
import type { TeacherCourseDetails } from "../../api/bffContracts";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useI18n } from "../../i18n/useI18n";
import { PageContainer } from "../../layouts/PageContainer";
import { getCourseItemCount, getCourseModuleCount, parseRouteCourseId } from "../../utils/courseFormat";

export default function AdminCourseReviewPage() {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const { courseId } = useParams();
    const parsedCourseId = parseRouteCourseId(courseId);
    const [course, setCourse] = useState<TeacherCourseDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [action, setAction] = useState<"approve" | "reject" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [reviewComment, setReviewComment] = useState("");

    const stats = useMemo(() => course ? { modules: getCourseModuleCount(course), items: getCourseItemCount(course) } : { modules: 0, items: 0 }, [course]);

    const load = useCallback(async () => {
        if (!parsedCourseId) {
            setError(isRu ? "Некорректный id курса" : "Invalid course id");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            setCourse(await adminApi.getCourseReview(parsedCourseId));
        } catch (requestError) {
            setError(getErrorMessage(requestError, isRu ? "Не удалось загрузить курс для модерации" : "Failed to load course review"));
        } finally {
            setIsLoading(false);
        }
    }, [isRu, parsedCourseId]);

    useEffect(() => { void load(); }, [load]);

    const approve = async () => {
        if (!course) return;
        setAction("approve");
        setError(null);
        setSuccess(null);
        try {
            const updated = await adminApi.approveCourse(course.id);
            setCourse(updated);
            setSuccess(isRu ? "Курс одобрен и опубликован" : "Course approved and published");
        } catch (requestError) {
            setError(getErrorMessage(requestError, isRu ? "Не удалось одобрить курс" : "Failed to approve course"));
        } finally {
            setAction(null);
        }
    };

    const reject = async () => {
        if (!course) return;
        setAction("reject");
        setError(null);
        setSuccess(null);
        try {
            const updated = await adminApi.rejectCourse(course.id, { reviewComment });
            setCourse(updated);
            setRejectOpen(false);
            setSuccess(isRu ? "Правки запрошены у преподавателя" : "Changes requested from teacher");
        } catch (requestError) {
            setError(getErrorMessage(requestError, isRu ? "Не удалось запросить правки" : "Failed to reject course"));
        } finally {
            setAction(null);
        }
    };

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Button component={RouterLink} to="/admin/courses/moderation" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }}>{isRu ? "К очереди модерации" : "Back to queue"}</Button>
                {isLoading ? <LoadingState rows={4} /> : null}
                {error ? <ErrorState message={error} onRetry={load} /> : null}
                {success ? <Alert severity="success">{success}</Alert> : null}
                {!isLoading && !error && !course ? <EmptyState title={isRu ? "Курс не найден" : "Course not found"} description={isRu ? "Цель модерации не существует." : "The moderation target does not exist."} /> : null}
                {course ? (
                    <>
                        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, background: "linear-gradient(135deg, rgba(53,37,205,0.10), rgba(113,42,226,0.08))", border: "1px solid", borderColor: "divider" }}>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><StatusBadge status={course.status} /></Stack>
                                <Typography variant="h2">{course.title}</Typography>
                                <Typography sx={{ color: "text.secondary", maxWidth: 900 }}>{course.description}</Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>{isRu ? "Преподаватель" : "Teacher"}: {course.createdByUserFullName ?? course.createdByUserEmail ?? course.createdByUserId}</Typography>
                                {course.reviewComment ? <Alert severity="warning">{isRu ? "Предыдущий комментарий" : "Previous review"}: {course.reviewComment}</Alert> : null}
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                    <Button variant="contained" color="success" startIcon={<CheckCircleRoundedIcon />} disabled={action !== null || course.status === "PUBLISHED"} onClick={() => void approve()}>{isRu ? "Одобрить и опубликовать" : "Approve and publish"}</Button>
                                    <Button variant="outlined" color="error" startIcon={<CancelRoundedIcon />} disabled={action !== null} onClick={() => setRejectOpen(true)}>{isRu ? "Запросить правки" : "Request changes"}</Button>
                                </Stack>
                            </Stack>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                            <Stack spacing={2}>
                                <Typography variant="h5">{isRu ? "Чеклист модерации" : "Review checklist"}</Typography>
                                <Alert severity={stats.modules > 0 ? "success" : "warning"}>{isRu ? "Модулей" : "Modules"}: {stats.modules}</Alert>
                                <Alert severity={stats.items > 0 ? "success" : "warning"}>{isRu ? "Уроков" : "Items"}: {stats.items}</Alert>
                                <Alert severity={course.shortDescription ? "success" : "warning"}>{course.shortDescription ? (isRu ? "Краткое описание заполнено" : "Short description is present") : (isRu ? "Краткое описание отсутствует" : "Short description is missing")}</Alert>
                                <Alert severity={course.description ? "success" : "warning"}>{course.description ? (isRu ? "Полное описание заполнено" : "Full description is present") : (isRu ? "Полное описание отсутствует" : "Full description is missing")}</Alert>
                            </Stack>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                            <Stack spacing={2}>
                                <Typography variant="h5">{isRu ? "Предпросмотр структуры курса" : "Course content preview"}</Typography>
                                {course.modules.length === 0 ? <EmptyState title={isRu ? "Модулей нет" : "No modules"} description={isRu ? "У курса пока нет структуры модулей." : "This course has no module structure."} /> : null}
                                {course.modules.slice().sort((a, b) => a.orderIndex - b.orderIndex).map((module) => (
                                    <Box key={module.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                                        <Typography variant="h6">{module.title}</Typography>
                                        <Stack spacing={1} sx={{ mt: 1 }}>
                                            {module.items.slice().sort((a, b) => a.orderIndex - b.orderIndex).map((item) => (
                                                <Stack key={item.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1, borderTop: "1px solid", borderColor: "divider" }}>
                                                    <ItemTypeBadge itemType={item.itemType} />
                                                    <Typography sx={{ fontWeight: 800 }}>{item.title}</Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </>
                ) : null}
            </Stack>

            <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{isRu ? "Запросить правки" : "Request changes"}</DialogTitle>
                <DialogContent>
                    <TextField label={isRu ? "Комментарий модератора" : "Review comment"} value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} multiline minRows={4} fullWidth sx={{ mt: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectOpen(false)}>{isRu ? "Отмена" : "Cancel"}</Button>
                    <Button color="error" variant="contained" disabled={action !== null || !reviewComment.trim()} onClick={() => void reject()}>{isRu ? "Вернуть с комментарием" : "Reject with comment"}</Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
}

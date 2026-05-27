import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, CircularProgress, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { getErrorMessage, isAlreadyEnrolledError } from "../../api/apiError";
import type { EnrollmentSummary } from "../../api/bffContracts";
import { learningApi } from "../../api/services";
import { useAuth } from "../../auth/useAuth";
import { AccessTypeBadge } from "../../components/ui/AccessTypeBadge";
import { DifficultyBadge } from "../../components/ui/DifficultyBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { useI18n } from "../../i18n/useI18n";
import { PageContainer } from "../../layouts/PageContainer";
import { formatDuration } from "../../utils/courseFormat";

function LearningCourseCard({
    enrollment,
    isStaff,
    isContinuing,
    onContinue,
}: {
    enrollment: EnrollmentSummary;
    isStaff: boolean;
    isContinuing: boolean;
    onContinue: (enrollment: EnrollmentSummary) => void;
}) {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const courseMapPath = isStaff ? `/teacher/courses/${enrollment.course.id}/edit#course-structure-section` : `/learn/${enrollment.course.id}`;
    const continuePath = `/learn/${enrollment.course.id}${enrollment.nextItemId ? `/items/${enrollment.nextItemId}` : ""}`;
    const isCompleted = enrollment.status === "COMPLETED";
    const isTeacherOnly = enrollment.relation === "TEACHER";
    const progressPercent = enrollment.progressPercent ?? 0;

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
                        label={isTeacherOnly ? (isRu ? "Автор" : "Author") : enrollment.status}
                        color={isCompleted ? "success" : isTeacherOnly ? "default" : "primary"}
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
                            {isTeacherOnly ? (isRu ? "Авторский курс" : "Teacher course") : `${progressPercent}% ${isRu ? "пройдено" : "complete"}`}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {formatDuration(enrollment.course.estimatedMinutes, isRu)}
                        </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 8, borderRadius: 999 }} />
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                    <Button component={RouterLink} to={courseMapPath} variant="outlined" fullWidth>
                        {isRu ? "Карта курса" : "Course map"}
                    </Button>
                    {isTeacherOnly ? (
                        <Button variant="contained" endIcon={isContinuing ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardRoundedIcon />} disabled={isContinuing} fullWidth onClick={() => onContinue(enrollment)}>
                            {isRu ? "Открыть как студент" : "Open as learner"}
                        </Button>
                    ) : (
                        <Button component={RouterLink} to={continuePath} variant="contained" endIcon={<ArrowForwardRoundedIcon />} fullWidth>
                            {isCompleted ? (isRu ? "Повторить" : "Review") : (isRu ? "Продолжить" : "Continue")}
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}

export default function MyLearningPage() {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState<EnrollmentSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [continuingCourseId, setContinuingCourseId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const isStaff = user?.role === "TEACHER" || user?.role === "ADMIN";

    const loadItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            setItems(await learningApi.getMyCourses());
        } catch (requestError) {
            setError(getErrorMessage(requestError, isRu ? "Не удалось загрузить обучение" : "Failed to load learning dashboard"));
        } finally {
            setIsLoading(false);
        }
    }, [isRu]);

    useEffect(() => {
        void loadItems();
    }, [loadItems]);

    const enrollTeacherCourseAndContinue = async (enrollment: EnrollmentSummary) => {
        const target = `/learn/${enrollment.course.id}${enrollment.nextItemId ? `/items/${enrollment.nextItemId}` : ""}`;
        setContinuingCourseId(enrollment.course.id);
        setError(null);
        try {
            await learningApi.enrollCourse(enrollment.course.id);
            await navigate(target);
        } catch (requestError) {
            if (isAlreadyEnrolledError(requestError)) {
                await navigate(target);
                return;
            }
            setError(getErrorMessage(requestError, isRu ? "Не удалось открыть курс как студент" : "Failed to open course as learner"));
        } finally {
            setContinuingCourseId(null);
        }
    };

    const inProgress = useMemo(() => items.filter((item) => item.status !== "COMPLETED"), [items]);
    const completed = useMemo(() => items.filter((item) => item.status === "COMPLETED"), [items]);
    const averageProgress = useMemo(() => {
        if (items.length === 0) return 0;
        return Math.round(items.reduce((sum, item) => sum + (item.progressPercent ?? 0), 0) / items.length);
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
                                    {isRu ? "Моё обучение" : "My Learning"}
                                </Typography>
                            </Stack>
                            <Box>
                                <Typography variant="h2">{isRu ? `Продолжай обучение, ${user?.fullName?.split(" ")[0] ?? "студент"}.` : `Continue building skill, ${user?.fullName?.split(" ")[0] ?? "student"}.`}</Typography>
                                <Typography sx={{ color: "text.secondary", mt: 1.5, lineHeight: 1.7, maxWidth: 760 }}>
                                    {isRu ? "Здесь собраны записанные курсы, следующий урок и уже пройденные материалы." : "Track enrolled courses, resume from the next item and review completed material from one workspace."}
                                </Typography>
                            </Box>
                            {continueEnrollment ? (
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                    {continueEnrollment.relation === "TEACHER" ? (
                                        <Button
                                            variant="contained"
                                            endIcon={continuingCourseId === continueEnrollment.course.id ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardRoundedIcon />}
                                            disabled={continuingCourseId === continueEnrollment.course.id}
                                            onClick={() => void enrollTeacherCourseAndContinue(continueEnrollment)}
                                        >
                                            {isRu ? `Открыть ${continueEnrollment.course.title} как студент` : `Open ${continueEnrollment.course.title} as learner`}
                                        </Button>
                                    ) : (
                                        <Button component={RouterLink} to={`/learn/${continueEnrollment.course.id}${continueEnrollment.nextItemId ? `/items/${continueEnrollment.nextItemId}` : ""}`} variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
                                            {isRu ? `Продолжить ${continueEnrollment.course.title}` : `Continue ${continueEnrollment.course.title}`}
                                        </Button>
                                    )}
                                    <Button component={RouterLink} to="/courses" variant="outlined">
                                        {isRu ? "Найти ещё курсы" : "Browse more courses"}
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
                                    {isRu ? "Сводка обучения" : "Learning summary"}
                                </Typography>
                                <Stack spacing={1.2}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography sx={{ color: "text.secondary" }}>{isRu ? "Записано" : "Enrolled"}</Typography>
                                        <Typography sx={{ fontWeight: 950 }}>{items.length}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography sx={{ color: "text.secondary" }}>{isRu ? "В процессе" : "In progress"}</Typography>
                                        <Typography sx={{ fontWeight: 950 }}>{inProgress.length}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography sx={{ color: "text.secondary" }}>{isRu ? "Завершено" : "Completed"}</Typography>
                                        <Typography sx={{ fontWeight: 950 }}>{completed.length}</Typography>
                                    </Stack>
                                </Stack>
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.7 }}>
                                        {isRu ? "Средний прогресс" : "Average progress"}
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
                        title={isRu ? "Нет записей на курсы" : "No enrolled courses"}
                        description={isRu ? "Открой каталог и запишись на курс, чтобы начать обучение." : "Open the catalog and enroll in a course to start learning."}
                        action={
                            <Button component={RouterLink} to="/courses" variant="contained">
                                {isRu ? "Смотреть курсы" : "Browse courses"}
                            </Button>
                        }
                    />
                ) : null}

                {!isLoading && !error && inProgress.length > 0 ? (
                    <Stack spacing={2.2}>
                        <Typography variant="h3">{isRu ? "В процессе" : "In progress"}</Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2.5 }}>
                            {inProgress.map((item) => (
                                <LearningCourseCard key={item.course.id} enrollment={item} isStaff={isStaff} isContinuing={continuingCourseId === item.course.id} onContinue={(enrollment) => void enrollTeacherCourseAndContinue(enrollment)} />
                            ))}
                        </Box>
                    </Stack>
                ) : null}

                {!isLoading && !error && completed.length > 0 ? (
                    <Stack spacing={2.2}>
                        <Typography variant="h3">{isRu ? "Завершено" : "Completed"}</Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2.5 }}>
                            {completed.map((item) => (
                                <LearningCourseCard key={item.course.id} enrollment={item} isStaff={isStaff} isContinuing={continuingCourseId === item.course.id} onContinue={(enrollment) => void enrollTeacherCourseAndContinue(enrollment)} />
                            ))}
                        </Box>
                    </Stack>
                ) : null}
            </Stack>
        </PageContainer>
    );
}

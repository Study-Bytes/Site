import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiError, getErrorMessage } from "../../api/apiError";
import type { CourseDetails, CourseItemSummary } from "../../api/bffContracts";
import { coursesApi, learningApi } from "../../api/services";
import { useAuth } from "../../auth/useAuth";
import { useI18n } from "../../i18n/useI18n";
import { AccessTypeBadge } from "../../components/ui/AccessTypeBadge";
import { DifficultyBadge } from "../../components/ui/DifficultyBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageContainer } from "../../layouts/PageContainer";
import { formatDuration, getCourseItemCount, getCourseModuleCount, parseRouteCourseId } from "../../utils/courseFormat";
import { deadlineTypeLabel, formatDateTime } from "../../utils/moduleDeadlines";

function CourseMetric({ label, value }: { label: string; value: string | number }) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 1.5,
                background: (theme) => (theme.palette.mode === "dark" ? "rgba(31,31,40,0.78)" : "rgba(255,255,255,0.72)"),
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 950 }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.35 }}>
                {label}
            </Typography>
        </Paper>
    );
}

function CourseItemRow({ item }: { item: CourseItemSummary }) {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const stateLabel = item.locked ? (isRu ? "Закрыто" : "Locked") : item.completed ? (isRu ? "Пройдено" : "Completed") : (isRu ? "Доступно" : "Available");

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                borderRadius: 1.5,
                transition: "border-color 160ms ease, background-color 160ms ease",
                "&:hover": { borderColor: "rgba(53,37,205,0.35)", backgroundColor: "rgba(53,37,205,0.025)" },
            }}
        >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <ItemTypeBadge itemType={item.itemType} />
                    <Box>
                        <Typography sx={{ fontWeight: 900 }}>{item.title}</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {item.estimatedMinutes ? `${item.estimatedMinutes} ${isRu ? "мин" : "min"}` : (isRu ? "Без ограничения" : "Flexible")}
                        </Typography>
                    </Box>
                </Stack>
                <Chip size="small" variant="outlined" label={stateLabel} sx={{ fontWeight: 800 }} />
            </Stack>
        </Paper>
    );
}

function CourseCta({ course }: { course: CourseDetails }) {
    const { isAuthenticated } = useAuth();
    const { locale } = useI18n();
    const navigate = useNavigate();
    const location = useLocation();
    const isRu = locale === "ru";
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState<string | null>(null);
    const hasStarted = course.modules.some((module) => module.items.some((item) => item.completed));

    const enrollAndOpen = async () => {
        setIsEnrolling(true);
        setEnrollError(null);
        try {
            await learningApi.enrollCourse(course.id);
            await navigate(`/learn/${course.id}`);
        } catch (error) {
            setEnrollError(getErrorMessage(error, isRu ? "Не удалось записаться на курс" : "Failed to enroll in this course"));
        } finally {
            setIsEnrolling(false);
        }
    };

    if (course.status !== "PUBLISHED") {
        return (
            <Button variant="outlined" disabled startIcon={<LockOutlinedIcon />} fullWidth>
                {isRu ? "Курс недоступен" : "Course unavailable"}
            </Button>
        );
    }

    if (!course.enrollmentEnabled) {
        return (
            <Button variant="outlined" disabled startIcon={<LockOutlinedIcon />} fullWidth>
                {isRu ? "Запись закрыта" : "Enrollment disabled"}
            </Button>
        );
    }

    if (!isAuthenticated) {
        return (
            <Button component={RouterLink} to="/login" state={{ from: `${location.pathname}${location.search}` }} variant="contained" endIcon={<ArrowForwardRoundedIcon />} fullWidth>
                {isRu ? "Войти и начать" : "Login to start"}
            </Button>
        );
    }

    return (
        <Stack spacing={1.5}>
            <Button
                variant="contained"
                endIcon={isEnrolling ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardRoundedIcon />}
                disabled={isEnrolling}
                fullWidth
                onClick={() => void enrollAndOpen()}
            >
                {hasStarted ? (isRu ? "Продолжить обучение" : "Continue learning") : (isRu ? "Начать курс" : "Start course")}
            </Button>
            {enrollError ? <Alert severity="error">{enrollError}</Alert> : null}
        </Stack>
    );
}

export default function CourseDetailsPage() {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const { courseId } = useParams();
    const parsedCourseId = parseRouteCourseId(courseId);
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNotFound, setIsNotFound] = useState(false);

    const loadCourse = useCallback(async () => {
        if (!parsedCourseId) {
            setError("Invalid course id");
            setIsNotFound(true);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsNotFound(false);
        try {
            setCourse(await coursesApi.getCourse(parsedCourseId));
        } catch (requestError) {
            if (requestError instanceof ApiError && requestError.status === 404) {
                setIsNotFound(true);
                setError(null);
            } else {
                setError(getErrorMessage(requestError, "Failed to load course"));
            }
        } finally {
            setIsLoading(false);
        }
    }, [parsedCourseId]);

    useEffect(() => {
        void loadCourse();
    }, [loadCourse]);

    const itemCount = useMemo(() => (course ? getCourseItemCount(course) : 0), [course]);
    const moduleCount = useMemo(() => (course ? getCourseModuleCount(course) : 0), [course]);

    return (
        <PageContainer>
            {isLoading ? <LoadingState rows={4} /> : null}
            {error ? <ErrorState message={error} onRetry={loadCourse} /> : null}
            {!isLoading && isNotFound ? (
                <EmptyState
                    title={isRu ? "Курс не найден" : "Course not found"}
                    description={isRu ? "Курс не найден, ещё не опубликован или недоступен в каталоге." : "The course does not exist, is not published, or is not available in the catalog."}
                    action={
                        <Button component={RouterLink} to="/courses" variant="contained" startIcon={<ArrowBackRoundedIcon />}>
                            {isRu ? "Назад в каталог" : "Back to catalog"}
                        </Button>
                    }
                />
            ) : null}
            {!isLoading && !error && course ? (
                <Stack spacing={4.5}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: { xs: 2.5, md: 4 },
                            borderRadius: 2.5,
                            overflow: "hidden",
                            background: (theme) =>
                                theme.palette.mode === "dark"
                                    ? "radial-gradient(700px 320px at 88% 6%, rgba(60,221,199,0.12), transparent 62%), linear-gradient(135deg, #1f1f28 0%, #13121b 100%)"
                                    : "radial-gradient(700px 320px at 88% 6%, rgba(113,42,226,0.16), transparent 62%), linear-gradient(135deg, #ffffff 0%, #f4f0ff 100%)",
                        }}
                    >
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" }, gap: { xs: 3, md: 4 }, alignItems: "center" }}>
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <DifficultyBadge difficulty={course.difficulty} />
                                    <AccessTypeBadge accessType={course.accessType} />
                                    <Chip
                                        icon={course.enrollmentEnabled ? <PlayCircleOutlineRoundedIcon /> : <LockOutlinedIcon />}
                                        label={course.enrollmentEnabled ? (isRu ? "Запись открыта" : "Enrollment open") : (isRu ? "Запись закрыта" : "Enrollment disabled")}
                                        variant="outlined"
                                        sx={{ fontWeight: 900 }}
                                    />
                                </Stack>

                                <Box>
                                    <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 950 }}>
                                        {isRu ? "Описание курса" : "Course details"}
                                    </Typography>
                                    <Typography variant="h2" sx={{ mt: 1 }}>
                                        {course.title}
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: "text.secondary", mt: 1.5, lineHeight: 1.6 }}>
                                        {course.shortDescription}
                                    </Typography>
                                </Box>

                                <Typography sx={{ color: "text.secondary", lineHeight: 1.75, maxWidth: 760 }}>{course.description}</Typography>

                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1.5 }}>
                                    <CourseMetric label={isRu ? "Модули" : "Modules"} value={moduleCount} />
                                    <CourseMetric label={isRu ? "Уроки" : "Items"} value={itemCount} />
                                    <CourseMetric label={isRu ? "Длительность" : "Duration"} value={formatDuration(course.estimatedMinutes)} />
                                    <CourseMetric label={isRu ? "Статус" : "Status"} value={course.status} />
                                </Box>
                            </Stack>

                            <Stack spacing={2.5}>
                                {course.coverImageUrl ? (
                                    <Box component="img" src={course.coverImageUrl} alt={course.title} sx={{ width: "100%", borderRadius: 2, display: "block", maxHeight: 330, objectFit: "cover" }} />
                                ) : (
                                    <Paper
                                        sx={{
                                            height: 280,
                                            borderRadius: 2,
                                            display: "grid",
                                            placeItems: "center",
                                            background: (theme) =>
                                                theme.palette.mode === "dark"
                                                    ? "radial-gradient(circle at 22% 18%, rgba(195,192,255,0.24), transparent 30%), radial-gradient(circle at 82% 12%, rgba(60,221,199,0.18), transparent 28%), linear-gradient(135deg, #2a2933 0%, #13121b 100%)"
                                                    : "radial-gradient(circle at 22% 18%, rgba(53,37,205,0.28), transparent 30%), radial-gradient(circle at 82% 12%, rgba(113,42,226,0.24), transparent 28%), linear-gradient(135deg, #f8f4ff 0%, #e8e1ff 100%)",
                                        }}
                                    >
                                        <MenuBookRoundedIcon color="primary" sx={{ fontSize: 72 }} />
                                    </Paper>
                                )}
                                <Box sx={{ display: { xs: "block", md: "none" } }}>
                                    <CourseCta course={course} />
                                </Box>
                            </Stack>
                        </Box>
                    </Paper>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 320px" }, gap: 3, alignItems: "start" }}>
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography variant="h3">{isRu ? "Структура курса" : "Course structure"}</Typography>
                                <Typography sx={{ color: "text.secondary", mt: 1 }}>
                                    {isRu ? "Посмотри модули и типы заданий перед началом обучения." : "Preview modules and task types before starting the course."}
                                </Typography>
                            </Box>

                            {course.modules.length === 0 ? <EmptyState title={isRu ? "Модулей пока нет" : "No modules yet"} description={isRu ? "У курса пока нет опубликованной структуры." : "This course has no visible modules in the catalog."} /> : null}
                            {course.modules.map((module, index) => (
                                <Accordion key={module.id} defaultExpanded={index === 0} variant="outlined" sx={{ borderRadius: 1.5, overflow: "hidden", "&:before": { display: "none" } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 2, md: 2.5 }, py: 1 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                                            <Chip label={index + 1} size="small" color="primary" sx={{ fontWeight: 950 }} />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ fontWeight: 950 }}>{module.title}</Typography>
                                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                    {isRu ? `${module.items.length} уроков` : `${module.items.length} item${module.items.length === 1 ? "" : "s"}`}
                                                </Typography>
                                                {module.deadlineType !== "NONE" ? (
                                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                        {deadlineTypeLabel(module.deadlineType, isRu)}
                                                        {module.deadlineType === "ABSOLUTE" && module.deadlineAt ? ` · ${formatDateTime(module.deadlineAt, locale)}` : ""}
                                                        {module.deadlineType === "RELATIVE_FROM_START" && module.timeLimitMinutes ? ` · ${formatDuration(module.timeLimitMinutes)}` : ""}
                                                    </Typography>
                                                ) : null}
                                            </Box>
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: { xs: 2, md: 2.5 }, pb: 2.5 }}>
                                        <Stack spacing={1.2}>
                                            {module.items.length === 0 ? <Typography sx={{ color: "text.secondary" }}>{isRu ? "В этом модуле пока нет опубликованных уроков." : "This module has no visible items."}</Typography> : null}
                                            {module.items.map((item) => (
                                                <CourseItemRow key={item.id} item={item} />
                                            ))}
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>

                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, position: { md: "sticky" }, top: { md: 96 }, display: { xs: "none", md: "block" } }}>
                            <Stack spacing={2.2}>
                                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                    {isRu ? "Начать обучение" : "Start learning"}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {isRu ? "Смотреть программу курса можно без регистрации. Войди, чтобы записаться, сохранять прогресс и решать задания." : "You can view the course program without registration. Sign in to enroll, save progress and solve assignments."}
                                </Typography>
                                <CourseCta course={course} />
                                <Divider />
                                <Stack spacing={1.2}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <AccessTimeRoundedIcon fontSize="small" color="primary" />
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            {isRu ? "Примерное время" : "Estimated time"}: {formatDuration(course.estimatedMinutes)}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <MenuBookRoundedIcon fontSize="small" color="primary" />
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            {isRu ? `${moduleCount} модулей · ${itemCount} уроков` : `${moduleCount} modules · ${itemCount} items`}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Box>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 1.5,
                            display: { xs: "block", md: "none" },
                            position: "sticky",
                            bottom: 12,
                            zIndex: 2,
                            boxShadow: "0 16px 42px rgba(30,25,70,0.16)",
                        }}
                    >
                        <CourseCta course={course} />
                    </Paper>
                </Stack>
            ) : null}
        </PageContainer>
    );
}

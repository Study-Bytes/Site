import { useCallback, useEffect, useMemo, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { Link as RouterLink, useParams } from "react-router-dom";
import { getErrorMessage } from "../../api/apiError";
import type { CourseItemSummary, CourseLeaderboardResponse, LearningCourse } from "../../api/bffContracts";
import { learningApi } from "../../api/services";
import { CourseLeaderboard } from "../../components/learning/CourseLeaderboard";
import { DifficultyBadge } from "../../components/ui/DifficultyBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { useI18n } from "../../i18n/useI18n";
import { PageContainer } from "../../layouts/PageContainer";
import { formatDuration, getCourseItemCount, getCourseModuleCount } from "../../utils/courseFormat";

function parseId(value: string | undefined) {
    const id = Number(value);
    return Number.isFinite(id) ? id : null;
}

function itemState(item: CourseItemSummary, isRu: boolean) {
    if (item.locked) return { label: isRu ? "Закрыто" : "Locked", icon: <LockOutlinedIcon fontSize="small" />, color: "default" as const };
    if (item.completed) return { label: isRu ? "Пройдено" : "Completed", icon: <CheckCircleRoundedIcon fontSize="small" />, color: "success" as const };
    return { label: isRu ? "Доступно" : "Available", icon: <PlayCircleOutlineRoundedIcon fontSize="small" />, color: "primary" as const };
}

function LearningItemRow({ courseId, item }: { courseId: number; item: CourseItemSummary }) {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const state = itemState(item, isRu);

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.6,
                borderRadius: 1.5,
                bgcolor: item.locked ? "action.hover" : "background.paper",
            }}
        >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
                    <ItemTypeBadge itemType={item.itemType} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900 }}>{item.title}</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {item.estimatedMinutes ? `${item.estimatedMinutes} ${isRu ? "мин" : "min"}` : (isRu ? "Без ограничения" : "Flexible pace")}
                        </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                    <Chip size="small" icon={state.icon} label={state.label} color={state.color} variant="outlined" sx={{ fontWeight: 900 }} />
                    <Button component={RouterLink} to={`/learn/${courseId}/items/${item.id}`} size="small" variant={item.completed ? "outlined" : "contained"} disabled={item.locked}>
                        {item.completed ? (isRu ? "Повторить" : "Review") : (isRu ? "Открыть" : "Open")}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}

export default function LearningCoursePage() {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const { courseId } = useParams();
    const parsedCourseId = parseId(courseId);
    const [course, setCourse] = useState<LearningCourse | null>(null);
    const [leaderboard, setLeaderboard] = useState<CourseLeaderboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

    const loadCourse = useCallback(async () => {
        if (!parsedCourseId) {
            setError("Invalid course id");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            setCourse(await learningApi.getLearningCourse(parsedCourseId));
        } catch (requestError) {
            setError(getErrorMessage(requestError, isRu ? "Не удалось загрузить курс" : "Failed to load learning course"));
        } finally {
            setIsLoading(false);
        }
    }, [isRu, parsedCourseId]);

    const loadLeaderboard = useCallback(async () => {
        if (!parsedCourseId) {
            setIsLeaderboardLoading(false);
            return;
        }
        setIsLeaderboardLoading(true);
        setLeaderboardError(null);
        try {
            setLeaderboard(await learningApi.getCourseLeaderboard(parsedCourseId));
        } catch (requestError) {
            setLeaderboardError(getErrorMessage(requestError, isRu ? "Не удалось загрузить рейтинг курса" : "Failed to load course leaderboard"));
        } finally {
            setIsLeaderboardLoading(false);
        }
    }, [isRu, parsedCourseId]);

    useEffect(() => {
        void loadCourse();
    }, [loadCourse]);

    useEffect(() => {
        void loadLeaderboard();
    }, [loadLeaderboard]);

    const itemCount = useMemo(() => (course ? getCourseItemCount(course) : 0), [course]);
    const moduleCount = useMemo(() => (course ? getCourseModuleCount(course) : 0), [course]);
    const completedCount = useMemo(() => course?.modules.flatMap((module) => module.items).filter((item) => item.completed).length ?? 0, [course]);

    return (
        <PageContainer>
            {isLoading ? <LoadingState rows={4} /> : null}
            {error ? <ErrorState message={error} onRetry={loadCourse} /> : null}
            {!isLoading && !error && course ? (
                <Stack spacing={4}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: { xs: 3, md: 5 },
                            borderRadius: 2.5,
                            background: (theme) =>
                                theme.palette.mode === "dark"
                                    ? "radial-gradient(720px 320px at 88% 0%, rgba(60,221,199,0.12), transparent 62%), linear-gradient(135deg, #1f1f28 0%, #13121b 100%)"
                                    : "radial-gradient(720px 320px at 88% 0%, rgba(113,42,226,0.15), transparent 62%), linear-gradient(135deg, #ffffff 0%, #f4f0ff 100%)",
                        }}
                    >
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) 300px" }, gap: 3, alignItems: "center" }}>
                            <Stack spacing={2.5}>
                                <Button component={RouterLink} to="/my-learning" variant="text" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }}>
                                    {isRu ? "Моё обучение" : "My Learning"}
                                </Button>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <DifficultyBadge difficulty={course.difficulty} />
                                    <Chip label={course.enrollmentStatus} color={course.enrollmentStatus === "COMPLETED" ? "success" : "primary"} variant="outlined" sx={{ fontWeight: 900 }} />
                                </Stack>
                                <Box>
                                    <Typography variant="h2">{course.title}</Typography>
                                    <Typography sx={{ color: "text.secondary", mt: 1.4, lineHeight: 1.7, maxWidth: 820 }}>{course.description || course.shortDescription}</Typography>
                                </Box>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                    {course.nextItemId ? (
                                        <Button component={RouterLink} to={`/learn/${course.id}/items/${course.nextItemId}`} variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
                                            {isRu ? "Продолжить следующий урок" : "Continue next item"}
                                        </Button>
                                    ) : null}
                                    <Button component={RouterLink} to="/courses" variant="outlined">
                                        {isRu ? "Каталог курсов" : "Browse catalog"}
                                    </Button>
                                </Stack>
                            </Stack>

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    background: (theme) => (theme.palette.mode === "dark" ? "rgba(31,31,40,0.78)" : "rgba(255,255,255,0.74)"),
                                }}
                            >
                                <Stack spacing={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                        {isRu ? "Прогресс курса" : "Course progress"}
                                    </Typography>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                                            <Typography sx={{ fontWeight: 900 }}>{course.progressPercent}%</Typography>
                                            <Typography sx={{ color: "text.secondary" }}>{completedCount}/{itemCount} {isRu ? "уроков" : "items"}</Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={course.progressPercent} sx={{ height: 10, borderRadius: 999 }} />
                                    </Box>
                                    <Stack spacing={1}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography sx={{ color: "text.secondary" }}>{isRu ? "Модули" : "Modules"}</Typography>
                                            <Typography sx={{ fontWeight: 950 }}>{moduleCount}</Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography sx={{ color: "text.secondary" }}>{isRu ? "Длительность" : "Duration"}</Typography>
                                            <Typography sx={{ fontWeight: 950 }}>{formatDuration(course.estimatedMinutes)}</Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Box>
                    </Paper>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "320px minmax(0, 1fr)" }, gap: 3, alignItems: "start" }}>
                        <Stack spacing={2.5} sx={{ position: { md: "sticky" }, top: { md: 96 } }}>
                            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                                <Stack spacing={1.7}>
                                    <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                        {isRu ? "Навигация по курсу" : "Course navigation"}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        {isRu ? "Открывайте доступные уроки. Пройденные уроки остаются доступными для повторения." : "Open any available item. Completed items stay available for review."}
                                    </Typography>
                                    <LinearProgress variant="determinate" value={course.progressPercent} sx={{ height: 7, borderRadius: 999 }} />
                                </Stack>
                            </Paper>
                            <CourseLeaderboard leaderboard={leaderboard} isLoading={isLeaderboardLoading} error={leaderboardError} onRetry={loadLeaderboard} />
                        </Stack>

                        <Stack spacing={2.5}>
                            {course.modules.length === 0 ? <EmptyState title={isRu ? "Модулей пока нет" : "No modules"} description={isRu ? "В этом курсе пока нет учебной структуры." : "This enrolled course has no modules yet."} /> : null}
                            {course.modules.map((module, index) => (
                                <Accordion key={module.id} defaultExpanded={index === 0} variant="outlined" sx={{ borderRadius: 1.5, overflow: "hidden", "&:before": { display: "none" } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 2, md: 2.6 }, py: 1 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Chip label={index + 1} color="primary" size="small" sx={{ fontWeight: 950 }} />
                                            <Box>
                                                <Typography sx={{ fontWeight: 950 }}>{module.title}</Typography>
                                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                    {isRu ? `${module.items.length} уроков` : `${module.items.length} item${module.items.length === 1 ? "" : "s"}`}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: { xs: 2, md: 2.6 }, pb: 2.5 }}>
                                        <Stack spacing={1.2}>
                                            {module.items.map((item) => (
                                                <LearningItemRow key={item.id} courseId={course.id} item={item} />
                                            ))}
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>
                    </Box>
                </Stack>
            ) : null}
        </PageContainer>
    );
}

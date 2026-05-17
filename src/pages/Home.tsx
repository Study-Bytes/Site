import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { Link as RouterLink } from "react-router-dom";
import { getErrorMessage } from "../api/apiError";
import type { CourseCatalogItem } from "../api/bffContracts";
import { coursesApi } from "../api/services";
import { useI18n } from "../i18n/useI18n";
import { CourseCard } from "../components/course/CourseCard";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";

function FeatureCard({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 3,
                borderRadius: 2,
                height: "100%",
                background: (theme) => (theme.palette.mode === "dark" ? "rgba(31,31,40,0.78)" : "rgba(255,255,255,0.72)"),
                backdropFilter: "blur(10px)",
            }}
        >
            <Stack spacing={1.5}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.25,
                        display: "grid",
                        placeItems: "center",
                        color: "primary.main",
                        bgcolor: "rgba(53,37,205,0.09)",
                    }}
                >
                    {icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                    {title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.65 }}>{text}</Typography>
            </Stack>
        </Paper>
    );
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 1.5,
                textAlign: "center",
                background: (theme) => (theme.palette.mode === "dark" ? "rgba(31,31,40,0.78)" : "rgba(255,255,255,0.72)"),
            }}
        >
            <Typography variant="h5" sx={{ fontWeight: 950, color: "primary.main" }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                {label}
            </Typography>
        </Paper>
    );
}

function CodePreviewCard() {
    const { locale } = useI18n();
    const isRu = locale === "ru";

    return (
        <Paper
            variant="outlined"
            sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 2.5,
                overflow: "hidden",
                background: (theme) =>
                    theme.palette.mode === "dark"
                        ? "linear-gradient(145deg, rgba(31,31,40,0.96) 0%, rgba(19,18,27,0.94) 100%)"
                        : "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(242,238,255,0.9) 100%)",
                boxShadow: (theme) => (theme.palette.mode === "dark" ? "0 30px 80px rgba(0,0,0,0.34)" : "0 30px 80px rgba(53,37,205,0.12)"),
            }}
        >
            <Box component="img" src="/hero-study.jpg" alt="Study workspace" sx={{ width: "100%", borderRadius: 2, display: "block", mb: 2 }} />
            <Paper
                sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: "#151321",
                    color: "#f7f3ff",
                    fontFamily: "monospace",
                    fontSize: { xs: 12, sm: 13 },
                    overflow: "hidden",
                }}
            >
                <Stack spacing={1}>
                    <Typography component="div" sx={{ color: "#9a91ff", fontFamily: "inherit", fontSize: "inherit" }}>
                        public int sum(int a, int b) &#123;
                    </Typography>
                    <Typography component="div" sx={{ pl: 2, fontFamily: "inherit", fontSize: "inherit" }}>
                        return a + b;
                    </Typography>
                    <Typography component="div" sx={{ color: "#9a91ff", fontFamily: "inherit", fontSize: "inherit" }}>
                        &#125;
                    </Typography>
                    <Typography component="div" sx={{ color: "#8ee6a7", fontFamily: "inherit", fontSize: "inherit" }}>
                        {isRu ? "OK 4/4 проверки пройдены" : "OK 4/4 tests passed"}
                    </Typography>
                </Stack>
            </Paper>
        </Paper>
    );
}

export default function Home() {
    const { locale, t } = useI18n();
    const isRu = locale === "ru";
    const [featuredCourses, setFeaturedCourses] = useState<CourseCatalogItem[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [coursesError, setCoursesError] = useState<string | null>(null);

    const loadFeaturedCourses = useCallback(async () => {
        setIsLoadingCourses(true);
        setCoursesError(null);
        try {
            const courses = await coursesApi.listCourses({ size: 3, page: 0, enrollmentEnabled: true });
            setFeaturedCourses(courses.slice(0, 3));
        } catch (error) {
            setCoursesError(getErrorMessage(error, "Failed to load featured courses"));
        } finally {
            setIsLoadingCourses(false);
        }
    }, []);

    useEffect(() => {
        void loadFeaturedCourses();
    }, [loadFeaturedCourses]);

    return (
        <Box>
            <Box
                component="section"
                sx={{
                    pt: { xs: 12, md: 17 },
                    pb: { xs: 7, md: 12 },
                    background: (theme) =>
                        theme.palette.mode === "dark"
                            ? "radial-gradient(1000px 480px at 16% 6%, rgba(195,192,255,0.16), transparent 62%), radial-gradient(760px 420px at 88% 18%, rgba(60,221,199,0.11), transparent 58%), linear-gradient(180deg, #13121b 0%, #0e0d16 100%)"
                            : "radial-gradient(1000px 480px at 16% 6%, rgba(53,37,205,0.18), transparent 62%), radial-gradient(760px 420px at 88% 18%, rgba(113,42,226,0.14), transparent 58%), linear-gradient(180deg, #fcf8ff 0%, #ffffff 100%)",
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" },
                            gap: { xs: 5, md: 7 },
                            alignItems: "center",
                        }}
                    >
                        <Stack spacing={3.2}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "primary.main" }}>
                                <VerifiedRoundedIcon fontSize="small" />
                                <Typography variant="overline" sx={{ fontWeight: 950, letterSpacing: 1 }}>
                                    {t("home.eyebrow")}
                                </Typography>
                            </Stack>
                            <Typography variant="h1" sx={{ maxWidth: 760 }}>
                                {t("home.heroTitle")}
                            </Typography>
                            <Typography variant="h6" sx={{ color: "text.secondary", maxWidth: 700, lineHeight: 1.65 }}>
                                {t("home.heroSubtitle")}
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Button component={RouterLink} to="/courses" size="large" variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
                                    {t("home.browseCourses")}
                                </Button>
                                <Button component={RouterLink} to="/register" size="large" variant="outlined">
                                    {t("home.createAccount")}
                                </Button>
                            </Stack>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" }, gap: 1.5, maxWidth: 620 }}>
                                <StatCard value="5" label={isRu ? "типов уроков" : "item types"} />
                                <StatCard value="24/7" label={isRu ? "доступ к курсам" : "course access"} />
                                <StatCard value="100%" label={isRu ? "практический формат" : "practice focused"} />
                            </Box>
                        </Stack>

                        <CodePreviewCard />
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
                <Stack spacing={4}>
                    <Box sx={{ maxWidth: 720 }}>
                        <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 950 }}>
                            {isRu ? "Возможности платформы" : "Platform capabilities"}
                        </Typography>
                        <Typography variant="h2" sx={{ mt: 1 }}>
                            {isRu ? "Обучение с понятным прогрессом" : "Built for measurable progress"}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 3 }}>
                        <FeatureCard title={isRu ? "Структурные курсы" : "Structured courses"} text={isRu ? "Модули и уроки выстроены в понятный учебный маршрут." : "Modules and lessons are organized for predictable learning paths."} icon={<SchoolRoundedIcon />} />
                        <FeatureCard title={isRu ? "Практические задачи" : "Coding tasks"} text={isRu ? "Пиши код, запускай решения и получай обратную связь по проверкам." : "Practice with executable tasks, starter code and test feedback."} icon={<CodeRoundedIcon />} />
                        <FeatureCard title={isRu ? "Короткие тесты" : "Quizzes"} text={isRu ? "Проверяй понимание теории перед практическими заданиями." : "Check understanding with fast theory checkpoints before practice."} icon={<FactCheckRoundedIcon />} />
                        <FeatureCard title={isRu ? "Отслеживание прогресса" : "Progress tracking"} text={isRu ? "Продолжай обучение с того места, где остановился." : "Continue learning from the exact place where you stopped."} icon={<TimelineRoundedIcon />} />
                    </Box>
                </Stack>
            </Container>

            <Box component="section" sx={{ py: { xs: 6, md: 9 }, bgcolor: (theme) => (theme.palette.mode === "dark" ? "#1b1b24" : "rgba(245,241,255,0.68)") }}>
                <Container maxWidth="lg">
                    <Stack spacing={4}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "flex-end" }} justifyContent="space-between">
                            <Box>
                                <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 950 }}>
                                    {isRu ? "Каталог курсов" : "Course catalog"}
                                </Typography>
                                <Typography variant="h2" sx={{ mt: 1 }}>
                                    {isRu ? "Рекомендуемые курсы" : "Featured courses"}
                                </Typography>
                                <Typography sx={{ color: "text.secondary", mt: 1, maxWidth: 650 }}>
                                    {isRu ? "Выбирай опубликованные курсы и начинай обучение в удобном темпе." : "Choose published courses and start learning at your own pace."}
                                </Typography>
                            </Box>
                            <Button component={RouterLink} to="/courses" variant="outlined" endIcon={<ArrowForwardRoundedIcon />} sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
                                {isRu ? "Все курсы" : "View all courses"}
                            </Button>
                        </Stack>

                        {isLoadingCourses ? <LoadingState rows={3} /> : null}
                        {coursesError ? <ErrorState message={coursesError} onRetry={loadFeaturedCourses} /> : null}
                        {!isLoadingCourses && !coursesError && featuredCourses.length === 0 ? (
                            <EmptyState
                                title="No public courses yet"
                                description={isRu ? "После публикации курсов преподавателями они появятся здесь." : "Once courses are published by teachers, they will appear here."}
                                action={
                                    <Button component={RouterLink} to="/courses" variant="contained">
                                        {isRu ? "Открыть каталог" : "Open catalog"}
                                    </Button>
                                }
                            />
                        ) : null}
                        {!isLoadingCourses && !coursesError && featuredCourses.length > 0 ? (
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
                                {featuredCourses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </Box>
                        ) : null}
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 2.5,
                        overflow: "hidden",
                        background: (theme) =>
                            theme.palette.mode === "dark"
                                ? "radial-gradient(600px 260px at 90% 10%, rgba(60,221,199,0.12), transparent 60%), linear-gradient(135deg, #1f1f28 0%, #13121b 100%)"
                                : "radial-gradient(600px 260px at 90% 10%, rgba(113,42,226,0.18), transparent 60%), linear-gradient(135deg, #ffffff 0%, #f3efff 100%)",
                    }}
                >
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                        <Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "primary.main", mb: 1 }}>
                                <TerminalRoundedIcon fontSize="small" />
                                <Typography variant="overline" sx={{ fontWeight: 950 }}>
                                    {isRu ? "Учебная платформа готова к работе" : "Ready for learning"}
                                </Typography>
                            </Stack>
                            <Typography variant="h3">{isRu ? "Курсы, задания и прогресс собраны в одном удобном кабинете." : "Courses, tasks and progress are kept in one clear workspace."}</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1.5, maxWidth: 740 }}>
                                {isRu ? "Учись, отслеживай результаты и возвращайся к нужному уроку без лишних технических деталей." : "Learn, track results and return to the right lesson without technical friction."}
                            </Typography>
                        </Box>
                        <Button component={RouterLink} to="/courses" size="large" variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
                            {isRu ? "Перейти к курсам" : "Start exploring"}
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

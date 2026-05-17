import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { getErrorMessage } from "../../api/apiError";
import type { CourseAccessType, CourseCatalogItem, CourseCatalogQuery, CourseDifficulty } from "../../api/bffContracts";
import { coursesApi } from "../../api/services";
import { CourseCard } from "../../components/course/CourseCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageContainer } from "../../layouts/PageContainer";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../../i18n/useI18n";

type DifficultyFilter = CourseDifficulty | "ALL";
type AccessFilter = CourseAccessType | "ALL";
type EnrollmentFilter = "ALL" | "OPEN" | "DISABLED";
type DurationFilter = "ALL" | "SHORT" | "MEDIUM" | "LONG";
type SortOption = "RELEVANCE" | "DURATION_ASC" | "DURATION_DESC" | "TITLE_ASC";

function getDurationRange(duration: DurationFilter): Pick<CourseCatalogQuery, "minEstimatedMinutes" | "maxEstimatedMinutes"> {
    if (duration === "SHORT") return { maxEstimatedMinutes: 180 };
    if (duration === "MEDIUM") return { minEstimatedMinutes: 181, maxEstimatedMinutes: 480 };
    if (duration === "LONG") return { minEstimatedMinutes: 481 };
    return {};
}

function courseMatchesClientFilters(course: CourseCatalogItem, filters: { query: string; difficulty: DifficultyFilter; accessType: AccessFilter; enrollment: EnrollmentFilter; duration: DurationFilter }) {
    const normalizedQuery = filters.query.trim().toLowerCase();
    const estimatedMinutes = course.estimatedMinutes ?? 0;

    const matchesQuery =
        !normalizedQuery ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.shortDescription.toLowerCase().includes(normalizedQuery) ||
        course.slug.toLowerCase().includes(normalizedQuery);
    const matchesDifficulty = filters.difficulty === "ALL" || course.difficulty === filters.difficulty;
    const matchesAccess = filters.accessType === "ALL" || course.accessType === filters.accessType;
    const matchesEnrollment =
        filters.enrollment === "ALL" ||
        (filters.enrollment === "OPEN" && course.enrollmentEnabled) ||
        (filters.enrollment === "DISABLED" && !course.enrollmentEnabled);
    const matchesDuration =
        filters.duration === "ALL" ||
        (filters.duration === "SHORT" && estimatedMinutes > 0 && estimatedMinutes <= 180) ||
        (filters.duration === "MEDIUM" && estimatedMinutes >= 181 && estimatedMinutes <= 480) ||
        (filters.duration === "LONG" && estimatedMinutes >= 481);

    return matchesQuery && matchesDifficulty && matchesAccess && matchesEnrollment && matchesDuration;
}

function sortCourses(courses: CourseCatalogItem[], sort: SortOption) {
    const sorted = [...courses];
    if (sort === "TITLE_ASC") return sorted.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "DURATION_ASC") return sorted.sort((a, b) => (a.estimatedMinutes ?? Number.MAX_SAFE_INTEGER) - (b.estimatedMinutes ?? Number.MAX_SAFE_INTEGER));
    if (sort === "DURATION_DESC") return sorted.sort((a, b) => (b.estimatedMinutes ?? 0) - (a.estimatedMinutes ?? 0));
    return sorted;
}

export default function CoursesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const urlSearch = searchParams.get("search") ?? "";
    const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState(urlSearch);
    const [difficulty, setDifficulty] = useState<DifficultyFilter>("ALL");
    const [accessType, setAccessType] = useState<AccessFilter>("ALL");
    const [enrollment, setEnrollment] = useState<EnrollmentFilter>("ALL");
    const [duration, setDuration] = useState<DurationFilter>("ALL");
    const [sort, setSort] = useState<SortOption>("RELEVANCE");
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

    useEffect(() => {
        setQuery(urlSearch);
    }, [urlSearch]);

    const setSearchQuery = (value: string) => {
        setQuery(value);
        const next = new URLSearchParams(searchParams);
        if (value.trim()) next.set("search", value.trim());
        else next.delete("search");
        setSearchParams(next, { replace: true });
    };

    const resetFilters = () => {
        setSearchQuery("");
        setDifficulty("ALL");
        setAccessType("ALL");
        setEnrollment("ALL");
        setDuration("ALL");
        setSort("RELEVANCE");
        setSearchParams({}, { replace: true });
    };

    const loadCourses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const durationRange = getDurationRange(duration);
            const response = await coursesApi.listCourses({
                search: query.trim() || undefined,
                difficulty: difficulty === "ALL" ? undefined : difficulty,
                accessType: accessType === "ALL" ? undefined : accessType,
                enrollmentEnabled: enrollment === "ALL" ? undefined : enrollment === "OPEN",
                ...durationRange,
                page: 0,
                size: 50,
            });
            setCourses(response);
        } catch (requestError) {
            setError(getErrorMessage(requestError, isRu ? "Не удалось загрузить курсы" : "Failed to load courses"));
        } finally {
            setIsLoading(false);
        }
    }, [accessType, difficulty, duration, enrollment, isRu, query]);

    useEffect(() => {
        void loadCourses();
    }, [loadCourses]);

    const visibleCourses = useMemo(() => {
        const filtered = courses.filter((course) => courseMatchesClientFilters(course, { query, difficulty, accessType, enrollment, duration }));
        return sortCourses(filtered, sort);
    }, [accessType, courses, difficulty, duration, enrollment, query, sort]);

    const activeFilterCount = [difficulty !== "ALL", accessType !== "ALL", enrollment !== "ALL", duration !== "ALL", query.trim() !== ""].filter(Boolean).length;

    const filterControls = (
        <Stack spacing={2.2}>
            <TextField
                value={query}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={isRu ? "Название, тема или адрес курса" : "Search by title, topic or slug"}
                label={isRu ? "Поиск" : "Search"}
                fullWidth
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchRoundedIcon color="action" />
                        </InputAdornment>
                    ),
                }}
            />
            <TextField select label={isRu ? "Сложность" : "Difficulty"} value={difficulty} onChange={(event) => setDifficulty(event.target.value as DifficultyFilter)} fullWidth>
                <MenuItem value="ALL">{isRu ? "Любая сложность" : "All difficulties"}</MenuItem>
                <MenuItem value="BEGINNER">{isRu ? "Начальный" : "Beginner"}</MenuItem>
                <MenuItem value="INTERMEDIATE">{isRu ? "Средний" : "Intermediate"}</MenuItem>
                <MenuItem value="ADVANCED">{isRu ? "Продвинутый" : "Advanced"}</MenuItem>
            </TextField>
            <TextField select label={isRu ? "Доступ" : "Access type"} value={accessType} onChange={(event) => setAccessType(event.target.value as AccessFilter)} fullWidth>
                <MenuItem value="ALL">{isRu ? "Любой доступ" : "All access types"}</MenuItem>
                <MenuItem value="PUBLIC">{isRu ? "Открытый" : "Public"}</MenuItem>
                <MenuItem value="UNLISTED">{isRu ? "По ссылке" : "Unlisted"}</MenuItem>
                <MenuItem value="PRIVATE">{isRu ? "Закрытый" : "Private"}</MenuItem>
            </TextField>
            <TextField select label={isRu ? "Запись" : "Enrollment"} value={enrollment} onChange={(event) => setEnrollment(event.target.value as EnrollmentFilter)} fullWidth>
                <MenuItem value="ALL">{isRu ? "Любое состояние" : "Any enrollment state"}</MenuItem>
                <MenuItem value="OPEN">{isRu ? "Запись открыта" : "Enrollment open"}</MenuItem>
                <MenuItem value="DISABLED">{isRu ? "Запись закрыта" : "Enrollment disabled"}</MenuItem>
            </TextField>
            <TextField select label={isRu ? "Длительность" : "Duration"} value={duration} onChange={(event) => setDuration(event.target.value as DurationFilter)} fullWidth>
                <MenuItem value="ALL">{isRu ? "Любая длительность" : "Any duration"}</MenuItem>
                <MenuItem value="SHORT">{isRu ? "До 3 часов" : "Up to 3 hours"}</MenuItem>
                <MenuItem value="MEDIUM">{isRu ? "3-8 часов" : "3-8 hours"}</MenuItem>
                <MenuItem value="LONG">{isRu ? "8+ часов" : "8+ hours"}</MenuItem>
            </TextField>
            <TextField select label={isRu ? "Сортировка" : "Sort"} value={sort} onChange={(event) => setSort(event.target.value as SortOption)} fullWidth>
                <MenuItem value="RELEVANCE">{isRu ? "Рекомендованные" : "Recommended"}</MenuItem>
                <MenuItem value="DURATION_ASC">{isRu ? "Сначала короткие" : "Shortest first"}</MenuItem>
                <MenuItem value="DURATION_DESC">{isRu ? "Сначала длинные" : "Longest first"}</MenuItem>
                <MenuItem value="TITLE_ASC">{isRu ? "По названию А-Я" : "Title A-Z"}</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={resetFilters} disabled={activeFilterCount === 0}>
                {isRu ? "Сбросить фильтры" : "Reset filters"}
            </Button>
        </Stack>
    );

    return (
        <PageContainer>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "300px 1fr" }, gap: { xs: 3, md: 4 }, alignItems: "start" }}>
                <Stack spacing={3} sx={{ display: { xs: "none", md: "flex" }, position: "sticky", top: 96 }}>
                    <Box>
                        <Typography variant="h4">{isRu ? "Каталог" : "Explore"}</Typography>
                        <Typography sx={{ color: "text.secondary", mt: 0.7 }}>
                            {isRu ? "Найди следующий навык для изучения." : "Find your next technical skill."}
                        </Typography>
                    </Box>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Stack spacing={2.2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <TuneRoundedIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                    {isRu ? "Фильтры" : "Filters"}
                                </Typography>
                            </Stack>
                            <Divider />
                            {filterControls}
                        </Stack>
                    </Paper>
                </Stack>

                <Stack spacing={3}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "flex-start" }} justifyContent="space-between">
                        <Box>
                            <Typography variant="h2">{isRu ? "Рекомендуемые курсы" : "Recommended Courses"}</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 0.8, display: { xs: "block", md: "none" } }}>
                                {isRu ? "Выбирай опубликованные курсы и развивай навыки на практике." : "Discover high-quality educational content to advance your skills."}
                            </Typography>
                        </Box>
                        <Chip label={isRu ? `Найдено: ${visibleCourses.length}` : `Showing ${visibleCourses.length} result${visibleCourses.length === 1 ? "" : "s"}`} variant="outlined" sx={{ fontWeight: 900, alignSelf: { xs: "flex-start", md: "center" } }} />
                    </Stack>

                    <TextField
                        value={query}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={isRu ? "Курс, тема или навык..." : "Search for courses, topics, or skills..."}
                        fullWidth
                        sx={{ display: { xs: "block", md: "none" } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, display: { xs: "block", md: "none" } }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <FilterListRoundedIcon color="primary" />
                                    <Typography sx={{ fontWeight: 900 }}>{activeFilterCount ? (isRu ? `Активно: ${activeFilterCount}` : `${activeFilterCount} active filters`) : (isRu ? "Фильтры" : "Filters")}</Typography>
                                </Stack>
                                <Button variant="outlined" onClick={() => setFilterDrawerOpen(true)}>
                                    {isRu ? "Открыть" : "Open"}
                                </Button>
                            </Stack>
                        </Paper>

                        {activeFilterCount > 0 ? (
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {query.trim() ? <Chip label={`${isRu ? "Поиск" : "Search"}: ${query.trim()}`} onDelete={() => setSearchQuery("")} /> : null}
                                {difficulty !== "ALL" ? <Chip label={`${isRu ? "Сложность" : "Difficulty"}: ${difficulty}`} onDelete={() => setDifficulty("ALL")} /> : null}
                                {accessType !== "ALL" ? <Chip label={`${isRu ? "Доступ" : "Access"}: ${accessType}`} onDelete={() => setAccessType("ALL")} /> : null}
                                {enrollment !== "ALL" ? <Chip label={enrollment === "OPEN" ? (isRu ? "Запись открыта" : "Enrollment open") : (isRu ? "Запись закрыта" : "Enrollment disabled")} onDelete={() => setEnrollment("ALL")} /> : null}
                                {duration !== "ALL" ? <Chip label={`${isRu ? "Длительность" : "Duration"}: ${duration}`} onDelete={() => setDuration("ALL")} /> : null}
                            </Stack>
                        ) : null}

                        {isLoading ? <LoadingState rows={4} /> : null}
                        {error ? <ErrorState message={error} onRetry={loadCourses} /> : null}
                        {!isLoading && !error && visibleCourses.length === 0 ? (
                            <EmptyState
                                title={isRu ? "Курсы не найдены" : "No courses found"}
                                description={isRu ? "Попробуй изменить поиск или сбросить фильтры." : "Try clearing filters or changing your search query."}
                                action={
                                    <Button variant="contained" onClick={resetFilters} disabled={activeFilterCount === 0}>
                                        {isRu ? "Сбросить фильтры" : "Reset filters"}
                                    </Button>
                                }
                            />
                        ) : null}
                        {!isLoading && !error && visibleCourses.length > 0 ? (
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3 }}>
                                {visibleCourses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </Box>
                        ) : null}
                </Stack>
            </Box>

            <Drawer anchor="bottom" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} PaperProps={{ sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24 } }}>
                <Box sx={{ p: 2.5, pb: 4 }}>
                    <Stack spacing={2.2}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                {isRu ? "Фильтры каталога" : "Catalog filters"}
                            </Typography>
                            <IconButton onClick={() => setFilterDrawerOpen(false)}>
                                <CloseRoundedIcon />
                            </IconButton>
                        </Stack>
                        <Divider />
                        {filterControls}
                        <Button variant="contained" onClick={() => setFilterDrawerOpen(false)}>
                            {isRu ? "Показать курсы" : "Show courses"}
                        </Button>
                    </Stack>
                </Box>
            </Drawer>
        </PageContainer>
    );
}

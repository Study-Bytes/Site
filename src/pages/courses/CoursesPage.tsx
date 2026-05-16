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
    const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [difficulty, setDifficulty] = useState<DifficultyFilter>("ALL");
    const [accessType, setAccessType] = useState<AccessFilter>("ALL");
    const [enrollment, setEnrollment] = useState<EnrollmentFilter>("ALL");
    const [duration, setDuration] = useState<DurationFilter>("ALL");
    const [sort, setSort] = useState<SortOption>("RELEVANCE");
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

    const resetFilters = () => {
        setQuery("");
        setDifficulty("ALL");
        setAccessType("ALL");
        setEnrollment("ALL");
        setDuration("ALL");
        setSort("RELEVANCE");
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
            setError(getErrorMessage(requestError, "Failed to load courses"));
        } finally {
            setIsLoading(false);
        }
    }, [accessType, difficulty, duration, enrollment, query]);

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
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, topic or slug"
                label="Search"
                fullWidth
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchRoundedIcon color="action" />
                        </InputAdornment>
                    ),
                }}
            />
            <TextField select label="Difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value as DifficultyFilter)} fullWidth>
                <MenuItem value="ALL">All difficulties</MenuItem>
                <MenuItem value="BEGINNER">Beginner</MenuItem>
                <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                <MenuItem value="ADVANCED">Advanced</MenuItem>
            </TextField>
            <TextField select label="Access type" value={accessType} onChange={(event) => setAccessType(event.target.value as AccessFilter)} fullWidth>
                <MenuItem value="ALL">All access types</MenuItem>
                <MenuItem value="PUBLIC">Public</MenuItem>
                <MenuItem value="UNLISTED">Unlisted</MenuItem>
                <MenuItem value="PRIVATE">Private</MenuItem>
            </TextField>
            <TextField select label="Enrollment" value={enrollment} onChange={(event) => setEnrollment(event.target.value as EnrollmentFilter)} fullWidth>
                <MenuItem value="ALL">Any enrollment state</MenuItem>
                <MenuItem value="OPEN">Enrollment open</MenuItem>
                <MenuItem value="DISABLED">Enrollment disabled</MenuItem>
            </TextField>
            <TextField select label="Duration" value={duration} onChange={(event) => setDuration(event.target.value as DurationFilter)} fullWidth>
                <MenuItem value="ALL">Any duration</MenuItem>
                <MenuItem value="SHORT">Up to 3 hours</MenuItem>
                <MenuItem value="MEDIUM">3-8 hours</MenuItem>
                <MenuItem value="LONG">8+ hours</MenuItem>
            </TextField>
            <TextField select label="Sort" value={sort} onChange={(event) => setSort(event.target.value as SortOption)} fullWidth>
                <MenuItem value="RELEVANCE">Recommended</MenuItem>
                <MenuItem value="DURATION_ASC">Shortest first</MenuItem>
                <MenuItem value="DURATION_DESC">Longest first</MenuItem>
                <MenuItem value="TITLE_ASC">Title A-Z</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={resetFilters} disabled={activeFilterCount === 0}>
                Reset filters
            </Button>
        </Stack>
    );

    return (
        <PageContainer>
            <Stack spacing={4}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 6,
                        background:
                            "radial-gradient(620px 260px at 88% 4%, rgba(113,42,226,0.16), transparent 62%), linear-gradient(135deg, #ffffff 0%, #f4f0ff 100%)",
                    }}
                >
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "flex-end" }}>
                        <Box sx={{ maxWidth: 760 }}>
                            <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 950 }}>
                                Course catalog
                            </Typography>
                            <Typography variant="h2" sx={{ mt: 1 }}>
                                Choose a course and start building skill through practice.
                            </Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1.5, lineHeight: 1.65 }}>
                                Browse published StudyBytes courses through the BFF contract. Use filters to narrow by difficulty, access type, enrollment state and duration.
                            </Typography>
                        </Box>
                        <Chip label={`${visibleCourses.length} course${visibleCourses.length === 1 ? "" : "s"}`} color="primary" variant="outlined" sx={{ fontWeight: 900 }} />
                    </Stack>
                </Paper>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "300px 1fr" }, gap: 3, alignItems: "start" }}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 5, display: { xs: "none", md: "block" }, position: "sticky", top: 96 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <TuneRoundedIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                    Filters
                                </Typography>
                            </Stack>
                            <Divider />
                            {filterControls}
                        </Stack>
                    </Paper>

                    <Stack spacing={3}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, display: { xs: "block", md: "none" } }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <FilterListRoundedIcon color="primary" />
                                    <Typography sx={{ fontWeight: 900 }}>{activeFilterCount ? `${activeFilterCount} active filters` : "Filters"}</Typography>
                                </Stack>
                                <Button variant="outlined" onClick={() => setFilterDrawerOpen(true)}>
                                    Open
                                </Button>
                            </Stack>
                        </Paper>

                        {activeFilterCount > 0 ? (
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {query.trim() ? <Chip label={`Search: ${query.trim()}`} onDelete={() => setQuery("")} /> : null}
                                {difficulty !== "ALL" ? <Chip label={`Difficulty: ${difficulty}`} onDelete={() => setDifficulty("ALL")} /> : null}
                                {accessType !== "ALL" ? <Chip label={`Access: ${accessType}`} onDelete={() => setAccessType("ALL")} /> : null}
                                {enrollment !== "ALL" ? <Chip label={enrollment === "OPEN" ? "Enrollment open" : "Enrollment disabled"} onDelete={() => setEnrollment("ALL")} /> : null}
                                {duration !== "ALL" ? <Chip label={`Duration: ${duration}`} onDelete={() => setDuration("ALL")} /> : null}
                            </Stack>
                        ) : null}

                        {isLoading ? <LoadingState rows={4} /> : null}
                        {error ? <ErrorState message={error} onRetry={loadCourses} /> : null}
                        {!isLoading && !error && visibleCourses.length === 0 ? (
                            <EmptyState
                                title="No courses found"
                                description="Try clearing filters or changing your search query."
                                action={
                                    <Button variant="contained" onClick={resetFilters} disabled={activeFilterCount === 0}>
                                        Reset filters
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
            </Stack>

            <Drawer anchor="bottom" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} PaperProps={{ sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24 } }}>
                <Box sx={{ p: 2.5, pb: 4 }}>
                    <Stack spacing={2.2}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                Catalog filters
                            </Typography>
                            <IconButton onClick={() => setFilterDrawerOpen(false)}>
                                <CloseRoundedIcon />
                            </IconButton>
                        </Stack>
                        <Divider />
                        {filterControls}
                        <Button variant="contained" onClick={() => setFilterDrawerOpen(false)}>
                            Show courses
                        </Button>
                    </Stack>
                </Box>
            </Drawer>
        </PageContainer>
    );
}

import { useEffect, useMemo, useState } from "react";
import { Box, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { coursesApi } from "../../api/services";
import type { CourseAccessType, CourseCatalogItem, CourseDifficulty } from "../../api/bffContracts";
import { CourseCard } from "../../components/course/CourseCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageContainer } from "../../layouts/PageContainer";
import { getErrorMessage } from "../../api/apiError";

type DifficultyFilter = CourseDifficulty | "ALL";
type AccessFilter = CourseAccessType | "ALL";

export default function CoursesPage() {
    const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [difficulty, setDifficulty] = useState<DifficultyFilter>("ALL");
    const [accessType, setAccessType] = useState<AccessFilter>("ALL");

    const loadCourses = async () => {
        setIsLoading(true);
        setError(null);
        try {
            setCourses(await coursesApi.listCourses());
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Failed to load courses"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return courses.filter((course) => {
            const matchesQuery =
                !normalizedQuery ||
                course.title.toLowerCase().includes(normalizedQuery) ||
                course.shortDescription.toLowerCase().includes(normalizedQuery);
            const matchesDifficulty = difficulty === "ALL" || course.difficulty === difficulty;
            const matchesAccess = accessType === "ALL" || course.accessType === accessType;
            return matchesQuery && matchesDifficulty && matchesAccess;
        });
    }, [accessType, courses, difficulty, query]);

    return (
        <PageContainer>
            <Stack spacing={4}>
                <Box>
                    <Typography variant="h2">Courses</Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1 }}>
                        Public catalog loaded through the BFF contract. Direct service URLs are not used here.
                    </Typography>
                </Box>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <TextField
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search courses"
                            fullWidth
                            InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
                        />
                        <TextField
                            select
                            label="Difficulty"
                            value={difficulty}
                            onChange={(event) => setDifficulty(event.target.value as DifficultyFilter)}
                            sx={{ minWidth: { md: 190 } }}
                        >
                            <MenuItem value="ALL">All</MenuItem>
                            <MenuItem value="BEGINNER">Beginner</MenuItem>
                            <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                            <MenuItem value="ADVANCED">Advanced</MenuItem>
                        </TextField>
                        <TextField
                            select
                            label="Access"
                            value={accessType}
                            onChange={(event) => setAccessType(event.target.value as AccessFilter)}
                            sx={{ minWidth: { md: 170 } }}
                        >
                            <MenuItem value="ALL">All</MenuItem>
                            <MenuItem value="PUBLIC">Public</MenuItem>
                            <MenuItem value="UNLISTED">Unlisted</MenuItem>
                            <MenuItem value="PRIVATE">Private</MenuItem>
                        </TextField>
                    </Stack>
                </Paper>

                {isLoading ? <LoadingState rows={3} /> : null}
                {error ? <ErrorState message={error} onRetry={loadCourses} /> : null}
                {!isLoading && !error && filteredCourses.length === 0 ? (
                    <EmptyState title="No courses found" description="Try changing search or filters." />
                ) : null}
                {!isLoading && !error && filteredCourses.length > 0 ? (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
                        {filteredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </Box>
                ) : null}
            </Stack>
        </PageContainer>
    );
}

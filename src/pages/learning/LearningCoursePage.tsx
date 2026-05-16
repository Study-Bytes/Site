import { useCallback, useEffect, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Link as RouterLink, useParams } from "react-router-dom";
import { getErrorMessage } from "../../api/apiError";
import type { LearningCourse } from "../../api/bffContracts";
import { learningApi } from "../../api/services";
import { ErrorState } from "../../components/ui/ErrorState";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageContainer } from "../../layouts/PageContainer";

function parseId(value: string | undefined) {
    const id = Number(value);
    return Number.isFinite(id) ? id : null;
}

export default function LearningCoursePage() {
    const { courseId } = useParams();
    const parsedCourseId = parseId(courseId);
    const [course, setCourse] = useState<LearningCourse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            setError(getErrorMessage(requestError, "Failed to load learning course"));
        } finally {
            setIsLoading(false);
        }
    }, [parsedCourseId]);

    useEffect(() => {
        void loadCourse();
    }, [loadCourse]);

    return (
        <PageContainer>
            {isLoading ? <LoadingState rows={3} /> : null}
            {error ? <ErrorState message={error} onRetry={loadCourse} /> : null}
            {course ? (
                <Stack spacing={4}>
                    <Box>
                        <Typography variant="h2">{course.title}</Typography>
                        <Typography sx={{ color: "text.secondary", mt: 1 }}>{course.shortDescription}</Typography>
                    </Box>

                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 5 }}>
                        <Stack spacing={1.5}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                                <Typography sx={{ fontWeight: 900, flexGrow: 1 }}>Progress: {course.progressPercent}% · {course.enrollmentStatus}</Typography>
                                {course.nextItemId ? (
                                    <Button component={RouterLink} to={`/learn/${course.id}/items/${course.nextItemId}`} variant="contained">
                                        Continue
                                    </Button>
                                ) : null}
                            </Stack>
                            <LinearProgress variant="determinate" value={course.progressPercent} sx={{ height: 8, borderRadius: 999 }} />
                        </Stack>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 5 }}>
                        <Stack spacing={2}>
                            {course.modules.map((module) => (
                                <Accordion key={module.id} defaultExpanded variant="outlined" sx={{ borderRadius: 3, "&:before": { display: "none" } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                                        <Typography sx={{ fontWeight: 900 }}>{module.title}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack spacing={1}>
                                            {module.items.map((item) => (
                                                <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                                                    <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} spacing={1.5}>
                                                        <ItemTypeBadge itemType={item.itemType} />
                                                        <Typography sx={{ flexGrow: 1, fontWeight: 800 }}>{item.title}</Typography>
                                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>{item.completed ? "Completed" : "Not completed"}</Typography>
                                                        <Button component={RouterLink} to={`/learn/${course.id}/items/${item.id}`} size="small">
                                                            Open
                                                        </Button>
                                                    </Stack>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>
                    </Paper>
                </Stack>
            ) : null}
        </PageContainer>
    );
}

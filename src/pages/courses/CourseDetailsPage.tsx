import { useEffect, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Paper, Stack, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Link as RouterLink, useParams } from "react-router-dom";
import { coursesApi } from "../../api/services";
import type { CourseDetails } from "../../api/bffContracts";
import { AccessTypeBadge } from "../../components/ui/AccessTypeBadge";
import { DifficultyBadge } from "../../components/ui/DifficultyBadge";
import { ErrorState } from "../../components/ui/ErrorState";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageContainer } from "../../layouts/PageContainer";
import { getErrorMessage } from "../../api/apiError";

function parseCourseId(value: string | undefined) {
    const id = Number(value);
    return Number.isFinite(id) ? id : null;
}

export default function CourseDetailsPage() {
    const { courseId } = useParams();
    const parsedCourseId = parseCourseId(courseId);
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourse = async () => {
            if (!parsedCourseId) {
                setError("Invalid course id");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                setCourse(await coursesApi.getCourse(parsedCourseId));
            } catch (requestError) {
                setError(getErrorMessage(requestError, "Failed to load course"));
            } finally {
                setIsLoading(false);
            }
        };

        void loadCourse();
    }, [parsedCourseId]);

    return (
        <PageContainer>
            {isLoading ? <LoadingState rows={3} /> : null}
            {error ? <ErrorState message={error} /> : null}
            {course ? (
                <Stack spacing={4}>
                    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 5 }}>
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <DifficultyBadge difficulty={course.difficulty} />
                                <AccessTypeBadge accessType={course.accessType} />
                            </Stack>
                            <Box>
                                <Typography variant="h2">{course.title}</Typography>
                                <Typography sx={{ color: "text.secondary", mt: 1.5, maxWidth: 780 }}>{course.description}</Typography>
                            </Box>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Button component={RouterLink} to={`/learn/${course.id}`} variant="contained" disabled={!course.enrollmentEnabled}>
                                    {course.enrollmentEnabled ? "Start course" : "Enrollment disabled"}
                                </Button>
                                <Button variant="outlined">Estimated {course.estimatedMinutes ?? "flexible"} min</Button>
                            </Stack>
                        </Stack>
                    </Paper>

                    <Stack spacing={2}>
                        <Typography variant="h4">Course structure</Typography>
                        {course.modules.map((module) => (
                            <Accordion key={module.id} defaultExpanded variant="outlined" sx={{ borderRadius: 3, "&:before": { display: "none" } }}>
                                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                                    <Typography sx={{ fontWeight: 900 }}>{module.title}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack spacing={1.2}>
                                        {module.items.map((item) => (
                                            <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <ItemTypeBadge itemType={item.itemType} />
                                                    <Typography sx={{ fontWeight: 800 }}>{item.title}</Typography>
                                                </Stack>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Stack>
                </Stack>
            ) : null}
        </PageContainer>
    );
}

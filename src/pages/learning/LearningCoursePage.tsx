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
import type { CourseItemSummary, LearningCourse } from "../../api/bffContracts";
import { learningApi } from "../../api/services";
import { DifficultyBadge } from "../../components/ui/DifficultyBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageContainer } from "../../layouts/PageContainer";
import { formatDuration, getCourseItemCount, getCourseModuleCount } from "../../utils/courseFormat";

function parseId(value: string | undefined) {
    const id = Number(value);
    return Number.isFinite(id) ? id : null;
}

function itemState(item: CourseItemSummary) {
    if (item.locked) return { label: "Locked", icon: <LockOutlinedIcon fontSize="small" />, color: "default" as const };
    if (item.completed) return { label: "Completed", icon: <CheckCircleRoundedIcon fontSize="small" />, color: "success" as const };
    return { label: "Available", icon: <PlayCircleOutlineRoundedIcon fontSize="small" />, color: "primary" as const };
}

function LearningItemRow({ courseId, item }: { courseId: number; item: CourseItemSummary }) {
    const state = itemState(item);

    return (
        <Paper variant="outlined" sx={{ p: 1.6, borderRadius: 3.5, bgcolor: item.locked ? "rgba(0,0,0,0.02)" : "background.paper" }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
                    <ItemTypeBadge itemType={item.itemType} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900 }}>{item.title}</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {item.estimatedMinutes ? `${item.estimatedMinutes} min` : "Flexible pace"}
                        </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                    <Chip size="small" icon={state.icon} label={state.label} color={state.color} variant="outlined" sx={{ fontWeight: 900 }} />
                    <Button component={RouterLink} to={`/learn/${courseId}/items/${item.id}`} size="small" variant={item.completed ? "outlined" : "contained"} disabled={item.locked}>
                        {item.completed ? "Review" : "Open"}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
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
                            borderRadius: 6,
                            background:
                                "radial-gradient(720px 320px at 88% 0%, rgba(113,42,226,0.15), transparent 62%), linear-gradient(135deg, #ffffff 0%, #f4f0ff 100%)",
                        }}
                    >
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) 300px" }, gap: 3, alignItems: "center" }}>
                            <Stack spacing={2.5}>
                                <Button component={RouterLink} to="/my-learning" variant="text" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }}>
                                    My Learning
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
                                            Continue next item
                                        </Button>
                                    ) : null}
                                    <Button component={RouterLink} to="/courses" variant="outlined">
                                        Browse catalog
                                    </Button>
                                </Stack>
                            </Stack>

                            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 5, background: "rgba(255,255,255,0.74)" }}>
                                <Stack spacing={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                        Course progress
                                    </Typography>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                                            <Typography sx={{ fontWeight: 900 }}>{course.progressPercent}%</Typography>
                                            <Typography sx={{ color: "text.secondary" }}>{completedCount}/{itemCount} items</Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={course.progressPercent} sx={{ height: 10, borderRadius: 999 }} />
                                    </Box>
                                    <Stack spacing={1}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography sx={{ color: "text.secondary" }}>Modules</Typography>
                                            <Typography sx={{ fontWeight: 950 }}>{moduleCount}</Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography sx={{ color: "text.secondary" }}>Duration</Typography>
                                            <Typography sx={{ fontWeight: 950 }}>{formatDuration(course.estimatedMinutes)}</Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Box>
                    </Paper>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "320px minmax(0, 1fr)" }, gap: 3, alignItems: "start" }}>
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 5, position: { md: "sticky" }, top: { md: 96 } }}>
                            <Stack spacing={1.7}>
                                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                    Course navigation
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    Open any available item. Completed items stay available for review.
                                </Typography>
                                <LinearProgress variant="determinate" value={course.progressPercent} sx={{ height: 7, borderRadius: 999 }} />
                            </Stack>
                        </Paper>

                        <Stack spacing={2.5}>
                            {course.modules.length === 0 ? <EmptyState title="No modules" description="This enrolled course has no modules yet." /> : null}
                            {course.modules.map((module, index) => (
                                <Accordion key={module.id} defaultExpanded={index === 0} variant="outlined" sx={{ borderRadius: 4, overflow: "hidden", "&:before": { display: "none" } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 2, md: 2.6 }, py: 1 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Chip label={index + 1} color="primary" size="small" sx={{ fontWeight: 950 }} />
                                            <Box>
                                                <Typography sx={{ fontWeight: 950 }}>{module.title}</Typography>
                                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                    {module.items.length} item{module.items.length === 1 ? "" : "s"}
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

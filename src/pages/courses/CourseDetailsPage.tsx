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
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { ApiError, getErrorMessage } from "../../api/apiError";
import type { CourseDetails, CourseItemSummary } from "../../api/bffContracts";
import { coursesApi, learningApi } from "../../api/services";
import { useAuth } from "../../auth/useAuth";
import { AccessTypeBadge } from "../../components/ui/AccessTypeBadge";
import { DifficultyBadge } from "../../components/ui/DifficultyBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageContainer } from "../../layouts/PageContainer";
import { formatDuration, getCourseItemCount, getCourseModuleCount, parseRouteCourseId } from "../../utils/courseFormat";

function CourseMetric({ label, value }: { label: string; value: string | number }) {
    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, background: "rgba(255,255,255,0.72)" }}>
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
    const stateLabel = item.locked ? "Locked" : item.completed ? "Completed" : "Available";

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
                            {item.estimatedMinutes ? `${item.estimatedMinutes} min` : "Flexible"}
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
    const navigate = useNavigate();
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
            setEnrollError(getErrorMessage(error, "Failed to enroll in this course"));
        } finally {
            setIsEnrolling(false);
        }
    };

    if (course.status !== "PUBLISHED") {
        return (
            <Button variant="outlined" disabled startIcon={<LockOutlinedIcon />} fullWidth>
                Course unavailable
            </Button>
        );
    }

    if (!course.enrollmentEnabled) {
        return (
            <Button variant="outlined" disabled startIcon={<LockOutlinedIcon />} fullWidth>
                Enrollment disabled
            </Button>
        );
    }

    if (!isAuthenticated) {
        return (
            <Button component={RouterLink} to="/login" variant="contained" endIcon={<ArrowForwardRoundedIcon />} fullWidth>
                Login to start
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
                {hasStarted ? "Continue learning" : "Start course"}
            </Button>
            {enrollError ? <Alert severity="error">{enrollError}</Alert> : null}
        </Stack>
    );
}

export default function CourseDetailsPage() {
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
                    title="Course not found"
                    description="The course does not exist, is not published, or is not available through the public BFF catalog."
                    action={
                        <Button component={RouterLink} to="/courses" variant="contained" startIcon={<ArrowBackRoundedIcon />}>
                            Back to catalog
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
                            background:
                                "radial-gradient(700px 320px at 88% 6%, rgba(113,42,226,0.16), transparent 62%), linear-gradient(135deg, #ffffff 0%, #f4f0ff 100%)",
                        }}
                    >
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" }, gap: { xs: 3, md: 4 }, alignItems: "center" }}>
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <DifficultyBadge difficulty={course.difficulty} />
                                    <AccessTypeBadge accessType={course.accessType} />
                                    <Chip
                                        icon={course.enrollmentEnabled ? <PlayCircleOutlineRoundedIcon /> : <LockOutlinedIcon />}
                                        label={course.enrollmentEnabled ? "Enrollment open" : "Enrollment disabled"}
                                        variant="outlined"
                                        sx={{ fontWeight: 900 }}
                                    />
                                </Stack>

                                <Box>
                                    <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 950 }}>
                                        Course details
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
                                    <CourseMetric label="Modules" value={moduleCount} />
                                    <CourseMetric label="Items" value={itemCount} />
                                    <CourseMetric label="Duration" value={formatDuration(course.estimatedMinutes)} />
                                    <CourseMetric label="Status" value={course.status} />
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
                                            background:
                                                "radial-gradient(circle at 22% 18%, rgba(53,37,205,0.28), transparent 30%), radial-gradient(circle at 82% 12%, rgba(113,42,226,0.24), transparent 28%), linear-gradient(135deg, #f8f4ff 0%, #e8e1ff 100%)",
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
                                <Typography variant="h3">Course structure</Typography>
                                <Typography sx={{ color: "text.secondary", mt: 1 }}>
                                    Modules and item metadata are loaded from the BFF public course details endpoint.
                                </Typography>
                            </Box>

                            {course.modules.length === 0 ? <EmptyState title="No modules yet" description="This course has no visible modules in the public catalog." /> : null}
                            {course.modules.map((module, index) => (
                                <Accordion key={module.id} defaultExpanded={index === 0} variant="outlined" sx={{ borderRadius: 1.5, overflow: "hidden", "&:before": { display: "none" } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 2, md: 2.5 }, py: 1 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                                            <Chip label={index + 1} size="small" color="primary" sx={{ fontWeight: 950 }} />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ fontWeight: 950 }}>{module.title}</Typography>
                                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                    {module.items.length} item{module.items.length === 1 ? "" : "s"}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: { xs: 2, md: 2.5 }, pb: 2.5 }}>
                                        <Stack spacing={1.2}>
                                            {module.items.length === 0 ? <Typography sx={{ color: "text.secondary" }}>This module has no visible items.</Typography> : null}
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
                                    Start learning
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    Sign in to enroll, track progress and continue from the next item.
                                </Typography>
                                <CourseCta course={course} />
                                <Divider />
                                <Stack spacing={1.2}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <AccessTimeRoundedIcon fontSize="small" color="primary" />
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            Estimated time: {formatDuration(course.estimatedMinutes)}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <MenuBookRoundedIcon fontSize="small" color="primary" />
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            {moduleCount} modules · {itemCount} items
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

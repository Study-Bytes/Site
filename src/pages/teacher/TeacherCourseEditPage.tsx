import { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, FormControlLabel, MenuItem, Paper, Stack, Switch, TextField, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { ApiError, getErrorMessage } from "../../api/apiError";
import { teacherApi } from "../../api/services";
import type { ApiValidationError, CourseAccessType, CourseDifficulty, CourseUpsertRequest, TeacherCourseDetails } from "../../api/bffContracts";
import { AccessTypeBadge } from "../../components/ui/AccessTypeBadge";
import { DifficultyBadge } from "../../components/ui/DifficultyBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { FormSectionCard } from "../../components/ui/FormSectionCard";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ValidationErrorPanel } from "../../components/ui/ValidationErrorPanel";
import { PageContainer } from "../../layouts/PageContainer";
import { formatDuration, getCourseItemCount, getCourseModuleCount, parseRouteCourseId } from "../../utils/courseFormat";

const defaultForm: CourseUpsertRequest = {
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    difficulty: "BEGINNER",
    accessType: "PUBLIC",
    enrollmentEnabled: true,
    coverImageUrl: "",
    estimatedMinutes: 120,
};

type Props = {
    mode?: "create" | "edit";
};

function toForm(course: TeacherCourseDetails): CourseUpsertRequest {
    return {
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        description: course.description,
        difficulty: course.difficulty,
        accessType: course.accessType,
        enrollmentEnabled: course.enrollmentEnabled,
        coverImageUrl: course.coverImageUrl ?? "",
        estimatedMinutes: course.estimatedMinutes,
    };
}

function normalizeForm(form: CourseUpsertRequest): CourseUpsertRequest {
    return {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        coverImageUrl: form.coverImageUrl?.trim() || null,
        estimatedMinutes: form.estimatedMinutes === null || form.estimatedMinutes === undefined ? null : Number(form.estimatedMinutes),
    };
}

function validateForm(form: CourseUpsertRequest): ApiValidationError[] {
    const normalized = normalizeForm(form);
    const errors: ApiValidationError[] = [];
    if (!normalized.title) errors.push({ field: "title", message: "Title is required" });
    if (!normalized.slug) errors.push({ field: "slug", message: "Slug is required" });
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized.slug)) errors.push({ field: "slug", message: "Use lowercase letters, numbers and hyphens" });
    if (!normalized.shortDescription) errors.push({ field: "shortDescription", message: "Short description is required" });
    if (!normalized.description) errors.push({ field: "description", message: "Description is required" });
    if (normalized.estimatedMinutes !== null && (!Number.isFinite(normalized.estimatedMinutes) || normalized.estimatedMinutes < 0)) {
        errors.push({ field: "estimatedMinutes", message: "Estimated minutes must be non-negative" });
    }
    return errors;
}

export default function TeacherCourseEditPage({ mode = "edit" }: Props) {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const parsedCourseId = parseRouteCourseId(courseId);
    const isCreate = mode === "create";

    const [course, setCourse] = useState<TeacherCourseDetails | null>(null);
    const [form, setForm] = useState<CourseUpsertRequest>(defaultForm);
    const [isLoading, setIsLoading] = useState(!isCreate);
    const [isSaving, setIsSaving] = useState(false);
    const [action, setAction] = useState<"publish" | "archive" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ApiValidationError[]>([]);

    const loadCourse = async () => {
        if (isCreate) return;
        if (!parsedCourseId) {
            setError("Invalid course id");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const loaded = await teacherApi.getCourse(parsedCourseId);
            setCourse(loaded);
            setForm(toForm(loaded));
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Failed to load course"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadCourse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parsedCourseId, isCreate]);

    const updateField = <K extends keyof CourseUpsertRequest>(field: K, value: CourseUpsertRequest[K]) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const title = isCreate ? "Create course" : `Edit course${course ? `: ${course.title}` : ""}`;

    const stats = useMemo(() => {
        if (!course) return { modules: 0, items: 0 };
        return { modules: getCourseModuleCount(course), items: getCourseItemCount(course) };
    }, [course]);

    const handleApiError = (requestError: unknown, fallback: string) => {
        if (requestError instanceof ApiError && requestError.validationErrors.length > 0) {
            setValidationErrors(requestError.validationErrors);
        }
        setError(getErrorMessage(requestError, fallback));
    };

    const submitForm = async () => {
        setSuccessMessage(null);
        setError(null);
        const errors = validateForm(form);
        setValidationErrors(errors);
        if (errors.length > 0) return;

        setIsSaving(true);
        try {
            const payload = normalizeForm(form);
            if (isCreate) {
                const created = await teacherApi.createCourse(payload);
                setCourse(created);
                setSuccessMessage("Course draft created");
                navigate(`/teacher/courses/${created.id}/edit`, { replace: true });
                return;
            }
            if (!parsedCourseId) throw new Error("Invalid course id");
            const updated = await teacherApi.updateCourse(parsedCourseId, payload);
            setCourse(updated);
            setForm(toForm(updated));
            setSuccessMessage("Course metadata saved");
        } catch (requestError) {
            handleApiError(requestError, isCreate ? "Failed to create course" : "Failed to save course");
        } finally {
            setIsSaving(false);
        }
    };

    const runCourseAction = async (nextAction: "publish" | "archive") => {
        if (!course) return;
        setAction(nextAction);
        setSuccessMessage(null);
        setError(null);
        setValidationErrors([]);
        try {
            const updated = nextAction === "publish" ? await teacherApi.publishCourse(course.id) : await teacherApi.archiveCourse(course.id);
            setCourse(updated);
            setForm(toForm(updated));
            setSuccessMessage(nextAction === "publish" ? "Course published" : "Course archived");
        } catch (requestError) {
            handleApiError(requestError, nextAction === "publish" ? "Failed to publish course" : "Failed to archive course");
        } finally {
            setAction(null);
        }
    };

    if (isLoading) {
        return (
            <PageContainer>
                <LoadingState rows={4} />
            </PageContainer>
        );
    }

    if (!isCreate && error && !course) {
        return (
            <PageContainer>
                <ErrorState message={error} onRetry={loadCourse} />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Button component={RouterLink} to="/teacher/courses" startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 1 }}>
                            Back to courses
                        </Button>
                        <Typography variant="h2">{title}</Typography>
                        <Typography sx={{ color: "text.secondary", mt: 1, maxWidth: 760 }}>
                            Manage supported CourseService metadata. Module and item structure editing is kept visible here and will be implemented in the next teacher editor task.
                        </Typography>
                    </Box>
                    {course ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <StatusBadge status={course.status} />
                            <DifficultyBadge difficulty={course.difficulty} />
                            <AccessTypeBadge accessType={course.accessType} />
                        </Stack>
                    ) : null}
                </Stack>

                {successMessage ? <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert> : null}
                {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
                <ValidationErrorPanel errors={validationErrors} />

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: course ? "minmax(0, 1fr) 320px" : "1fr" }, gap: 3 }}>
                    <Stack spacing={3}>
                        <FormSectionCard title="Course metadata" description="These fields match the frontend-facing BFF CourseUpsertRequest.">
                            <Stack spacing={2}>
                                <TextField label="Title" value={form.title} onChange={(event) => updateField("title", event.target.value)} required />
                                <TextField label="Slug" value={form.slug} onChange={(event) => updateField("slug", event.target.value)} helperText="Lowercase URL slug, for example java-core" required />
                                <TextField label="Short description" value={form.shortDescription} onChange={(event) => updateField("shortDescription", event.target.value)} required />
                                <TextField label="Description" multiline minRows={5} value={form.description} onChange={(event) => updateField("description", event.target.value)} required />
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                    <TextField select label="Difficulty" value={form.difficulty} onChange={(event) => updateField("difficulty", event.target.value as CourseDifficulty)} fullWidth>
                                        <MenuItem value="BEGINNER">BEGINNER</MenuItem>
                                        <MenuItem value="INTERMEDIATE">INTERMEDIATE</MenuItem>
                                        <MenuItem value="ADVANCED">ADVANCED</MenuItem>
                                    </TextField>
                                    <TextField select label="Access type" value={form.accessType} onChange={(event) => updateField("accessType", event.target.value as CourseAccessType)} fullWidth>
                                        <MenuItem value="PUBLIC">PUBLIC</MenuItem>
                                        <MenuItem value="UNLISTED">UNLISTED</MenuItem>
                                        <MenuItem value="PRIVATE">PRIVATE</MenuItem>
                                    </TextField>
                                </Stack>
                                <TextField label="Cover image URL" value={form.coverImageUrl ?? ""} onChange={(event) => updateField("coverImageUrl", event.target.value)} />
                                <TextField
                                    label="Estimated minutes"
                                    type="number"
                                    value={form.estimatedMinutes ?? ""}
                                    onChange={(event) => updateField("estimatedMinutes", event.target.value === "" ? null : Number(event.target.value))}
                                />
                                <FormControlLabel
                                    control={<Switch checked={form.enrollmentEnabled} onChange={(event) => updateField("enrollmentEnabled", event.target.checked)} />}
                                    label="Enrollment enabled"
                                />
                            </Stack>
                        </FormSectionCard>

                        <FormSectionCard title="Modules and items" description="Visible now for context. Full add/edit/reorder flows are intentionally left for the next task.">
                            {!course ? (
                                <EmptyState title="Create course first" description="Modules and items can be added after the course draft exists." />
                            ) : course.modules.length === 0 ? (
                                <EmptyState title="No modules yet" description="The next teacher editor task will add module and item management." />
                            ) : (
                                <Stack spacing={2}>
                                    {course.modules
                                        .slice()
                                        .sort((a, b) => a.orderIndex - b.orderIndex)
                                        .map((module) => (
                                            <Accordion key={module.id} defaultExpanded variant="outlined" sx={{ borderRadius: 1.25, "&:before": { display: "none" } }}>
                                                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                                                        <Typography sx={{ fontWeight: 900 }}>{module.title}</Typography>
                                                        <Chip size="small" label={`${module.items.length} items`} />
                                                    </Stack>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Stack spacing={1.25}>
                                                        {module.items
                                                            .slice()
                                                            .sort((a, b) => a.orderIndex - b.orderIndex)
                                                            .map((item) => (
                                                                <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1.25 }}>
                                                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ sm: "center" }}>
                                                                        <Box sx={{ flexGrow: 1 }}>
                                                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                                                                <ItemTypeBadge itemType={item.itemType} />
                                                                                <Typography sx={{ fontWeight: 900 }}>{item.title}</Typography>
                                                                            </Stack>
                                                                        </Box>
                                                                        <Button component={RouterLink} to={`/teacher/courses/${course.id}/edit/items/${item.id}`} variant="outlined" size="small">
                                                                            Edit item
                                                                        </Button>
                                                                    </Stack>
                                                                </Paper>
                                                            ))}
                                                        <Button variant="outlined" startIcon={<AddRoundedIcon />} disabled>
                                                            Add item — next task
                                                        </Button>
                                                    </Stack>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                </Stack>
                            )}
                        </FormSectionCard>
                    </Stack>

                    {course ? (
                        <Stack spacing={2}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                <Stack spacing={2}>
                                    <Typography variant="h5">Course summary</Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <StatusBadge status={course.status} />
                                        <Chip size="small" label={`${stats.modules} modules`} />
                                        <Chip size="small" label={`${stats.items} items`} />
                                        <Chip size="small" label={formatDuration(course.estimatedMinutes)} />
                                    </Stack>
                                    <Typography sx={{ color: "text.secondary" }}>Created {new Date(course.createdAt).toLocaleDateString()}</Typography>
                                    <Typography sx={{ color: "text.secondary" }}>Updated {new Date(course.updatedAt).toLocaleDateString()}</Typography>
                                    {course.publishedAt ? <Typography sx={{ color: "text.secondary" }}>Published {new Date(course.publishedAt).toLocaleDateString()}</Typography> : null}
                                </Stack>
                            </Paper>
                        </Stack>
                    ) : null}
                </Box>

                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        position: { md: "sticky" },
                        bottom: { md: 16 },
                        zIndex: 2,
                        bgcolor: "background.paper",
                    }}
                >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={submitForm} disabled={isSaving || action !== null}>
                            {isCreate ? "Create course" : "Save metadata"}
                        </Button>
                        {!isCreate && course ? (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<PublishRoundedIcon />}
                                    onClick={() => void runCourseAction("publish")}
                                    disabled={isSaving || action !== null || course.status === "PUBLISHED"}
                                >
                                    Publish Course
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<ArchiveRoundedIcon />}
                                    onClick={() => void runCourseAction("archive")}
                                    disabled={isSaving || action !== null || course.status === "ARCHIVED"}
                                >
                                    Archive Course
                                </Button>
                            </>
                        ) : null}
                    </Stack>
                </Paper>
            </Stack>
        </PageContainer>
    );
}

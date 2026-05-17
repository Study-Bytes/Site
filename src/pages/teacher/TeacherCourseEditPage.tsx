import { useEffect, useMemo, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { ApiError, getErrorMessage } from "../../api/apiError";
import { teacherApi } from "../../api/services";
import type {
    ApiValidationError,
    CourseAccessType,
    CourseDifficulty,
    CourseItemSummary,
    CourseItemType,
    CourseItemUpsertRequest,
    CourseModuleSummary,
    CourseUpsertRequest,
    ModuleUpsertRequest,
    TeacherCourseDetails,
    TeacherItemDetails,
} from "../../api/bffContracts";
import { AccessTypeBadge } from "../../components/ui/AccessTypeBadge";
import { DifficultyBadge } from "../../components/ui/DifficultyBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { FormSectionCard } from "../../components/ui/FormSectionCard";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ValidationErrorPanel } from "../../components/ui/ValidationErrorPanel";
import { useI18n } from "../../i18n/useI18n";
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

const defaultItemDraft = (orderIndex: number): CourseItemUpsertRequest => ({
    title: "",
    itemType: "THEORY",
    statement: "",
    orderIndex,
    language: null,
    starterCode: null,
    solutionCode: null,
    timeLimitMs: null,
    memoryLimitMb: null,
    outputLimitKb: null,
    networkDisabled: true,
    readOnlyFs: true,
    comparisonMode: "EXACT",
    normalizeLineEndings: true,
    trimTrailingWhitespaces: true,
});

type Props = {
    mode?: "create" | "edit";
};

type ModuleDialogState = {
    mode: "create" | "edit";
    moduleId?: number;
    draft: ModuleUpsertRequest;
};

type ItemDialogState = {
    mode: "create" | "edit";
    moduleId: number;
    itemId?: number;
    draft: CourseItemUpsertRequest;
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

function normalizeItemDraft(input: CourseItemUpsertRequest): CourseItemUpsertRequest {
    const itemType = input.itemType;
    const isExecutable = itemType === "CODING" || itemType === "SQL";
    return {
        ...input,
        title: input.title.trim(),
        statement: input.statement?.trim() || null,
        orderIndex: Number(input.orderIndex),
        language: isExecutable ? input.language?.trim() || "" : null,
        starterCode: isExecutable ? input.starterCode ?? "" : null,
        solutionCode: isExecutable ? input.solutionCode ?? null : null,
        timeLimitMs: isExecutable ? Number(input.timeLimitMs ?? 2000) : null,
        memoryLimitMb: isExecutable ? Number(input.memoryLimitMb ?? 256) : null,
        outputLimitKb: isExecutable ? Number(input.outputLimitKb ?? 128) : null,
        networkDisabled: input.networkDisabled,
        readOnlyFs: input.readOnlyFs,
        comparisonMode: input.comparisonMode,
        normalizeLineEndings: input.normalizeLineEndings,
        trimTrailingWhitespaces: input.trimTrailingWhitespaces,
    };
}

function validateModuleDraft(input: ModuleUpsertRequest): ApiValidationError[] {
    const errors: ApiValidationError[] = [];
    if (!input.title.trim()) errors.push({ field: "module.title", message: "Module title is required" });
    if (!Number.isFinite(input.orderIndex) || input.orderIndex < 0) errors.push({ field: "module.orderIndex", message: "Order index must be non-negative" });
    return errors;
}

function validateItemDraft(input: CourseItemUpsertRequest): ApiValidationError[] {
    const item = normalizeItemDraft(input);
    const errors: ApiValidationError[] = [];
    if (!item.title) errors.push({ field: "item.title", message: "Item title is required" });
    if (!Number.isFinite(item.orderIndex) || item.orderIndex < 0) errors.push({ field: "item.orderIndex", message: "Order index must be non-negative" });
    if ((item.itemType === "CODING" || item.itemType === "SQL") && !item.language) errors.push({ field: "item.language", message: "Language is required for CODING and SQL items" });
    for (const field of ["timeLimitMs", "memoryLimitMb", "outputLimitKb"] as const) {
        const value = item[field];
        if ((item.itemType === "CODING" || item.itemType === "SQL") && (value === null || !Number.isFinite(value) || value < 0)) {
            errors.push({ field: `item.${field}`, message: `${field} must be non-negative` });
        }
    }
    return errors;
}

function itemDraftFromDetails(item: TeacherItemDetails): CourseItemUpsertRequest {
    return {
        title: item.title,
        itemType: item.itemType,
        statement: item.statement,
        orderIndex: item.orderIndex,
        language: item.language,
        starterCode: item.starterCode,
        solutionCode: item.solutionCode,
        timeLimitMs: item.timeLimitMs,
        memoryLimitMb: item.memoryLimitMb,
        outputLimitKb: item.outputLimitKb,
        networkDisabled: item.networkDisabled,
        readOnlyFs: item.readOnlyFs,
        comparisonMode: item.comparisonMode,
        normalizeLineEndings: item.normalizeLineEndings,
        trimTrailingWhitespaces: item.trimTrailingWhitespaces,
    };
}

function sortedModules(course: TeacherCourseDetails) {
    return course.modules.slice().sort((a, b) => a.orderIndex - b.orderIndex);
}

function sortedItems(module: CourseModuleSummary) {
    return module.items.slice().sort((a, b) => a.orderIndex - b.orderIndex);
}

export default function TeacherCourseEditPage({ mode = "edit" }: Props) {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const parsedCourseId = parseRouteCourseId(courseId);
    const isCreate = mode === "create";

    const [course, setCourse] = useState<TeacherCourseDetails | null>(null);
    const [form, setForm] = useState<CourseUpsertRequest>(defaultForm);
    const [isLoading, setIsLoading] = useState(!isCreate);
    const [isSaving, setIsSaving] = useState(false);
    const [action, setAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ApiValidationError[]>([]);
    const [moduleDialog, setModuleDialog] = useState<ModuleDialogState | null>(null);
    const [itemDialog, setItemDialog] = useState<ItemDialogState | null>(null);

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

    const title = isCreate
        ? isRu ? "Создать курс" : "Create course"
        : `${isRu ? "Редактирование курса" : "Edit course"}${course ? `: ${course.title}` : ""}`;

    const stats = useMemo(() => {
        if (!course) return { modules: 0, items: 0 };
        return { modules: getCourseModuleCount(course), items: getCourseItemCount(course) };
    }, [course]);
    const isEditingLocked = course?.status === "PENDING_REVIEW";

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

    const runCourseAction = async (nextAction: "submit" | "archive") => {
        if (!course) return;
        setAction(nextAction);
        setSuccessMessage(null);
        setError(null);
        setValidationErrors([]);
        try {
            const updated = nextAction === "submit" ? await teacherApi.submitCourseForReview(course.id) : await teacherApi.archiveCourse(course.id);
            setCourse(updated);
            setForm(toForm(updated));
            setSuccessMessage(nextAction === "submit" ? "Course submitted for review" : "Course archived");
        } catch (requestError) {
            handleApiError(requestError, nextAction === "submit" ? "Failed to submit course for review" : "Failed to archive course");
        } finally {
            setAction(null);
        }
    };

    const refreshAfterMutation = async (message: string) => {
        setSuccessMessage(message);
        if (!parsedCourseId) return;
        const loaded = await teacherApi.getCourse(parsedCourseId);
        setCourse(loaded);
        setForm(toForm(loaded));
    };

    const saveModule = async () => {
        if (!course || !moduleDialog) return;
        const errors = validateModuleDraft(moduleDialog.draft);
        setValidationErrors(errors);
        if (errors.length > 0) return;
        setAction("module");
        setError(null);
        try {
            if (moduleDialog.mode === "create") {
                await teacherApi.createModule(course.id, { title: moduleDialog.draft.title.trim(), orderIndex: Number(moduleDialog.draft.orderIndex) });
                setModuleDialog(null);
                await refreshAfterMutation("Module created");
            } else if (moduleDialog.moduleId) {
                await teacherApi.updateModule(moduleDialog.moduleId, { title: moduleDialog.draft.title.trim(), orderIndex: Number(moduleDialog.draft.orderIndex) });
                setModuleDialog(null);
                await refreshAfterMutation("Module saved");
            }
        } catch (requestError) {
            handleApiError(requestError, "Failed to save module");
        } finally {
            setAction(null);
        }
    };

    const deleteModule = async (moduleId: number) => {
        if (!window.confirm("Delete this module and all its items?")) return;
        setAction(`delete-module-${moduleId}`);
        setError(null);
        try {
            await teacherApi.deleteModule(moduleId);
            await refreshAfterMutation("Module deleted");
        } catch (requestError) {
            handleApiError(requestError, "Failed to delete module");
        } finally {
            setAction(null);
        }
    };

    const reorderModules = async (moduleId: number, direction: -1 | 1) => {
        if (!course) return;
        const ordered = sortedModules(course);
        const currentIndex = ordered.findIndex((module) => module.id === moduleId);
        const nextIndex = currentIndex + direction;
        if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ordered.length) return;
        const copy = [...ordered];
        [copy[currentIndex], copy[nextIndex]] = [copy[nextIndex], copy[currentIndex]];
        setAction("reorder-modules");
        setError(null);
        try {
            await teacherApi.reorderModules(course.id, { orderedModuleIds: copy.map((module) => module.id) });
            await refreshAfterMutation("Modules reordered");
        } catch (requestError) {
            handleApiError(requestError, "Failed to reorder modules");
        } finally {
            setAction(null);
        }
    };

    const openCreateItemDialog = (module: CourseModuleSummary) => {
        setValidationErrors([]);
        setItemDialog({ mode: "create", moduleId: module.id, draft: defaultItemDraft(module.items.length) });
    };

    const openEditItemDialog = async (moduleId: number, item: CourseItemSummary) => {
        setAction(`load-item-${item.id}`);
        setError(null);
        try {
            const details = await teacherApi.getItem(item.id);
            setItemDialog({ mode: "edit", moduleId, itemId: item.id, draft: itemDraftFromDetails(details) });
        } catch (requestError) {
            handleApiError(requestError, "Failed to load item");
        } finally {
            setAction(null);
        }
    };

    const saveItem = async () => {
        if (!itemDialog) return;
        const errors = validateItemDraft(itemDialog.draft);
        setValidationErrors(errors);
        if (errors.length > 0) return;
        setAction("item");
        setError(null);
        try {
            const payload = normalizeItemDraft(itemDialog.draft);
            if (itemDialog.mode === "create") {
                await teacherApi.createItem(itemDialog.moduleId, payload);
                setItemDialog(null);
                await refreshAfterMutation("Item created");
            } else if (itemDialog.itemId) {
                await teacherApi.updateItem(itemDialog.itemId, payload);
                setItemDialog(null);
                await refreshAfterMutation("Item saved");
            }
        } catch (requestError) {
            handleApiError(requestError, "Failed to save item");
        } finally {
            setAction(null);
        }
    };

    const deleteItem = async (itemId: number) => {
        if (!window.confirm("Delete this course item?")) return;
        setAction(`delete-item-${itemId}`);
        setError(null);
        try {
            await teacherApi.deleteItem(itemId);
            await refreshAfterMutation("Item deleted");
        } catch (requestError) {
            handleApiError(requestError, "Failed to delete item");
        } finally {
            setAction(null);
        }
    };

    const reorderItems = async (module: CourseModuleSummary, itemId: number, direction: -1 | 1) => {
        const ordered = sortedItems(module);
        const currentIndex = ordered.findIndex((item) => item.id === itemId);
        const nextIndex = currentIndex + direction;
        if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ordered.length) return;
        const copy = [...ordered];
        [copy[currentIndex], copy[nextIndex]] = [copy[nextIndex], copy[currentIndex]];
        setAction(`reorder-items-${module.id}`);
        setError(null);
        try {
            await teacherApi.reorderItems(module.id, { orderedItemIds: copy.map((item) => item.id) });
            await refreshAfterMutation("Items reordered");
        } catch (requestError) {
            handleApiError(requestError, "Failed to reorder items");
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
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
                    <Box>
                        <Button component={RouterLink} to="/teacher/courses" startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 1 }}>
                            {isRu ? "К курсам" : "Back to courses"}
                        </Button>
                        <Typography variant="h2">{title}</Typography>
                        <Typography sx={{ color: "text.secondary", mt: 1 }}>
                            {isRu ? "Настрой описание, структуру, модули и уроки курса." : "Edit course details, structure, modules and lessons."}
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
                {isEditingLocked ? (
                    <Alert severity="info">
                        This course is waiting for admin moderation. Editing is locked until the course is approved or changes are requested.
                    </Alert>
                ) : null}
                <ValidationErrorPanel errors={validationErrors} />

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: course ? "minmax(0, 1fr) 320px" : "1fr" }, gap: 3 }}>
                    <Stack spacing={3}>
                        <FormSectionCard
                            title={isRu ? "Описание курса" : "Course details"}
                            description={isRu ? "Эти данные видят студенты в каталоге и на странице курса." : "These fields are shown in the catalog and on the course details page."}
                        >
                            <Stack spacing={2}>
                                <TextField label="Title" value={form.title} onChange={(event) => updateField("title", event.target.value)} required disabled={isEditingLocked} />
                                <TextField label="Slug" value={form.slug} onChange={(event) => updateField("slug", event.target.value)} helperText="Lowercase URL slug, for example java-core" required disabled={isEditingLocked} />
                                <TextField label="Short description" value={form.shortDescription} onChange={(event) => updateField("shortDescription", event.target.value)} required disabled={isEditingLocked} />
                                <TextField label="Description" multiline minRows={5} value={form.description} onChange={(event) => updateField("description", event.target.value)} required disabled={isEditingLocked} />
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                    <TextField select label="Difficulty" value={form.difficulty} onChange={(event) => updateField("difficulty", event.target.value as CourseDifficulty)} fullWidth disabled={isEditingLocked}>
                                        <MenuItem value="BEGINNER">BEGINNER</MenuItem>
                                        <MenuItem value="INTERMEDIATE">INTERMEDIATE</MenuItem>
                                        <MenuItem value="ADVANCED">ADVANCED</MenuItem>
                                    </TextField>
                                    <TextField select label="Access type" value={form.accessType} onChange={(event) => updateField("accessType", event.target.value as CourseAccessType)} fullWidth disabled={isEditingLocked}>
                                        <MenuItem value="PUBLIC">PUBLIC</MenuItem>
                                        <MenuItem value="UNLISTED">UNLISTED</MenuItem>
                                        <MenuItem value="PRIVATE">PRIVATE</MenuItem>
                                    </TextField>
                                </Stack>
                                <TextField label="Cover image URL" value={form.coverImageUrl ?? ""} onChange={(event) => updateField("coverImageUrl", event.target.value)} disabled={isEditingLocked} />
                                <TextField label="Estimated minutes" type="number" value={form.estimatedMinutes ?? ""} onChange={(event) => updateField("estimatedMinutes", event.target.value === "" ? null : Number(event.target.value))} disabled={isEditingLocked} />
                                <FormControlLabel control={<Switch checked={form.enrollmentEnabled} onChange={(event) => updateField("enrollmentEnabled", event.target.checked)} disabled={isEditingLocked} />} label="Enrollment enabled" />
                            </Stack>
                        </FormSectionCard>

                        <FormSectionCard title="Modules and items" description="Build the course structure, reorder modules/items, then open the full item editor for content, hints and tests.">
                            {!course ? (
                                <EmptyState title="Create course first" description="Modules and items can be added after the course draft exists." />
                            ) : (
                                <Stack spacing={2}>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                                        <Typography sx={{ color: "text.secondary" }}>{course.modules.length} modules · {stats.items} items</Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddRoundedIcon />}
                                            disabled={isEditingLocked}
                                            onClick={() => setModuleDialog({ mode: "create", draft: { title: "", orderIndex: course.modules.length } })}
                                        >
                                            Add module
                                        </Button>
                                    </Stack>

                                    {course.modules.length === 0 ? (
                                        <EmptyState title="No modules yet" description="Create the first module to start adding lessons and tasks." />
                                    ) : (
                                        sortedModules(course).map((module, moduleIndex) => {
                                            const items = sortedItems(module);
                                            return (
                                                <Accordion key={module.id} defaultExpanded variant="outlined" sx={{ borderRadius: 1.25, "&:before": { display: "none" } }}>
                                                    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} sx={{ width: "100%", pr: 1 }}>
                                                            <Box sx={{ flexGrow: 1 }}>
                                                                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                                                                    <Typography sx={{ fontWeight: 900 }}>{module.title}</Typography>
                                                                    <Chip size="small" label={`${items.length} items`} />
                                                                    <Chip size="small" label={`#${module.orderIndex}`} />
                                                                </Stack>
                                                            </Box>
                                                        </Stack>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Stack spacing={1.5}>
                                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                                                                <Stack direction="row" spacing={0.5}>
                                                                    <Tooltip title="Move module up">
                                                                        <span><IconButton disabled={isEditingLocked || moduleIndex === 0 || action === "reorder-modules"} onClick={() => void reorderModules(module.id, -1)}><ArrowUpwardRoundedIcon /></IconButton></span>
                                                                    </Tooltip>
                                                                    <Tooltip title="Move module down">
                                                                        <span><IconButton disabled={isEditingLocked || moduleIndex === course.modules.length - 1 || action === "reorder-modules"} onClick={() => void reorderModules(module.id, 1)}><ArrowDownwardRoundedIcon /></IconButton></span>
                                                                    </Tooltip>
                                                                </Stack>
                                                                <Stack direction="row" spacing={1}>
                                                                    <Button variant="outlined" size="small" startIcon={<EditRoundedIcon />} disabled={isEditingLocked} onClick={() => setModuleDialog({ mode: "edit", moduleId: module.id, draft: { title: module.title, orderIndex: module.orderIndex } })}>
                                                                        Edit module
                                                                    </Button>
                                                                    <Button variant="outlined" size="small" color="error" startIcon={<DeleteRoundedIcon />} disabled={isEditingLocked} onClick={() => void deleteModule(module.id)}>
                                                                        Delete
                                                                    </Button>
                                                                </Stack>
                                                            </Stack>

                                                            {items.length === 0 ? (
                                                                <EmptyState title="No items in this module" description="Add theory, quiz, coding, SQL or file items." />
                                                            ) : (
                                                                <Stack spacing={1.25}>
                                                                    {items.map((item, itemIndex) => (
                                                                        <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1.25 }}>
                                                                            <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems={{ md: "center" }}>
                                                                                <Box sx={{ flexGrow: 1 }}>
                                                                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                                                                        <ItemTypeBadge itemType={item.itemType} />
                                                                                        <Typography sx={{ fontWeight: 900 }}>{item.title}</Typography>
                                                                                        <Chip size="small" label={`#${item.orderIndex}`} />
                                                                                    </Stack>
                                                                                </Box>
                                                                                <Stack direction="row" spacing={0.5}>
                                                                                    <Tooltip title="Move item up">
                                                                                        <span><IconButton disabled={isEditingLocked || itemIndex === 0 || action === `reorder-items-${module.id}`} onClick={() => void reorderItems(module, item.id, -1)}><ArrowUpwardRoundedIcon /></IconButton></span>
                                                                                    </Tooltip>
                                                                                    <Tooltip title="Move item down">
                                                                                        <span><IconButton disabled={isEditingLocked || itemIndex === items.length - 1 || action === `reorder-items-${module.id}`} onClick={() => void reorderItems(module, item.id, 1)}><ArrowDownwardRoundedIcon /></IconButton></span>
                                                                                    </Tooltip>
                                                                                    <Tooltip title="Quick edit metadata">
                                                                                        <span><IconButton disabled={isEditingLocked || action === `load-item-${item.id}`} onClick={() => void openEditItemDialog(module.id, item)}><EditRoundedIcon /></IconButton></span>
                                                                                    </Tooltip>
                                                                                    <Tooltip title="Open full item editor">
                                                                                        <IconButton component={RouterLink} to={`/teacher/courses/${course.id}/edit/items/${item.id}`}><OpenInNewRoundedIcon /></IconButton>
                                                                                    </Tooltip>
                                                                                    <Tooltip title="Delete item">
                                                                                        <IconButton color="error" disabled={isEditingLocked} onClick={() => void deleteItem(item.id)}><DeleteRoundedIcon /></IconButton>
                                                                                    </Tooltip>
                                                                                </Stack>
                                                                            </Stack>
                                                                        </Paper>
                                                                    ))}
                                                                </Stack>
                                                            )}

                                                            <Button variant="outlined" startIcon={<AddRoundedIcon />} disabled={isEditingLocked} onClick={() => openCreateItemDialog(module)}>
                                                                Add item
                                                            </Button>
                                                        </Stack>
                                                    </AccordionDetails>
                                                </Accordion>
                                            );
                                        })
                                    )}
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
                                    {course.submittedForReviewAt ? <Typography sx={{ color: "text.secondary" }}>Submitted for review {new Date(course.submittedForReviewAt).toLocaleDateString()}</Typography> : null}
                                    {course.reviewedAt ? <Typography sx={{ color: "text.secondary" }}>Reviewed {new Date(course.reviewedAt).toLocaleDateString()}</Typography> : null}
                                    {course.reviewComment ? <Alert severity={course.status === "CHANGES_REQUESTED" ? "warning" : "info"}>Admin review: {course.reviewComment}</Alert> : null}
                                </Stack>
                            </Paper>
                        </Stack>
                    ) : null}
                </Box>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, position: { md: "sticky" }, bottom: { md: 16 }, zIndex: 2, bgcolor: "background.paper" }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={submitForm} disabled={isSaving || action !== null || isEditingLocked}>
                            {isCreate ? "Create course" : "Save metadata"}
                        </Button>
                        {!isCreate && course ? (
                            <>
                                <Button variant="outlined" startIcon={<RateReviewRoundedIcon />} onClick={() => void runCourseAction("submit")} disabled={isSaving || action !== null || course.status === "PENDING_REVIEW" || course.status === "PUBLISHED" || course.status === "ARCHIVED"}>
                                    Submit for review
                                </Button>
                                <Button variant="outlined" component={RouterLink} to={`/courses/${course.id}`} startIcon={<VisibilityRoundedIcon />}>
                                    Preview as student
                                </Button>
                                <Button variant="outlined" color="error" startIcon={<ArchiveRoundedIcon />} onClick={() => void runCourseAction("archive")} disabled={isSaving || action !== null || course.status === "ARCHIVED"}>
                                    Archive Course
                                </Button>
                            </>
                        ) : null}
                    </Stack>
                </Paper>
            </Stack>

            <Dialog open={Boolean(moduleDialog)} onClose={() => setModuleDialog(null)} fullWidth maxWidth="sm">
                <DialogTitle>{moduleDialog?.mode === "create" ? "Create module" : "Edit module"}</DialogTitle>
                <DialogContent>
                    {moduleDialog ? (
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <TextField label="Title" value={moduleDialog.draft.title} onChange={(event) => setModuleDialog({ ...moduleDialog, draft: { ...moduleDialog.draft, title: event.target.value } })} required />
                            <TextField label="Order index" type="number" value={moduleDialog.draft.orderIndex} onChange={(event) => setModuleDialog({ ...moduleDialog, draft: { ...moduleDialog.draft, orderIndex: Number(event.target.value) } })} />
                        </Stack>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModuleDialog(null)}>Cancel</Button>
                    <Button variant="contained" onClick={() => void saveModule()} disabled={action === "module" || isEditingLocked}>Save module</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(itemDialog)} onClose={() => setItemDialog(null)} fullWidth maxWidth="md">
                <DialogTitle>{itemDialog?.mode === "create" ? "Create item" : "Edit item metadata"}</DialogTitle>
                <DialogContent>
                    {itemDialog ? (
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <TextField label="Title" value={itemDialog.draft.title} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, title: event.target.value } })} required fullWidth />
                                <TextField select label="Item type" value={itemDialog.draft.itemType} onChange={(event) => {
                                    const nextType = event.target.value as CourseItemType;
                                    setItemDialog({ ...itemDialog, draft: normalizeItemDraft({ ...itemDialog.draft, itemType: nextType }) });
                                }} fullWidth>
                                    <MenuItem value="THEORY">THEORY</MenuItem>
                                    <MenuItem value="QUIZ">QUIZ</MenuItem>
                                    <MenuItem value="CODING">CODING</MenuItem>
                                    <MenuItem value="SQL">SQL</MenuItem>
                                    <MenuItem value="FILE">FILE</MenuItem>
                                </TextField>
                            </Stack>
                            <TextField label="Order index" type="number" value={itemDialog.draft.orderIndex} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, orderIndex: Number(event.target.value) } })} />
                            <TextField label="Statement" multiline minRows={4} value={itemDialog.draft.statement ?? ""} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, statement: event.target.value } })} />
                            {itemDialog.draft.itemType === "CODING" || itemDialog.draft.itemType === "SQL" ? (
                                <Stack spacing={2}>
                                    <TextField label={isRu ? "Язык" : "Language"} helperText={isRu ? "Например: java, python или sql." : "For example: java, python or sql."} value={itemDialog.draft.language ?? ""} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, language: event.target.value } })} required />
                                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                        <TextField label="timeLimitMs" type="number" value={itemDialog.draft.timeLimitMs ?? 2000} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, timeLimitMs: Number(event.target.value) } })} fullWidth />
                                        <TextField label="memoryLimitMb" type="number" value={itemDialog.draft.memoryLimitMb ?? 256} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, memoryLimitMb: Number(event.target.value) } })} fullWidth />
                                        <TextField label="outputLimitKb" type="number" value={itemDialog.draft.outputLimitKb ?? 128} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, outputLimitKb: Number(event.target.value) } })} fullWidth />
                                    </Stack>
                                </Stack>
                            ) : null}
                        </Stack>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setItemDialog(null)}>Cancel</Button>
                    <Button variant="contained" onClick={() => void saveItem()} disabled={action === "item" || isEditingLocked}>Save item</Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
}

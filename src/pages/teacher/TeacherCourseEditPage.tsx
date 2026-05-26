import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
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
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import DoNotDisturbOnRoundedIcon from "@mui/icons-material/DoNotDisturbOnRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
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
    ModuleDeadlineType,
    ModuleUpsertRequest,
    TeacherCourseDetails,
    TeacherItemDetails,
} from "../../api/bffContracts";
import { AccessTypeBadge } from "../../components/ui/AccessTypeBadge";
import { CourseLeaderboardPanel } from "../../components/learning/CourseLeaderboard";
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
import { courseItemTypeLabel } from "../../utils/courseLabels";
import { formatDuration, getCourseItemCount, getCourseModuleCount, parseRouteCourseId } from "../../utils/courseFormat";
import { deadlineTypeLabel, formatDateTime, normalizeModuleDraft } from "../../utils/moduleDeadlines";

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

const defaultModuleDraft = (orderIndex: number): ModuleUpsertRequest => ({
    title: "",
    orderIndex,
    deadlineType: "NONE",
    deadlineAt: null,
    timeLimitMinutes: null,
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

function validateForm(form: CourseUpsertRequest, isRu = false): ApiValidationError[] {
    const normalized = normalizeForm(form);
    const errors: ApiValidationError[] = [];
    if (!normalized.title) errors.push({ field: "title", message: isRu ? "Укажите название курса" : "Title is required" });
    if (!normalized.slug) errors.push({ field: "slug", message: isRu ? "Укажите slug" : "Slug is required" });
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized.slug)) errors.push({ field: "slug", message: isRu ? "Используйте строчные латинские буквы, цифры и дефисы" : "Use lowercase letters, numbers and hyphens" });
    if (!normalized.shortDescription) errors.push({ field: "shortDescription", message: isRu ? "Укажите краткое описание" : "Short description is required" });
    if (!normalized.description) errors.push({ field: "description", message: isRu ? "Укажите полное описание" : "Description is required" });
    if (normalized.estimatedMinutes !== null && (!Number.isFinite(normalized.estimatedMinutes) || normalized.estimatedMinutes < 0)) {
        errors.push({ field: "estimatedMinutes", message: isRu ? "Оценка длительности должна быть неотрицательной" : "Estimated minutes must be non-negative" });
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

function validateModuleDraft(input: ModuleUpsertRequest, isRu = false): ApiValidationError[] {
    const module = normalizeModuleDraft(input);
    const errors: ApiValidationError[] = [];
    if (!module.title) errors.push({ field: "module.title", message: isRu ? "Укажите название модуля" : "Module title is required" });
    if (!Number.isFinite(module.orderIndex) || module.orderIndex < 0) errors.push({ field: "module.orderIndex", message: isRu ? "Порядок должен быть неотрицательным числом" : "Order index must be non-negative" });
    if (module.deadlineType === "ABSOLUTE" && !module.deadlineAt) errors.push({ field: "module.deadlineAt", message: isRu ? "Укажите дату дедлайна" : "Deadline date is required" });
    if (module.deadlineType === "RELATIVE_FROM_START" && (!module.timeLimitMinutes || module.timeLimitMinutes <= 0)) {
        errors.push({ field: "module.timeLimitMinutes", message: isRu ? "Лимит времени должен быть больше нуля" : "Time limit must be greater than zero" });
    }
    return errors;
}

function validateItemDraft(input: CourseItemUpsertRequest, isRu = false): ApiValidationError[] {
    const item = normalizeItemDraft(input);
    const errors: ApiValidationError[] = [];
    if (!item.title) errors.push({ field: "item.title", message: isRu ? "Укажите название урока" : "Item title is required" });
    if (!Number.isFinite(item.orderIndex) || item.orderIndex < 0) errors.push({ field: "item.orderIndex", message: isRu ? "Порядок должен быть неотрицательным числом" : "Order index must be non-negative" });
    if ((item.itemType === "CODING" || item.itemType === "SQL") && !item.language) errors.push({ field: "item.language", message: isRu ? "Для CODING и SQL нужен язык" : "Language is required for CODING and SQL items" });
    for (const field of ["timeLimitMs", "memoryLimitMb", "outputLimitKb"] as const) {
        const value = item[field];
        if ((item.itemType === "CODING" || item.itemType === "SQL") && (value === null || !Number.isFinite(value) || value < 0)) {
            errors.push({ field: `item.${field}`, message: isRu ? `${field} должен быть неотрицательным` : `${field} must be non-negative` });
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

function splitTimeLimit(totalMinutes: number | null | undefined) {
    const total = Math.max(1, Number(totalMinutes ?? 120));
    return {
        hours: Math.floor(total / 60),
        minutes: total % 60,
    };
}

function combineTimeLimit(hours: number, minutes: number) {
    const safeHours = Math.max(0, Math.floor(Number.isFinite(hours) ? hours : 0));
    const safeMinutes = Math.max(0, Math.min(59, Math.floor(Number.isFinite(minutes) ? minutes : 0)));
    return Math.max(1, safeHours * 60 + safeMinutes);
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
    const [isInspectorOpen, setInspectorOpen] = useState(() => localStorage.getItem("studybytes_course_editor_panel") !== "closed");
    const moduleTimeLimit = splitTimeLimit(moduleDialog?.draft.timeLimitMinutes);

    const updateModuleDeadlineType = (deadlineType: ModuleDeadlineType) => {
        if (!moduleDialog) return;
        setModuleDialog({
            ...moduleDialog,
            draft: normalizeModuleDraft({
                ...moduleDialog.draft,
                deadlineType,
                deadlineAt: deadlineType === "ABSOLUTE" ? moduleDialog.draft.deadlineAt : null,
                timeLimitMinutes: deadlineType === "RELATIVE_FROM_START" ? moduleDialog.draft.timeLimitMinutes ?? 120 : null,
            }),
        });
    };

    const updateModuleTimeLimit = (hours: number, minutes: number) => {
        if (!moduleDialog) return;
        setModuleDialog({
            ...moduleDialog,
            draft: {
                ...moduleDialog.draft,
                deadlineAt: null,
                timeLimitMinutes: combineTimeLimit(hours, minutes),
            },
        });
    };

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
            setError(getErrorMessage(requestError, isRu ? "Не удалось загрузить курс" : "Failed to load course"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadCourse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parsedCourseId, isCreate]);

    useEffect(() => {
        localStorage.setItem("studybytes_course_editor_panel", isInspectorOpen ? "open" : "closed");
    }, [isInspectorOpen]);

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
        const errors = validateForm(form, isRu);
        setValidationErrors(errors);
        if (errors.length > 0) return;

        setIsSaving(true);
        try {
            const payload = normalizeForm(form);
            if (isCreate) {
                const created = await teacherApi.createCourse(payload);
                setCourse(created);
                setSuccessMessage(isRu ? "Черновик курса создан" : "Course draft created");
                navigate(`/teacher/courses/${created.id}/edit`, { replace: true });
                return;
            }
            if (!parsedCourseId) throw new Error("Invalid course id");
            const updated = await teacherApi.updateCourse(parsedCourseId, payload);
            setCourse(updated);
            setForm(toForm(updated));
            setSuccessMessage(isRu ? "Описание курса сохранено" : "Course metadata saved");
        } catch (requestError) {
            handleApiError(requestError, isCreate ? (isRu ? "Не удалось создать курс" : "Failed to create course") : (isRu ? "Не удалось сохранить курс" : "Failed to save course"));
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
            setSuccessMessage(nextAction === "submit" ? (isRu ? "Курс отправлен на модерацию" : "Course submitted for review") : (isRu ? "Курс архивирован" : "Course archived"));
        } catch (requestError) {
            handleApiError(requestError, nextAction === "submit" ? (isRu ? "Не удалось отправить курс на модерацию" : "Failed to submit course for review") : (isRu ? "Не удалось архивировать курс" : "Failed to archive course"));
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
        const errors = validateModuleDraft(moduleDialog.draft, isRu);
        setValidationErrors(errors);
        if (errors.length > 0) return;
        setAction("module");
        setError(null);
        try {
            const payload = normalizeModuleDraft(moduleDialog.draft);
            if (moduleDialog.mode === "create") {
                await teacherApi.createModule(course.id, payload);
                setModuleDialog(null);
                await refreshAfterMutation(isRu ? "Модуль создан" : "Module created");
            } else if (moduleDialog.moduleId) {
                await teacherApi.updateModule(moduleDialog.moduleId, payload);
                setModuleDialog(null);
                await refreshAfterMutation(isRu ? "Модуль сохранён" : "Module saved");
            }
        } catch (requestError) {
            handleApiError(requestError, isRu ? "Не удалось сохранить модуль" : "Failed to save module");
        } finally {
            setAction(null);
        }
    };

    const deleteModule = async (moduleId: number) => {
        if (!window.confirm(isRu ? "Удалить этот модуль и все его уроки?" : "Delete this module and all its items?")) return;
        setAction(`delete-module-${moduleId}`);
        setError(null);
        try {
            await teacherApi.deleteModule(moduleId);
            await refreshAfterMutation(isRu ? "Модуль удалён" : "Module deleted");
        } catch (requestError) {
            handleApiError(requestError, isRu ? "Не удалось удалить модуль" : "Failed to delete module");
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
            await refreshAfterMutation(isRu ? "Порядок модулей обновлён" : "Modules reordered");
        } catch (requestError) {
            handleApiError(requestError, isRu ? "Не удалось изменить порядок модулей" : "Failed to reorder modules");
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
            handleApiError(requestError, isRu ? "Не удалось загрузить урок" : "Failed to load item");
        } finally {
            setAction(null);
        }
    };

    const saveItem = async () => {
        if (!itemDialog) return;
        const errors = validateItemDraft(itemDialog.draft, isRu);
        setValidationErrors(errors);
        if (errors.length > 0) return;
        setAction("item");
        setError(null);
        try {
            const payload = normalizeItemDraft(itemDialog.draft);
            if (itemDialog.mode === "create") {
                await teacherApi.createItem(itemDialog.moduleId, payload);
                setItemDialog(null);
                await refreshAfterMutation(isRu ? "Урок создан" : "Item created");
            } else if (itemDialog.itemId) {
                await teacherApi.updateItem(itemDialog.itemId, payload);
                setItemDialog(null);
                await refreshAfterMutation(isRu ? "Урок сохранён" : "Item saved");
            }
        } catch (requestError) {
            handleApiError(requestError, isRu ? "Не удалось сохранить урок" : "Failed to save item");
        } finally {
            setAction(null);
        }
    };

    const deleteItem = async (itemId: number) => {
        if (!window.confirm(isRu ? "Удалить этот урок?" : "Delete this course item?")) return;
        setAction(`delete-item-${itemId}`);
        setError(null);
        try {
            await teacherApi.deleteItem(itemId);
            await refreshAfterMutation(isRu ? "Урок удалён" : "Item deleted");
        } catch (requestError) {
            handleApiError(requestError, isRu ? "Не удалось удалить урок" : "Failed to delete item");
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
            await refreshAfterMutation(isRu ? "Порядок уроков обновлён" : "Items reordered");
        } catch (requestError) {
            handleApiError(requestError, isRu ? "Не удалось изменить порядок уроков" : "Failed to reorder items");
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
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={isInspectorOpen ? <MenuOpenRoundedIcon /> : <MenuRoundedIcon />}
                                onClick={() => setInspectorOpen((current) => !current)}
                            >
                                {isInspectorOpen ? (isRu ? "Скрыть панель" : "Hide panel") : (isRu ? "Показать панель" : "Show panel")}
                            </Button>
                        </Stack>
                    ) : null}
                </Stack>

                {successMessage ? <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert> : null}
                {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
                {isEditingLocked ? (
                    <Alert severity="info">
                        {isRu
                            ? "Курс ожидает модерации администратора. Редактирование заблокировано до публикации или запроса правок."
                            : "This course is waiting for admin moderation. Editing is locked until the course is approved or changes are requested."}
                    </Alert>
                ) : null}
                <ValidationErrorPanel errors={validationErrors} />

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: course && isInspectorOpen ? "minmax(0, 1fr) 300px" : "1fr" }, gap: 2.5, alignItems: "start" }}>
                    <Stack spacing={3}>
                        <FormSectionCard
                            id="course-details-section"
                            title={isRu ? "Описание курса" : "Course details"}
                            description={isRu ? "Эти данные видят студенты в каталоге и на странице курса." : "These fields are shown in the catalog and on the course details page."}
                        >
                            <Stack spacing={2}>
                                <TextField label={isRu ? "Название" : "Title"} value={form.title} onChange={(event) => updateField("title", event.target.value)} required disabled={isEditingLocked} />
                                <TextField label={isRu ? "URL-адрес" : "Slug"} value={form.slug} onChange={(event) => updateField("slug", event.target.value)} helperText={isRu ? "URL-адрес латиницей, например java-core" : "Lowercase URL slug, for example java-core"} required disabled={isEditingLocked} />
                                <TextField label={isRu ? "Краткое описание" : "Short description"} value={form.shortDescription} onChange={(event) => updateField("shortDescription", event.target.value)} required disabled={isEditingLocked} />
                                <TextField label={isRu ? "Полное описание" : "Description"} multiline minRows={4} value={form.description} onChange={(event) => updateField("description", event.target.value)} required disabled={isEditingLocked} />
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                    <TextField select label={isRu ? "Сложность" : "Difficulty"} value={form.difficulty} onChange={(event) => updateField("difficulty", event.target.value as CourseDifficulty)} fullWidth disabled={isEditingLocked}>
                                        <MenuItem value="BEGINNER">{isRu ? "Начальный" : "BEGINNER"}</MenuItem>
                                        <MenuItem value="INTERMEDIATE">{isRu ? "Средний" : "INTERMEDIATE"}</MenuItem>
                                        <MenuItem value="ADVANCED">{isRu ? "Продвинутый" : "ADVANCED"}</MenuItem>
                                    </TextField>
                                    <TextField select label={isRu ? "Доступ" : "Access type"} value={form.accessType} onChange={(event) => updateField("accessType", event.target.value as CourseAccessType)} fullWidth disabled={isEditingLocked}>
                                        <MenuItem value="PUBLIC">{isRu ? "Публичный" : "PUBLIC"}</MenuItem>
                                        <MenuItem value="UNLISTED">{isRu ? "По ссылке" : "UNLISTED"}</MenuItem>
                                        <MenuItem value="PRIVATE">{isRu ? "Приватный" : "PRIVATE"}</MenuItem>
                                    </TextField>
                                </Stack>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                    <TextField label={isRu ? "Обложка URL" : "Cover image URL"} value={form.coverImageUrl ?? ""} onChange={(event) => updateField("coverImageUrl", event.target.value)} disabled={isEditingLocked} fullWidth />
                                    <TextField label={isRu ? "Длительность, минут" : "Estimated minutes"} type="number" value={form.estimatedMinutes ?? ""} onChange={(event) => updateField("estimatedMinutes", event.target.value === "" ? null : Number(event.target.value))} disabled={isEditingLocked} fullWidth />
                                </Stack>
                                <FormControlLabel control={<Switch checked={form.enrollmentEnabled} onChange={(event) => updateField("enrollmentEnabled", event.target.checked)} disabled={isEditingLocked} />} label={isRu ? "Запись на курс открыта" : "Enrollment enabled"} />
                            </Stack>
                        </FormSectionCard>

                        <FormSectionCard
                            id="course-structure-section"
                            title={isRu ? "Структура курса" : "Course structure"}
                            description={isRu ? "Собери последовательность модулей и уроков. Порядок можно менять стрелками, а содержание урока открывается отдельным редактором." : "Build a compact module sequence. Reorder with arrows and open item content in the full editor."}
                        >
                            {!course ? (
                                <EmptyState title={isRu ? "Сначала создай курс" : "Create course first"} description={isRu ? "Модули и уроки можно добавить после создания черновика." : "Modules and items can be added after the course draft exists."} />
                            ) : (
                                <Stack spacing={2}>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ sm: "center" }}>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <Chip size="small" color="primary" variant="outlined" label={isRu ? `${course.modules.length} модулей` : `${course.modules.length} modules`} />
                                            <Chip size="small" color="secondary" variant="outlined" label={isRu ? `${stats.items} уроков` : `${stats.items} items`} />
                                            <Chip size="small" label={isRu ? "Порядок сверху вниз" : "Top-down sequence"} />
                                        </Stack>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddRoundedIcon />}
                                            disabled={isEditingLocked}
                                            onClick={() => setModuleDialog({ mode: "create", draft: defaultModuleDraft(course.modules.length) })}
                                        >
                                            {isRu ? "Добавить модуль" : "Add module"}
                                        </Button>
                                    </Stack>

                                    {course.modules.length === 0 ? (
                                        <EmptyState title={isRu ? "Модулей пока нет" : "No modules yet"} description={isRu ? "Создай первый модуль, затем добавь теорию, квиз или практическое задание." : "Create the first module to start adding lessons and tasks."} />
                                    ) : (
                                        <Stack spacing={1.25}>
                                            {sortedModules(course).map((module, moduleIndex) => {
                                                const items = sortedItems(module);
                                                return (
                                                    <Paper
                                                        key={module.id}
                                                        variant="outlined"
                                                        sx={{
                                                            p: { xs: 1.5, md: 2 },
                                                            borderRadius: 1.5,
                                                            borderColor: moduleIndex === 0 ? "primary.main" : "divider",
                                                            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(31,31,40,0.72)" : "rgba(255,255,255,0.86)",
                                                        }}
                                                    >
                                                        <Stack spacing={1.5}>
                                                            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
                                                                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
                                                                    <Box
                                                                        sx={{
                                                                            width: 34,
                                                                            height: 34,
                                                                            borderRadius: "50%",
                                                                            display: "grid",
                                                                            placeItems: "center",
                                                                            bgcolor: "primary.main",
                                                                            color: "primary.contrastText",
                                                                            fontWeight: 950,
                                                                            flexShrink: 0,
                                                                        }}
                                                                    >
                                                                        {moduleIndex + 1}
                                                                    </Box>
                                                                    <Box sx={{ minWidth: 0 }}>
                                                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                                                            <Typography sx={{ fontWeight: 950, fontSize: 17 }}>{module.title}</Typography>
                                                                        <Chip size="small" label={isRu ? `${items.length} уроков` : `${items.length} items`} />
                                                                        <Chip
                                                                            size="small"
                                                                            icon={<AccessTimeRoundedIcon />}
                                                                            label={
                                                                                module.deadlineType === "ABSOLUTE" && module.deadlineAt
                                                                                    ? `${deadlineTypeLabel(module.deadlineType, isRu)}: ${formatDateTime(module.deadlineAt, locale)}`
                                                                                    : module.deadlineType === "RELATIVE_FROM_START" && module.timeLimitMinutes
                                                                                      ? `${deadlineTypeLabel(module.deadlineType, isRu)}: ${formatDuration(module.timeLimitMinutes)}`
                                                                                      : deadlineTypeLabel(module.deadlineType, isRu)
                                                                            }
                                                                            variant="outlined"
                                                                        />
                                                                        </Stack>
                                                                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                                                                            {isRu ? `Модуль ${moduleIndex + 1} в учебной последовательности` : `Module ${moduleIndex + 1} in the learning sequence`}
                                                                        </Typography>
                                                                    </Box>
                                                                </Stack>
                                                                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                                                                    <Tooltip title={isRu ? "Выше" : "Move module up"}>
                                                                        <span><IconButton size="small" disabled={isEditingLocked || moduleIndex === 0 || action === "reorder-modules"} onClick={() => void reorderModules(module.id, -1)}><ArrowUpwardRoundedIcon /></IconButton></span>
                                                                    </Tooltip>
                                                                    <Tooltip title={isRu ? "Ниже" : "Move module down"}>
                                                                        <span><IconButton size="small" disabled={isEditingLocked || moduleIndex === course.modules.length - 1 || action === "reorder-modules"} onClick={() => void reorderModules(module.id, 1)}><ArrowDownwardRoundedIcon /></IconButton></span>
                                                                    </Tooltip>
                                                                    <Tooltip title={isRu ? "Порядок" : "Sequence"}>
                                                                        <DragIndicatorRoundedIcon sx={{ color: "text.disabled" }} />
                                                                    </Tooltip>
                                                                    <Button
                                                                        variant="text"
                                                                        size="small"
                                                                        startIcon={<EditRoundedIcon />}
                                                                        disabled={isEditingLocked}
                                                                        onClick={() =>
                                                                            setModuleDialog({
                                                                                mode: "edit",
                                                                                moduleId: module.id,
                                                                                draft: {
                                                                                    title: module.title,
                                                                                    orderIndex: module.orderIndex,
                                                                                    deadlineType: module.deadlineType,
                                                                                    deadlineAt: module.deadlineAt,
                                                                                    timeLimitMinutes: module.timeLimitMinutes,
                                                                                },
                                                                            })
                                                                        }
                                                                    >
                                                                        {isRu ? "Модуль" : "Module"}
                                                                    </Button>
                                                                    <Button variant="text" size="small" color="error" startIcon={<DeleteRoundedIcon />} disabled={isEditingLocked} onClick={() => void deleteModule(module.id)}>
                                                                        {isRu ? "Удалить" : "Delete"}
                                                                    </Button>
                                                                </Stack>
                                                            </Stack>

                                                            {items.length === 0 ? (
                                                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.25, borderStyle: "dashed" }}>
                                                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} justifyContent="space-between">
                                                                        <Typography sx={{ color: "text.secondary" }}>{isRu ? "В модуле пока нет уроков." : "No items in this module yet."}</Typography>
                                                                        <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} disabled={isEditingLocked} onClick={() => openCreateItemDialog(module)}>
                                                                            {isRu ? "Добавить урок" : "Add item"}
                                                                        </Button>
                                                                    </Stack>
                                                                </Paper>
                                                            ) : (
                                                                <Stack spacing={0.75}>
                                                                    {items.map((item, itemIndex) => (
                                                                        <Paper key={item.id} variant="outlined" sx={{ px: 1.25, py: 1, borderRadius: 1.25 }}>
                                                                            <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }}>
                                                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
                                                                                    <Chip size="small" label={`${moduleIndex + 1}.${itemIndex + 1}`} sx={{ fontWeight: 900 }} />
                                                                                    <ItemTypeBadge itemType={item.itemType} />
                                                                                    <Typography sx={{ fontWeight: 850, overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</Typography>
                                                                                </Stack>
                                                                                <Stack direction="row" spacing={0.25} alignItems="center" flexWrap="wrap" useFlexGap>
                                                                                    <Tooltip title={isRu ? "Выше" : "Move item up"}>
                                                                                        <span><IconButton size="small" disabled={isEditingLocked || itemIndex === 0 || action === `reorder-items-${module.id}`} onClick={() => void reorderItems(module, item.id, -1)}><ArrowUpwardRoundedIcon /></IconButton></span>
                                                                                    </Tooltip>
                                                                                    <Tooltip title={isRu ? "Ниже" : "Move item down"}>
                                                                                        <span><IconButton size="small" disabled={isEditingLocked || itemIndex === items.length - 1 || action === `reorder-items-${module.id}`} onClick={() => void reorderItems(module, item.id, 1)}><ArrowDownwardRoundedIcon /></IconButton></span>
                                                                                    </Tooltip>
                                                                                    <Tooltip title={isRu ? "Быстро изменить" : "Quick edit metadata"}>
                                                                                        <span><IconButton size="small" disabled={isEditingLocked || action === `load-item-${item.id}`} onClick={() => void openEditItemDialog(module.id, item)}><EditRoundedIcon /></IconButton></span>
                                                                                    </Tooltip>
                                                                                    <Tooltip title={isRu ? "Открыть редактор урока" : "Open full item editor"}>
                                                                                        <IconButton size="small" component={RouterLink} to={`/teacher/courses/${course.id}/edit/items/${item.id}`}><OpenInNewRoundedIcon /></IconButton>
                                                                                    </Tooltip>
                                                                                    <Tooltip title={isRu ? "Удалить урок" : "Delete item"}>
                                                                                        <IconButton size="small" color="error" disabled={isEditingLocked} onClick={() => void deleteItem(item.id)}><DeleteRoundedIcon /></IconButton>
                                                                                    </Tooltip>
                                                                                </Stack>
                                                                            </Stack>
                                                                        </Paper>
                                                                    ))}
                                                                    <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} disabled={isEditingLocked} onClick={() => openCreateItemDialog(module)} sx={{ alignSelf: "flex-start" }}>
                                                                        {isRu ? "Добавить урок в модуль" : "Add item to module"}
                                                                    </Button>
                                                                </Stack>
                                                            )}
                                                        </Stack>
                                                    </Paper>
                                                );
                                            })}
                                        </Stack>
                                    )}
                                </Stack>
                            )}
                        </FormSectionCard>
                        {course ? (
                            <Box id="course-leaderboard-section" sx={{ scrollMarginTop: 96 }}>
                                <CourseLeaderboardPanel courseId={course.id} />
                            </Box>
                        ) : null}
                    </Stack>

                    {course && isInspectorOpen ? (
                        <Stack spacing={2} sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                        <Typography variant="h6">{isRu ? "Панель редактора" : "Editor panel"}</Typography>
                                        <Tooltip title={isRu ? "Скрыть панель" : "Hide panel"}>
                                            <IconButton size="small" onClick={() => setInspectorOpen(false)}>
                                                <MenuOpenRoundedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                    <Stack spacing={0.75}>
                                        <Button component="a" href="#course-details-section" variant="text" size="small" sx={{ justifyContent: "flex-start" }}>
                                            {isRu ? "Описание" : "Details"}
                                        </Button>
                                        <Button component="a" href="#course-structure-section" variant="text" size="small" sx={{ justifyContent: "flex-start" }}>
                                            {isRu ? "Структура" : "Structure"}
                                        </Button>
                                        <Button component="a" href="#course-leaderboard-section" variant="text" size="small" sx={{ justifyContent: "flex-start" }}>
                                            {isRu ? "Лидерборд" : "Leaderboard"}
                                        </Button>
                                        <Button component="a" href="#course-moderation-section" variant="text" size="small" sx={{ justifyContent: "flex-start" }}>
                                            {isRu ? "Модерация" : "Moderation"}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Paper>

                            <Paper id="course-moderation-section" variant="outlined" sx={{ p: 2, borderRadius: 2, scrollMarginTop: 96 }}>
                                <Stack spacing={1.5}>
                                    <Typography variant="h6">{isRu ? "Сводка курса" : "Course summary"}</Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <StatusBadge status={course.status} />
                                        <Chip size="small" label={isRu ? `${stats.modules} модулей` : `${stats.modules} modules`} />
                                        <Chip size="small" label={isRu ? `${stats.items} уроков` : `${stats.items} items`} />
                                        <Chip size="small" label={formatDuration(course.estimatedMinutes)} />
                                    </Stack>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        {isRu ? "Создан" : "Created"} {new Date(course.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        {isRu ? "Обновлён" : "Updated"} {new Date(course.updatedAt).toLocaleDateString()}
                                    </Typography>
                                    {course.publishedAt ? <Typography variant="body2" sx={{ color: "text.secondary" }}>{isRu ? "Опубликован" : "Published"} {new Date(course.publishedAt).toLocaleDateString()}</Typography> : null}
                                    {course.submittedForReviewAt ? <Typography variant="body2" sx={{ color: "text.secondary" }}>{isRu ? "Отправлен на модерацию" : "Submitted for review"} {new Date(course.submittedForReviewAt).toLocaleDateString()}</Typography> : null}
                                    {course.reviewedAt ? <Typography variant="body2" sx={{ color: "text.secondary" }}>{isRu ? "Проверен" : "Reviewed"} {new Date(course.reviewedAt).toLocaleDateString()}</Typography> : null}
                                    {course.reviewComment ? <Alert severity={course.status === "CHANGES_REQUESTED" ? "warning" : "info"}>{isRu ? "Комментарий администратора" : "Admin review"}: {course.reviewComment}</Alert> : null}
                                </Stack>
                            </Paper>
                        </Stack>
                    ) : null}
                </Box>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, position: { md: "sticky" }, bottom: { md: 16 }, zIndex: 2, bgcolor: "background.paper" }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={submitForm} disabled={isSaving || action !== null || isEditingLocked}>
                            {isCreate ? (isRu ? "Создать курс" : "Create course") : (isRu ? "Сохранить описание" : "Save metadata")}
                        </Button>
                        {!isCreate && course ? (
                            <>
                                <Button variant="outlined" startIcon={<RateReviewRoundedIcon />} onClick={() => void runCourseAction("submit")} disabled={isSaving || action !== null || course.status === "PENDING_REVIEW" || course.status === "PUBLISHED" || course.status === "ARCHIVED"}>
                                    {isRu ? "Отправить на модерацию" : "Submit for review"}
                                </Button>
                                <Button variant="outlined" component={RouterLink} to={`/courses/${course.id}`} startIcon={<VisibilityRoundedIcon />}>
                                    {isRu ? "Предпросмотр" : "Preview as student"}
                                </Button>
                                <Button variant="outlined" color="error" startIcon={<ArchiveRoundedIcon />} onClick={() => void runCourseAction("archive")} disabled={isSaving || action !== null || course.status === "ARCHIVED"}>
                                    {isRu ? "В архив" : "Archive Course"}
                                </Button>
                            </>
                        ) : null}
                    </Stack>
                </Paper>
            </Stack>

            <Dialog open={Boolean(moduleDialog)} onClose={() => setModuleDialog(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}>
                <DialogTitle sx={{ p: 0 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ px: { xs: 2.5, md: 3 }, py: 2.2, borderBottom: 1, borderColor: "divider" }}>
                        <Box>
                            <Typography variant="h5">{moduleDialog?.mode === "create" ? (isRu ? "Создать модуль" : "Create module") : (isRu ? "Редактировать модуль" : "Edit module")}</Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.4 }}>
                                {isRu ? "Настройте порядок и правило дедлайна." : "Set the module order and deadline rule."}
                            </Typography>
                        </Box>
                        <IconButton aria-label={isRu ? "Закрыть" : "Close"} onClick={() => setModuleDialog(null)}>
                            <CloseRoundedIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ px: { xs: 2.5, md: 3 }, py: 3 }}>
                    {moduleDialog ? (
                        <Stack spacing={2.4}>
                            <TextField label={isRu ? "Название" : "Title"} value={moduleDialog.draft.title} onChange={(event) => setModuleDialog({ ...moduleDialog, draft: { ...moduleDialog.draft, title: event.target.value } })} required fullWidth />
                            <TextField label={isRu ? "Порядок" : "Order index"} type="number" value={moduleDialog.draft.orderIndex} onChange={(event) => setModuleDialog({ ...moduleDialog, draft: { ...moduleDialog.draft, orderIndex: Number(event.target.value) } })} sx={{ maxWidth: 180 }} />

                            <Divider />

                            <Stack spacing={1.4}>
                                <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 950, lineHeight: 1 }}>
                                    {isRu ? "Дедлайн" : "Deadline"}
                                </Typography>
                                <ToggleButtonGroup
                                    exclusive
                                    fullWidth
                                    size="small"
                                    value={moduleDialog.draft.deadlineType ?? "NONE"}
                                    onChange={(_, nextDeadlineType: ModuleDeadlineType | null) => {
                                        if (nextDeadlineType) updateModuleDeadlineType(nextDeadlineType);
                                    }}
                                    sx={{
                                        p: 0.4,
                                        border: 1,
                                        borderColor: "divider",
                                        borderRadius: 1.25,
                                        bgcolor: "action.hover",
                                        "& .MuiToggleButtonGroup-grouped": {
                                            flex: 1,
                                            minHeight: 42,
                                            border: 0,
                                            borderRadius: 1,
                                            fontWeight: 900,
                                            color: "text.secondary",
                                            "&.Mui-selected": {
                                                bgcolor: "background.paper",
                                                color: "primary.main",
                                                boxShadow: (theme) => (theme.palette.mode === "dark" ? "inset 0 0 0 1px rgba(255,255,255,0.08)" : "0 1px 4px rgba(53,37,205,0.12)"),
                                            },
                                        },
                                    }}
                                >
                                    <ToggleButton value="NONE">
                                        <Stack direction="row" spacing={0.7} alignItems="center" justifyContent="center">
                                            <DoNotDisturbOnRoundedIcon fontSize="small" />
                                            <span>{isRu ? "Без дедлайна" : "No deadline"}</span>
                                        </Stack>
                                    </ToggleButton>
                                    <ToggleButton value="ABSOLUTE">
                                        <Stack direction="row" spacing={0.7} alignItems="center" justifyContent="center">
                                            <CalendarMonthRoundedIcon fontSize="small" />
                                            <span>{isRu ? "Дата" : "Fixed date"}</span>
                                        </Stack>
                                    </ToggleButton>
                                    <ToggleButton value="RELATIVE_FROM_START">
                                        <Stack direction="row" spacing={0.7} alignItems="center" justifyContent="center">
                                            <AccessTimeRoundedIcon fontSize="small" />
                                            <span>{isRu ? "Таймер" : "Timer"}</span>
                                        </Stack>
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Stack>

                            {moduleDialog.draft.deadlineType === "ABSOLUTE" ? (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, bgcolor: "action.hover" }}>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.6} alignItems={{ sm: "flex-start" }}>
                                        <CalendarMonthRoundedIcon color="primary" sx={{ mt: { sm: 2.2 } }} />
                                        <TextField
                                            fullWidth
                                            label={isRu ? "Дата и время дедлайна" : "Deadline date and time"}
                                            type="datetime-local"
                                            value={moduleDialog.draft.deadlineAt ?? ""}
                                            onChange={(event) => setModuleDialog({ ...moduleDialog, draft: { ...moduleDialog.draft, deadlineAt: event.target.value || null, timeLimitMinutes: null } })}
                                            InputLabelProps={{ shrink: true }}
                                            required
                                        />
                                    </Stack>
                                </Paper>
                            ) : null}

                            {moduleDialog.draft.deadlineType === "RELATIVE_FROM_START" ? (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, bgcolor: "action.hover" }}>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.6} alignItems={{ sm: "flex-start" }}>
                                        <AccessTimeRoundedIcon color="primary" sx={{ mt: { sm: 0.3 } }} />
                                        <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                                            <Box>
                                                <Typography sx={{ fontWeight: 950 }}>{isRu ? "Таймер от старта" : "Timer from start"}</Typography>
                                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                    {isRu ? "Лимит начнется после явного старта модуля." : "The limit starts after the student explicitly starts the module."}
                                                </Typography>
                                            </Box>
                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                                <TextField
                                                    label={isRu ? "Часы" : "Hours"}
                                                    type="number"
                                                    value={moduleTimeLimit.hours}
                                                    onChange={(event) => updateModuleTimeLimit(Number(event.target.value), moduleTimeLimit.minutes)}
                                                    inputProps={{ min: 0 }}
                                                    fullWidth
                                                />
                                                <TextField
                                                    label={isRu ? "Минуты" : "Minutes"}
                                                    type="number"
                                                    value={moduleTimeLimit.minutes}
                                                    onChange={(event) => updateModuleTimeLimit(moduleTimeLimit.hours, Number(event.target.value))}
                                                    inputProps={{ min: 0, max: 59 }}
                                                    fullWidth
                                                />
                                            </Stack>
                                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
                                                {isRu ? "Итого" : "Total"}: {formatDuration(moduleDialog.draft.timeLimitMinutes ?? 120)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ) : null}

                            {moduleDialog.draft.deadlineType === "NONE" ? (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, bgcolor: "action.hover" }}>
                                    <Stack direction="row" spacing={1.2} alignItems="center">
                                        <DoNotDisturbOnRoundedIcon color="disabled" />
                                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 800 }}>
                                            {isRu ? "Модуль будет доступен без проверки дедлайна." : "The module will be available without deadline checks."}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            ) : null}
                        </Stack>
                    ) : null}
                </DialogContent>
                <DialogActions sx={{ px: { xs: 2.5, md: 3 }, py: 2, borderTop: 1, borderColor: "divider", bgcolor: "action.hover" }}>
                    <Button onClick={() => setModuleDialog(null)}>{isRu ? "Отмена" : "Cancel"}</Button>
                    <Button variant="contained" onClick={() => void saveModule()} disabled={action === "module" || isEditingLocked}>{isRu ? "Сохранить модуль" : "Save module"}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(itemDialog)} onClose={() => setItemDialog(null)} fullWidth maxWidth="md">
                <DialogTitle>{itemDialog?.mode === "create" ? (isRu ? "Создать урок" : "Create item") : (isRu ? "Редактировать урок" : "Edit item metadata")}</DialogTitle>
                <DialogContent>
                    {itemDialog ? (
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <TextField label={isRu ? "Название" : "Title"} value={itemDialog.draft.title} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, title: event.target.value } })} required fullWidth />
                                <TextField select label={isRu ? "Тип урока" : "Item type"} value={itemDialog.draft.itemType} onChange={(event) => {
                                    const nextType = event.target.value as CourseItemType;
                                    setItemDialog({ ...itemDialog, draft: normalizeItemDraft({ ...itemDialog.draft, itemType: nextType }) });
                                }} fullWidth>
                                    {(["THEORY", "QUIZ", "CODING", "SQL", "FILE"] as CourseItemType[]).map((type) => (
                                        <MenuItem key={type} value={type}>{courseItemTypeLabel(type, isRu)}</MenuItem>
                                    ))}
                                </TextField>
                            </Stack>
                            <TextField label={isRu ? "Порядок" : "Order index"} type="number" value={itemDialog.draft.orderIndex} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, orderIndex: Number(event.target.value) } })} />
                            <TextField label={isRu ? "Условие / описание" : "Statement"} multiline minRows={4} value={itemDialog.draft.statement ?? ""} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, statement: event.target.value } })} />
                            {itemDialog.draft.itemType === "CODING" || itemDialog.draft.itemType === "SQL" ? (
                                <Stack spacing={2}>
                                    <TextField label={isRu ? "Язык" : "Language"} helperText={isRu ? "Например: java, python или sql." : "For example: java, python or sql."} value={itemDialog.draft.language ?? ""} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, language: event.target.value } })} required />
                                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                        <TextField label={isRu ? "Лимит времени, мс" : "Time limit, ms"} type="number" value={itemDialog.draft.timeLimitMs ?? 2000} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, timeLimitMs: Number(event.target.value) } })} fullWidth />
                                        <TextField label={isRu ? "Память, МБ" : "Memory, MB"} type="number" value={itemDialog.draft.memoryLimitMb ?? 256} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, memoryLimitMb: Number(event.target.value) } })} fullWidth />
                                        <TextField label={isRu ? "Лимит вывода, КБ" : "Output limit, KB"} type="number" value={itemDialog.draft.outputLimitKb ?? 128} onChange={(event) => setItemDialog({ ...itemDialog, draft: { ...itemDialog.draft, outputLimitKb: Number(event.target.value) } })} fullWidth />
                                    </Stack>
                                </Stack>
                            ) : null}
                        </Stack>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setItemDialog(null)}>{isRu ? "Отмена" : "Cancel"}</Button>
                    <Button variant="contained" onClick={() => void saveItem()} disabled={action === "item" || isEditingLocked}>{isRu ? "Сохранить урок" : "Save item"}</Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
}

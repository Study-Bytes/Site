import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
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
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ApiError, getErrorMessage } from "../../api/apiError";
import { teacherApi } from "../../api/services";
import type {
    ApiValidationError,
    ComparisonMode,
    ContentBlockDto,
    ContentBlockType,
    ContentBlockUpsertRequest,
    CourseItemType,
    CourseItemUpsertRequest,
    HintDto,
    HintUpsertRequest,
    QuizOptionDto,
    QuizOptionUpsertRequest,
    TeacherItemDetails,
    TestCaseDto,
    TestCaseUpsertRequest,
    TestCaseVisibility,
} from "../../api/bffContracts";
import { FormSectionCard } from "../../components/ui/FormSectionCard";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ValidationErrorPanel } from "../../components/ui/ValidationErrorPanel";
import { useI18n } from "../../i18n/useI18n";
import { PageContainer } from "../../layouts/PageContainer";
import { courseItemTypeLabel } from "../../utils/courseLabels";
import { parseRouteCourseId } from "../../utils/courseFormat";

function contentBlockTypeLabel(type: ContentBlockType, isRu: boolean) {
    const labels: Record<ContentBlockType, { ru: string; en: string }> = {
        TEXT: { ru: "Текст", en: "Text" },
        VIDEO: { ru: "Видео", en: "Video" },
        IMAGE: { ru: "Изображение", en: "Image" },
        CODE: { ru: "Код", en: "Code" },
        EMBED: { ru: "Embed", en: "Embed" },
        FILE: { ru: "Файл", en: "File" },
    };
    return isRu ? labels[type].ru : labels[type].en;
}

function testVisibilityLabel(value: TestCaseVisibility, isRu: boolean) {
    if (value === "OPEN") return isRu ? "Открытый" : "Open";
    return isRu ? "Скрытый" : "Hidden";
}

function comparisonModeLabel(value: ComparisonMode, isRu: boolean) {
    if (value === "EXACT") return isRu ? "Точное совпадение" : "Exact match";
    if (value === "IGNORE_WHITESPACE") return isRu ? "Игнорировать пробелы" : "Ignore whitespace";
    return isRu ? "Своя проверка" : "Custom checker";
}

function formFromItem(item: TeacherItemDetails): CourseItemUpsertRequest {
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

function normalizeItemForm(input: CourseItemUpsertRequest): CourseItemUpsertRequest {
    const executable = input.itemType === "CODING" || input.itemType === "SQL";
    return {
        ...input,
        title: input.title.trim(),
        statement: input.statement?.trim() || null,
        orderIndex: Number(input.orderIndex),
        language: executable ? input.language?.trim() || "" : null,
        starterCode: executable ? input.starterCode ?? "" : null,
        solutionCode: executable ? input.solutionCode ?? null : null,
        timeLimitMs: executable ? Number(input.timeLimitMs ?? 2000) : null,
        memoryLimitMb: executable ? Number(input.memoryLimitMb ?? 256) : null,
        outputLimitKb: executable ? Number(input.outputLimitKb ?? 128) : null,
    };
}

function validateItemForm(input: CourseItemUpsertRequest, isRu = false): ApiValidationError[] {
    const item = normalizeItemForm(input);
    const errors: ApiValidationError[] = [];
    if (!item.title) errors.push({ field: "title", message: isRu ? "Укажите название урока" : "Title is required" });
    if (!Number.isFinite(item.orderIndex) || item.orderIndex < 0) errors.push({ field: "orderIndex", message: isRu ? "Порядок должен быть неотрицательным числом" : "Order index must be non-negative" });
    if ((item.itemType === "CODING" || item.itemType === "SQL") && !item.language) errors.push({ field: "language", message: isRu ? "Для CODING и SQL нужен язык" : "Language is required for CODING and SQL items" });
    for (const field of ["timeLimitMs", "memoryLimitMb", "outputLimitKb"] as const) {
        const value = item[field];
        if ((item.itemType === "CODING" || item.itemType === "SQL") && (value === null || !Number.isFinite(value) || value < 0)) {
            errors.push({ field, message: isRu ? `${field} должен быть неотрицательным` : `${field} must be non-negative` });
        }
    }
    return errors;
}

function move<T>(items: T[], index: number, direction: -1 | 1): T[] {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return items;
    const copy = [...items];
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
    return copy;
}

function reindexContentBlocks(items: ContentBlockDto[]): ContentBlockDto[] {
    return items.map((item, index) => ({ ...item, orderIndex: index }));
}
function reindexHints(items: HintDto[]): HintDto[] {
    return items.map((item, index) => ({ ...item, orderIndex: index }));
}
function reindexTestCases(items: TestCaseDto[]): TestCaseDto[] {
    return items.map((item, index) => ({ ...item, orderIndex: index }));
}
function reindexOptions(items: QuizOptionDto[]): QuizOptionDto[] {
    return items.map((item, index) => ({ ...item, orderIndex: index }));
}

function blockToRequest(block: ContentBlockDto): ContentBlockUpsertRequest {
    return {
        blockType: block.blockType,
        orderIndex: block.orderIndex,
        title: block.title?.trim() || null,
        textContent: block.textContent ?? null,
        url: block.url?.trim() || null,
        language: block.language?.trim() || null,
        metadataJson: block.metadataJson?.trim() || null,
    };
}
function hintToRequest(hint: HintDto): HintUpsertRequest {
    return { orderIndex: hint.orderIndex, text: hint.text.trim() };
}
function testCaseToRequest(testCase: TestCaseDto): TestCaseUpsertRequest {
    return {
        testKey: testCase.testKey.trim(),
        orderIndex: testCase.orderIndex,
        visibility: testCase.visibility,
        inputData: testCase.inputData ?? null,
        expectedOutput: testCase.expectedOutput ?? null,
    };
}
function optionToRequest(option: QuizOptionDto): QuizOptionUpsertRequest {
    return {
        orderIndex: option.orderIndex,
        label: option.label?.trim() || null,
        text: option.text.trim(),
        correct: Boolean(option.correct),
        explanation: option.explanation?.trim() || null,
    };
}

const newId = () => -Date.now() - Math.floor(Math.random() * 1000);

export default function TeacherItemEditorPage() {
    const { courseId, itemId } = useParams();
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const parsedCourseId = parseRouteCourseId(courseId);
    const parsedItemId = parseRouteCourseId(itemId);

    const [item, setItem] = useState<TeacherItemDetails | null>(null);
    const [form, setForm] = useState<CourseItemUpsertRequest | null>(null);
    const [contentBlocks, setContentBlocks] = useState<ContentBlockDto[]>([]);
    const [hints, setHints] = useState<HintDto[]>([]);
    const [testCases, setTestCases] = useState<TestCaseDto[]>([]);
    const [options, setOptions] = useState<QuizOptionDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savingSection, setSavingSection] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ApiValidationError[]>([]);
    const [isInspectorOpen, setInspectorOpen] = useState(() => localStorage.getItem("studybytes_item_editor_panel") !== "closed");

    const applyItem = (loaded: TeacherItemDetails) => {
        setItem(loaded);
        setForm(formFromItem(loaded));
        setContentBlocks(loaded.contentBlocks.slice().sort((a, b) => a.orderIndex - b.orderIndex));
        setHints(loaded.hints.slice().sort((a, b) => a.orderIndex - b.orderIndex));
        setTestCases(loaded.testCases.slice().sort((a, b) => a.orderIndex - b.orderIndex));
        setOptions(loaded.options.slice().sort((a, b) => a.orderIndex - b.orderIndex));
    };

    const loadItem = async () => {
        if (!parsedItemId) {
            setError(isRu ? "Некорректный id урока" : "Invalid item id");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const loaded = await teacherApi.getItem(parsedItemId);
            applyItem(loaded);
        } catch (requestError) {
            setError(getErrorMessage(requestError, isRu ? "Не удалось загрузить урок" : "Failed to load item"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadItem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parsedItemId]);

    useEffect(() => {
        localStorage.setItem("studybytes_item_editor_panel", isInspectorOpen ? "open" : "closed");
    }, [isInspectorOpen]);

    const handleApiError = (requestError: unknown, fallback: string) => {
        if (requestError instanceof ApiError && requestError.validationErrors.length > 0) {
            setValidationErrors(requestError.validationErrors);
        }
        setError(getErrorMessage(requestError, fallback));
    };

    const updateForm = <K extends keyof CourseItemUpsertRequest>(field: K, value: CourseItemUpsertRequest[K]) => {
        setForm((current) => (current ? { ...current, [field]: value } : current));
    };

    const saveMetadata = async () => {
        if (!form || !parsedItemId) return;
        setSuccessMessage(null);
        setError(null);
        const errors = validateItemForm(form, isRu);
        setValidationErrors(errors);
        if (errors.length > 0) return;
        setSavingSection("metadata");
        try {
            const updated = await teacherApi.updateItem(parsedItemId, normalizeItemForm(form));
            applyItem(updated);
            setSuccessMessage(isRu ? "Настройки урока сохранены" : "Item metadata saved");
        } catch (requestError) {
            handleApiError(requestError, isRu ? "Не удалось сохранить настройки урока" : "Failed to save item metadata");
        } finally {
            setSavingSection(null);
        }
    };

    const saveContentBlocks = async () => {
        if (!parsedItemId) return;
        setSavingSection("contentBlocks");
        setSuccessMessage(null);
        setError(null);
        try {
            const updated = await teacherApi.replaceContentBlocks(parsedItemId, reindexContentBlocks(contentBlocks).map(blockToRequest));
            applyItem(updated);
            setSuccessMessage(isRu ? "Материалы сохранены" : "Content blocks saved");
        } catch (requestError) {
            handleApiError(requestError, isRu ? "Не удалось сохранить материалы" : "Failed to save content blocks");
        } finally {
            setSavingSection(null);
        }
    };

    const saveHints = async () => {
        if (!parsedItemId) return;
        setSavingSection("hints");
        setSuccessMessage(null);
        setError(null);
        try {
            const updated = await teacherApi.replaceHints(parsedItemId, reindexHints(hints).map(hintToRequest));
            applyItem(updated);
            setSuccessMessage(isRu ? "Подсказки сохранены" : "Hints saved");
        } catch (requestError) {
            handleApiError(requestError, isRu ? "Не удалось сохранить подсказки" : "Failed to save hints");
        } finally {
            setSavingSection(null);
        }
    };

    const saveTestCases = async () => {
        if (!parsedItemId) return;
        setSavingSection("testCases");
        setSuccessMessage(null);
        setError(null);
        try {
            const updated = await teacherApi.replaceTestCases(parsedItemId, reindexTestCases(testCases).map(testCaseToRequest));
            applyItem(updated);
            setSuccessMessage(isRu ? "Тесты сохранены" : "Test cases saved");
        } catch (requestError) {
            handleApiError(requestError, isRu ? "Не удалось сохранить тесты" : "Failed to save test cases");
        } finally {
            setSavingSection(null);
        }
    };

    const saveOptions = async () => {
        if (!parsedItemId) return;
        setSavingSection("options");
        setSuccessMessage(null);
        setError(null);
        try {
            const updated = await teacherApi.replaceOptions(parsedItemId, reindexOptions(options).map(optionToRequest));
            applyItem(updated);
            setSuccessMessage(isRu ? "Варианты ответа сохранены" : "Quiz options saved");
        } catch (requestError) {
            handleApiError(requestError, isRu ? "Не удалось сохранить варианты ответа" : "Failed to save quiz options");
        } finally {
            setSavingSection(null);
        }
    };

    if (isLoading) {
        return (
            <PageContainer>
                <LoadingState rows={5} />
            </PageContainer>
        );
    }

    if (error && !item) {
        return (
            <PageContainer>
                <ErrorState message={error} onRetry={loadItem} />
            </PageContainer>
        );
    }

    if (!item || !form) {
        return (
            <PageContainer>
                <ErrorState message={isRu ? "Урок не найден" : "Item was not found"} />
            </PageContainer>
        );
    }

    const isExecutable = form.itemType === "CODING" || form.itemType === "SQL";
    const isQuiz = form.itemType === "QUIZ";

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Box>
                    <Button component={RouterLink} to={`/teacher/courses/${parsedCourseId ?? ""}/edit`} startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 1 }}>
                        {isRu ? "К редактору курса" : "Back to course editor"}
                    </Button>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ md: "center" }}>
                        <Box>
                            <Typography variant="h2">{isRu ? "Редактор урока" : "Item editor"}: {item.title}</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1 }}>
                                {isRu ? "Редактируй задание, материалы, подсказки, тесты и варианты ответа." : "Edit the task, materials, hints, tests and answer options."}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <ItemTypeBadge itemType={item.itemType} />
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={isInspectorOpen ? <MenuOpenRoundedIcon /> : <MenuRoundedIcon />}
                                onClick={() => setInspectorOpen((current) => !current)}
                            >
                                {isInspectorOpen ? (isRu ? "Скрыть панель" : "Hide panel") : (isRu ? "Показать панель" : "Show panel")}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>

                {successMessage ? <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert> : null}
                {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
                <ValidationErrorPanel errors={validationErrors} />

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: isInspectorOpen ? "minmax(0, 1fr) 280px" : "1fr" }, gap: 2.5, alignItems: "start" }}>
                    <Stack spacing={3}>
                <FormSectionCard id="item-basic-section" title={isRu ? "Основные настройки" : "Basic settings"} description={isRu ? "Общие параметры для всех типов уроков." : "Basic fields shared by all item types."}>
                    <Stack spacing={2}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <TextField label={isRu ? "Название урока" : "Title"} value={form.title} onChange={(event) => updateForm("title", event.target.value)} required fullWidth />
                            <TextField select label={isRu ? "Тип урока" : "Item type"} value={form.itemType} onChange={(event) => updateForm("itemType", event.target.value as CourseItemType)} fullWidth>
                                {(["THEORY", "QUIZ", "CODING", "SQL", "FILE"] as CourseItemType[]).map((type) => (
                                    <MenuItem key={type} value={type}>{courseItemTypeLabel(type, isRu)}</MenuItem>
                                ))}
                            </TextField>
                            <TextField label={isRu ? "Порядок" : "Order index"} type="number" value={form.orderIndex} onChange={(event) => updateForm("orderIndex", Number(event.target.value))} fullWidth />
                        </Stack>
                        <TextField label={isRu ? "Условие / описание для студента" : "Statement"} multiline minRows={5} value={form.statement ?? ""} onChange={(event) => updateForm("statement", event.target.value)} />
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveMetadata()} disabled={savingSection === "metadata"}>
                                {isRu ? "Сохранить урок" : "Save Item"}
                            </Button>
                        </Stack>
                    </Stack>
                </FormSectionCard>

                {isExecutable ? (
                    <FormSectionCard id="item-execution-section" title={isRu ? "Настройки проверки" : "Execution settings"} description={isRu ? "Настрой язык, ограничения выполнения и код для проверки решения." : "Configure language, execution limits and solution-checking code."}>
                        <Stack spacing={2}>
                            <TextField label={isRu ? "Язык" : "Language"} value={form.language ?? ""} onChange={(event) => updateForm("language", event.target.value)} required />
                            <TextField label={isRu ? "Стартовый код" : "Starter code"} multiline minRows={8} value={form.starterCode ?? ""} onChange={(event) => updateForm("starterCode", event.target.value)} sx={{ "& textarea": { fontFamily: "monospace" } }} />
                            <TextField label={isRu ? "Эталонное решение" : "Solution code"} multiline minRows={8} value={form.solutionCode ?? ""} onChange={(event) => updateForm("solutionCode", event.target.value)} sx={{ "& textarea": { fontFamily: "monospace" } }} />
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <TextField label={isRu ? "Лимит времени, мс" : "Time limit, ms"} type="number" value={form.timeLimitMs ?? 2000} onChange={(event) => updateForm("timeLimitMs", Number(event.target.value))} fullWidth />
                                <TextField label={isRu ? "Память, МБ" : "Memory, MB"} type="number" value={form.memoryLimitMb ?? 256} onChange={(event) => updateForm("memoryLimitMb", Number(event.target.value))} fullWidth />
                                <TextField label={isRu ? "Лимит вывода, КБ" : "Output limit, KB"} type="number" value={form.outputLimitKb ?? 128} onChange={(event) => updateForm("outputLimitKb", Number(event.target.value))} fullWidth />
                            </Stack>
                            <TextField select label={isRu ? "Режим сравнения" : "Comparison mode"} value={form.comparisonMode} onChange={(event) => updateForm("comparisonMode", event.target.value as ComparisonMode)}>
                                {(["EXACT", "IGNORE_WHITESPACE", "CUSTOM"] as ComparisonMode[]).map((mode) => (
                                    <MenuItem key={mode} value={mode}>{comparisonModeLabel(mode, isRu)}</MenuItem>
                                ))}
                            </TextField>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
                                <FormControlLabel control={<Switch checked={form.networkDisabled} onChange={(event) => updateForm("networkDisabled", event.target.checked)} />} label={isRu ? "Запретить сеть" : "Network disabled"} />
                                <FormControlLabel control={<Switch checked={form.readOnlyFs} onChange={(event) => updateForm("readOnlyFs", event.target.checked)} />} label={isRu ? "Файловая система только для чтения" : "Read-only filesystem"} />
                                <FormControlLabel control={<Switch checked={form.normalizeLineEndings} onChange={(event) => updateForm("normalizeLineEndings", event.target.checked)} />} label={isRu ? "Нормализовать переносы строк" : "Normalize line endings"} />
                                <FormControlLabel control={<Switch checked={form.trimTrailingWhitespaces} onChange={(event) => updateForm("trimTrailingWhitespaces", event.target.checked)} />} label={isRu ? "Обрезать пробелы в конце" : "Trim trailing whitespaces"} />
                            </Stack>
                            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveMetadata()} disabled={savingSection === "metadata"}>
                                {isRu ? "Сохранить проверку" : "Save execution settings"}
                            </Button>
                        </Stack>
                    </FormSectionCard>
                ) : null}

                <FormSectionCard id="item-content-section" title={isRu ? "Материалы урока" : "Content blocks"} description={isRu ? "Текст, видео, изображения, код, embed и файлы, которые видит студент." : "Theory, file, code, image, video, embed and document blocks shown to students."}>
                    <Stack spacing={2}>
                        {contentBlocks.length === 0 ? <Alert severity="info">{isRu ? "Материалов пока нет." : "No content blocks yet."}</Alert> : null}
                        {contentBlocks.map((block, index) => (
                            <Accordion key={block.id} defaultExpanded={index === 0} variant="outlined" sx={{ borderRadius: 1.25, "&:before": { display: "none" } }}>
                                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                                    <Typography sx={{ fontWeight: 900 }}>{block.title || `${contentBlockTypeLabel(block.blockType, isRu)} #${index + 1}`}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack spacing={2}>
                                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                            <TextField select label={isRu ? "Тип материала" : "Block type"} value={block.blockType} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, blockType: event.target.value as ContentBlockType } : entry))} fullWidth>
                                                {(["TEXT", "VIDEO", "IMAGE", "CODE", "EMBED", "FILE"] as ContentBlockType[]).map((type) => (
                                                    <MenuItem key={type} value={type}>{contentBlockTypeLabel(type, isRu)}</MenuItem>
                                                ))}
                                            </TextField>
                                            <TextField label={isRu ? "Порядок" : "Order index"} type="number" value={block.orderIndex} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, orderIndex: Number(event.target.value) } : entry))} fullWidth />
                                        </Stack>
                                        <TextField label={isRu ? "Заголовок" : "Title"} value={block.title ?? ""} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, title: event.target.value } : entry))} />
                                        <TextField label={isRu ? "Текст, описание или код" : "Text, description or code"} multiline minRows={4} value={block.textContent ?? ""} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, textContent: event.target.value } : entry))} />
                                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                            <TextField label={isRu ? "URL материала" : "Media URL"} helperText={isRu ? "Для изображения, видео, embed или файла укажите ссылку." : "Use this for image, video, embed or file links."} value={block.url ?? ""} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, url: event.target.value } : entry))} fullWidth />
                                            <TextField label={isRu ? "Язык кода" : "Code language"} value={block.language ?? ""} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, language: event.target.value } : entry))} fullWidth />
                                        </Stack>
                                        <TextField label={isRu ? "Метаданные JSON" : "Metadata JSON"} multiline minRows={3} value={block.metadataJson ?? ""} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, metadataJson: event.target.value } : entry))} />
                                        <Stack direction="row" spacing={0.5}>
                                            <Tooltip title={isRu ? "Поднять" : "Move up"}><span><IconButton disabled={index === 0} onClick={() => setContentBlocks((current) => reindexContentBlocks(move(current, index, -1)))}><ArrowUpwardRoundedIcon /></IconButton></span></Tooltip>
                                            <Tooltip title={isRu ? "Опустить" : "Move down"}><span><IconButton disabled={index === contentBlocks.length - 1} onClick={() => setContentBlocks((current) => reindexContentBlocks(move(current, index, 1)))}><ArrowDownwardRoundedIcon /></IconButton></span></Tooltip>
                                            <Tooltip title={isRu ? "Удалить материал" : "Delete block"}><IconButton color="error" onClick={() => window.confirm(isRu ? "Удалить этот материал?" : "Delete this content block?") && setContentBlocks((current) => reindexContentBlocks(current.filter((_, i) => i !== index)))}><DeleteRoundedIcon /></IconButton></Tooltip>
                                        </Stack>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setContentBlocks((current) => [...current, { id: newId(), blockType: "TEXT", orderIndex: current.length, title: "", textContent: "", url: null, language: null, metadataJson: null }])}>
                                {isRu ? "Добавить материал" : "Add content block"}
                            </Button>
                            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveContentBlocks()} disabled={savingSection === "contentBlocks"}>
                                {isRu ? "Сохранить материалы" : "Save content blocks"}
                            </Button>
                        </Stack>
                    </Stack>
                </FormSectionCard>

                <FormSectionCard id="item-hints-section" title={isRu ? "Подсказки" : "Hints"} description={isRu ? "Дополнительные подсказки, которые помогают студенту во время практики." : "Optional hints that can be shown to students during practice."}>
                    <Stack spacing={2}>
                        {hints.map((hint, index) => (
                            <Paper key={hint.id} variant="outlined" sx={{ p: 2, borderRadius: 1.25 }}>
                                <Stack spacing={2}>
                                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                        <TextField label={isRu ? "Порядок" : "Order index"} type="number" value={hint.orderIndex} onChange={(event) => setHints((current) => current.map((entry, i) => i === index ? { ...entry, orderIndex: Number(event.target.value) } : entry))} sx={{ maxWidth: { md: 180 } }} />
                                        <TextField label={isRu ? "Текст подсказки" : "Hint text"} value={hint.text} onChange={(event) => setHints((current) => current.map((entry, i) => i === index ? { ...entry, text: event.target.value } : entry))} fullWidth />
                                    </Stack>
                                    <Stack direction="row" spacing={0.5}>
                                        <IconButton disabled={index === 0} onClick={() => setHints((current) => reindexHints(move(current, index, -1)))}><ArrowUpwardRoundedIcon /></IconButton>
                                        <IconButton disabled={index === hints.length - 1} onClick={() => setHints((current) => reindexHints(move(current, index, 1)))}><ArrowDownwardRoundedIcon /></IconButton>
                                        <IconButton color="error" onClick={() => window.confirm(isRu ? "Удалить эту подсказку?" : "Delete this hint?") && setHints((current) => reindexHints(current.filter((_, i) => i !== index)))}><DeleteRoundedIcon /></IconButton>
                                    </Stack>
                                </Stack>
                            </Paper>
                        ))}
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setHints((current) => [...current, { id: newId(), orderIndex: current.length, text: "" }])}>
                                {isRu ? "Добавить подсказку" : "Add hint"}
                            </Button>
                            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveHints()} disabled={savingSection === "hints"}>
                                {isRu ? "Сохранить подсказки" : "Save hints"}
                            </Button>
                        </Stack>
                    </Stack>
                </FormSectionCard>

                {isExecutable ? (
                    <FormSectionCard id="item-tests-section" title={isRu ? "Тесты проверки" : "Test cases"} description={isRu ? "Открытые тесты видны студенту, скрытые используются только при проверке решения." : "Open tests are visible to students; hidden tests are used only by execution checking."}>
                        <Stack spacing={2}>
                            {testCases.length === 0 ? <Alert severity="info">{isRu ? "Тестов пока нет." : "No test cases yet."}</Alert> : null}
                            {testCases.map((testCase, index) => (
                                <Paper key={testCase.id} variant="outlined" sx={{ p: 2, borderRadius: 1.25 }}>
                                    <Stack spacing={2}>
                                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                            <TextField label={isRu ? "Ключ теста" : "Test key"} value={testCase.testKey} onChange={(event) => setTestCases((current) => current.map((entry, i) => i === index ? { ...entry, testKey: event.target.value } : entry))} fullWidth />
                                            <TextField label={isRu ? "Порядок" : "Order index"} type="number" value={testCase.orderIndex} onChange={(event) => setTestCases((current) => current.map((entry, i) => i === index ? { ...entry, orderIndex: Number(event.target.value) } : entry))} fullWidth />
                                            <TextField select label={isRu ? "Видимость" : "Visibility"} value={testCase.visibility} onChange={(event) => setTestCases((current) => current.map((entry, i) => i === index ? { ...entry, visibility: event.target.value as TestCaseVisibility } : entry))} fullWidth>
                                                {(["OPEN", "HIDDEN"] as TestCaseVisibility[]).map((value) => (
                                                    <MenuItem key={value} value={value}>{testVisibilityLabel(value, isRu)}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Stack>
                                        <TextField label={isRu ? "Входные данные" : "Input data"} multiline minRows={3} value={testCase.inputData ?? ""} onChange={(event) => setTestCases((current) => current.map((entry, i) => i === index ? { ...entry, inputData: event.target.value } : entry))} />
                                        <TextField label={isRu ? "Ожидаемый вывод" : "Expected output"} multiline minRows={3} value={testCase.expectedOutput ?? ""} onChange={(event) => setTestCases((current) => current.map((entry, i) => i === index ? { ...entry, expectedOutput: event.target.value } : entry))} />
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton disabled={index === 0} onClick={() => setTestCases((current) => reindexTestCases(move(current, index, -1)))}><ArrowUpwardRoundedIcon /></IconButton>
                                            <IconButton disabled={index === testCases.length - 1} onClick={() => setTestCases((current) => reindexTestCases(move(current, index, 1)))}><ArrowDownwardRoundedIcon /></IconButton>
                                            <IconButton color="error" onClick={() => window.confirm(isRu ? "Удалить этот тест?" : "Delete this test case?") && setTestCases((current) => reindexTestCases(current.filter((_, i) => i !== index)))}><DeleteRoundedIcon /></IconButton>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setTestCases((current) => [...current, { id: newId(), testKey: `sample-${current.length + 1}`, orderIndex: current.length, visibility: "OPEN", inputData: "", expectedOutput: "" }])}>
                                    {isRu ? "Добавить тест" : "Add test case"}
                            </Button>
                            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveTestCases()} disabled={savingSection === "testCases"}>
                                {isRu ? "Сохранить тесты" : "Save test cases"}
                            </Button>
                            </Stack>
                        </Stack>
                    </FormSectionCard>
                ) : null}

                {isQuiz ? (
                    <FormSectionCard id="item-options-section" title={isRu ? "Варианты ответа" : "Quiz options"} description={isRu ? "Перед отправкой курса на модерацию у квиза должен быть хотя бы один правильный вариант." : "At least one correct option is required before submitting a quiz course item for review."}>
                        <Stack spacing={2}>
                            {options.length === 0 ? <Alert severity="info">{isRu ? "Вариантов ответа пока нет." : "No quiz options yet."}</Alert> : null}
                            {options.map((option, index) => (
                                <Paper key={option.id} variant="outlined" sx={{ p: 2, borderRadius: 1.25 }}>
                                    <Stack spacing={2}>
                                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                            <TextField label={isRu ? "Метка" : "Label"} value={option.label ?? ""} onChange={(event) => setOptions((current) => current.map((entry, i) => i === index ? { ...entry, label: event.target.value } : entry))} sx={{ maxWidth: { md: 160 } }} />
                                            <TextField label={isRu ? "Порядок" : "Order index"} type="number" value={option.orderIndex} onChange={(event) => setOptions((current) => current.map((entry, i) => i === index ? { ...entry, orderIndex: Number(event.target.value) } : entry))} sx={{ maxWidth: { md: 160 } }} />
                                            <FormControlLabel control={<Checkbox checked={Boolean(option.correct)} onChange={(event) => setOptions((current) => current.map((entry, i) => i === index ? { ...entry, correct: event.target.checked } : entry))} />} label={isRu ? "правильный" : "correct"} />
                                        </Stack>
                                        <TextField label={isRu ? "Текст варианта" : "Option text"} value={option.text} onChange={(event) => setOptions((current) => current.map((entry, i) => i === index ? { ...entry, text: event.target.value } : entry))} />
                                        <TextField label={isRu ? "Объяснение" : "Explanation"} multiline minRows={2} value={option.explanation ?? ""} onChange={(event) => setOptions((current) => current.map((entry, i) => i === index ? { ...entry, explanation: event.target.value } : entry))} />
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton disabled={index === 0} onClick={() => setOptions((current) => reindexOptions(move(current, index, -1)))}><ArrowUpwardRoundedIcon /></IconButton>
                                            <IconButton disabled={index === options.length - 1} onClick={() => setOptions((current) => reindexOptions(move(current, index, 1)))}><ArrowDownwardRoundedIcon /></IconButton>
                                            <IconButton color="error" onClick={() => window.confirm(isRu ? "Удалить этот вариант ответа?" : "Delete this quiz option?") && setOptions((current) => reindexOptions(current.filter((_, i) => i !== index)))}><DeleteRoundedIcon /></IconButton>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setOptions((current) => [...current, { id: newId(), orderIndex: current.length, label: String.fromCharCode(65 + current.length), text: "", correct: false, explanation: null }])}>
                                    {isRu ? "Добавить вариант" : "Add option"}
                            </Button>
                            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveOptions()} disabled={savingSection === "options"}>
                                {isRu ? "Сохранить варианты" : "Save options"}
                            </Button>
                            </Stack>
                        </Stack>
                    </FormSectionCard>
                ) : null}

                {!isExecutable && !isQuiz ? (
                    <Alert severity="info">
                        {isRu
                            ? "Этот тип урока использует материалы и подсказки. Тесты выполнения и варианты квиза скрыты."
                            : "This item type uses content blocks and hints. Execution tests and quiz options are hidden for THEORY/FILE items."}
                    </Alert>
                ) : null}
                    </Stack>

                    {isInspectorOpen ? (
                        <Stack spacing={2} sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                        <Typography variant="h6">{isRu ? "Разделы урока" : "Item sections"}</Typography>
                                        <Tooltip title={isRu ? "Скрыть панель" : "Hide panel"}>
                                            <IconButton size="small" onClick={() => setInspectorOpen(false)}>
                                                <MenuOpenRoundedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <ItemTypeBadge itemType={form.itemType} />
                                        <Chip size="small" label={isRu ? `Порядок ${form.orderIndex}` : `Order ${form.orderIndex}`} />
                                    </Stack>
                                    <Stack spacing={0.75}>
                                        <Button component="a" href="#item-basic-section" variant="text" size="small" sx={{ justifyContent: "flex-start" }}>{isRu ? "Основное" : "Basic"}</Button>
                                        {isExecutable ? <Button component="a" href="#item-execution-section" variant="text" size="small" sx={{ justifyContent: "flex-start" }}>{isRu ? "Проверка" : "Execution"}</Button> : null}
                                        <Button component="a" href="#item-content-section" variant="text" size="small" sx={{ justifyContent: "flex-start" }}>{isRu ? "Материалы" : "Content"}</Button>
                                        <Button component="a" href="#item-hints-section" variant="text" size="small" sx={{ justifyContent: "flex-start" }}>{isRu ? "Подсказки" : "Hints"}</Button>
                                        {isExecutable ? <Button component="a" href="#item-tests-section" variant="text" size="small" sx={{ justifyContent: "flex-start" }}>{isRu ? "Тесты" : "Tests"}</Button> : null}
                                        {isQuiz ? <Button component="a" href="#item-options-section" variant="text" size="small" sx={{ justifyContent: "flex-start" }}>{isRu ? "Ответы" : "Options"}</Button> : null}
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Stack>
                    ) : null}
                </Box>

                <Divider />
                <Button component={RouterLink} to={`/teacher/courses/${parsedCourseId ?? ""}/edit`} variant="outlined" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }}>
                    {isRu ? "К редактору курса" : "Back to Course Editor"}
                </Button>
            </Stack>
        </PageContainer>
    );
}

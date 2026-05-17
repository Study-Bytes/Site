import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Checkbox,
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
import { parseRouteCourseId } from "../../utils/courseFormat";

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

function validateItemForm(input: CourseItemUpsertRequest): ApiValidationError[] {
    const item = normalizeItemForm(input);
    const errors: ApiValidationError[] = [];
    if (!item.title) errors.push({ field: "title", message: "Title is required" });
    if (!Number.isFinite(item.orderIndex) || item.orderIndex < 0) errors.push({ field: "orderIndex", message: "Order index must be non-negative" });
    if ((item.itemType === "CODING" || item.itemType === "SQL") && !item.language) errors.push({ field: "language", message: "Language is required for CODING and SQL items" });
    for (const field of ["timeLimitMs", "memoryLimitMb", "outputLimitKb"] as const) {
        const value = item[field];
        if ((item.itemType === "CODING" || item.itemType === "SQL") && (value === null || !Number.isFinite(value) || value < 0)) {
            errors.push({ field, message: `${field} must be non-negative` });
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
            setError("Invalid item id");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const loaded = await teacherApi.getItem(parsedItemId);
            applyItem(loaded);
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Failed to load item"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadItem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parsedItemId]);

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
        const errors = validateItemForm(form);
        setValidationErrors(errors);
        if (errors.length > 0) return;
        setSavingSection("metadata");
        try {
            const updated = await teacherApi.updateItem(parsedItemId, normalizeItemForm(form));
            applyItem(updated);
            setSuccessMessage("Item metadata saved");
        } catch (requestError) {
            handleApiError(requestError, "Failed to save item metadata");
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
            setSuccessMessage("Content blocks saved");
        } catch (requestError) {
            handleApiError(requestError, "Failed to save content blocks");
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
            setSuccessMessage("Hints saved");
        } catch (requestError) {
            handleApiError(requestError, "Failed to save hints");
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
            setSuccessMessage("Test cases saved");
        } catch (requestError) {
            handleApiError(requestError, "Failed to save test cases");
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
            setSuccessMessage("Quiz options saved");
        } catch (requestError) {
            handleApiError(requestError, "Failed to save quiz options");
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
                <ErrorState message="Item was not found" />
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
                        <ItemTypeBadge itemType={item.itemType} />
                    </Stack>
                </Box>

                {successMessage ? <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert> : null}
                {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
                <ValidationErrorPanel errors={validationErrors} />

                <FormSectionCard title={isRu ? "Основные настройки" : "Basic settings"} description={isRu ? "Общие параметры для всех типов уроков." : "Basic fields shared by all item types."}>
                    <Stack spacing={2}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <TextField label="Title" value={form.title} onChange={(event) => updateForm("title", event.target.value)} required fullWidth />
                            <TextField select label="Item type" value={form.itemType} onChange={(event) => updateForm("itemType", event.target.value as CourseItemType)} fullWidth>
                                <MenuItem value="THEORY">THEORY</MenuItem>
                                <MenuItem value="QUIZ">QUIZ</MenuItem>
                                <MenuItem value="CODING">CODING</MenuItem>
                                <MenuItem value="SQL">SQL</MenuItem>
                                <MenuItem value="FILE">FILE</MenuItem>
                            </TextField>
                            <TextField label="Order index" type="number" value={form.orderIndex} onChange={(event) => updateForm("orderIndex", Number(event.target.value))} fullWidth />
                        </Stack>
                        <TextField label="Statement" multiline minRows={5} value={form.statement ?? ""} onChange={(event) => updateForm("statement", event.target.value)} />
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveMetadata()} disabled={savingSection === "metadata"}>
                                Save Item
                            </Button>
                        </Stack>
                    </Stack>
                </FormSectionCard>

                {isExecutable ? (
                    <FormSectionCard title={isRu ? "Настройки проверки" : "Execution settings"} description={isRu ? "Настрой язык, ограничения выполнения и код для проверки решения." : "Configure language, execution limits and solution-checking code."}>
                        <Stack spacing={2}>
                            <TextField label="Language" value={form.language ?? ""} onChange={(event) => updateForm("language", event.target.value)} required />
                            <TextField label="Starter code" multiline minRows={8} value={form.starterCode ?? ""} onChange={(event) => updateForm("starterCode", event.target.value)} sx={{ "& textarea": { fontFamily: "monospace" } }} />
                            <TextField label="Solution code" multiline minRows={8} value={form.solutionCode ?? ""} onChange={(event) => updateForm("solutionCode", event.target.value)} sx={{ "& textarea": { fontFamily: "monospace" } }} />
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <TextField label="timeLimitMs" type="number" value={form.timeLimitMs ?? 2000} onChange={(event) => updateForm("timeLimitMs", Number(event.target.value))} fullWidth />
                                <TextField label="memoryLimitMb" type="number" value={form.memoryLimitMb ?? 256} onChange={(event) => updateForm("memoryLimitMb", Number(event.target.value))} fullWidth />
                                <TextField label="outputLimitKb" type="number" value={form.outputLimitKb ?? 128} onChange={(event) => updateForm("outputLimitKb", Number(event.target.value))} fullWidth />
                            </Stack>
                            <TextField select label="comparisonMode" value={form.comparisonMode} onChange={(event) => updateForm("comparisonMode", event.target.value as ComparisonMode)}>
                                <MenuItem value="EXACT">EXACT</MenuItem>
                                <MenuItem value="IGNORE_WHITESPACE">IGNORE_WHITESPACE</MenuItem>
                                <MenuItem value="CUSTOM">CUSTOM</MenuItem>
                            </TextField>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
                                <FormControlLabel control={<Switch checked={form.networkDisabled} onChange={(event) => updateForm("networkDisabled", event.target.checked)} />} label="networkDisabled" />
                                <FormControlLabel control={<Switch checked={form.readOnlyFs} onChange={(event) => updateForm("readOnlyFs", event.target.checked)} />} label="readOnlyFs" />
                                <FormControlLabel control={<Switch checked={form.normalizeLineEndings} onChange={(event) => updateForm("normalizeLineEndings", event.target.checked)} />} label="normalizeLineEndings" />
                                <FormControlLabel control={<Switch checked={form.trimTrailingWhitespaces} onChange={(event) => updateForm("trimTrailingWhitespaces", event.target.checked)} />} label="trimTrailingWhitespaces" />
                            </Stack>
                            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveMetadata()} disabled={savingSection === "metadata"}>
                                Save execution settings
                            </Button>
                        </Stack>
                    </FormSectionCard>
                ) : null}

                <FormSectionCard title="Content blocks" description="Theory, file, code, image, video, embed and document blocks shown to students.">
                    <Stack spacing={2}>
                        {contentBlocks.length === 0 ? <Alert severity="info">No content blocks yet.</Alert> : null}
                        {contentBlocks.map((block, index) => (
                            <Accordion key={block.id} defaultExpanded={index === 0} variant="outlined" sx={{ borderRadius: 1.25, "&:before": { display: "none" } }}>
                                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                                    <Typography sx={{ fontWeight: 900 }}>{block.title || `${block.blockType} block #${index + 1}`}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack spacing={2}>
                                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                            <TextField select label="blockType" value={block.blockType} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, blockType: event.target.value as ContentBlockType } : entry))} fullWidth>
                                                <MenuItem value="TEXT">TEXT</MenuItem>
                                                <MenuItem value="VIDEO">VIDEO</MenuItem>
                                                <MenuItem value="IMAGE">IMAGE</MenuItem>
                                                <MenuItem value="CODE">CODE</MenuItem>
                                                <MenuItem value="EMBED">EMBED</MenuItem>
                                                <MenuItem value="FILE">FILE</MenuItem>
                                            </TextField>
                                            <TextField label="orderIndex" type="number" value={block.orderIndex} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, orderIndex: Number(event.target.value) } : entry))} fullWidth />
                                        </Stack>
                                        <TextField label="Title" value={block.title ?? ""} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, title: event.target.value } : entry))} />
                                        <TextField label="textContent" multiline minRows={4} value={block.textContent ?? ""} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, textContent: event.target.value } : entry))} />
                                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                            <TextField label="url" value={block.url ?? ""} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, url: event.target.value } : entry))} fullWidth />
                                            <TextField label="language" value={block.language ?? ""} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, language: event.target.value } : entry))} fullWidth />
                                        </Stack>
                                        <TextField label="metadataJson" multiline minRows={3} value={block.metadataJson ?? ""} onChange={(event) => setContentBlocks((current) => current.map((entry, i) => i === index ? { ...entry, metadataJson: event.target.value } : entry))} />
                                        <Stack direction="row" spacing={0.5}>
                                            <Tooltip title="Move up"><span><IconButton disabled={index === 0} onClick={() => setContentBlocks((current) => reindexContentBlocks(move(current, index, -1)))}><ArrowUpwardRoundedIcon /></IconButton></span></Tooltip>
                                            <Tooltip title="Move down"><span><IconButton disabled={index === contentBlocks.length - 1} onClick={() => setContentBlocks((current) => reindexContentBlocks(move(current, index, 1)))}><ArrowDownwardRoundedIcon /></IconButton></span></Tooltip>
                                            <Tooltip title="Delete block"><IconButton color="error" onClick={() => window.confirm("Delete this content block?") && setContentBlocks((current) => reindexContentBlocks(current.filter((_, i) => i !== index)))}><DeleteRoundedIcon /></IconButton></Tooltip>
                                        </Stack>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setContentBlocks((current) => [...current, { id: newId(), blockType: "TEXT", orderIndex: current.length, title: "", textContent: "", url: null, language: null, metadataJson: null }])}>
                                Add content block
                            </Button>
                            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveContentBlocks()} disabled={savingSection === "contentBlocks"}>
                                Save content blocks
                            </Button>
                        </Stack>
                    </Stack>
                </FormSectionCard>

                <FormSectionCard title="Hints" description="Optional hints that can be shown to students during practice.">
                    <Stack spacing={2}>
                        {hints.map((hint, index) => (
                            <Paper key={hint.id} variant="outlined" sx={{ p: 2, borderRadius: 1.25 }}>
                                <Stack spacing={2}>
                                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                        <TextField label="orderIndex" type="number" value={hint.orderIndex} onChange={(event) => setHints((current) => current.map((entry, i) => i === index ? { ...entry, orderIndex: Number(event.target.value) } : entry))} sx={{ maxWidth: { md: 180 } }} />
                                        <TextField label="Hint text" value={hint.text} onChange={(event) => setHints((current) => current.map((entry, i) => i === index ? { ...entry, text: event.target.value } : entry))} fullWidth />
                                    </Stack>
                                    <Stack direction="row" spacing={0.5}>
                                        <IconButton disabled={index === 0} onClick={() => setHints((current) => reindexHints(move(current, index, -1)))}><ArrowUpwardRoundedIcon /></IconButton>
                                        <IconButton disabled={index === hints.length - 1} onClick={() => setHints((current) => reindexHints(move(current, index, 1)))}><ArrowDownwardRoundedIcon /></IconButton>
                                        <IconButton color="error" onClick={() => window.confirm("Delete this hint?") && setHints((current) => reindexHints(current.filter((_, i) => i !== index)))}><DeleteRoundedIcon /></IconButton>
                                    </Stack>
                                </Stack>
                            </Paper>
                        ))}
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setHints((current) => [...current, { id: newId(), orderIndex: current.length, text: "" }])}>
                                Add hint
                            </Button>
                            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveHints()} disabled={savingSection === "hints"}>
                                Save hints
                            </Button>
                        </Stack>
                    </Stack>
                </FormSectionCard>

                {isExecutable ? (
                    <FormSectionCard title="Test cases" description="Open tests are visible to students; hidden tests are used only by execution checking.">
                        <Stack spacing={2}>
                            {testCases.length === 0 ? <Alert severity="info">No test cases yet.</Alert> : null}
                            {testCases.map((testCase, index) => (
                                <Paper key={testCase.id} variant="outlined" sx={{ p: 2, borderRadius: 1.25 }}>
                                    <Stack spacing={2}>
                                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                            <TextField label="testKey" value={testCase.testKey} onChange={(event) => setTestCases((current) => current.map((entry, i) => i === index ? { ...entry, testKey: event.target.value } : entry))} fullWidth />
                                            <TextField label="orderIndex" type="number" value={testCase.orderIndex} onChange={(event) => setTestCases((current) => current.map((entry, i) => i === index ? { ...entry, orderIndex: Number(event.target.value) } : entry))} fullWidth />
                                            <TextField select label="visibility" value={testCase.visibility} onChange={(event) => setTestCases((current) => current.map((entry, i) => i === index ? { ...entry, visibility: event.target.value as TestCaseVisibility } : entry))} fullWidth>
                                                <MenuItem value="OPEN">OPEN</MenuItem>
                                                <MenuItem value="HIDDEN">HIDDEN</MenuItem>
                                            </TextField>
                                        </Stack>
                                        <TextField label="inputData" multiline minRows={3} value={testCase.inputData ?? ""} onChange={(event) => setTestCases((current) => current.map((entry, i) => i === index ? { ...entry, inputData: event.target.value } : entry))} />
                                        <TextField label="expectedOutput" multiline minRows={3} value={testCase.expectedOutput ?? ""} onChange={(event) => setTestCases((current) => current.map((entry, i) => i === index ? { ...entry, expectedOutput: event.target.value } : entry))} />
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton disabled={index === 0} onClick={() => setTestCases((current) => reindexTestCases(move(current, index, -1)))}><ArrowUpwardRoundedIcon /></IconButton>
                                            <IconButton disabled={index === testCases.length - 1} onClick={() => setTestCases((current) => reindexTestCases(move(current, index, 1)))}><ArrowDownwardRoundedIcon /></IconButton>
                                            <IconButton color="error" onClick={() => window.confirm("Delete this test case?") && setTestCases((current) => reindexTestCases(current.filter((_, i) => i !== index)))}><DeleteRoundedIcon /></IconButton>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setTestCases((current) => [...current, { id: newId(), testKey: `sample-${current.length + 1}`, orderIndex: current.length, visibility: "OPEN", inputData: "", expectedOutput: "" }])}>
                                    Add test case
                                </Button>
                                <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveTestCases()} disabled={savingSection === "testCases"}>
                                    Save test cases
                                </Button>
                            </Stack>
                        </Stack>
                    </FormSectionCard>
                ) : null}

                {isQuiz ? (
                    <FormSectionCard title="Quiz options" description="At least one correct option is required before submitting a quiz course item for review.">
                        <Stack spacing={2}>
                            {options.length === 0 ? <Alert severity="info">No quiz options yet.</Alert> : null}
                            {options.map((option, index) => (
                                <Paper key={option.id} variant="outlined" sx={{ p: 2, borderRadius: 1.25 }}>
                                    <Stack spacing={2}>
                                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                            <TextField label="label" value={option.label ?? ""} onChange={(event) => setOptions((current) => current.map((entry, i) => i === index ? { ...entry, label: event.target.value } : entry))} sx={{ maxWidth: { md: 160 } }} />
                                            <TextField label="orderIndex" type="number" value={option.orderIndex} onChange={(event) => setOptions((current) => current.map((entry, i) => i === index ? { ...entry, orderIndex: Number(event.target.value) } : entry))} sx={{ maxWidth: { md: 160 } }} />
                                            <FormControlLabel control={<Checkbox checked={Boolean(option.correct)} onChange={(event) => setOptions((current) => current.map((entry, i) => i === index ? { ...entry, correct: event.target.checked } : entry))} />} label="correct" />
                                        </Stack>
                                        <TextField label="Option text" value={option.text} onChange={(event) => setOptions((current) => current.map((entry, i) => i === index ? { ...entry, text: event.target.value } : entry))} />
                                        <TextField label="Explanation" multiline minRows={2} value={option.explanation ?? ""} onChange={(event) => setOptions((current) => current.map((entry, i) => i === index ? { ...entry, explanation: event.target.value } : entry))} />
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton disabled={index === 0} onClick={() => setOptions((current) => reindexOptions(move(current, index, -1)))}><ArrowUpwardRoundedIcon /></IconButton>
                                            <IconButton disabled={index === options.length - 1} onClick={() => setOptions((current) => reindexOptions(move(current, index, 1)))}><ArrowDownwardRoundedIcon /></IconButton>
                                            <IconButton color="error" onClick={() => window.confirm("Delete this quiz option?") && setOptions((current) => reindexOptions(current.filter((_, i) => i !== index)))}><DeleteRoundedIcon /></IconButton>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setOptions((current) => [...current, { id: newId(), orderIndex: current.length, label: String.fromCharCode(65 + current.length), text: "", correct: false, explanation: null }])}>
                                    Add option
                                </Button>
                                <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveOptions()} disabled={savingSection === "options"}>
                                    Save options
                                </Button>
                            </Stack>
                        </Stack>
                    </FormSectionCard>
                ) : null}

                {!isExecutable && !isQuiz ? (
                    <Alert severity="info">This item type uses content blocks and hints. Execution tests and quiz options are hidden for THEORY/FILE items.</Alert>
                ) : null}

                <Divider />
                <Button component={RouterLink} to={`/teacher/courses/${parsedCourseId ?? ""}/edit`} variant="outlined" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }}>
                    Back to Course Editor
                </Button>
            </Stack>
        </PageContainer>
    );
}

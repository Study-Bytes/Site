import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Link as RouterLink, useParams } from "react-router-dom";
import { getErrorMessage } from "../../api/apiError";
import type {
    ContentBlockDto,
    CourseModuleSummary,
    LearningCourse,
    LearningItem,
    ModuleDeadlineState,
    QuizOptionDto,
    SubmissionHistoryItem,
    SubmissionResult,
    SubmissionStatus,
    TestResultDto,
} from "../../api/bffContracts";
import { learningApi } from "../../api/services";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { useI18n } from "../../i18n/useI18n";
import { PageContainer } from "../../layouts/PageContainer";
import { studyBytesColors } from "../../theme/theme";
import { formatDuration } from "../../utils/courseFormat";
import { deadlineStatusColor, deadlineStatusLabel, deadlineTypeLabel, effectiveModuleDeadlineAt, formatDateTime, getStoredModuleStartedAt, storeModuleStartedAt } from "../../utils/moduleDeadlines";

function parseId(value: string | undefined) {
    const id = Number(value);
    return Number.isFinite(id) ? id : null;
}

function statusColor(status: SubmissionStatus) {
    if (status === "ACCEPTED") return "success" as const;
    if (status === "PENDING" || status === "RUNNING") return "primary" as const;
    return "error" as const;
}

function ContentBlock({ block }: { block: ContentBlockDto }) {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const title = block.title ?? block.blockType;

    if (block.blockType === "IMAGE" && block.url) {
        return (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                <Stack spacing={1.5}>
                    <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
                    <Box component="img" src={block.url} alt={title} sx={{ width: "100%", maxHeight: 420, objectFit: "cover", borderRadius: 1.25 }} />
                    {block.textContent ? <Typography sx={{ color: "text.secondary" }}>{block.textContent}</Typography> : null}
                </Stack>
            </Paper>
        );
    }

    if (block.blockType === "VIDEO" || block.blockType === "EMBED") {
        return (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                <Stack spacing={1}>
                    <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
                    {block.url ? (
                        <Button component="a" href={block.url} target="_blank" rel="noreferrer" variant="outlined" sx={{ alignSelf: "flex-start" }}>
                            {isRu ? "Открыть материал" : `Open ${block.blockType.toLowerCase()}`}
                        </Button>
                    ) : null}
                    {block.textContent ? <Typography sx={{ color: "text.secondary" }}>{block.textContent}</Typography> : null}
                </Stack>
            </Paper>
        );
    }

    if (block.blockType === "CODE") {
        return (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
                        {block.language ? <Chip size="small" label={block.language} variant="outlined" /> : null}
                    </Stack>
                    <Box
                        component="pre"
                        sx={{
                            m: 0,
                            p: 2,
                            borderRadius: 1.25,
                            overflow: "auto",
                            bgcolor: studyBytesColors.codeSurface,
                            color: "#f8f8f2",
                            fontFamily: "'Geist Mono', Consolas, monospace",
                            fontSize: 13,
                        }}
                    >
                        {block.textContent ?? ""}
                    </Box>
                </Stack>
            </Paper>
        );
    }

    if (block.blockType === "FILE") {
        return (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                <Stack spacing={1}>
                    <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
                    <Typography sx={{ color: "text.secondary" }}>{block.textContent ?? (isRu ? "Откройте прикрепленный файл." : "Download or review the attached file.")}</Typography>
                    {block.url ? (
                        <Button component="a" href={block.url} target="_blank" rel="noreferrer" variant="outlined" sx={{ alignSelf: "flex-start" }}>
                            {isRu ? "Открыть файл" : "Open file"}
                        </Button>
                    ) : null}
                </Stack>
            </Paper>
        );
    }

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
            <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
            <Typography sx={{ color: "text.secondary", mt: 1, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{block.textContent ?? block.url ?? (isRu ? "Материал не заполнен." : "No content.")}</Typography>
        </Paper>
    );
}

function QuizOptionCard({ option, selected, showFeedback, onToggle }: { option: QuizOptionDto; selected: boolean; showFeedback: boolean; onToggle: (id: number) => void }) {
    return (
        <Paper
            variant="outlined"
            role="button"
            tabIndex={0}
            onClick={() => onToggle(option.id)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onToggle(option.id);
            }}
            sx={{
                p: 2,
                borderRadius: 1.5,
                cursor: "pointer",
                borderColor: selected ? "primary.main" : "divider",
                bgcolor: selected ? "action.selected" : "background.paper",
                outline: "none",
                "&:focus-visible": { boxShadow: "0 0 0 3px rgba(53,37,205,0.20)" },
            }}
        >
            <Stack spacing={1}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip label={option.label ?? option.orderIndex + 1} color={selected ? "primary" : "default"} sx={{ fontWeight: 950 }} />
                    <Typography sx={{ fontWeight: 850 }}>{option.text}</Typography>
                </Stack>
                {showFeedback && option.explanation ? (
                    <Typography variant="body2" sx={{ color: "text.secondary", pl: { sm: 6 } }}>
                        {option.explanation}
                    </Typography>
                ) : null}
            </Stack>
        </Paper>
    );
}

function TestResultRow({ test }: { test: TestResultDto }) {
    const { locale } = useI18n();
    const isRu = locale === "ru";

    return (
        <Paper variant="outlined" sx={{ p: 1.6, borderRadius: 1.25, borderColor: test.passed ? "rgba(46,125,50,0.32)" : "rgba(186,26,26,0.32)" }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ sm: "center" }}>
                <Chip
                    size="small"
                    icon={test.passed ? <CheckCircleRoundedIcon /> : <CloseRoundedIcon />}
                    label={test.passed ? (isRu ? "Пройден" : "Passed") : (isRu ? "Ошибка" : "Failed")}
                    color={test.passed ? "success" : "error"}
                    variant="outlined"
                    sx={{ fontWeight: 900 }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900 }}>{test.testKey}</Typography>
                    {test.message ? <Typography variant="body2" sx={{ color: "text.secondary" }}>{test.message}</Typography> : null}
                    {test.actualOutput ? <Typography variant="body2" sx={{ color: "text.secondary" }}>{isRu ? "Вывод" : "Output"}: {test.actualOutput}</Typography> : null}
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {test.durationMs ?? "-"} ms · {test.memoryMb ?? "-"} MB
                </Typography>
            </Stack>
        </Paper>
    );
}

function SubmissionResultPanel({ result }: { result: SubmissionResult }) {
    const { locale } = useI18n();
    const isRu = locale === "ru";

    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ sm: "center" }}>
                    <Typography variant="h5" sx={{ flexGrow: 1 }}>
                        {isRu ? "Последний результат" : "Latest result"}
                    </Typography>
                    <Chip label={result.status} color={statusColor(result.status)} sx={{ fontWeight: 950 }} />
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={`${isRu ? "Балл" : "Score"}: ${result.score ?? "n/a"}`} variant="outlined" sx={{ fontWeight: 900 }} />
                    <Chip label={`${isRu ? "Тесты" : "Tests"}: ${result.passedTests}/${result.totalTests}`} variant="outlined" sx={{ fontWeight: 900 }} />
                    <Chip label={new Date(result.createdAt).toLocaleString()} variant="outlined" sx={{ fontWeight: 900 }} />
                </Stack>
                {(result.stdout || result.stderr) ? (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                        <Paper sx={{ p: 2, borderRadius: 1.25, bgcolor: studyBytesColors.codeSurface, color: "#f8f8f2" }}>
                            <Typography sx={{ fontWeight: 950, mb: 1 }}>stdout</Typography>
                            <Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap", fontFamily: "'Geist Mono', Consolas, monospace", fontSize: 13 }}>{result.stdout ?? ""}</Box>
                        </Paper>
                        <Paper sx={{ p: 2, borderRadius: 1.25, bgcolor: studyBytesColors.codeSurface, color: "#f8f8f2" }}>
                            <Typography sx={{ fontWeight: 950, mb: 1 }}>stderr</Typography>
                            <Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap", fontFamily: "'Geist Mono', Consolas, monospace", fontSize: 13 }}>{result.stderr ?? ""}</Box>
                        </Paper>
                    </Box>
                ) : null}
                {result.testResults.length > 0 ? (
                    <Stack spacing={1.1}>
                        {result.testResults.map((test) => (
                            <TestResultRow key={test.testKey} test={test} />
                        ))}
                    </Stack>
                ) : null}
            </Stack>
        </Paper>
    );
}

function SubmissionHistory({ history }: { history: SubmissionHistoryItem[] }) {
    const { locale } = useI18n();
    const isRu = locale === "ru";

    if (history.length === 0) return null;

    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack spacing={1.4}>
                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                    {isRu ? "История попыток" : "Attempt history"}
                </Typography>
                {history.map((item) => (
                    <Stack key={item.id} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Chip size="small" label={item.status} color={statusColor(item.status)} variant="outlined" sx={{ fontWeight: 900 }} />
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {item.passedTests}/{item.totalTests} {isRu ? "тестов" : "tests"} · {isRu ? "балл" : "score"} {item.score ?? "n/a"}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Paper>
    );
}

export default function LearningItemPage() {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const { courseId, itemId } = useParams();
    const parsedCourseId = parseId(courseId);
    const parsedItemId = parseId(itemId);
    const [learningItem, setLearningItem] = useState<LearningItem | null>(null);
    const [learningCourse, setLearningCourse] = useState<LearningCourse | null>(null);
    const [moduleStarts, setModuleStarts] = useState<Record<number, string>>({});
    const [deadlineState, setDeadlineState] = useState<ModuleDeadlineState | null>(null);
    const [isDeadlineLoading, setDeadlineLoading] = useState(false);
    const [isStartingModule, setStartingModule] = useState(false);
    const [deadlineError, setDeadlineError] = useState<string | null>(null);
    const [sourceCode, setSourceCode] = useState("");
    const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
    const [result, setResult] = useState<SubmissionResult | null>(null);
    const [history, setHistory] = useState<SubmissionHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingAction, setPendingAction] = useState<"run" | "submit" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const isSubmitting = pendingAction !== null;

    const itemType = learningItem?.item.itemType;
    const isExecutable = itemType === "CODING" || itemType === "SQL";
    const isQuiz = itemType === "QUIZ";
    const isContentOnly = itemType === "THEORY" || itemType === "FILE";

    const currentModule = useMemo<CourseModuleSummary | null>(() => {
        if (!learningCourse || !parsedItemId) return null;
        return learningCourse.modules.find((module) => module.items.some((item) => item.id === parsedItemId)) ?? null;
    }, [learningCourse, parsedItemId]);
    const currentModuleStartedAt = currentModule ? moduleStarts[currentModule.id] ?? null : null;
    const currentModuleDeadlineAt = currentModule ? effectiveModuleDeadlineAt(currentModule, currentModuleStartedAt) : null;
    const requiresModuleStart = currentModule?.deadlineType === "RELATIVE_FROM_START" && !currentModuleStartedAt;

    const loadItem = useCallback(async () => {
        if (!parsedCourseId || !parsedItemId) {
            setError(isRu ? "Некорректный адрес курса или урока" : "Invalid course or item id");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const [item, submissions, course] = await Promise.all([
                learningApi.getLearningItem(parsedCourseId, parsedItemId),
                learningApi.getItemSubmissions(parsedCourseId, parsedItemId).catch(() => [] as SubmissionHistoryItem[]),
                learningApi.getLearningCourse(parsedCourseId),
            ]);
            setLearningItem(item);
            setLearningCourse(course);
            const storedStarts: Record<number, string> = {};
            course.modules.forEach((module) => {
                const startedAt = getStoredModuleStartedAt(course.id, module.id);
                if (startedAt) storedStarts[module.id] = startedAt;
            });
            setModuleStarts(storedStarts);
            setSourceCode(item.item.starterCode ?? "");
            setSelectedOptionIds(item.item.options.filter((option) => option.selected).map((option) => option.id));
            setResult(null);
            setHistory(submissions);
        } catch (requestError) {
            setError(getErrorMessage(requestError, isRu ? "Не удалось загрузить урок" : "Failed to load learning item"));
        } finally {
            setIsLoading(false);
        }
    }, [isRu, parsedCourseId, parsedItemId]);

    useEffect(() => {
        void loadItem();
    }, [loadItem]);

    useEffect(() => {
        if (!parsedCourseId || !currentModule || !currentModuleDeadlineAt) {
            setDeadlineState(null);
            return;
        }
        let isActive = true;
        setDeadlineLoading(true);
        setDeadlineError(null);
        learningApi
            .getModuleDeadlineState(parsedCourseId, currentModule.id, currentModuleDeadlineAt)
            .then((state) => {
                if (isActive) setDeadlineState(state);
            })
            .catch((requestError) => {
                if (isActive) setDeadlineError(getErrorMessage(requestError, isRu ? "Не удалось загрузить дедлайн" : "Failed to load deadline state"));
            })
            .finally(() => {
                if (isActive) setDeadlineLoading(false);
            });
        return () => {
            isActive = false;
        };
    }, [currentModule, currentModuleDeadlineAt, isRu, parsedCourseId]);

    const submitPayload = useMemo(() => {
        if (itemType === "SQL") return { sql: sourceCode };
        if (itemType === "QUIZ") return { selectedOptionIds };
        return { sourceCode };
    }, [itemType, selectedOptionIds, sourceCode]);

    const runOrSubmit = async (submit: boolean) => {
        if (!parsedCourseId || !parsedItemId) return;
        setPendingAction(submit ? "submit" : "run");
        setActionError(null);
        try {
            const response = submit
                ? await learningApi.submitItem(parsedCourseId, parsedItemId, submitPayload)
                : await learningApi.runItem(parsedCourseId, parsedItemId, submitPayload);
            setResult(response);
            setHistory((previous) => [{ id: response.id, itemId: response.itemId, status: response.status, score: response.score, passedTests: response.passedTests, totalTests: response.totalTests, createdAt: response.createdAt }, ...previous]);
        } catch (requestError) {
            setActionError(getErrorMessage(requestError, submit ? (isRu ? "Не удалось отправить решение" : "Submit failed") : (isRu ? "Не удалось запустить проверку" : "Run failed")));
        } finally {
            setPendingAction(null);
        }
    };

    const toggleOption = (optionId: number) => {
        setSelectedOptionIds((current) => (current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]));
    };

    const startCurrentModule = async () => {
        if (!parsedCourseId || !currentModule) return;
        setStartingModule(true);
        setDeadlineError(null);
        try {
            const response = await learningApi.startModule(parsedCourseId, currentModule.id);
            storeModuleStartedAt(parsedCourseId, currentModule.id, response.startedAt);
            setModuleStarts((current) => ({ ...current, [currentModule.id]: response.startedAt }));
        } catch (requestError) {
            setDeadlineError(getErrorMessage(requestError, isRu ? "Не удалось начать модуль" : "Failed to start module"));
        } finally {
            setStartingModule(false);
        }
    };

    return (
        <PageContainer>
            {isLoading ? <LoadingState rows={4} /> : null}
            {error ? <ErrorState message={error} onRetry={loadItem} /> : null}
            {!isLoading && !error && learningItem ? (
                <Stack spacing={3}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: { xs: 2.5, md: 4 },
                            borderRadius: 2.5,
                            background: (theme) =>
                                theme.palette.mode === "dark"
                                    ? "radial-gradient(680px 300px at 88% 0%, rgba(60,221,199,0.12), transparent 62%), linear-gradient(135deg, #1f1f28 0%, #13121b 100%)"
                                    : "radial-gradient(680px 300px at 88% 0%, rgba(113,42,226,0.15), transparent 62%), linear-gradient(135deg, #ffffff 0%, #f4f0ff 100%)",
                        }}
                    >
                        <Stack spacing={2.4}>
                            <Button component={RouterLink} to={`/learn/${learningItem.course.id}`} variant="text" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }}>
                                {isRu ? "Карта курса" : "Course map"}
                            </Button>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <ItemTypeBadge itemType={learningItem.item.itemType} />
                                {learningItem.item.language ? <Chip size="small" label={learningItem.item.language} variant="outlined" sx={{ fontWeight: 900 }} /> : null}
                                <Chip size="small" label={learningItem.progress.status} color={learningItem.progress.status === "COMPLETED" ? "success" : "primary"} variant="outlined" sx={{ fontWeight: 900 }} />
                            </Stack>
                            <Box>
                                <Typography variant="h2">{learningItem.item.title}</Typography>
                                <Typography sx={{ color: "text.secondary", mt: 1.2 }}>
                                    {learningItem.course.title} · {isRu ? "Попыток" : "Attempts"}: {learningItem.progress.attemptsCount} · {isRu ? "Последний балл" : "Last score"}: {learningItem.progress.lastScore ?? "n/a"}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    {currentModule && currentModule.deadlineType !== "NONE" ? (
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                            <Stack spacing={1.3}>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                    <Chip icon={<AccessTimeRoundedIcon />} label={deadlineTypeLabel(currentModule.deadlineType, isRu)} variant="outlined" sx={{ fontWeight: 900 }} />
                                    {currentModuleStartedAt ? <Chip label={`${isRu ? "Старт" : "Started"}: ${formatDateTime(currentModuleStartedAt, locale)}`} variant="outlined" sx={{ fontWeight: 900 }} /> : null}
                                    {currentModuleDeadlineAt ? <Chip label={`${isRu ? "Дедлайн" : "Deadline"}: ${formatDateTime(currentModuleDeadlineAt, locale)}`} variant="outlined" sx={{ fontWeight: 900 }} /> : null}
                                    {deadlineState ? <Chip label={deadlineStatusLabel(deadlineState.deadlineStatus, isRu)} color={deadlineStatusColor(deadlineState.deadlineStatus)} variant="outlined" sx={{ fontWeight: 900 }} /> : null}
                                </Stack>
                                {isDeadlineLoading ? <LinearProgress sx={{ height: 6, borderRadius: 999 }} /> : null}
                                {deadlineError ? <Alert severity="warning">{deadlineError}</Alert> : null}
                                {deadlineState ? (
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        {isRu ? "Задач до дедлайна" : "Tasks before deadline"}: {deadlineState.tasksCompletedBeforeDeadline.length} · {isRu ? "после дедлайна" : "after deadline"}: {deadlineState.tasksCompletedAfterDeadline.length}
                                    </Typography>
                                ) : null}
                            </Stack>
                        </Paper>
                    ) : null}

                    {requiresModuleStart && currentModule ? (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: { xs: 2.5, md: 4 },
                                borderRadius: 2.5,
                                maxWidth: 860,
                                mx: "auto",
                                width: "100%",
                                bgcolor: "background.paper",
                            }}
                        >
                            <Stack spacing={3} alignItems="center" textAlign="center">
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        display: "grid",
                                        placeItems: "center",
                                        borderRadius: 2,
                                        bgcolor: "action.hover",
                                        color: "primary.main",
                                        border: 1,
                                        borderColor: "divider",
                                    }}
                                >
                                    <AccessTimeRoundedIcon />
                                </Box>
                                <Box>
                                    <Typography variant="h3">{isRu ? "Сначала начните модуль" : "Start the module first"}</Typography>
                                    <Typography sx={{ color: "text.secondary", lineHeight: 1.7, mt: 1, maxWidth: 640 }}>
                                        {isRu
                                            ? "Задания откроются после явного запуска. Повторный старт вернет старое время и не сбросит таймер."
                                            : "Items unlock after an explicit start. Starting again returns the original time and will not reset the timer."}
                                    </Typography>
                                </Box>

                                <Paper
                                    variant="outlined"
                                    sx={{
                                        width: "100%",
                                        p: 2.2,
                                        borderRadius: 1.5,
                                        borderColor: "error.main",
                                        bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,180,171,0.08)" : "rgba(186,26,26,0.05)"),
                                    }}
                                >
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "center", sm: "flex-start" }} textAlign={{ xs: "center", sm: "left" }}>
                                        <WarningAmberRoundedIcon color="error" />
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 950, color: "error.main" }}>{isRu ? "Модуль с таймером" : "Timed module"}</Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                                                {isRu
                                                    ? `Лимит: ${formatDuration(currentModule.timeLimitMinutes ?? 0, isRu)}. Начинайте, когда готовы пройти модуль без пауз.`
                                                    : `Limit: ${formatDuration(currentModule.timeLimitMinutes ?? 0, isRu)}. Start when you are ready to work through the module without breaks.`}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={0} divider={<Divider flexItem orientation="vertical" sx={{ display: { xs: "none", sm: "block" } }} />} sx={{ width: "100%", maxWidth: 420 }}>
                                    <Box sx={{ flex: 1, py: 0.5 }}>
                                        <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 950 }}>
                                            {isRu ? "Лимит" : "Limit"}
                                        </Typography>
                                        <Typography variant="h5">{formatDuration(currentModule.timeLimitMinutes ?? 0, isRu)}</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, py: 0.5 }}>
                                        <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 950 }}>
                                            {isRu ? "Уроки" : "Items"}
                                        </Typography>
                                        <Typography variant="h5">{currentModule.items.length}</Typography>
                                    </Box>
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} justifyContent="center">
                                    <Button variant="contained" size="large" startIcon={<PlayArrowRoundedIcon />} disabled={isStartingModule} onClick={() => void startCurrentModule()}>
                                        {isRu ? "Начать / продолжить модуль" : "Start / continue module"}
                                    </Button>
                                    <Button component={RouterLink} to={`/learn/${learningItem.course.id}`} size="large" variant="outlined">
                                        {isRu ? "Карта курса" : "Course map"}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ) : null}

                    {!requiresModuleStart ? (
                        <>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: isExecutable ? "minmax(0, 1fr) 420px" : "1fr" }, gap: 3, alignItems: "start" }}>
                        <Stack spacing={3}>
                            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                                <Stack spacing={2.2}>
                                    <Box>
                                        <Typography variant="h5">{isRu ? "Инструкция" : "Instructions"}</Typography>
                                        <Typography sx={{ color: "text.secondary", mt: 1, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{learningItem.item.statement ?? (isRu ? "Описание урока пока не заполнено." : "No statement provided.")}</Typography>
                                    </Box>

                                    {learningItem.item.contentBlocks.length > 0 ? (
                                        <Stack spacing={1.5}>
                                            {learningItem.item.contentBlocks.map((block) => (
                                                <ContentBlock key={block.id} block={block} />
                                            ))}
                                        </Stack>
                                    ) : null}

                                    {learningItem.item.hints.length > 0 ? (
                                        <Accordion variant="outlined" sx={{ borderRadius: 1.5, overflow: "hidden", "&:before": { display: "none" } }}>
                                            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <HelpOutlineRoundedIcon color="primary" />
                                                    <Typography sx={{ fontWeight: 950 }}>{isRu ? "Подсказки" : "Hints"}</Typography>
                                                </Stack>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Stack spacing={1}>
                                                    {learningItem.item.hints.map((hint) => (
                                                        <Alert key={hint.id} severity="info">{hint.text}</Alert>
                                                    ))}
                                                </Stack>
                                            </AccordionDetails>
                                        </Accordion>
                                    ) : null}
                                </Stack>
                            </Paper>

                            {isQuiz ? (
                                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="h5">{isRu ? "Выбор ответа" : "Choose answer"}</Typography>
                                            <Typography sx={{ color: "text.secondary", mt: 0.6 }}>{isRu ? "Выберите один или несколько вариантов и отправьте ответ." : "Select one or more options and submit your answer."}</Typography>
                                        </Box>
                                        {learningItem.item.options.length === 0 ? <EmptyState title={isRu ? "Нет вариантов" : "No options"} description={isRu ? "У этого квиза пока нет вариантов ответа." : "This quiz has no options yet."} /> : null}
                                        <Stack spacing={1.2}>
                                            {learningItem.item.options.map((option) => (
                                                <QuizOptionCard key={option.id} option={option} selected={selectedOptionIds.includes(option.id)} showFeedback={Boolean(result)} onToggle={toggleOption} />
                                            ))}
                                        </Stack>
                                        {actionError ? <Alert severity="error">{actionError}</Alert> : null}
                                        {pendingAction === "submit" ? <Alert severity="info">{isRu ? "Отправляем ответ и ждём результат проверки..." : "Submitting answer and waiting for the result..."}</Alert> : null}
                                        <Button variant="contained" startIcon={<SendRoundedIcon />} disabled={isSubmitting || selectedOptionIds.length === 0} onClick={() => void runOrSubmit(true)}>
                                            {isRu ? "Отправить ответ" : "Submit answer"}
                                        </Button>
                                    </Stack>
                                </Paper>
                            ) : null}

                            {isContentOnly ? (
                                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: "center" }}>
                                        <Typography sx={{ color: "text.secondary" }}>{isRu ? "Это теоретический урок. После чтения переходите к следующему шагу." : "This item is content-only. Use navigation to continue after reading."}</Typography>
                                        <Chip label={isRu ? "Проверка не требуется" : "No execution required"} color="primary" variant="outlined" sx={{ fontWeight: 900 }} />
                                    </Stack>
                                </Paper>
                            ) : null}

                            {result ? <SubmissionResultPanel result={result} /> : null}
                        </Stack>

                        {isExecutable ? (
                            <Stack spacing={2.5} sx={{ position: { lg: "sticky" }, top: { lg: 96 } }}>
                                <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
                                    <Stack spacing={2}>
                                        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography variant="h5">{isRu ? "Рабочая область" : "Workspace"}</Typography>
                                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                    {itemType === "SQL" ? (isRu ? "Напишите SQL и запустите проверку." : "Write SQL and run checks.") : (isRu ? "Напишите код и запустите проверку." : "Write code and run checks.")}
                                                </Typography>
                                            </Box>
                                            {learningItem.item.language ? <Chip label={learningItem.item.language} color="primary" variant="outlined" sx={{ fontWeight: 900 }} /> : null}
                                        </Stack>
                                        <TextField
                                            multiline
                                            minRows={16}
                                            value={sourceCode}
                                            onChange={(event) => setSourceCode(event.target.value)}
                                            fullWidth
                                            sx={{
                                                "& textarea": {
                                                    fontFamily: "'Geist Mono', Consolas, monospace",
                                                    color: "#f8f8f2",
                                                    fontSize: 13,
                                                },
                                                "& .MuiInputBase-root": {
                                                    bgcolor: studyBytesColors.codeSurface,
                                                    color: "#f8f8f2",
                                                    borderRadius: 1.25,
                                                },
                                            }}
                                        />
                                        {actionError ? <Alert severity="error">{actionError}</Alert> : null}
                                        {isSubmitting ? <LinearProgress /> : null}
                                        {pendingAction ? (
                                            <Alert severity="info">
                                                {pendingAction === "run"
                                                    ? (isRu ? "Запускаем код и ждём ответ от системы проверки..." : "Running code and waiting for the checker response...")
                                                    : (isRu ? "Отправляем решение и ждём итоговый результат..." : "Submitting solution and waiting for the final result...")}
                                            </Alert>
                                        ) : null}
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                            <Button variant="outlined" startIcon={<PlayArrowRoundedIcon />} disabled={isSubmitting} onClick={() => void runOrSubmit(false)} fullWidth>
                                                {isRu ? "Запустить" : "Run"}
                                            </Button>
                                            <Button variant="contained" startIcon={<SendRoundedIcon />} disabled={isSubmitting} onClick={() => void runOrSubmit(true)} fullWidth>
                                                {isRu ? "Отправить" : "Submit"}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Paper>

                                <SubmissionHistory history={history} />
                            </Stack>
                        ) : null}
                    </Box>

                    {!isExecutable ? <SubmissionHistory history={history} /> : null}

                    <Divider />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between">
                        {learningItem.navigation.previousItemId ? (
                            <Button component={RouterLink} to={`/learn/${learningItem.course.id}/items/${learningItem.navigation.previousItemId}`} variant="outlined" startIcon={<ArrowBackRoundedIcon />}>
                                {isRu ? "Назад" : "Previous"}
                            </Button>
                        ) : (
                            <Box />
                        )}
                        {learningItem.navigation.nextItemId ? (
                            <Button component={RouterLink} to={`/learn/${learningItem.course.id}/items/${learningItem.navigation.nextItemId}`} variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
                                {isRu ? "Следующий урок" : "Next item"}
                            </Button>
                        ) : (
                            <Button component={RouterLink} to={`/learn/${learningItem.course.id}`} variant="contained">
                                {isRu ? "К курсу" : "Back to course"}
                            </Button>
                        )}
                    </Stack>
                        </>
                    ) : null}
                </Stack>
            ) : null}
        </PageContainer>
    );
}

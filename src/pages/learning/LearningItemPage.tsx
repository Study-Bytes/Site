import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Link as RouterLink, useParams } from "react-router-dom";
import { getErrorMessage } from "../../api/apiError";
import type { LearningItem, SubmissionResult } from "../../api/bffContracts";
import { learningApi } from "../../api/services";
import { ErrorState } from "../../components/ui/ErrorState";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageContainer } from "../../layouts/PageContainer";
import { studyBytesColors } from "../../theme/theme";

function parseId(value: string | undefined) {
    const id = Number(value);
    return Number.isFinite(id) ? id : null;
}

export default function LearningItemPage() {
    const { courseId, itemId } = useParams();
    const parsedCourseId = parseId(courseId);
    const parsedItemId = parseId(itemId);
    const [learningItem, setLearningItem] = useState<LearningItem | null>(null);
    const [sourceCode, setSourceCode] = useState("");
    const [result, setResult] = useState<SubmissionResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const isExecutable = useMemo(() => learningItem?.item.itemType === "CODING" || learningItem?.item.itemType === "SQL", [learningItem]);

    const loadItem = useCallback(async () => {
        if (!parsedCourseId || !parsedItemId) {
            setError("Invalid course or item id");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const item = await learningApi.getLearningItem(parsedCourseId, parsedItemId);
            setLearningItem(item);
            setSourceCode(item.item.starterCode ?? "");
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Failed to load learning item"));
        } finally {
            setIsLoading(false);
        }
    }, [parsedCourseId, parsedItemId]);

    useEffect(() => {
        void loadItem();
    }, [loadItem]);

    const run = async (submit: boolean) => {
        if (!parsedCourseId || !parsedItemId) return;
        setIsSubmitting(true);
        setActionError(null);
        try {
            const payload = { sourceCode };
            const response = submit
                ? await learningApi.submitItem(parsedCourseId, parsedItemId, payload)
                : await learningApi.runItem(parsedCourseId, parsedItemId, payload);
            setResult(response);
        } catch (requestError) {
            setActionError(getErrorMessage(requestError, submit ? "Submit failed" : "Run failed"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer>
            {isLoading ? <LoadingState rows={3} /> : null}
            {error ? <ErrorState message={error} onRetry={loadItem} /> : null}
            {learningItem ? (
                <Stack spacing={3}>
                    <Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                            <ItemTypeBadge itemType={learningItem.item.itemType} />
                            {learningItem.item.language ? <Chip size="small" label={learningItem.item.language} /> : null}
                            <Chip size="small" label={learningItem.progress.status} />
                        </Stack>
                        <Typography variant="h2">{learningItem.item.title}</Typography>
                        <Typography sx={{ color: "text.secondary", mt: 1 }}>
                            {learningItem.course.title} · Attempts: {learningItem.progress.attemptsCount}
                        </Typography>
                    </Box>

                    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 5 }}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="h5">Task statement</Typography>
                                <Typography sx={{ color: "text.secondary", mt: 1 }}>{learningItem.item.statement ?? "No statement provided."}</Typography>
                            </Box>

                            {learningItem.item.contentBlocks.map((block) => (
                                <Paper key={block.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                    <Typography sx={{ fontWeight: 900 }}>{block.title ?? block.blockType}</Typography>
                                    <Typography sx={{ color: "text.secondary", mt: 1 }}>{block.textContent ?? block.url ?? "No content"}</Typography>
                                </Paper>
                            ))}

                            {learningItem.item.hints.length > 0 ? (
                                <Alert severity="info">Hint: {learningItem.item.hints[0].text}</Alert>
                            ) : null}

                            {isExecutable ? (
                                <>
                                    <TextField
                                        multiline
                                        minRows={12}
                                        value={sourceCode}
                                        onChange={(event) => setSourceCode(event.target.value)}
                                        sx={{
                                            "& textarea": {
                                                fontFamily: "'Geist Mono', Consolas, monospace",
                                                color: "#f8f8f2",
                                            },
                                            "& .MuiInputBase-root": {
                                                bgcolor: studyBytesColors.codeSurface,
                                                color: "#f8f8f2",
                                            },
                                        }}
                                    />
                                    {actionError ? <Alert severity="error">{actionError}</Alert> : null}
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                        <Button variant="outlined" startIcon={<PlayArrowRoundedIcon />} disabled={isSubmitting} onClick={() => void run(false)}>
                                            Run
                                        </Button>
                                        <Button variant="contained" startIcon={<SendRoundedIcon />} disabled={isSubmitting} onClick={() => void run(true)}>
                                            Submit
                                        </Button>
                                    </Stack>
                                </>
                            ) : null}

                            {learningItem.item.itemType === "QUIZ" ? (
                                <Stack spacing={1}>
                                    {learningItem.item.options.map((option) => (
                                        <Paper key={option.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                            <Typography sx={{ fontWeight: 900 }}>{option.label ? `${option.label}. ` : ""}{option.text}</Typography>
                                        </Paper>
                                    ))}
                                    <Button variant="contained" disabled={isSubmitting} onClick={() => void run(true)}>
                                        Submit answer
                                    </Button>
                                </Stack>
                            ) : null}
                        </Stack>
                    </Paper>

                    {result ? (
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 5 }}>
                            <Stack spacing={1.5}>
                                <Typography variant="h5">Result: {result.status}</Typography>
                                <Typography sx={{ color: "text.secondary" }}>
                                    Passed {result.passedTests}/{result.totalTests} tests · Score {result.score ?? "n/a"}
                                </Typography>
                                {result.testResults.map((test) => (
                                    <Paper key={test.testKey} variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                                        <Typography sx={{ fontWeight: 900 }}>{test.testKey}: {test.passed ? "passed" : "failed"}</Typography>
                                        {test.message ? <Typography sx={{ color: "text.secondary" }}>{test.message}</Typography> : null}
                                    </Paper>
                                ))}
                            </Stack>
                        </Paper>
                    ) : null}

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        {learningItem.navigation.previousItemId ? (
                            <Button component={RouterLink} to={`/learn/${learningItem.course.id}/items/${learningItem.navigation.previousItemId}`} variant="outlined">
                                Previous
                            </Button>
                        ) : null}
                        {learningItem.navigation.nextItemId ? (
                            <Button component={RouterLink} to={`/learn/${learningItem.course.id}/items/${learningItem.navigation.nextItemId}`} variant="contained">
                                Next
                            </Button>
                        ) : null}
                    </Stack>
                </Stack>
            ) : null}
        </PageContainer>
    );
}

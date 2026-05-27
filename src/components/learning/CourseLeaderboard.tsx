import { Alert, Avatar, Box, Button, Chip, Divider, Paper, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { useCallback, useEffect, useState } from "react";
import { getErrorMessage, isEnrollmentRequiredError } from "../../api/apiError";
import type { CourseLeaderboardEntry, CourseLeaderboardResponse } from "../../api/bffContracts";
import { learningApi } from "../../api/services";
import { useI18n } from "../../i18n/useI18n";

const leaderboardLimit = 10;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clampProgress(value: number) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
}

function displayName(entry: CourseLeaderboardEntry, isRu: boolean) {
    const name = entry.fullName?.trim();
    if (name && !emailPattern.test(name)) return name;
    const rank = validRank(entry.rank);
    if (rank) return isRu ? `Участник #${rank}` : `Participant #${rank}`;
    return entry.userId ? `#${entry.userId}` : isRu ? "Пользователь" : "User";
}

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function validRank(rank: number | null | undefined) {
    return typeof rank === "number" && Number.isFinite(rank) && rank > 0 ? rank : null;
}

function rankLabel(rank: number | null | undefined, isRu: boolean) {
    const value = validRank(rank);
    if (!value) return isRu ? "Без места" : "Unranked";
    return isRu ? `${value} место` : `#${value}`;
}

function isTopPlace(rank: number | null | undefined) {
    const value = validRank(rank);
    return Boolean(value && value <= 3);
}

function dedupeByUser(entries: CourseLeaderboardEntry[]) {
    const seen = new Set<number>();
    return entries.filter((entry) => {
        if (seen.has(entry.userId)) return false;
        seen.add(entry.userId);
        return true;
    });
}

function LeaderboardRow({ entry, isCurrentUser, compact = false }: { entry: CourseLeaderboardEntry; isCurrentUser: boolean; compact?: boolean }) {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const name = displayName(entry, isRu);
    const progress = clampProgress(entry.progressPercent);
    const rank = validRank(entry.rank);

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "34px minmax(0, 1fr) 48px",
                gap: 1,
                alignItems: "center",
                py: compact ? 1.1 : 1.25,
                px: 1,
                borderRadius: 1.2,
                bgcolor: isCurrentUser ? "action.hover" : "transparent",
                borderLeft: isCurrentUser ? 3 : 0,
                borderColor: "primary.main",
            }}
        >
            <Tooltip title={rankLabel(entry.rank, isRu)}>
                <Box
                    sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1,
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 950,
                        color: isTopPlace(rank) ? "primary.contrastText" : "text.primary",
                        bgcolor: isTopPlace(rank) ? "primary.main" : "action.selected",
                    }}
                >
                    {isTopPlace(rank) ? <EmojiEventsRoundedIcon fontSize="small" /> : rank ?? "-"}
                </Box>
            </Tooltip>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <Avatar src={entry.avatarUrl ?? undefined} sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 900, flex: "0 0 auto" }}>
                    {initials(name) || <PersonRoundedIcon fontSize="small" />}
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography noWrap sx={{ fontWeight: 900, minWidth: 0 }}>
                        {name}
                    </Typography>
                    <Stack direction="row" spacing={0.7} alignItems="center" sx={{ minWidth: 0 }}>
                        <Typography noWrap variant="caption" sx={{ color: "text.secondary", fontWeight: 800, minWidth: 0 }}>
                            {rankLabel(entry.rank, isRu)}
                        </Typography>
                        {isCurrentUser ? <Chip size="small" label={isRu ? "Вы" : "You"} color="primary" sx={{ height: 20, fontWeight: 900 }} /> : null}
                    </Stack>
                </Box>
            </Stack>

            <Typography sx={{ fontWeight: 950, whiteSpace: "nowrap", textAlign: "right" }}>{progress}%</Typography>
        </Box>
    );
}

function LeaderboardSkeleton() {
    return (
        <Stack spacing={1.4}>
            {Array.from({ length: 5 }).map((_, index) => (
                <Stack key={index} direction="row" spacing={1.2} alignItems="center">
                    <Skeleton variant="rounded" width={34} height={34} />
                    <Skeleton variant="circular" width={30} height={30} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Skeleton width="72%" height={22} />
                        <Skeleton width="100%" height={14} />
                    </Box>
                    <Skeleton width={36} height={22} />
                </Stack>
            ))}
        </Stack>
    );
}

export function CourseLeaderboard({
    leaderboard,
    isLoading,
    error,
    errorSeverity = "warning",
    showRetry = true,
    onRetry,
}: {
    leaderboard: CourseLeaderboardResponse | null;
    isLoading: boolean;
    error: string | null;
    errorSeverity?: "info" | "warning";
    showRetry?: boolean;
    onRetry: () => void;
}) {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const returnedTopEntries = dedupeByUser(leaderboard?.top ?? []);
    const topEntries = returnedTopEntries.slice(0, leaderboardLimit);
    const currentUser = leaderboard?.currentUser ?? null;
    const currentUserInTop = Boolean(currentUser && returnedTopEntries.some((entry) => entry.userId === currentUser.userId));
    const shouldShowCurrentUser = Boolean(currentUser && !currentUserInTop);

    return (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Stack spacing={0}>
                <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between" sx={{ p: 2.2, borderBottom: 1, borderColor: "divider" }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <WorkspacePremiumRoundedIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 950 }}>
                            {isRu ? "Лидеры курса" : "Course leaders"}
                        </Typography>
                    </Stack>
                    <Chip size="small" label={`Top ${leaderboardLimit}`} variant="outlined" sx={{ fontWeight: 900 }} />
                </Stack>

                {isLoading ? <Box sx={{ p: 2 }}><LeaderboardSkeleton /></Box> : null}

                {!isLoading && error ? (
                    <Stack spacing={1.3} sx={{ p: 2 }}>
                        <Alert severity={errorSeverity}>{error}</Alert>
                        {showRetry ? (
                            <Button startIcon={<ReplayRoundedIcon />} onClick={onRetry} variant="outlined" size="small" sx={{ alignSelf: "flex-start" }}>
                                {isRu ? "Повторить" : "Retry"}
                            </Button>
                        ) : null}
                    </Stack>
                ) : null}

                {!isLoading && !error && topEntries.length === 0 && !currentUser ? (
                    <Typography variant="body2" sx={{ color: "text.secondary", p: 2 }}>
                        {isRu ? "В рейтинге пока нет участников." : "No leaderboard entries yet."}
                    </Typography>
                ) : null}

                {!isLoading && !error && topEntries.length > 0 ? (
                    <Stack divider={<Divider flexItem />} spacing={0} sx={{ p: 1 }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "34px minmax(0, 1fr) 48px", gap: 1, px: 1, pb: 0.8 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 950 }}>
                                #
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 950, textTransform: "uppercase" }}>
                                {isRu ? "Ник" : "Name"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 950, textAlign: "right", textTransform: "uppercase" }}>
                                {isRu ? "Прог." : "Prog."}
                            </Typography>
                        </Box>
                        {topEntries.map((entry, index) => (
                            <LeaderboardRow key={`${entry.userId}-${entry.rank}-${index}`} entry={entry} isCurrentUser={currentUser?.userId === entry.userId} />
                        ))}
                    </Stack>
                ) : null}

                {!isLoading && !error && shouldShowCurrentUser && currentUser ? (
                    <Stack spacing={1.2} sx={{ p: 1.2, pt: 0 }}>
                        <Divider />
                        <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 950 }}>
                            {isRu ? "Ваш результат" : "Your result"}
                        </Typography>
                        <LeaderboardRow entry={currentUser} isCurrentUser compact />
                    </Stack>
                ) : null}
            </Stack>
        </Paper>
    );
}

export function CourseLeaderboardPanel({
    courseId,
    enabled = true,
    enrollmentRequiredMessage,
}: {
    courseId: number | null | undefined;
    enabled?: boolean;
    enrollmentRequiredMessage?: string;
}) {
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const [leaderboard, setLeaderboard] = useState<CourseLeaderboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(Boolean(courseId && enabled));
    const [error, setError] = useState<string | null>(null);
    const [isAccessNotice, setIsAccessNotice] = useState(false);

    const loadLeaderboard = useCallback(async () => {
        if (!courseId || !enabled) {
            setLeaderboard(null);
            setError(null);
            setIsAccessNotice(false);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsAccessNotice(false);
        try {
            setLeaderboard(await learningApi.getCourseLeaderboard(courseId));
        } catch (requestError) {
            setLeaderboard(null);
            if (isEnrollmentRequiredError(requestError)) {
                setIsAccessNotice(true);
                setError(enrollmentRequiredMessage ?? (isRu ? "Рейтинг доступен после записи на курс." : "Leaderboard is available after enrollment."));
            } else {
                setError(getErrorMessage(requestError, isRu ? "Не удалось загрузить рейтинг курса" : "Failed to load course leaderboard"));
            }
        } finally {
            setIsLoading(false);
        }
    }, [courseId, enabled, enrollmentRequiredMessage, isRu]);

    useEffect(() => {
        void loadLeaderboard();
    }, [loadLeaderboard]);

    return <CourseLeaderboard leaderboard={leaderboard} isLoading={isLoading} error={error} errorSeverity={isAccessNotice ? "info" : "warning"} showRetry={!isAccessNotice} onRetry={loadLeaderboard} />;
}

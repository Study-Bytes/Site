import { Alert, Avatar, Box, Button, Chip, Divider, LinearProgress, Paper, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import type { CourseLeaderboardEntry, CourseLeaderboardResponse } from "../../api/bffContracts";
import { useI18n } from "../../i18n/useI18n";

const leaderboardLimit = 10;

function clampProgress(value: number) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
}

function displayName(entry: CourseLeaderboardEntry, isRu: boolean) {
    return entry.fullName?.trim() || (entry.userId ? `#${entry.userId}` : isRu ? "Пользователь" : "User");
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
                gridTemplateColumns: "auto minmax(0, 1fr)",
                gap: 1.2,
                alignItems: "center",
                py: compact ? 1.2 : 1.35,
                px: isCurrentUser ? 1.2 : 0,
                borderRadius: 1.2,
                bgcolor: isCurrentUser ? "action.hover" : "transparent",
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

            <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    <Avatar src={entry.avatarUrl ?? undefined} sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 900, flex: "0 0 auto" }}>
                        {initials(name) || <PersonRoundedIcon fontSize="small" />}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                            <Typography noWrap sx={{ fontWeight: 900, minWidth: 0, flexGrow: 1 }}>
                                {name}
                            </Typography>
                            <Typography sx={{ fontWeight: 950, whiteSpace: "nowrap", flex: "0 0 auto" }}>{progress}%</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.7} alignItems="center" sx={{ minWidth: 0 }}>
                            <Typography noWrap variant="caption" sx={{ color: "text.secondary", fontWeight: 800, minWidth: 0 }}>
                                {rankLabel(entry.rank, isRu)}
                            </Typography>
                            {isCurrentUser ? <Chip size="small" label={isRu ? "Вы" : "You"} color="primary" variant="outlined" sx={{ height: 22, fontWeight: 900 }} /> : null}
                        </Stack>
                    </Box>
                </Stack>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 999 }} />
            </Stack>
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
    onRetry,
}: {
    leaderboard: CourseLeaderboardResponse | null;
    isLoading: boolean;
    error: string | null;
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
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack spacing={2}>
                <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <WorkspacePremiumRoundedIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 950 }}>
                            {isRu ? "Лидеры курса" : "Course leaders"}
                        </Typography>
                    </Stack>
                    <Chip size="small" label={`Top ${leaderboardLimit}`} variant="outlined" sx={{ fontWeight: 900 }} />
                </Stack>

                {isLoading ? <LeaderboardSkeleton /> : null}

                {!isLoading && error ? (
                    <Stack spacing={1.3}>
                        <Alert severity="warning">{error}</Alert>
                        <Button startIcon={<ReplayRoundedIcon />} onClick={onRetry} variant="outlined" size="small" sx={{ alignSelf: "flex-start" }}>
                            {isRu ? "Повторить" : "Retry"}
                        </Button>
                    </Stack>
                ) : null}

                {!isLoading && !error && topEntries.length === 0 && !currentUser ? (
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {isRu ? "В рейтинге пока нет участников." : "No leaderboard entries yet."}
                    </Typography>
                ) : null}

                {!isLoading && !error && topEntries.length > 0 ? (
                    <Stack divider={<Divider flexItem />} spacing={0}>
                        {topEntries.map((entry, index) => (
                            <LeaderboardRow key={`${entry.userId}-${entry.rank}-${index}`} entry={entry} isCurrentUser={currentUser?.userId === entry.userId} />
                        ))}
                    </Stack>
                ) : null}

                {!isLoading && !error && shouldShowCurrentUser && currentUser ? (
                    <Stack spacing={1.2}>
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

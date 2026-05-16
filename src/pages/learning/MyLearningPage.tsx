import { useEffect, useState } from "react";
import { Box, Button, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { bffClient } from "../../api/apiClient";
import type { EnrollmentSummary } from "../../api/bffContracts";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageContainer } from "../../layouts/PageContainer";
import { getErrorMessage } from "../../api/apiError";

export default function MyLearningPage() {
    const [items, setItems] = useState<EnrollmentSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = async () => {
        setIsLoading(true);
        setError(null);
        try {
            setItems(await bffClient.getMyLearning());
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Failed to load learning dashboard"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadItems();
    }, []);

    return (
        <PageContainer>
            <Stack spacing={4}>
                <Box>
                    <Typography variant="h2">My Learning</Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1 }}>Student learning dashboard placeholder for BFF integration.</Typography>
                </Box>

                {isLoading ? <LoadingState rows={2} /> : null}
                {error ? <ErrorState message={error} onRetry={loadItems} /> : null}
                {!isLoading && !error && items.length === 0 ? (
                    <EmptyState title="No enrolled courses" description="Enroll in a course to start learning." />
                ) : null}
                <Stack spacing={2}>
                    {items.map((item) => (
                        <Paper key={item.course.id} variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="h5">{item.course.title}</Typography>
                                    <Typography sx={{ color: "text.secondary" }}>{item.course.shortDescription}</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={item.progressPercent} sx={{ height: 8, borderRadius: 999 }} />
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                                    <Typography sx={{ color: "text.secondary" }}>{item.progressPercent}% complete · {item.status}</Typography>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Button component={RouterLink} to={`/learn/${item.course.id}`} variant="contained">
                                        Continue
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            </Stack>
        </PageContainer>
    );
}

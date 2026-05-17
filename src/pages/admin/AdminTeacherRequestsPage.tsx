import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography } from "@mui/material";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import { getErrorMessage } from "../../api/apiError";
import type { TeacherAccessRequest } from "../../api/bffContracts";
import { teacherRequestsApi } from "../../api/services/teacherRequestsApi";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageContainer } from "../../layouts/PageContainer";
import { useI18n } from "../../i18n/useI18n";

function statusColor(status: TeacherAccessRequest["status"]): "warning" | "success" | "error" | "default" {
    if (status === "PENDING") return "warning";
    if (status === "APPROVED") return "success";
    if (status === "REJECTED") return "error";
    return "default";
}

type ReviewDialog = { request: TeacherAccessRequest; action: "approve" | "reject" } | null;

export default function AdminTeacherRequestsPage() {
    const { t } = useI18n();
    const [requests, setRequests] = useState<TeacherAccessRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialog, setDialog] = useState<ReviewDialog>(null);
    const [comment, setComment] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const loadRequests = async () => {
        setIsLoading(true);
        setError(null);
        try {
            setRequests(await teacherRequestsApi.listAdmin());
        } catch (apiError) {
            setError(getErrorMessage(apiError, "Failed to load teacher requests"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadRequests();
    }, []);

    const review = async () => {
        if (!dialog) return;
        setIsSaving(true);
        try {
            if (dialog.action === "approve") await teacherRequestsApi.approve(dialog.request.id, { reviewComment: comment.trim() || null });
            else await teacherRequestsApi.reject(dialog.request.id, { reviewComment: comment.trim() || null });
            setDialog(null);
            setComment("");
            await loadRequests();
        } catch (apiError) {
            setError(getErrorMessage(apiError, "Failed to review teacher request"));
        } finally {
            setIsSaving(false);
        }
    };

    const stats = {
        total: requests.length,
        pending: requests.filter((request) => request.status === "PENDING").length,
        approved: requests.filter((request) => request.status === "APPROVED").length,
        rejected: requests.filter((request) => request.status === "REJECTED").length,
    };

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 2,
                        background: (theme) => (theme.palette.mode === "dark" ? "rgba(31,31,40,0.88)" : "linear-gradient(135deg, #ffffff, #f6f2ff)"),
                    }}
                >
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                        <Box sx={{ maxWidth: 760 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "primary.main", mb: 1 }}>
                                <AssignmentTurnedInRoundedIcon fontSize="small" />
                                <Typography variant="overline" sx={{ fontWeight: 950 }}>Admin review</Typography>
                            </Stack>
                            <Typography variant="h2">{t("teacherRequest.adminTitle")}</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1 }}>{t("teacherRequest.adminSubtitle")}</Typography>
                        </Box>
                    </Stack>
                </Paper>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
                    {[
                        { label: "Total", value: stats.total, icon: <AssignmentTurnedInRoundedIcon /> },
                        { label: "Pending", value: stats.pending, icon: <PendingActionsRoundedIcon /> },
                        { label: "Approved", value: stats.approved, icon: <CheckCircleRoundedIcon /> },
                        { label: "Rejected", value: stats.rejected, icon: <ReportProblemRoundedIcon /> },
                    ].map((item) => (
                        <Paper key={item.label} variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ color: "primary.main", display: "grid", placeItems: "center" }}>{item.icon}</Box>
                                <Box>
                                    <Typography variant="h5">{item.value}</Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>{item.label}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    ))}
                </Box>

                {error ? <Alert severity="error">{error}</Alert> : null}
                {isLoading ? <LoadingState rows={3} /> : null}
                {!isLoading && requests.length === 0 ? <EmptyState title={t("teacherRequest.noRequestsTitle")} description={t("teacherRequest.noRequestsDescription")} /> : null}

                <Stack spacing={2}>
                    {requests.map((request) => (
                        <Paper key={request.id} variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 1.5 }}>
                            <Stack spacing={2}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                                    <Box>
                                        <Typography variant="h6">{request.user?.fullName ?? `User #${request.userId}`}</Typography>
                                        <Typography sx={{ color: "text.secondary" }}>{request.user?.email}</Typography>
                                    </Box>
                                    <Chip color={statusColor(request.status)} label={request.status} sx={{ fontWeight: 900 }} />
                                </Stack>
                                <Typography>{request.motivation}</Typography>
                                <Typography sx={{ color: "text.secondary" }}>{request.experience}</Typography>
                                <Typography variant="body2">{t("teacherRequest.topics")}: {request.preferredTopics.join(", ") || "-"}</Typography>
                                {request.reviewComment ? <Alert severity="info">{request.reviewComment}</Alert> : null}
                                {request.status === "PENDING" ? (
                                    <Stack direction="row" spacing={1}>
                                        <Button variant="contained" onClick={() => setDialog({ request, action: "approve" })}>{t("teacherRequest.approve")}</Button>
                                        <Button variant="outlined" color="error" onClick={() => setDialog({ request, action: "reject" })}>{t("teacherRequest.reject")}</Button>
                                    </Stack>
                                ) : null}
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            </Stack>

            <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
                <DialogTitle>{dialog?.action === "approve" ? t("teacherRequest.approve") : t("teacherRequest.reject")}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label={t("teacherRequest.reviewComment")} value={comment} onChange={(event) => setComment(event.target.value)} multiline minRows={3} sx={{ mt: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(null)}>{t("common.cancel")}</Button>
                    <Button variant="contained" color={dialog?.action === "reject" ? "error" : "primary"} onClick={() => void review()} disabled={isSaving}>
                        {isSaving ? t("common.saving") : dialog?.action === "approve" ? t("teacherRequest.approve") : t("teacherRequest.reject")}
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
}

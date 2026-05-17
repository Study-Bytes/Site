import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { ApiError, getErrorMessage } from "../api/apiError";
import type { ApiValidationError, TeacherAccessRequest } from "../api/bffContracts";
import { teacherRequestsApi } from "../api/services/teacherRequestsApi";
import { useI18n } from "../i18n/useI18n";
import { FormSectionCard } from "../components/ui/FormSectionCard";
import { LoadingState } from "../components/ui/LoadingState";
import { ValidationErrorPanel } from "../components/ui/ValidationErrorPanel";
import { PageContainer } from "../layouts/PageContainer";

function validationErrors(error: unknown): ApiValidationError[] {
    return error instanceof ApiError ? error.validationErrors : [];
}

function statusColor(status: TeacherAccessRequest["status"]): "warning" | "success" | "error" | "default" {
    if (status === "PENDING") return "warning";
    if (status === "APPROVED") return "success";
    if (status === "REJECTED") return "error";
    return "default";
}

export default function TeacherRequestPage() {
    const { t } = useI18n();
    const [request, setRequest] = useState<TeacherAccessRequest | null>(null);
    const [motivation, setMotivation] = useState("");
    const [experience, setExperience] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [preferredTopics, setPreferredTopics] = useState("Java, Spring Boot");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<ApiValidationError[]>([]);

    const loadRequest = async () => {
        setIsLoading(true);
        setError(null);
        try {
            setRequest(await teacherRequestsApi.getMine());
        } catch (apiError) {
            setError(getErrorMessage(apiError, "Failed to load teacher request"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadRequest();
    }, []);

    const submitRequest = async () => {
        setError(null);
        setErrors([]);
        const nextErrors: ApiValidationError[] = [];
        if (!motivation.trim()) nextErrors.push({ field: "motivation", message: "Motivation is required" });
        if (!experience.trim()) nextErrors.push({ field: "experience", message: "Experience is required" });
        if (nextErrors.length) {
            setErrors(nextErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const created = await teacherRequestsApi.create({
                motivation: motivation.trim(),
                experience: experience.trim(),
                portfolioUrl: portfolioUrl.trim() || null,
                preferredTopics: preferredTopics.split(",").map((item) => item.trim()).filter(Boolean),
            });
            setRequest(created);
        } catch (apiError) {
            setErrors(validationErrors(apiError));
            setError(getErrorMessage(apiError, "Failed to submit teacher request"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 2,
                        background: (theme) =>
                            theme.palette.mode === "dark"
                                ? "linear-gradient(135deg, rgba(31,31,40,0.94), rgba(19,18,27,0.98))"
                                : "linear-gradient(135deg, #ffffff, #f4f0ff)",
                    }}
                >
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                        <Box sx={{ maxWidth: 760 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "primary.main", mb: 1 }}>
                                <SchoolRoundedIcon fontSize="small" />
                                <Typography variant="overline" sx={{ fontWeight: 950 }}>Teacher access</Typography>
                            </Stack>
                            <Typography variant="h2">{t("teacherRequest.title")}</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1.5, lineHeight: 1.65 }}>{t("teacherRequest.subtitle")}</Typography>
                        </Box>
                        <Stack spacing={1.5} sx={{ minWidth: { xs: "100%", md: 280 } }}>
                            {[
                                { icon: <AssignmentTurnedInRoundedIcon />, label: t("teacherRequest.submit") },
                                { icon: <CheckCircleRoundedIcon />, label: t("teacherRequest.approved") },
                            ].map((item) => (
                                <Paper key={item.label} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "background.paper" }}>
                                    <Stack direction="row" spacing={1.25} alignItems="center">
                                        <Box sx={{ color: "primary.main", display: "grid", placeItems: "center" }}>{item.icon}</Box>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.label}</Typography>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </Stack>
                </Paper>

                {isLoading ? <LoadingState rows={2} /> : null}
                {error ? <Alert severity="error">{error}</Alert> : null}

                {request ? (
                    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 1.5 }}>
                        <Stack spacing={2}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                                <Box>
                                    <Typography variant="h5">{t("teacherRequest.statusTitle")}</Typography>
                                    <Typography sx={{ color: "text.secondary" }}>{new Date(request.createdAt).toLocaleString()}</Typography>
                                </Box>
                                <Chip color={statusColor(request.status)} label={request.status} sx={{ fontWeight: 900 }} />
                            </Stack>
                            <Typography>{request.motivation}</Typography>
                            <Typography sx={{ color: "text.secondary" }}>{request.experience}</Typography>
                            {request.reviewComment ? <Alert severity={request.status === "REJECTED" ? "warning" : "info"}>{request.reviewComment}</Alert> : null}
                        </Stack>
                    </Paper>
                ) : (
                    <FormSectionCard title={t("teacherRequest.title")} description={t("teacherRequest.subtitle")}>
                        <Stack spacing={2}>
                            <ValidationErrorPanel errors={errors} />
                            <TextField label={t("teacherRequest.motivation")} value={motivation} onChange={(event) => setMotivation(event.target.value)} multiline minRows={3} />
                            <TextField label={t("teacherRequest.experience")} value={experience} onChange={(event) => setExperience(event.target.value)} multiline minRows={3} />
                            <TextField label={t("teacherRequest.portfolioUrl")} value={portfolioUrl} onChange={(event) => setPortfolioUrl(event.target.value)} />
                            <TextField label={t("teacherRequest.preferredTopics")} value={preferredTopics} onChange={(event) => setPreferredTopics(event.target.value)} />
                            <Button variant="contained" onClick={() => void submitRequest()} disabled={isSubmitting} sx={{ alignSelf: "flex-start" }}>
                                {isSubmitting ? t("common.saving") : t("teacherRequest.submit")}
                            </Button>
                        </Stack>
                    </FormSectionCard>
                )}
            </Stack>
        </PageContainer>
    );
}

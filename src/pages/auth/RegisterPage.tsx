import { Alert, Box, Button, Container, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { teacherRequestsApi } from "../../api/services/teacherRequestsApi";
import { storeAuthTokens } from "../../api/apiClient";
import { useI18n } from "../../i18n/useI18n";

const registerSchema = z.object({
    fullName: z.string().min(2, "Full name is required").max(80, "Too long"),
    email: z.string().min(1, "Email is required").refine((value) => z.email().safeParse(value).success, { message: "Invalid email" }),
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password"),
    motivation: z.string().optional(),
    experience: z.string().optional(),
    portfolioUrl: z.string().optional(),
    preferredTopics: z.string().optional(),
}).refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

type RegisterTab = "student" | "teacher";

export default function RegisterPage() {
    const auth = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const [tab, setTab] = useState<RegisterTab>("student");
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", motivation: "", experience: "", portfolioUrl: "", preferredTopics: "Java, Spring Boot" },
    });

    const onSubmit: SubmitHandler<RegisterForm> = async (values) => {
        setServerError(null);
        try {
            if (tab === "teacher") {
                if (!values.motivation?.trim() || !values.experience?.trim()) {
                    setServerError("Motivation and experience are required for teacher requests.");
                    return;
                }
                const response = await teacherRequestsApi.registerTeacherRequest({
                    fullName: values.fullName,
                    email: values.email,
                    password: values.password,
                    role: "STUDENT",
                    motivation: values.motivation.trim(),
                    experience: values.experience.trim(),
                    portfolioUrl: values.portfolioUrl?.trim() || null,
                    preferredTopics: values.preferredTopics?.split(",").map((item) => item.trim()).filter(Boolean) ?? [],
                });
                storeAuthTokens(response.accessToken, response.refreshToken);
                auth.setCurrentUser(response.user);
                navigate("/teacher-request", { replace: true });
                return;
            }

            await auth.register({ fullName: values.fullName, email: values.email, password: values.password, role: "STUDENT" });
            navigate("/profile", { replace: true });
        } catch (error) {
            setServerError(error instanceof Error ? error.message : "Registration failed");
        }
    };

    return (
        <Box sx={{ minHeight: "100svh", display: "flex", alignItems: "center", pt: 10, pb: 6 }}>
            <Container maxWidth="sm">
                <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography variant="h4">Register</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>Create a StudyBytes account.</Typography>
                        </Box>
                        <Tabs value={tab} onChange={(_, value: RegisterTab) => setTab(value)}>
                            <Tab value="student" label="Student registration" />
                            <Tab value="teacher" label="Teacher request" />
                        </Tabs>
                        {tab === "teacher" ? <Alert severity="info">Teacher access requires admin approval. Your account is created as STUDENT until approved.</Alert> : null}
                        {serverError ? <Alert severity="error">{serverError}</Alert> : null}
                        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
                            <TextField label="Full name" autoComplete="name" {...register("fullName")} error={Boolean(errors.fullName)} helperText={errors.fullName?.message} />
                            <TextField label="Email" type="email" autoComplete="email" {...register("email")} error={Boolean(errors.email)} helperText={errors.email?.message} />
                            <TextField label="Password" type="password" autoComplete="new-password" {...register("password")} error={Boolean(errors.password)} helperText={errors.password?.message} />
                            <TextField label="Confirm password" type="password" autoComplete="new-password" {...register("confirmPassword")} error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword?.message} />
                            {tab === "teacher" ? (
                                <>
                                    <TextField label={t("teacherRequest.motivation")} {...register("motivation")} multiline minRows={3} />
                                    <TextField label={t("teacherRequest.experience")} {...register("experience")} multiline minRows={3} />
                                    <TextField label={t("teacherRequest.portfolioUrl")} {...register("portfolioUrl")} />
                                    <TextField label={t("teacherRequest.preferredTopics")} {...register("preferredTopics")} />
                                </>
                            ) : null}
                            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                                {tab === "teacher" ? "Create account and request teacher access" : "Create account"}
                            </Button>
                            <Typography variant="body2">
                                Already registered? <Button component={RouterLink} to="/login" sx={{ p: 0, minWidth: 0 }}>Login</Button>
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

import { Alert, Box, Button, Card, CardActionArea, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../auth/useAuth";
import type { UserRole } from "../../api/bffContracts";
import { useI18n } from "../../i18n/useI18n";

const registerSchema = z.object({
    fullName: z.string().min(2, "Full name is required").max(80, "Too long"),
    email: z.string().min(1, "Email is required").refine((value) => z.email().safeParse(value).success, { message: "Invalid email" }),
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password"),
}).refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;
type RegistrationRole = Exclude<UserRole, "ADMIN">;

const roleCards: Array<{ role: RegistrationRole; title: string; description: string; icon: "student" | "teacher" }> = [
    { role: "STUDENT", title: "Student", description: "Learn from courses, solve tasks, track progress.", icon: "student" },
    { role: "TEACHER", title: "Teacher", description: "Create courses immediately. Public publication requires admin moderation.", icon: "teacher" },
];

export default function RegisterPage() {
    const auth = useAuth();
    const { locale } = useI18n();
    const navigate = useNavigate();
    const [role, setRole] = useState<RegistrationRole>("STUDENT");
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
    });

    const onSubmit: SubmitHandler<RegisterForm> = async (values) => {
        setServerError(null);
        try {
            await auth.register({ fullName: values.fullName, email: values.email, password: values.password, role, preferredLocale: locale });
            navigate(role === "TEACHER" ? "/teacher" : "/my-learning", { replace: true });
        } catch (error) {
            setServerError(error instanceof Error ? error.message : "Registration failed");
        }
    };

    return (
        <Box sx={{ minHeight: "100svh", display: "flex", alignItems: "center", pt: 10, pb: 6 }}>
            <Container maxWidth="md">
                <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography variant="h4">Register</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>Create a StudyBytes account and choose how you want to use the platform.</Typography>
                        </Box>

                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                            {roleCards.map((item) => (
                                <Card key={item.role} variant={role === item.role ? undefined : "outlined"} sx={{ borderRadius: 3, border: "1px solid", borderColor: role === item.role ? "primary.main" : "divider", boxShadow: role === item.role ? 6 : 0 }}>
                                    <CardActionArea onClick={() => setRole(item.role)} sx={{ p: 2.5, height: "100%" }}>
                                        <Stack spacing={1.2}>
                                            {item.icon === "student" ? <SchoolRoundedIcon color="primary" /> : <AutoStoriesRoundedIcon color="primary" />}
                                            <Typography variant="h6">{item.title}</Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>{item.description}</Typography>
                                        </Stack>
                                    </CardActionArea>
                                </Card>
                            ))}
                        </Box>

                        <Alert severity="info">
                            Admin accounts cannot be self-registered. Teachers can create courses immediately, but publication for all users requires admin moderation.
                        </Alert>
                        {serverError ? <Alert severity="error">{serverError}</Alert> : null}
                        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
                            <TextField label="Full name" autoComplete="name" {...register("fullName")} error={Boolean(errors.fullName)} helperText={errors.fullName?.message} />
                            <TextField label="Email" type="email" autoComplete="email" {...register("email")} error={Boolean(errors.email)} helperText={errors.email?.message} />
                            <TextField label="Password" type="password" autoComplete="new-password" {...register("password")} error={Boolean(errors.password)} helperText={errors.password?.message} />
                            <TextField label="Confirm password" type="password" autoComplete="new-password" {...register("confirmPassword")} error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword?.message} />
                            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                                {role === "TEACHER" ? "Create teacher account" : "Create student account"}
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

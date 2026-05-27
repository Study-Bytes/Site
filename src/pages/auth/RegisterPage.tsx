import { Alert, Box, Button, Card, CardActionArea, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import type { UserRole } from "../../api/bffContracts";
import { useI18n } from "../../i18n/useI18n";

const createRegisterSchema = (isRu: boolean) => z.object({
    fullName: z.string().min(1, isRu ? "Укажите имя" : "Full name is required").min(2, isRu ? "Имя должно содержать минимум 2 символа" : "Full name must contain at least 2 characters").max(80, isRu ? "Слишком длинное имя" : "Too long"),
    email: z.string().min(1, isRu ? "Укажите email" : "Email is required").refine((value) => z.email().safeParse(value).success, { message: isRu ? "Некорректный email" : "Invalid email" }),
    password: z.string().min(1, isRu ? "Укажите пароль" : "Password is required").min(8, isRu ? "Пароль должен содержать минимум 8 символов" : "Password must contain at least 8 characters"),
    confirmPassword: z.string().min(1, isRu ? "Повторите пароль" : "Confirm password is required").min(8, isRu ? "Пароль должен содержать минимум 8 символов" : "Password must contain at least 8 characters"),
}).refine((value) => value.password === value.confirmPassword, {
    message: isRu ? "Пароли не совпадают" : "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<ReturnType<typeof createRegisterSchema>>;
type RegistrationRole = Exclude<UserRole, "ADMIN">;

export default function RegisterPage() {
    const auth = useAuth();
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const navigate = useNavigate();
    const [role, setRole] = useState<RegistrationRole>("STUDENT");
    const [serverError, setServerError] = useState<string | null>(null);
    const registerSchema = useMemo(() => createRegisterSchema(isRu), [isRu]);
    const roleCards = useMemo<Array<{ role: RegistrationRole; title: string; description: string; icon: "student" | "teacher" }>>(() => [
        {
            role: "STUDENT",
            title: isRu ? "Студент" : "Student",
            description: isRu ? "Проходи курсы, решай задания и отслеживай прогресс." : "Learn from courses, solve tasks and track progress.",
            icon: "student",
        },
        {
            role: "TEACHER",
            title: isRu ? "Преподаватель" : "Teacher",
            description: isRu ? "Создавай курсы сразу. Публикация для всех проходит модерацию." : "Create courses immediately. Public publication requires admin moderation.",
            icon: "teacher",
        },
    ], [isRu]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isSubmitted },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
        mode: "onTouched",
        reValidateMode: "onChange",
    });
    const hasValidationErrors = Object.keys(errors).length > 0;

    const onSubmit: SubmitHandler<RegisterForm> = async (values) => {
        setServerError(null);
        try {
            await auth.register({ fullName: values.fullName, email: values.email, password: values.password, role, preferredLocale: locale });
            navigate(role === "TEACHER" ? "/teacher" : "/my-learning", { replace: true });
        } catch (error) {
            setServerError(error instanceof Error ? error.message : isRu ? "Не удалось зарегистрироваться" : "Registration failed");
        }
    };

    return (
        <Box sx={{ minHeight: "100svh", display: "flex", alignItems: "center", pt: 10, pb: 6 }}>
            <Container maxWidth="md">
                <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography variant="h4">{isRu ? "Регистрация" : "Register"}</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                                {isRu ? "Создай аккаунт StudyBytes и выбери, как будешь пользоваться платформой." : "Create a StudyBytes account and choose how you want to use the platform."}
                            </Typography>
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
                            {isRu
                                ? "Аккаунт администратора нельзя создать самостоятельно. Преподаватели могут сразу создавать курсы, но публикация для всех пользователей проходит модерацию."
                                : "Admin accounts cannot be self-registered. Teachers can create courses immediately, but publication for all users requires admin moderation."}
                        </Alert>
                        {serverError ? <Alert severity="error">{serverError}</Alert> : null}
                        {isSubmitted && hasValidationErrors ? <Alert severity="warning">{isRu ? "Заполните обязательные поля и исправьте ошибки." : "Fill in the required fields and fix validation errors."}</Alert> : null}
                        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)} noValidate>
                            <TextField label={isRu ? "Имя" : "Full name"} autoComplete="name" required {...register("fullName")} error={Boolean(errors.fullName)} helperText={errors.fullName?.message} />
                            <TextField label="Email" type="email" autoComplete="email" required {...register("email")} error={Boolean(errors.email)} helperText={errors.email?.message} />
                            <TextField label={isRu ? "Пароль" : "Password"} type="password" autoComplete="new-password" required {...register("password")} error={Boolean(errors.password)} helperText={errors.password?.message} />
                            <TextField label={isRu ? "Повторите пароль" : "Confirm password"} type="password" autoComplete="new-password" required {...register("confirmPassword")} error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword?.message} />
                            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                                {role === "TEACHER"
                                    ? isRu ? "Создать аккаунт преподавателя" : "Create teacher account"
                                    : isRu ? "Создать аккаунт студента" : "Create student account"}
                            </Button>
                            <Typography variant="body2">
                                {isRu ? "Уже есть аккаунт?" : "Already registered?"}{" "}
                                <Button component={RouterLink} to="/login" sx={{ p: 0, minWidth: 0 }}>
                                    {isRu ? "Войти" : "Login"}
                                </Button>
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

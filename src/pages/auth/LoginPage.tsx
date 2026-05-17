import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { useI18n } from "../../i18n/useI18n";

const createLoginSchema = (isRu: boolean) => z.object({
    email: z.string().min(1, isRu ? "Укажите email" : "Email is required").refine((value) => z.email().safeParse(value).success, { message: isRu ? "Некорректный email" : "Invalid email" }),
    password: z.string().min(1, isRu ? "Укажите пароль" : "Password is required"),
});

type LoginForm = z.infer<ReturnType<typeof createLoginSchema>>;

type LocationState = {
    from?: string;
};

export default function LoginPage() {
    const auth = useAuth();
    const { locale } = useI18n();
    const isRu = locale === "ru";
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState | null;
    const [serverError, setServerError] = useState<string | null>(null);
    const loginSchema = useMemo(() => createLoginSchema(isRu), [isRu]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

    const onSubmit: SubmitHandler<LoginForm> = async (values) => {
        setServerError(null);
        try {
            await auth.login(values);
            navigate(state?.from ?? "/profile", { replace: true });
        } catch (error) {
            setServerError(error instanceof Error ? error.message : isRu ? "Не удалось войти" : "Login failed");
        }
    };

    return (
        <Box sx={{ minHeight: "100svh", display: "flex", alignItems: "center", pt: 10, pb: 6 }}>
            <Container maxWidth="sm">
                <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography variant="h4">{isRu ? "Вход" : "Login"}</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                                {isRu ? "Войди в аккаунт StudyBytes." : "Use your StudyBytes account."}
                            </Typography>
                        </Box>
                        {serverError ? <Alert severity="error">{serverError}</Alert> : null}
                        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
                            <TextField label="Email" type="email" autoComplete="email" {...register("email")} error={Boolean(errors.email)} helperText={errors.email?.message} />
                            <TextField label={isRu ? "Пароль" : "Password"} type="password" autoComplete="current-password" {...register("password")} error={Boolean(errors.password)} helperText={errors.password?.message} />
                            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                                {isRu ? "Войти" : "Login"}
                            </Button>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                {isRu ? "Восстановление пароля появится позже." : "Forgot password is coming soon."}
                            </Typography>
                            <Typography variant="body2">
                                {isRu ? "Нет аккаунта?" : "No account?"}{" "}
                                <Button component={RouterLink} to="/register" sx={{ p: 0, minWidth: 0 }}>
                                    {isRu ? "Зарегистрироваться" : "Register"}
                                </Button>
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useState } from "react";

const emailField = z
    .string()
    .min(1, "Укажи почту")
    // Zod v4: .email() у string считается legacy, используем z.email() внутри refine
    .refine((v) => z.email().safeParse(v).success, { message: "Неверный формат почты" });

const loginSchema = z.object({
    email: emailField,
    password: z.string().min(1, "Введи пароль"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const auth = useAuth();
    const nav = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
        mode: "onSubmit",
    });

    const onSubmit: SubmitHandler<LoginForm> = async (values) => {
        setServerError(null);
        try {
            await auth.login(values);
            nav("/profile");
        } catch (e) {
            setServerError(e instanceof Error ? e.message : "Ошибка входа");
        }
    };

    return (
        <Box
            sx={{
                minHeight: { xs: "100svh", md: "100vh" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pt: { xs: 10, md: 12 }, // отступ под fixed Navbar
                pb: { xs: 6, md: 8 },
            }}
        >
            <Container maxWidth="sm">
                <Paper sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3 }}>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900 }}>
                                Вход
                            </Typography>
                            <Typography sx={{ color: "text.secondary" }}>
                                Добро пожаловать обратно
                            </Typography>
                        </Box>

                        {serverError && <Alert severity="error">{serverError}</Alert>}

                        <Stack spacing={1.6} component="form" onSubmit={handleSubmit(onSubmit)}>
                            <TextField
                                label="Почта"
                                type="email"
                                autoComplete="email"
                                {...register("email")}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                fullWidth
                            />

                            <TextField
                                label="Пароль"
                                type="password"
                                autoComplete="current-password"
                                {...register("password")}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                fullWidth
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={isSubmitting}
                                sx={{ borderRadius: 999, py: 1.2, fontWeight: 900 }}
                            >
                                Войти
                            </Button>

                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Нет аккаунта?{" "}
                                <Button
                                    component={RouterLink}
                                    to="/register"
                                    variant="text"
                                    sx={{ p: 0, minWidth: "auto" }}
                                >
                                    Регистрация
                                </Button>
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

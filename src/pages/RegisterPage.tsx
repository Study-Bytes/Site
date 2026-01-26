import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useState } from "react";

const currentYear = new Date().getFullYear();

const emailField = z
    .string()
    .min(1, "Укажи почту")
    // Zod v4: .email() у string считается legacy, используем z.email() внутри refine
    .refine((v) => z.email().safeParse(v).success, { message: "Неверный формат почты" });

const registerSchema = z.object({
    email: emailField,
    username: z.string().min(3, "Минимум 3 символа").max(24, "Максимум 24 символа"),
    birthYear: z
        // Zod v4: invalid_type_error удалён, используем error/message
        .number({ message: "Укажи год рождения" })
        .int("Год должен быть целым")
        .min(1900, "Слишком старый год")
        .max(currentYear - 6, "Слишком рано для регистрации"),
    password: z.string().min(8, "Пароль минимум 8 символов"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const auth = useAuth();
    const nav = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
        },
        mode: "onSubmit",
    });

    const onSubmit: SubmitHandler<RegisterForm> = async (values) => {
        setServerError(null);
        try {
            await auth.register(values);
            nav("/profile");
        } catch (e) {
            setServerError(e instanceof Error ? e.message : "Ошибка регистрации");
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
                                Регистрация
                            </Typography>
                            <Typography sx={{ color: "text.secondary" }}>
                                Создай аккаунт за минуту
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
                                label="Никнейм"
                                autoComplete="username"
                                {...register("username")}
                                error={!!errors.username}
                                helperText={errors.username?.message}
                                fullWidth
                            />

                            <TextField
                                label="Год рождения"
                                type="number"
                                // MUI v6+: inputProps deprecated → slotProps.htmlInput
                                slotProps={{
                                    htmlInput: {
                                        inputMode: "numeric",
                                        min: 1900,
                                        max: currentYear - 6,
                                    },
                                }}
                                {...register("birthYear", { valueAsNumber: true })}
                                error={!!errors.birthYear}
                                helperText={errors.birthYear?.message}
                                fullWidth
                            />

                            <TextField
                                label="Пароль"
                                type="password"
                                autoComplete="new-password"
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
                                Создать аккаунт
                            </Button>

                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Уже есть аккаунт?{" "}
                                <Button
                                    component={RouterLink}
                                    to="/login"
                                    variant="text"
                                    sx={{ p: 0, minWidth: "auto" }}
                                >
                                    Войти
                                </Button>
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../auth/useAuth";

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").refine((value) => z.email().safeParse(value).success, { message: "Invalid email" }),
    password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

type LocationState = {
    from?: string;
};

export default function LoginPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState | null;
    const [serverError, setServerError] = useState<string | null>(null);

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
            setServerError(error instanceof Error ? error.message : "Login failed");
        }
    };

    return (
        <Box sx={{ minHeight: "100svh", display: "flex", alignItems: "center", pt: 10, pb: 6 }}>
            <Container maxWidth="sm">
                <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 5 }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography variant="h4">Login</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>Use your StudyBytes account.</Typography>
                        </Box>
                        {serverError ? <Alert severity="error">{serverError}</Alert> : null}
                        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
                            <TextField label="Email" type="email" autoComplete="email" {...register("email")} error={Boolean(errors.email)} helperText={errors.email?.message} />
                            <TextField label="Password" type="password" autoComplete="current-password" {...register("password")} error={Boolean(errors.password)} helperText={errors.password?.message} />
                            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                                Login
                            </Button>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Forgot password is coming soon. No email service is connected yet.
                            </Typography>
                            <Typography variant="body2">
                                No account? <Button component={RouterLink} to="/register" sx={{ p: 0, minWidth: 0 }}>Register</Button>
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

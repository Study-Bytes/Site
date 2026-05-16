import { Alert, Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../auth/useAuth";

const registerSchema = z.object({
    fullName: z.string().min(2, "Full name is required").max(80, "Too long"),
    email: z.string().min(1, "Email is required").refine((value) => z.email().safeParse(value).success, { message: "Invalid email" }),
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password"),
    role: z.union([z.literal("STUDENT"), z.literal("TEACHER")]),
}).refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", role: "STUDENT" },
    });

    const onSubmit: SubmitHandler<RegisterForm> = async (values) => {
        setServerError(null);
        try {
            await auth.register({ fullName: values.fullName, email: values.email, password: values.password, role: values.role });
            navigate("/profile", { replace: true });
        } catch (error) {
            setServerError(error instanceof Error ? error.message : "Registration failed");
        }
    };

    return (
        <Box sx={{ minHeight: "100svh", display: "flex", alignItems: "center", pt: 10, pb: 6 }}>
            <Container maxWidth="sm">
                <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 5 }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography variant="h4">Register</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>Create a StudyBytes account.</Typography>
                        </Box>
                        {serverError ? <Alert severity="error">{serverError}</Alert> : null}
                        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
                            <TextField label="Full name" autoComplete="name" {...register("fullName")} error={Boolean(errors.fullName)} helperText={errors.fullName?.message} />
                            <TextField label="Email" type="email" autoComplete="email" {...register("email")} error={Boolean(errors.email)} helperText={errors.email?.message} />
                            <TextField label="Password" type="password" autoComplete="new-password" {...register("password")} error={Boolean(errors.password)} helperText={errors.password?.message} />
                            <TextField label="Confirm password" type="password" autoComplete="new-password" {...register("confirmPassword")} error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword?.message} />
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <InputLabel id="role-label">Role</InputLabel>
                                        <Select labelId="role-label" label="Role" {...field}>
                                            <MenuItem value="STUDENT">Student</MenuItem>
                                            <MenuItem value="TEACHER">Teacher</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                                Create account
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

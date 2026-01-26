import { Paper, Typography } from "@mui/material";

export default function Login() {
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                Вход
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>
                Тут будет форма логина (email + пароль).
            </Typography>
        </Paper>
    );
}

import { Paper, Typography } from "@mui/material";

export default function Signup() {
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                Регистрация
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>
                Тут будет регистрация (имя + email + пароль).
            </Typography>
        </Paper>
    );
}

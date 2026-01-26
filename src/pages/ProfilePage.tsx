import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthContext";

export default function ProfilePage() {
    const auth = useAuth();

    if (!auth.user) return null; // защищено роутом, сюда не попадём без user

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3 }}>
                <Stack spacing={1.2}>
                    <Typography variant="h5" sx={{ fontWeight: 950 }}>
                        Профиль
                    </Typography>

                    <Typography sx={{ color: "text.secondary" }}>
                        Ты вошёл как <b>{auth.user.username}</b>
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                        <Typography>Email: {auth.user.email}</Typography>
                        <Typography>Год рождения: {auth.user.birthYear}</Typography>
                    </Box>

                    <Box sx={{ pt: 2 }}>
                        <Button variant="outlined" onClick={auth.logout}>
                            Выйти
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
}

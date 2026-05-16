import { Avatar, Box, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { FormSectionCard } from "../components/ui/FormSectionCard";
import { PageContainer } from "../layouts/PageContainer";

export default function ProfilePage() {
    const auth = useAuth();
    const navigate = useNavigate();

    if (!auth.user) return null;

    const handleLogout = async () => {
        await auth.logout();
        navigate("/");
    };

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h2">Profile</Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1 }}>Current user model is received through BFF `/api/me`.</Typography>
                </Box>

                <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 5 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "flex-start", sm: "center" }}>
                        <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main", fontSize: 28, fontWeight: 950 }}>
                            {(auth.user.fullName ?? auth.user.email).charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h4">{auth.user.fullName ?? "Unnamed user"}</Typography>
                            <Typography sx={{ color: "text.secondary" }}>{auth.user.email}</Typography>
                        </Box>
                        <Chip label={auth.user.role} color="primary" sx={{ fontWeight: 900 }} />
                    </Stack>
                </Paper>

                <FormSectionCard title="Account details" description="Profile editing is prepared in UI; BFF endpoint can be connected later.">
                    <Stack spacing={2}>
                        <TextField label="Full name" defaultValue={auth.user.fullName ?? ""} />
                        <TextField label="Email" defaultValue={auth.user.email} disabled />
                        <Button variant="outlined" sx={{ alignSelf: "flex-start" }} disabled>
                            Save changes — coming soon
                        </Button>
                    </Stack>
                </FormSectionCard>

                <Button variant="contained" color="error" onClick={handleLogout} sx={{ alignSelf: "flex-start" }}>
                    Logout
                </Button>
            </Stack>
        </PageContainer>
    );
}

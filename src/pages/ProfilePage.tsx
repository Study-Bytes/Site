import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiError, getErrorMessage } from "../api/apiError";
import type { ApiValidationError, Locale } from "../api/bffContracts";
import { profileApi } from "../api/services";
import { useAuth } from "../auth/useAuth";
import { useI18n } from "../i18n/useI18n";
import { FormSectionCard } from "../components/ui/FormSectionCard";
import { ValidationErrorPanel } from "../components/ui/ValidationErrorPanel";
import { PageContainer } from "../layouts/PageContainer";

function extractValidationErrors(error: unknown): ApiValidationError[] {
    return error instanceof ApiError ? error.validationErrors : [];
}

export default function ProfilePage() {
    const auth = useAuth();
    const { locale, setLocale, t } = useI18n();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [bio, setBio] = useState("");
    const [preferredLocale, setPreferredLocale] = useState<Locale>(locale);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileValidationErrors, setProfileValidationErrors] = useState<ApiValidationError[]>([]);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!auth.user) return;
        setFullName(auth.user.fullName ?? "");
        setAvatarUrl(auth.user.avatarUrl ?? "");
        setBio(auth.user.bio ?? "");
        setPreferredLocale(auth.user.preferredLocale ?? locale);
    }, [auth.user, locale]);

    if (!auth.user) return null;

    const handleLogout = async () => {
        await auth.logout();
        navigate("/");
    };

    const handleProfileSave = async () => {
        setProfileError(null);
        setProfileSuccess(null);
        setProfileValidationErrors([]);

        if (!fullName.trim()) {
            setProfileValidationErrors([{ field: "fullName", message: "Full name is required" }]);
            return;
        }

        setIsSavingProfile(true);
        try {
            const updatedUser = await profileApi.updateProfile({
                fullName: fullName.trim(),
                avatarUrl: avatarUrl.trim() || null,
                bio: bio.trim() || null,
                preferredLocale,
            });
            auth.setCurrentUser(updatedUser);
            await setLocale(preferredLocale, false);
            setProfileSuccess(t("profile.updated"));
        } catch (error) {
            setProfileValidationErrors(extractValidationErrors(error));
            setProfileError(getErrorMessage(error, "Failed to update profile"));
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handlePasswordChange = async () => {
        setPasswordError(null);
        setPasswordSuccess(null);

        if (!currentPassword || newPassword.length < 8) {
            setPasswordError("Current password is required and new password must contain at least 8 characters.");
            return;
        }

        setIsChangingPassword(true);
        try {
            await profileApi.changePassword({ currentPassword, newPassword });
            setCurrentPassword("");
            setNewPassword("");
            setPasswordSuccess("Password was changed successfully.");
        } catch (error) {
            setPasswordError(getErrorMessage(error, "Failed to change password"));
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h2">{t("profile.title")}</Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1 }}>{t("profile.subtitle")}</Typography>
                </Box>

                <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
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

                <FormSectionCard title={t("profile.accountDetails")} description={t("profile.accountDescription")}>
                    <Stack spacing={2}>
                        {profileError ? <Alert severity="error">{profileError}</Alert> : null}
                        {profileSuccess ? <Alert severity="success">{profileSuccess}</Alert> : null}
                        <ValidationErrorPanel errors={profileValidationErrors} />
                        <TextField label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
                        <TextField label="Email" value={auth.user.email} disabled />
                        <TextField label="Avatar URL" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
                        <TextField label="Bio" value={bio} onChange={(event) => setBio(event.target.value)} multiline minRows={3} />
                        <TextField select label={t("profile.language")} value={preferredLocale} onChange={(event) => setPreferredLocale(event.target.value as Locale)} helperText={t("profile.languageDescription")}>
                            <MenuItem value="ru">{t("language.ru")}</MenuItem>
                            <MenuItem value="en">{t("language.en")}</MenuItem>
                        </TextField>
                        <Button variant="outlined" sx={{ alignSelf: "flex-start" }} onClick={handleProfileSave} disabled={isSavingProfile}>
                            {isSavingProfile ? "Saving..." : "Save changes"}
                        </Button>
                    </Stack>
                </FormSectionCard>

                <FormSectionCard title={t("profile.security")} description="Password changes use the BFF profile contract when the endpoint is enabled.">
                    <Stack spacing={2}>
                        {passwordError ? <Alert severity="error">{passwordError}</Alert> : null}
                        {passwordSuccess ? <Alert severity="success">{passwordSuccess}</Alert> : null}
                        <TextField label="Current password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
                        <TextField label="New password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" />
                        <Button variant="outlined" sx={{ alignSelf: "flex-start" }} onClick={handlePasswordChange} disabled={isChangingPassword}>
                            {isChangingPassword ? "Changing..." : "Change password"}
                        </Button>
                    </Stack>
                </FormSectionCard>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    {auth.user.role === "STUDENT" ? <Button variant="outlined" onClick={() => navigate("/teacher-request")}>{t("nav.teacherRequest")}</Button> : null}
                    <Button variant="contained" color="error" onClick={handleLogout} sx={{ alignSelf: "flex-start" }}>
                        {t("nav.logout")}
                    </Button>
                </Stack>
            </Stack>
        </PageContainer>
    );
}

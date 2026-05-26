import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Alert, Avatar, Box, Button, Chip, InputAdornment, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, getErrorMessage } from "../api/apiError";
import type { ApiValidationError, Locale, UserRole } from "../api/bffContracts";
import { profileApi } from "../api/services";
import { useAuth } from "../auth/useAuth";
import { useI18n } from "../i18n/useI18n";
import { FormSectionCard } from "../components/ui/FormSectionCard";
import { ValidationErrorPanel } from "../components/ui/ValidationErrorPanel";
import { PageContainer } from "../layouts/PageContainer";

function extractValidationErrors(error: unknown): ApiValidationError[] {
    return error instanceof ApiError ? error.validationErrors : [];
}

type ProfileTab = "details" | "icon" | "security";
type AvatarInputMode = "file" | "url";
const avatarFileAccept = "image/png,image/jpeg,image/webp,image/gif";

function isProfileTab(value: string | null): value is ProfileTab {
    return value === "details" || value === "icon" || value === "security";
}

function userInitial(fullName: string | null | undefined, email: string) {
    return (fullName?.trim() || email).charAt(0).toUpperCase();
}

function roleLabel(role: UserRole, isRu: boolean) {
    const labels: Record<UserRole, { ru: string; en: string }> = {
        STUDENT: { ru: "Студент", en: "Student" },
        TEACHER: { ru: "Преподаватель", en: "Teacher" },
        ADMIN: { ru: "Администратор", en: "Admin" },
    };
    return isRu ? labels[role].ru : labels[role].en;
}

function ProfileTabsNav(props: { activeTab: ProfileTab; onChange: (tab: ProfileTab) => void; isRu: boolean; securityLabel: string }) {
    const tabs = [
        { value: "details" as const, icon: <PersonOutlineRoundedIcon fontSize="small" />, label: props.isRu ? "Данные" : "Details" },
        { value: "icon" as const, icon: <CameraAltRoundedIcon fontSize="small" />, label: props.isRu ? "Иконка" : "Icon" },
        { value: "security" as const, icon: <SecurityRoundedIcon fontSize="small" />, label: props.securityLabel },
    ];

    const renderTabs = (orientation: "horizontal" | "vertical") => (
        <Tabs
            value={props.activeTab}
            onChange={(_, value: ProfileTab) => props.onChange(value)}
            orientation={orientation}
            variant={orientation === "horizontal" ? "scrollable" : "standard"}
            scrollButtons={orientation === "horizontal" ? "auto" : false}
            allowScrollButtonsMobile
            TabIndicatorProps={{ sx: { display: "none" } }}
            sx={{
                p: 1,
                minHeight: 0,
                "& .MuiTabs-flexContainer": {
                    gap: 1,
                    alignItems: "stretch",
                },
                "& .MuiTab-root": {
                    justifyContent: "flex-start",
                    minHeight: 44,
                    borderRadius: 1,
                    px: 2,
                    color: "text.secondary",
                    fontWeight: 900,
                },
                "& .Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                },
            }}
        >
            {tabs.map((tab) => (
                <Tab key={tab.value} value={tab.value} icon={tab.icon} iconPosition="start" label={tab.label} />
            ))}
        </Tabs>
    );

    return (
        <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: "hidden", alignSelf: "start" }}>
            <Box sx={{ display: { xs: "block", md: "none" } }}>{renderTabs("horizontal")}</Box>
            <Box sx={{ display: { xs: "none", md: "block" } }}>{renderTabs("vertical")}</Box>
        </Paper>
    );
}

export default function ProfilePage() {
    const auth = useAuth();
    const { locale, setLocale, t } = useI18n();
    const isRu = locale === "ru";
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
        const tab = searchParams.get("tab");
        return isProfileTab(tab) ? tab : "details";
    });
    const [avatarInputMode, setAvatarInputMode] = useState<AvatarInputMode>("file");
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarFilePreview, setAvatarFilePreview] = useState<string | null>(null);
    const [bio, setBio] = useState("");
    const [preferredLocale, setPreferredLocale] = useState<Locale>(locale);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (isProfileTab(tab) && tab !== activeTab) setActiveTab(tab);
    }, [activeTab, searchParams]);

    useEffect(() => {
        if (!avatarFile) {
            setAvatarFilePreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(avatarFile);
        setAvatarFilePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [avatarFile]);

    if (!auth.user) return null;

    const handleTabChange = (tab: ProfileTab) => {
        setActiveTab(tab);
        setSearchParams({ tab }, { replace: true });
    };

    const handleLogout = async () => {
        await auth.logout();
        navigate("/");
    };

    const handleProfileSave = async () => {
        setProfileError(null);
        setProfileSuccess(null);
        setProfileValidationErrors([]);

        if (!fullName.trim()) {
            setProfileValidationErrors([{ field: "fullName", message: t("profile.fullNameRequired") }]);
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
            setProfileError(getErrorMessage(error, isRu ? "Не удалось обновить профиль" : "Failed to update profile"));
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAvatarFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        setAvatarFile(event.target.files?.[0] ?? null);
        setProfileError(null);
        setProfileSuccess(null);
        setProfileValidationErrors([]);
        event.target.value = "";
    };

    const handleAvatarUpload = async () => {
        setProfileError(null);
        setProfileSuccess(null);
        setProfileValidationErrors([]);

        if (!avatarFile) {
            setProfileError(isRu ? "Выбери файл изображения." : "Choose an image file.");
            return;
        }

        setIsUploadingAvatar(true);
        try {
            const updatedUser = await profileApi.uploadAvatar(avatarFile);
            auth.setCurrentUser(updatedUser);
            setAvatarFile(null);
            setProfileSuccess(isRu ? "Иконка профиля загружена." : "Profile icon uploaded.");
        } catch (error) {
            setProfileValidationErrors(extractValidationErrors(error));
            setProfileError(getErrorMessage(error, isRu ? "Не удалось загрузить иконку" : "Failed to upload profile icon"));
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handlePasswordChange = async () => {
        setPasswordError(null);
        setPasswordSuccess(null);

        if (!currentPassword || newPassword.length < 8) {
            setPasswordError(t("profile.passwordValidation"));
            return;
        }

        setIsChangingPassword(true);
        try {
            await profileApi.changePassword({ currentPassword, newPassword });
            setCurrentPassword("");
            setNewPassword("");
            setPasswordSuccess(t("profile.passwordChanged"));
        } catch (error) {
            setPasswordError(getErrorMessage(error, isRu ? "Не удалось изменить пароль" : "Failed to change password"));
        } finally {
            setIsChangingPassword(false);
        }
    };

    const displayName = auth.user.fullName?.trim() || auth.user.email;
    const avatarPreview = (avatarInputMode === "file" ? avatarFilePreview ?? avatarUrl.trim() : avatarUrl.trim()) || undefined;

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h2">{t("profile.title")}</Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1 }}>{t("profile.subtitle")}</Typography>
                </Box>

                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 2.5, md: 4 },
                        borderRadius: 2,
                        bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(31,31,40,0.82)" : "rgba(255,255,255,0.82)"),
                    }}
                >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "flex-start", sm: "center" }}>
                        <Box sx={{ position: "relative", flex: "0 0 auto" }}>
                            <Avatar src={avatarPreview} sx={{ width: 88, height: 88, bgcolor: "primary.main", fontSize: 34, fontWeight: 950, border: (theme) => `4px solid ${theme.palette.background.paper}` }}>
                                {userInitial(auth.user.fullName, auth.user.email)}
                            </Avatar>
                            <Box
                                sx={{
                                    position: "absolute",
                                    right: -2,
                                    bottom: -2,
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                    border: (theme) => `2px solid ${theme.palette.background.paper}`,
                                }}
                            >
                                <CameraAltRoundedIcon fontSize="small" />
                            </Box>
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="h4" sx={{ overflowWrap: "anywhere" }}>
                                {displayName}
                            </Typography>
                            <Typography sx={{ color: "text.secondary", overflowWrap: "anywhere" }}>{auth.user.email}</Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1 }}>
                                <Chip label={roleLabel(auth.user.role, isRu)} color="primary" sx={{ fontWeight: 900 }} />
                                <Chip label={preferredLocale === "ru" ? t("language.ru") : t("language.en")} variant="outlined" sx={{ fontWeight: 800 }} />
                            </Stack>
                        </Box>
                        <Button variant="outlined" startIcon={<CameraAltRoundedIcon />} onClick={() => handleTabChange("icon")} sx={{ flex: "0 0 auto" }}>
                            {isRu ? "Задать иконку" : "Set icon"}
                        </Button>
                    </Stack>
                </Paper>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "240px minmax(0, 1fr)" }, gap: 3, alignItems: "start" }}>
                    <ProfileTabsNav activeTab={activeTab} onChange={handleTabChange} isRu={isRu} securityLabel={t("profile.security")} />

                    <Box sx={{ minWidth: 0 }}>
                        {activeTab === "details" ? (
                            <FormSectionCard title={t("profile.accountDetails")} description={t("profile.accountDescription")}>
                                <Stack spacing={2}>
                                    {profileError ? <Alert severity="error">{profileError}</Alert> : null}
                                    {profileSuccess ? <Alert severity="success">{profileSuccess}</Alert> : null}
                                    <ValidationErrorPanel errors={profileValidationErrors} />
                                    <TextField label={t("profile.fullName")} value={fullName} onChange={(event) => setFullName(event.target.value)} />
                                    <TextField label={t("profile.email")} value={auth.user.email} disabled />
                                    <TextField label={t("profile.bio")} value={bio} onChange={(event) => setBio(event.target.value)} multiline minRows={3} />
                                    <TextField select label={t("profile.language")} value={preferredLocale} onChange={(event) => setPreferredLocale(event.target.value as Locale)} helperText={t("profile.languageDescription")}>
                                        <MenuItem value="ru">{t("language.ru")}</MenuItem>
                                        <MenuItem value="en">{t("language.en")}</MenuItem>
                                    </TextField>
                                    <Button variant="contained" sx={{ alignSelf: "flex-start" }} onClick={handleProfileSave} disabled={isSavingProfile} startIcon={<CheckRoundedIcon />}>
                                        {isSavingProfile ? t("common.saving") : t("profile.saveChanges")}
                                    </Button>
                                </Stack>
                            </FormSectionCard>
                        ) : null}

                        {activeTab === "icon" ? (
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "280px 1fr" }, gap: 3 }}>
                                <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 1.5 }}>
                                    <Stack spacing={2} alignItems="center" textAlign="center">
                                        <Avatar src={avatarPreview} sx={{ width: 136, height: 136, bgcolor: "secondary.main", fontSize: 48, fontWeight: 950, border: (theme) => `2px dashed ${theme.palette.divider}` }}>
                                            {userInitial(auth.user.fullName, auth.user.email)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                                {isRu ? "Иконка профиля" : "Profile avatar"}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                {avatarPreview ? (isRu ? "Предпросмотр новой иконки" : "New avatar preview") : isRu ? "Сейчас используется буква имени" : "Initial is used now"}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>

                                <FormSectionCard title={isRu ? "Настройка иконки" : "Icon settings"} description={isRu ? "Загрузи файл или используй прежний способ по ссылке. Файл выбран по умолчанию." : "Upload a file or use the previous URL flow. File upload is selected by default."}>
                                    <Stack spacing={2}>
                                        {profileError ? <Alert severity="error">{profileError}</Alert> : null}
                                        {profileSuccess ? <Alert severity="success">{profileSuccess}</Alert> : null}
                                        <ValidationErrorPanel errors={profileValidationErrors} />
                                        <Tabs
                                            value={avatarInputMode}
                                            onChange={(_, value: AvatarInputMode) => {
                                                setAvatarInputMode(value);
                                                setProfileError(null);
                                                setProfileSuccess(null);
                                                setProfileValidationErrors([]);
                                            }}
                                            variant="fullWidth"
                                            TabIndicatorProps={{ sx: { display: "none" } }}
                                            sx={{
                                                minHeight: 44,
                                                p: 0.5,
                                                borderRadius: 1,
                                                bgcolor: (theme) => theme.palette.action.hover,
                                                "& .MuiTab-root": { minHeight: 38, borderRadius: 0.75, fontWeight: 900 },
                                                "& .Mui-selected": { bgcolor: "background.paper", boxShadow: "0 1px 4px rgba(0,0,0,0.10)" },
                                            }}
                                        >
                                            <Tab value="file" icon={<CloudUploadRoundedIcon fontSize="small" />} iconPosition="start" label={isRu ? "Файл" : "File"} />
                                            <Tab value="url" icon={<LinkRoundedIcon fontSize="small" />} iconPosition="start" label={isRu ? "Ссылка" : "URL"} />
                                        </Tabs>

                                        {avatarInputMode === "file" ? (
                                            <Stack spacing={2}>
                                                <Box
                                                    component="label"
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: 1,
                                                        minHeight: 172,
                                                        p: 3,
                                                        borderRadius: 1.5,
                                                        border: (theme) => `2px dashed ${theme.palette.divider}`,
                                                        bgcolor: (theme) => theme.palette.background.default,
                                                        cursor: "pointer",
                                                        textAlign: "center",
                                                        transition: "border-color 160ms ease, background-color 160ms ease",
                                                        "&:hover": {
                                                            borderColor: "primary.main",
                                                            bgcolor: (theme) => theme.palette.action.hover,
                                                        },
                                                    }}
                                                >
                                                    <CloudUploadRoundedIcon color="primary" sx={{ fontSize: 36 }} />
                                                    <Typography sx={{ fontWeight: 950, overflowWrap: "anywhere" }}>
                                                        {avatarFile?.name ?? (isRu ? "Нажми, чтобы выбрать файл" : "Click to upload a file")}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                        {isRu ? "PNG, JPEG, WebP или GIF до 5 МБ." : "PNG, JPEG, WebP, or GIF up to 5 MB."}
                                                    </Typography>
                                                    <input hidden type="file" accept={avatarFileAccept} onChange={handleAvatarFileSelect} />
                                                </Box>
                                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
                                                    <Button variant="text" onClick={() => setAvatarFile(null)} disabled={!avatarFile}>
                                                        {isRu ? "Сбросить выбор" : "Reset selection"}
                                                    </Button>
                                                    <Button variant="contained" onClick={handleAvatarUpload} disabled={isUploadingAvatar || !avatarFile} startIcon={<CheckRoundedIcon />}>
                                                        {isUploadingAvatar ? t("common.saving") : isRu ? "Загрузить" : "Upload"}
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        ) : null}

                                        {avatarInputMode === "url" ? (
                                            <Stack spacing={2}>
                                                <TextField
                                                    label={t("profile.avatarUrl")}
                                                    value={avatarUrl}
                                                    onChange={(event) => setAvatarUrl(event.target.value)}
                                                    placeholder="https://..."
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LinkRoundedIcon fontSize="small" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
                                                    <Button variant="text" onClick={() => setAvatarUrl("")}>
                                                        {isRu ? "Убрать иконку" : "Remove icon"}
                                                    </Button>
                                                    <Button variant="contained" onClick={handleProfileSave} disabled={isSavingProfile} startIcon={<CheckRoundedIcon />}>
                                                        {isSavingProfile ? t("common.saving") : t("profile.saveChanges")}
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        ) : null}
                                    </Stack>
                                </FormSectionCard>
                            </Box>
                        ) : null}

                        {activeTab === "security" ? (
                            <FormSectionCard title={t("profile.security")} description={t("profile.securityDescription")}>
                                <Stack spacing={2}>
                                    {passwordError ? <Alert severity="error">{passwordError}</Alert> : null}
                                    {passwordSuccess ? <Alert severity="success">{passwordSuccess}</Alert> : null}
                                    <TextField label={t("profile.currentPassword")} type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
                                    <TextField label={t("profile.newPassword")} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" />
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                                        <Button variant="contained" onClick={handlePasswordChange} disabled={isChangingPassword}>
                                            {isChangingPassword ? t("common.saving") : t("profile.changePassword")}
                                        </Button>
                                        <Button variant="outlined" color="error" onClick={handleLogout} startIcon={<LogoutRoundedIcon />}>
                                            {t("nav.logout")}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </FormSectionCard>
                        ) : null}
                    </Box>
                </Box>
            </Stack>
        </PageContainer>
    );
}

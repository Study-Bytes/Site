import {
    Alert,
    AppBar,
    Avatar,
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    InputAdornment,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Popover,
    Stack,
    Tab,
    Tabs,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import type { ChangeEvent, FormEvent, MouseEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/apiError";
import type { UserRole, UserStatus } from "../api/bffContracts";
import { profileApi } from "../api/services";
import { useAuth } from "../auth/useAuth";
import { useI18n } from "../i18n/useI18n";
import { useColorMode } from "../theme/colorModeContext";
import { getStudyBytesColors } from "../theme/theme";
import { LanguageSwitcher } from "./LanguageSwitcher";

type NavVariant = "marketing" | "app";

type NavItem = {
    label: string;
    to: string;
    icon: ReactNode;
    roles?: UserRole[];
    requiresAuth?: boolean;
};

const navItems: NavItem[] = [
    { label: "Dashboard", to: "/", icon: <DashboardOutlinedIcon /> },
    { label: "Courses", to: "/courses", icon: <MenuBookOutlinedIcon /> },
    { label: "My Learning", to: "/my-learning", icon: <SchoolOutlinedIcon />, requiresAuth: true },
    { label: "Profile", to: "/profile", icon: <PersonOutlineRoundedIcon />, requiresAuth: true },
    { label: "Teacher Cabinet", to: "/teacher/courses", icon: <AdminPanelSettingsOutlinedIcon />, roles: ["TEACHER", "ADMIN"] },
    { label: "Admin Panel", to: "/admin", icon: <AdminPanelSettingsOutlinedIcon />, roles: ["ADMIN"] },
    { label: "Course Moderation", to: "/admin/courses/moderation", icon: <AssignmentTurnedInOutlinedIcon />, roles: ["ADMIN"] },
];

function canShow(item: NavItem, role: UserRole | null) {
    if (item.roles) return role ? item.roles.includes(role) : false;
    if (item.requiresAuth) return Boolean(role);
    return true;
}

function isActivePath(pathname: string, item: NavItem) {
    if (item.to === "/") return pathname === "/";
    if (item.to === "/my-learning") return pathname.startsWith("/my-learning") || pathname.startsWith("/learn");
    if (item.to === "/teacher/courses") return pathname.startsWith("/teacher");
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function navLabel(label: string, t: ReturnType<typeof useI18n>["t"]) {
    const map: Record<string, Parameters<typeof t>[0]> = {
        Dashboard: "nav.dashboard",
        Courses: "nav.courses",
        "My Learning": "nav.myLearning",
        Profile: "nav.profile",
        "Teacher Cabinet": "nav.teacherCabinet",
        "Admin Panel": "nav.adminPanel",
        "Course Moderation": "nav.courseModeration",
    };
    return map[label] ? t(map[label]) : label;
}

function Brand({ compact = false }: { compact?: boolean }) {
    const { locale } = useI18n();
    const isRu = locale === "ru";

    return (
        <Stack component={RouterLink} to="/" direction="row" spacing={1.4} alignItems="center" sx={{ textDecoration: "none" }}>
            <Box
                sx={{
                    width: compact ? 28 : 36,
                    height: compact ? 28 : 36,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    boxShadow: "0 6px 14px rgba(53,37,205,0.20)",
                }}
            >
                <TerminalRoundedIcon fontSize={compact ? "small" : "medium"} />
            </Box>
            <Box>
                <Typography sx={{ fontWeight: 950, fontSize: compact ? 18 : 22, color: "primary.main", lineHeight: 1 }}>StudyBytes</Typography>
                {!compact ? (
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 900, letterSpacing: 0.8, textTransform: "uppercase" }}>
                        {isRu ? "Учебная платформа" : "EdTech Platform"}
                    </Typography>
                ) : null}
            </Box>
        </Stack>
    );
}

function SearchBox({ placeholder }: { placeholder?: string }) {
    const { t } = useI18n();
    const navigate = useNavigate();
    const [value, setValue] = useState("");
    const resolvedPlaceholder = placeholder ?? t("nav.searchPlaceholder");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const search = value.trim();
        void navigate(search ? `/courses?search=${encodeURIComponent(search)}` : "/courses");
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <TextField
                size="small"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={resolvedPlaceholder}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchRoundedIcon />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    minWidth: { md: 360 },
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 999,
                        bgcolor: (theme) => getStudyBytesColors(theme.palette.mode).surfaceContainerLow,
                    },
                }}
            />
        </Box>
    );
}

type AccountMenuTab = "overview" | "avatar" | "account";
type AvatarInputMode = "file" | "url";
const avatarFileAccept = "image/png,image/jpeg,image/webp,image/gif";

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

function userStatusLabel(status: UserStatus | undefined, isRu: boolean) {
    const labels: Record<UserStatus, { ru: string; en: string }> = {
        ACTIVE: { ru: "Активен", en: "Active" },
        BLOCKED: { ru: "Заблокирован", en: "Blocked" },
        DELETED: { ru: "Удалён", en: "Deleted" },
    };
    const resolvedStatus = status ?? "ACTIVE";
    return isRu ? labels[resolvedStatus].ru : labels[resolvedStatus].en;
}

function AccountMenu() {
    const { locale, t } = useI18n();
    const isRu = locale === "ru";
    const { user, logout, setCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [activeTab, setActiveTab] = useState<AccountMenuTab>("overview");
    const [avatarInputMode, setAvatarInputMode] = useState<AvatarInputMode>("file");
    const [avatarDraft, setAvatarDraft] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarFilePreview, setAvatarFilePreview] = useState<string | null>(null);
    const [isSavingAvatar, setIsSavingAvatar] = useState(false);
    const [avatarMessage, setAvatarMessage] = useState<{ severity: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        setAvatarDraft(user?.avatarUrl ?? "");
    }, [user?.avatarUrl]);

    useEffect(() => {
        setAvatarInputMode("file");
        setAvatarFile(null);
        setAvatarMessage(null);
    }, [user?.id]);

    useEffect(() => {
        if (!avatarFile) {
            setAvatarFilePreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(avatarFile);
        setAvatarFilePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [avatarFile]);

    const handleMenuOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => {
        setAnchorEl(null);
        setActiveTab("overview");
        setAvatarMessage(null);
    };

    const handleLogout = async () => {
        await logout();
        handleMenuClose();
        navigate("/");
    };

    const handleAvatarFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        setAvatarFile(event.target.files?.[0] ?? null);
        setAvatarMessage(null);
        event.target.value = "";
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) {
            setAvatarMessage({ severity: "error", text: isRu ? "Выбери файл изображения." : "Choose an image file." });
            return;
        }

        setIsSavingAvatar(true);
        setAvatarMessage(null);
        try {
            const updatedUser = await profileApi.uploadAvatar(avatarFile);
            setCurrentUser(updatedUser);
            setAvatarFile(null);
            setAvatarMessage({ severity: "success", text: isRu ? "Иконка профиля загружена." : "Profile icon uploaded." });
        } catch (error) {
            setAvatarMessage({ severity: "error", text: getErrorMessage(error, isRu ? "Не удалось загрузить иконку." : "Failed to upload profile icon.") });
        } finally {
            setIsSavingAvatar(false);
        }
    };

    const handleAvatarUrlSave = async () => {
        if (!user) return;

        setIsSavingAvatar(true);
        setAvatarMessage(null);
        try {
            const updatedUser = await profileApi.updateProfile({
                fullName: user.fullName?.trim() || user.email,
                avatarUrl: avatarDraft.trim() || null,
                bio: user.bio?.trim() || null,
                preferredLocale: user.preferredLocale ?? locale,
            });
            setCurrentUser(updatedUser);
            setAvatarMessage({ severity: "success", text: isRu ? "Иконка профиля обновлена." : "Profile icon updated." });
        } catch (error) {
            setAvatarMessage({ severity: "error", text: getErrorMessage(error, isRu ? "Не удалось обновить иконку." : "Failed to update profile icon.") });
        } finally {
            setIsSavingAvatar(false);
        }
    };

    if (!user) {
        return (
            <Stack direction="row" spacing={1} sx={{ display: { xs: "none", sm: "flex" } }}>
                <Button component={RouterLink} to="/login" variant="text">
                    {t("nav.login")}
                </Button>
                <Button component={RouterLink} to="/register" variant="contained">
                    {t("nav.register")}
                </Button>
            </Stack>
        );
    }

    const displayName = user.fullName?.trim() || user.email;
    const roleText = roleLabel(user.role, isRu);
    const workspaceLink = user.role === "ADMIN" ? "/admin" : user.role === "TEACHER" ? "/teacher/courses" : "/my-learning";
    const workspaceLabel = user.role === "ADMIN" ? t("nav.adminPanel") : user.role === "TEACHER" ? t("nav.teacherCabinet") : t("nav.myLearning");
    const open = Boolean(anchorEl);

    return (
        <>
            <IconButton onClick={handleMenuOpen} aria-label={isRu ? "Открыть меню профиля" : "Open account menu"} aria-haspopup="dialog" aria-expanded={open ? "true" : undefined}>
                <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 34, height: 34, bgcolor: "secondary.main", fontWeight: 950, fontSize: 14 }}>
                    {userInitial(user.fullName, user.email)}
                </Avatar>
            </IconButton>
            <Popover
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                    paper: {
                        sx: {
                            width: { xs: "calc(100vw - 24px)", sm: 420 },
                            maxWidth: "calc(100vw - 24px)",
                            mt: 1,
                            overflow: "hidden",
                            borderRadius: 2,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            boxShadow: (theme) => (theme.palette.mode === "dark" ? "0 24px 70px rgba(0,0,0,0.45)" : "0 24px 70px rgba(39,35,67,0.18)"),
                        },
                    },
                }}
            >
                <Box sx={{ bgcolor: (theme) => getStudyBytesColors(theme.palette.mode).surfaceContainerLow }}>
                    <Stack direction="row" spacing={2} sx={{ p: 2.25, pb: 2 }} alignItems="center">
                        <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 58, height: 58, bgcolor: "secondary.main", fontSize: 22, fontWeight: 950, flex: "0 0 auto" }}>
                            {userInitial(user.fullName, user.email)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography sx={{ fontWeight: 950, lineHeight: 1.2 }} noWrap>
                                {displayName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                                {user.email}
                            </Typography>
                            <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: "wrap", rowGap: 0.75 }}>
                                <Chip size="small" label={roleText} color="primary" sx={{ fontWeight: 900 }} />
                                <Chip size="small" label={userStatusLabel(user.status, isRu)} variant="outlined" sx={{ fontWeight: 800 }} />
                            </Stack>
                        </Box>
                    </Stack>
                </Box>

                <Tabs
                    value={activeTab}
                    onChange={(_, value: AccountMenuTab) => setActiveTab(value)}
                    variant="fullWidth"
                    sx={{
                        minHeight: 44,
                        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        "& .MuiTab-root": { minHeight: 44, px: 1, fontWeight: 900 },
                    }}
                >
                    <Tab value="overview" icon={<AccountCircleRoundedIcon fontSize="small" />} iconPosition="start" label={isRu ? "Обзор" : "Overview"} />
                    <Tab value="avatar" icon={<CameraAltRoundedIcon fontSize="small" />} iconPosition="start" label={isRu ? "Иконка" : "Icon"} />
                    <Tab value="account" icon={<SettingsOutlinedIcon fontSize="small" />} iconPosition="start" label={isRu ? "Аккаунт" : "Account"} />
                </Tabs>

                <Box sx={{ p: 2 }}>
                    {activeTab === "overview" ? (
                        <Stack spacing={1.25}>
                            <Button component={RouterLink} to="/profile" onClick={handleMenuClose} variant="contained" startIcon={<PersonOutlineRoundedIcon />} fullWidth>
                                {t("nav.profile")}
                            </Button>
                            <Button component={RouterLink} to={workspaceLink} onClick={handleMenuClose} variant="outlined" startIcon={user.role === "STUDENT" ? <SchoolOutlinedIcon /> : <AdminPanelSettingsOutlinedIcon />} fullWidth>
                                {workspaceLabel}
                            </Button>
                            <Divider sx={{ my: 0.75 }} />
                            <Button onClick={handleLogout} color="error" startIcon={<LogoutRoundedIcon />} fullWidth>
                                {t("nav.logout")}
                            </Button>
                        </Stack>
                    ) : null}

                    {activeTab === "avatar" ? (
                        <Stack spacing={1.5}>
                            {avatarMessage ? <Alert severity={avatarMessage.severity}>{avatarMessage.text}</Alert> : null}
                            <Tabs
                                value={avatarInputMode}
                                onChange={(_, value: AvatarInputMode) => {
                                    setAvatarInputMode(value);
                                    setAvatarMessage(null);
                                }}
                                variant="fullWidth"
                                sx={{ minHeight: 40, "& .MuiTab-root": { minHeight: 40, fontWeight: 900 } }}
                            >
                                <Tab value="file" icon={<CloudUploadRoundedIcon fontSize="small" />} iconPosition="start" label={isRu ? "Файл" : "File"} />
                                <Tab value="url" icon={<LinkRoundedIcon fontSize="small" />} iconPosition="start" label={isRu ? "Ссылка" : "URL"} />
                            </Tabs>

                            {avatarInputMode === "file" ? (
                                <>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar src={avatarFilePreview ?? user.avatarUrl ?? undefined} sx={{ width: 72, height: 72, bgcolor: "secondary.main", fontSize: 26, fontWeight: 950, flex: "0 0 auto" }}>
                                            {userInitial(user.fullName, user.email)}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 950 }}>{avatarFile?.name ?? (isRu ? "Выбери изображение" : "Choose an image")}</Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                {isRu ? "PNG, JPEG, WebP или GIF до 5 МБ." : "PNG, JPEG, WebP, or GIF up to 5 MB."}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Button component="label" variant="outlined" startIcon={<CloudUploadRoundedIcon />}>
                                            {isRu ? "Выбрать файл" : "Choose file"}
                                            <input hidden type="file" accept={avatarFileAccept} onChange={handleAvatarFileSelect} />
                                        </Button>
                                        <Button variant="contained" onClick={handleAvatarUpload} disabled={isSavingAvatar} startIcon={<CheckRoundedIcon />}>
                                            {isSavingAvatar ? t("common.saving") : t("common.save")}
                                        </Button>
                                    </Stack>
                                </>
                            ) : null}

                            {avatarInputMode === "url" ? (
                                <>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar src={avatarDraft.trim() || undefined} sx={{ width: 72, height: 72, bgcolor: "secondary.main", fontSize: 26, fontWeight: 950, flex: "0 0 auto" }}>
                                            {userInitial(user.fullName, user.email)}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 950 }}>{isRu ? "Ссылка на иконку" : "Icon URL"}</Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                {isRu ? "Вставь прямую ссылку на изображение." : "Paste a direct image URL."}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <TextField
                                        size="small"
                                        label={isRu ? "URL иконки" : "Icon URL"}
                                        value={avatarDraft}
                                        onChange={(event) => setAvatarDraft(event.target.value)}
                                        placeholder="https://..."
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LinkRoundedIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Button onClick={() => setAvatarDraft("")}>{isRu ? "Убрать" : "Remove"}</Button>
                                        <Button variant="contained" onClick={handleAvatarUrlSave} disabled={isSavingAvatar} startIcon={<CheckRoundedIcon />}>
                                            {isSavingAvatar ? t("common.saving") : t("common.save")}
                                        </Button>
                                    </Stack>
                                </>
                            ) : null}
                        </Stack>
                    ) : null}

                    {activeTab === "account" ? (
                        <Stack spacing={1.5}>
                            <Box>
                                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 800 }}>
                                    {isRu ? "Роль" : "Role"}
                                </Typography>
                                <Typography sx={{ fontWeight: 950 }}>{roleText}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 800 }}>
                                    {isRu ? "Язык" : "Language"}
                                </Typography>
                                <Typography sx={{ fontWeight: 950 }}>{locale === "ru" ? t("language.ru") : t("language.en")}</Typography>
                            </Box>
                            <Divider />
                            <Button component={RouterLink} to="/profile" onClick={handleMenuClose} variant="outlined" startIcon={<SettingsOutlinedIcon />} fullWidth>
                                {isRu ? "Открыть настройки" : "Open settings"}
                            </Button>
                            <Button onClick={handleLogout} color="error" startIcon={<LogoutRoundedIcon />} fullWidth>
                                {t("nav.logout")}
                            </Button>
                        </Stack>
                    ) : null}
                </Box>
            </Popover>
        </>
    );
}

function UtilityActions() {
    const { mode, toggleMode } = useColorMode();
    const { user } = useAuth();
    const { locale } = useI18n();
    const isRu = locale === "ru";

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <LanguageSwitcher compact />
            <IconButton onClick={toggleMode} aria-label={mode === "dark" ? (isRu ? "Включить светлую тему" : "Switch to light theme") : (isRu ? "Включить тёмную тему" : "Switch to dark theme")}>
                {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
            <IconButton component={RouterLink} to="/help" aria-label={isRu ? "Помощь" : "Help"} sx={{ display: { xs: "none", sm: "inline-flex" } }}>
                <HelpOutlineRoundedIcon />
            </IconButton>
            {user ? (
                <IconButton component={RouterLink} to="/profile" aria-label={isRu ? "Настройки" : "Settings"} sx={{ display: { xs: "none", sm: "inline-flex" } }}>
                    <SettingsOutlinedIcon />
                </IconButton>
            ) : null}
            <AccountMenu />
        </Stack>
    );
}

function MarketingNavbar() {
    return (
        <AppBar
            position="fixed"
            elevation={0}
            color="transparent"
            sx={{
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(19,18,27,0.88)" : "rgba(240,236,249,0.86)"),
                backdropFilter: "blur(14px)",
            }}
        >
            <Toolbar sx={{ maxWidth: 1280, width: "100%", mx: "auto", minHeight: 64, px: { xs: 2, md: 3 } }}>
                <Stack direction="row" spacing={3} alignItems="center" sx={{ flexGrow: 1 }}>
                    <Brand compact />
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <SearchBox />
                    </Box>
                </Stack>
                <UtilityActions />
            </Toolbar>
        </AppBar>
    );
}

function AppSidebar({ visibleItems, canCreateCourse }: { visibleItems: NavItem[]; canCreateCourse: boolean }) {
    const location = useLocation();
    const { t } = useI18n();

    return (
        <Box
            component="nav"
            sx={{
                display: { xs: "none", md: "flex" },
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                width: 256,
                flexDirection: "column",
                bgcolor: (theme) => getStudyBytesColors(theme.palette.mode).surfaceContainer,
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                zIndex: 1200,
                py: 4,
            }}
        >
            <Box sx={{ px: 3, mb: 6 }}>
                <Brand />
            </Box>
            <Stack spacing={0.5} sx={{ flexGrow: 1, alignItems: "stretch" }}>
                {visibleItems.map((item) => {
                    const active = isActivePath(location.pathname, item);
                    return (
                        <ListItemButton
                            key={item.to}
                            component={RouterLink}
                            to={item.to}
                            selected={active}
                            sx={{
                                mx: 0,
                                px: 3,
                                py: 1.3,
                                flexGrow: 0,
                                minHeight: 52,
                                borderLeft: active ? "4px solid" : "4px solid transparent",
                                borderLeftColor: active ? "primary.main" : "transparent",
                                borderRadius: active ? "0 8px 8px 0" : 0,
                                color: active ? "primary.contrastText" : "text.primary",
                                bgcolor: active ? "secondary.main" : "transparent",
                                "&.Mui-selected": { bgcolor: "secondary.main" },
                                "&.Mui-selected:hover": { bgcolor: "secondary.main" },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 42, color: "inherit" }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={navLabel(item.label, t)} primaryTypographyProps={{ fontWeight: active ? 900 : 500 }} />
                        </ListItemButton>
                    );
                })}
            </Stack>
            {canCreateCourse ? (
                <Box sx={{ px: 3, mt: 3 }}>
                    <Button fullWidth component={RouterLink} to="/teacher/courses/new" variant="contained">
                        {t("nav.createCourse")}
                    </Button>
                </Box>
            ) : null}
        </Box>
    );
}

function AppTopbar() {
    return (
        <AppBar
            position="fixed"
            elevation={0}
            color="transparent"
            sx={{
                display: { xs: "none", md: "block" },
                left: 256,
                width: "calc(100% - 256px)",
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(19,18,27,0.88)" : "rgba(252,248,255,0.86)"),
                backdropFilter: "blur(14px)",
            }}
        >
            <Toolbar sx={{ minHeight: 72, px: 4 }}>
                <SearchBox />
                <Box sx={{ flexGrow: 1 }} />
                <UtilityActions />
            </Toolbar>
        </AppBar>
    );
}

function MobileTopbar() {
    const { mode, toggleMode } = useColorMode();
    const { locale } = useI18n();
    const isRu = locale === "ru";

    return (
        <AppBar
            position="fixed"
            elevation={0}
            color="transparent"
            sx={{
                display: { xs: "block", md: "none" },
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(19,18,27,0.94)" : "rgba(252,248,255,0.92)"),
                backdropFilter: "blur(14px)",
            }}
        >
            <Toolbar sx={{ minHeight: 56, px: 1.5 }}>
                <Brand compact />
                <Box sx={{ flexGrow: 1 }} />
                <IconButton component={RouterLink} to="/courses" aria-label={isRu ? "Искать курсы" : "Search courses"}>
                    <SearchRoundedIcon />
                </IconButton>
                <LanguageSwitcher compact />
                <IconButton onClick={toggleMode} aria-label={mode === "dark" ? (isRu ? "Включить светлую тему" : "Switch to light theme") : (isRu ? "Включить тёмную тему" : "Switch to dark theme")}>
                    {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
                </IconButton>
                <AccountMenu />
            </Toolbar>
        </AppBar>
    );
}

function MobileBottomNav({ visibleItems, role }: { visibleItems: NavItem[]; role: UserRole | null }) {
    const location = useLocation();
    const { t } = useI18n();
    const priority = role === "ADMIN"
        ? ["/courses", "/teacher/courses", "/admin", "/profile"]
        : role === "TEACHER"
          ? ["/courses", "/my-learning", "/teacher/courses", "/profile"]
          : role === "STUDENT"
            ? ["/courses", "/my-learning", "/profile"]
            : ["/courses"];
    const items = priority.map((to) => visibleItems.find((item) => item.to === to)).filter((item): item is NavItem => Boolean(item)).slice(0, 4);
    const activeValue = items.find((item) => isActivePath(location.pathname, item))?.to ?? false;

    return (
        <Paper
            elevation={0}
            sx={{
                display: { xs: "block", md: "none" },
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                zIndex: 1300,
            }}
        >
            <BottomNavigation value={activeValue} showLabels sx={{ bgcolor: "background.paper" }}>
                {items.map((item) => (
                    <BottomNavigationAction key={item.to} component={RouterLink} to={item.to} label={navLabel(item.label, t).replace("My ", "").replace("Моё ", "")} value={item.to} icon={item.icon} />
                ))}
            </BottomNavigation>
        </Paper>
    );
}

export default function Navbar({ variant = "marketing" }: { variant?: NavVariant }) {
    const { user } = useAuth();
    const role = user?.role ?? null;
    const visibleItems = navItems.filter((item) => canShow(item, role));
    const canCreateCourse = role === "TEACHER" || role === "ADMIN";

    if (variant === "marketing") return <MarketingNavbar />;

    return (
        <>
            <AppSidebar visibleItems={visibleItems} canCreateCourse={canCreateCourse} />
            <AppTopbar />
            <MobileTopbar />
            <MobileBottomNav visibleItems={visibleItems} role={role} />
        </>
    );
}

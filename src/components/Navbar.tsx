import {
    AppBar,
    Avatar,
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Popover,
    Stack,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import type { FormEvent, MouseEvent, ReactNode } from "react";
import { useState } from "react";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import type { UserRole } from "../api/bffContracts";
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

function userInitial(fullName: string | null | undefined, email: string) {
    return (fullName?.trim() || email).charAt(0).toUpperCase();
}

function AccountMenu() {
    const { locale, t } = useI18n();
    const isRu = locale === "ru";
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleMenuOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await logout();
        handleMenuClose();
        navigate("/");
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
    const workspaceLink = user.role === "ADMIN" ? "/admin" : user.role === "TEACHER" ? "/teacher/courses" : "/my-learning";
    const workspaceLabel = user.role === "ADMIN" ? t("nav.adminPanel") : user.role === "TEACHER" ? t("nav.teacherCabinet") : t("nav.myLearning");
    const workspaceIcon = user.role === "STUDENT" ? <SchoolOutlinedIcon /> : <AdminPanelSettingsOutlinedIcon />;
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
                            width: { xs: "calc(100vw - 24px)", sm: 340 },
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
                <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                        p: 2,
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(42,41,51,0.78)" : getStudyBytesColors(theme.palette.mode).surfaceContainerLow),
                    }}
                    alignItems="center"
                >
                    <Box sx={{ position: "relative", flex: "0 0 auto" }}>
                        <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 52, height: 52, bgcolor: "secondary.main", fontSize: 20, fontWeight: 950, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                            {userInitial(user.fullName, user.email)}
                        </Avatar>
                        <Box
                            sx={{
                                position: "absolute",
                                right: 1,
                                bottom: 1,
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                bgcolor: "info.main",
                                border: (theme) => `2px solid ${theme.palette.background.paper}`,
                            }}
                        />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 950, lineHeight: 1.2 }} noWrap>
                            {displayName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                            {user.email}
                        </Typography>
                    </Box>
                </Stack>

                <Stack
                    sx={{
                        p: 1,
                        bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(42,50,65,0.88)" : "background.paper"),
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        "& .MuiListItemButton-root": {
                            borderRadius: 1,
                            minHeight: 46,
                            transition: "background-color 160ms ease, color 160ms ease, border-color 160ms ease",
                        },
                        "& .MuiListItemIcon-root": { minWidth: 40, color: "inherit" },
                    }}
                >
                    <ListItemButton component={RouterLink} to="/profile?tab=details" onClick={handleMenuClose}>
                        <ListItemIcon>
                            <PersonOutlineRoundedIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("nav.profile")} primaryTypographyProps={{ fontWeight: 800 }} />
                    </ListItemButton>
                    <ListItemButton component={RouterLink} to={workspaceLink} onClick={handleMenuClose}>
                        <ListItemIcon>{workspaceIcon}</ListItemIcon>
                        <ListItemText primary={workspaceLabel} primaryTypographyProps={{ fontWeight: 800 }} />
                    </ListItemButton>
                    <ListItemButton component={RouterLink} to="/profile?tab=icon" onClick={handleMenuClose}>
                        <ListItemIcon>
                            <SettingsOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary={isRu ? "Иконка и настройки" : "Icon settings"} primaryTypographyProps={{ fontWeight: 800 }} />
                        <Chip size="small" label={isRu ? "Новое" : "New"} sx={{ height: 24, fontWeight: 900 }} />
                    </ListItemButton>
                </Stack>

                <Box sx={{ p: 1, bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(42,50,65,0.72)" : "background.paper") }}>
                    <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1, justifyContent: "center", color: "error.main" }}>
                        <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                            <LogoutRoundedIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("nav.logout")} primaryTypographyProps={{ fontWeight: 900 }} sx={{ flex: "0 0 auto" }} />
                    </ListItemButton>
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

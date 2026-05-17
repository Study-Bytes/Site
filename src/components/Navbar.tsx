import {
    AppBar,
    Avatar,
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Button,
    Divider,
    IconButton,
    InputAdornment,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
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
    { label: "Teacher Request", to: "/teacher-request", icon: <AssignmentTurnedInOutlinedIcon />, roles: ["STUDENT"] },
    { label: "Teacher Cabinet", to: "/teacher/courses", icon: <AdminPanelSettingsOutlinedIcon />, roles: ["TEACHER", "ADMIN"] },
    { label: "Teacher Requests", to: "/admin/teacher-requests", icon: <AssignmentTurnedInOutlinedIcon />, roles: ["ADMIN"] },
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
        "Teacher Request": "nav.teacherRequest",
        "Teacher Requests": "nav.adminRequests",
    };
    return map[label] ? t(map[label]) : label;
}

function Brand({ compact = false }: { compact?: boolean }) {
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
                        EdTech Platform
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

function AccountMenu() {
    const { t } = useI18n();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleMenuOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

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

    return (
        <>
            <IconButton onClick={handleMenuOpen} aria-label="Open account menu">
                <Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main", fontWeight: 950, fontSize: 14 }}>{(user.fullName ?? user.email).charAt(0).toUpperCase()}</Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
                    {t("nav.profile")}
                </MenuItem>
                <MenuItem component={RouterLink} to="/teacher-request" onClick={handleMenuClose} sx={{ display: user.role === "STUDENT" ? "flex" : "none" }}>
                    {t("nav.teacherRequest")}
                </MenuItem>
                <MenuItem disabled>{user.role}</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <LogoutRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                    {t("nav.logout")}
                </MenuItem>
            </Menu>
        </>
    );
}

function UtilityActions() {
    const { mode, toggleMode } = useColorMode();
    const { user } = useAuth();

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <LanguageSwitcher compact />
            <IconButton onClick={toggleMode} aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
                {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
            <IconButton component={RouterLink} to="/maintenance" aria-label="Help" sx={{ display: { xs: "none", sm: "inline-flex" } }}>
                <HelpOutlineRoundedIcon />
            </IconButton>
            {user ? (
                <IconButton component={RouterLink} to="/profile" aria-label="Settings" sx={{ display: { xs: "none", sm: "inline-flex" } }}>
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
                <IconButton component={RouterLink} to="/courses" aria-label="Search courses">
                    <SearchRoundedIcon />
                </IconButton>
                <LanguageSwitcher compact />
                <IconButton onClick={toggleMode} aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
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
        ? ["/courses", "/teacher/courses", "/admin/teacher-requests", "/profile"]
        : role === "TEACHER"
          ? ["/courses", "/my-learning", "/teacher/courses", "/profile"]
          : role === "STUDENT"
            ? ["/courses", "/my-learning", "/teacher-request", "/profile"]
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

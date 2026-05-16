import {
    AppBar,
    Avatar,
    Badge,
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
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import type { UserRole } from "../api/bffContracts";
import { useAuth } from "../auth/useAuth";
import { studyBytesColors } from "../theme/theme";

type NavVariant = "marketing" | "app";

type NavItem = {
    label: string;
    to: string;
    icon: ReactNode;
    roles?: UserRole[];
};

const navItems: NavItem[] = [
    { label: "Dashboard", to: "/", icon: <DashboardOutlinedIcon /> },
    { label: "Courses", to: "/courses", icon: <MenuBookOutlinedIcon /> },
    { label: "My Learning", to: "/my-learning", icon: <SchoolOutlinedIcon /> },
    { label: "Profile", to: "/profile", icon: <PersonOutlineRoundedIcon /> },
    { label: "Teacher Cabinet", to: "/teacher/courses", icon: <AdminPanelSettingsOutlinedIcon />, roles: ["TEACHER", "ADMIN"] },
];

function canShow(item: NavItem, role: UserRole | null) {
    if (item.roles) return role ? item.roles.includes(role) : false;
    return true;
}

function isActivePath(pathname: string, item: NavItem) {
    if (item.to === "/") return pathname === "/";
    if (item.to === "/my-learning") return pathname.startsWith("/my-learning") || pathname.startsWith("/learn");
    if (item.to === "/teacher/courses") return pathname.startsWith("/teacher");
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function Brand({ compact = false }: { compact?: boolean }) {
    return (
        <Stack component={RouterLink} to="/" direction="row" spacing={1.4} alignItems="center">
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
                <Typography sx={{ fontWeight: 950, fontSize: compact ? 18 : 22, color: "primary.main", lineHeight: 1 }}>
                    StudyBytes
                </Typography>
                {!compact ? (
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 900, letterSpacing: 0.8, textTransform: "uppercase" }}>
                        EdTech Platform
                    </Typography>
                ) : null}
            </Box>
        </Stack>
    );
}

function SearchBox({ placeholder = "Search courses, skills..." }: { placeholder?: string }) {
    return (
        <TextField
            size="small"
            placeholder={placeholder}
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
                    bgcolor: studyBytesColors.surfaceContainerLow,
                },
            }}
        />
    );
}

function AccountMenu() {
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
                    Login
                </Button>
                <Button component={RouterLink} to="/register" variant="contained">
                    Register
                </Button>
            </Stack>
        );
    }

    return (
        <>
            <IconButton onClick={handleMenuOpen} aria-label="Open account menu">
                <Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main", fontWeight: 950, fontSize: 14 }}>
                    {(user.fullName ?? user.email).charAt(0).toUpperCase()}
                </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
                    Profile
                </MenuItem>
                <MenuItem disabled>{user.role}</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <LogoutRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                    Logout
                </MenuItem>
            </Menu>
        </>
    );
}

function UtilityActions() {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <IconButton aria-label="Notifications">
                <Badge color="error" variant="dot">
                    <NotificationsNoneRoundedIcon />
                </Badge>
            </IconButton>
            <IconButton aria-label="Help" sx={{ display: { xs: "none", sm: "inline-flex" } }}>
                <HelpOutlineRoundedIcon />
            </IconButton>
            <IconButton aria-label="Settings" sx={{ display: { xs: "none", sm: "inline-flex" } }}>
                <SettingsOutlinedIcon />
            </IconButton>
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
                borderBottom: `1px solid ${studyBytesColors.outlineVariant}`,
                bgcolor: "rgba(240,236,249,0.86)",
                backdropFilter: "blur(14px)",
            }}
        >
            <Toolbar sx={{ maxWidth: 1280, width: "100%", mx: "auto", minHeight: 64, px: { xs: 2, md: 3 } }}>
                <Stack direction="row" spacing={3} alignItems="center" sx={{ flexGrow: 1 }}>
                    <Brand compact />
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <SearchBox placeholder="Search courses, skills, or topics..." />
                    </Box>
                </Stack>
                <UtilityActions />
            </Toolbar>
        </AppBar>
    );
}

function AppSidebar({ visibleItems }: { visibleItems: NavItem[] }) {
    const location = useLocation();

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
                bgcolor: studyBytesColors.surfaceContainer,
                borderRight: `1px solid ${studyBytesColors.outlineVariant}`,
                zIndex: 1200,
                py: 4,
            }}
        >
            <Box sx={{ px: 3, mb: 6 }}>
                <Brand />
            </Box>
            <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
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
                                py: 1.4,
                                borderLeft: active ? `4px solid ${studyBytesColors.primary}` : "4px solid transparent",
                                borderRadius: active ? "0 8px 8px 0" : 0,
                                color: active ? "primary.contrastText" : "text.primary",
                                bgcolor: active ? "secondary.main" : "transparent",
                                "&.Mui-selected": { bgcolor: "secondary.main" },
                                "&.Mui-selected:hover": { bgcolor: "secondary.main" },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 42, color: "inherit" }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 900 : 500 }} />
                        </ListItemButton>
                    );
                })}
            </Stack>
            <Box sx={{ px: 3, mt: 3 }}>
                <Button fullWidth variant="contained">
                    Upgrade Pro
                </Button>
            </Box>
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
                borderBottom: `1px solid ${studyBytesColors.outlineVariant}`,
                bgcolor: "rgba(252,248,255,0.86)",
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
    return (
        <AppBar
            position="fixed"
            elevation={0}
            color="transparent"
            sx={{
                display: { xs: "block", md: "none" },
                borderBottom: `1px solid ${studyBytesColors.outlineVariant}`,
                bgcolor: "rgba(252,248,255,0.92)",
                backdropFilter: "blur(14px)",
            }}
        >
            <Toolbar sx={{ minHeight: 56, px: 1.5 }}>
                <Brand compact />
                <Box sx={{ flexGrow: 1 }} />
                <IconButton aria-label="Search">
                    <SearchRoundedIcon />
                </IconButton>
                <IconButton aria-label="Notifications">
                    <NotificationsNoneRoundedIcon />
                </IconButton>
                <AccountMenu />
            </Toolbar>
        </AppBar>
    );
}

function MobileBottomNav({ visibleItems }: { visibleItems: NavItem[] }) {
    const location = useLocation();
    const items = visibleItems.filter((item) => item.to !== "/teacher/courses").slice(0, 4);
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
                borderTop: `1px solid ${studyBytesColors.outlineVariant}`,
                zIndex: 1300,
            }}
        >
            <BottomNavigation value={activeValue} showLabels sx={{ bgcolor: "background.paper" }}>
                {items.map((item) => (
                    <BottomNavigationAction key={item.to} component={RouterLink} to={item.to} label={item.label.replace("My ", "")} value={item.to} icon={item.icon} />
                ))}
            </BottomNavigation>
        </Paper>
    );
}

export default function Navbar({ variant = "marketing" }: { variant?: NavVariant }) {
    const { user } = useAuth();
    const visibleItems = navItems.filter((item) => canShow(item, user?.role ?? null));

    if (variant === "marketing") return <MarketingNavbar />;

    return (
        <>
            <AppSidebar visibleItems={visibleItems} />
            <AppTopbar />
            <MobileTopbar />
            <MobileBottomNav visibleItems={visibleItems} />
        </>
    );
}

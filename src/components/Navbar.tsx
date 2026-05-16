import { useState } from "react";
import type { MouseEvent } from "react";
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { UserRole } from "../api/bffContracts";

type NavItem = {
    label: string;
    to: string;
    roles?: UserRole[];
    anonymousOnly?: boolean;
    authenticatedOnly?: boolean;
};

const navItems: NavItem[] = [
    { label: "Courses", to: "/courses" },
    { label: "My Learning", to: "/my-learning", authenticatedOnly: true },
    { label: "Teacher Cabinet", to: "/teacher/courses", roles: ["TEACHER", "ADMIN"] },
    { label: "Profile", to: "/profile", authenticatedOnly: true },
    { label: "Login", to: "/login", anonymousOnly: true },
    { label: "Register", to: "/register", anonymousOnly: true },
];

function canShow(item: NavItem, role: UserRole | null) {
    const isAuthenticated = role !== null;
    if (item.anonymousOnly) return !isAuthenticated;
    if (item.authenticatedOnly && !isAuthenticated) return false;
    if (item.roles) return role ? item.roles.includes(role) : false;
    return true;
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const visibleItems = navItems.filter((item) => canShow(item, user?.role ?? null));

    const handleMenuOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = async () => {
        await logout();
        handleMenuClose();
        setDrawerOpen(false);
        navigate("/");
    };

    const navButton = (item: NavItem) => (
        <Button
            key={item.to}
            component={RouterLink}
            to={item.to}
            color={location.pathname === item.to ? "primary" : "inherit"}
            sx={{ fontWeight: 800 }}
        >
            {item.label}
        </Button>
    );

    return (
        <AppBar
            position="fixed"
            elevation={0}
            color="transparent"
            sx={{
                borderBottom: "1px solid rgba(119,117,135,0.22)",
                backgroundColor: "rgba(252,248,255,0.86)",
                backdropFilter: "blur(14px)",
            }}
        >
            <Toolbar sx={{ maxWidth: 1280, width: "100%", mx: "auto", px: { xs: 2, md: 4 } }}>
                <Stack component={RouterLink} to="/" direction="row" spacing={1.2} alignItems="center" sx={{ mr: 3 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                        }}
                    >
                        <SchoolRoundedIcon fontSize="small" />
                    </Box>
                    <Typography sx={{ fontWeight: 950, fontSize: 20, color: "text.primary" }}>StudyBytes</Typography>
                </Stack>

                <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
                    {visibleItems.map(navButton)}
                </Stack>

                <Box sx={{ flexGrow: 1 }} />

                {user ? (
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <IconButton onClick={handleMenuOpen} aria-label="Open account menu">
                            <Avatar sx={{ width: 36, height: 36, bgcolor: "secondary.main", fontWeight: 900 }}>
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
                    </Box>
                ) : null}

                <IconButton sx={{ display: { xs: "inline-flex", md: "none" } }} onClick={() => setDrawerOpen(true)}>
                    <MenuRoundedIcon />
                </IconButton>

                <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                    <Box sx={{ width: 300, p: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <SchoolRoundedIcon color="primary" />
                            <Typography sx={{ fontWeight: 950 }}>StudyBytes</Typography>
                        </Stack>
                        <List>
                            {visibleItems.map((item) => (
                                <ListItemButton
                                    key={item.to}
                                    component={RouterLink}
                                    to={item.to}
                                    selected={location.pathname === item.to}
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            ))}
                            {user ? (
                                <ListItemButton onClick={handleLogout}>
                                    <ListItemText primary="Logout" />
                                </ListItemButton>
                            ) : null}
                        </List>
                    </Box>
                </Drawer>
            </Toolbar>
        </AppBar>
    );
}

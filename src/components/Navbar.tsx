import { useState } from "react";
import type { MouseEvent } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Stack,
    Box,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    Tooltip,
} from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();

    const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const menuOpen = Boolean(anchorEl);
    const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        auth.logout();
        handleMenuClose();
        navigate("/");
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            color="transparent"
            sx={{
                borderBottom: "1px solid rgba(16, 24, 40, 0.08)",
                backgroundColor: "rgba(255,255,255,0.78)",
                backdropFilter: "blur(10px)",
            }}
        >
            <Toolbar sx={{ width: "100%", mx: "auto" }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                    <SchoolRoundedIcon />
                    <Typography
                        component={RouterLink}
                        to="/"
                        sx={{
                            textDecoration: "none",
                            fontWeight: 900,
                            color: "text.primary",
                        }}
                    >
                        LearnHub
                    </Typography>

                    <Button
                        component={RouterLink}
                        to="/"
                        sx={{
                            ml: 2,
                            fontWeight: 800,
                            color: "text.secondary",
                            display: { xs: "none", sm: "inline-flex" },
                        }}
                    >
                        Кабинет преподавателя
                    </Button>
                </Stack>

                <Box sx={{ flexGrow: 1 }} />

                {/* Right side */}
                {auth.user ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Tooltip title={auth.user.username}>
                            <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0.5 }}>
                                <Avatar
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        bgcolor: "rgba(16,24,40,0.10)",
                                        color: "text.primary",
                                    }}
                                >
                                    {/* "Пустая аватарка" как у Stepik */}
                                    <PersonOutlineRoundedIcon fontSize="small" />
                                </Avatar>
                            </IconButton>
                        </Tooltip>

                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleMenuClose}
                            onClick={handleMenuClose}
                            transformOrigin={{ horizontal: "right", vertical: "top" }}
                            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                            PaperProps={{ sx: { minWidth: 220, borderRadius: 2, mt: 1 } }}
                        >
                            <MenuItem component={RouterLink} to="/profile">
                                <ListItemIcon>
                                    <AccountCircleRoundedIcon fontSize="small" />
                                </ListItemIcon>
                                Профиль
                            </MenuItem>

                            <Divider />

                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogoutRoundedIcon fontSize="small" />
                                </ListItemIcon>
                                Выйти
                            </MenuItem>
                        </Menu>
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={1}>
                        <Button
                            component={RouterLink}
                            to="/login"
                            variant={isAuthPage ? "text" : "outlined"}
                            color="primary"
                        >
                            Войти
                        </Button>

                        <Button component={RouterLink} to="/register" variant="contained" color="primary">
                            Регистрация
                        </Button>
                    </Stack>
                )}
            </Toolbar>
        </AppBar>
    );
}

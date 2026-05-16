import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../auth/useAuth";

export function AppShell() {
    const location = useLocation();
    const { user } = useAuth();
    const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
    const usesMarketingShell = isAuthRoute || (location.pathname === "/" && !user);

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
            <Navbar variant={usesMarketingShell ? "marketing" : "app"} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: usesMarketingShell ? 0 : { md: "256px" },
                    pb: usesMarketingShell ? 0 : { xs: 8, md: 0 },
                }}
            >
                <Outlet />
            </Box>
            {usesMarketingShell ? <Footer /> : null}
        </Box>
    );
}

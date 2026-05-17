import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../auth/useAuth";

function isPublicRoute(pathname: string) {
    return pathname === "/" || pathname === "/courses" || pathname.startsWith("/courses/") || pathname === "/help" || pathname.startsWith("/400") || pathname.startsWith("/401") || pathname.startsWith("/403") || pathname.startsWith("/404") || pathname.startsWith("/409") || pathname.startsWith("/500") || pathname === "/maintenance";
}

export function AppShell() {
    const location = useLocation();
    const { user } = useAuth();
    const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
    const usesMarketingShell = isAuthRoute || (!user && isPublicRoute(location.pathname));

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

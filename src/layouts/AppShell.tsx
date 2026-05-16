import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export function AppShell() {
    const location = useLocation();
    const usesMarketingShell = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register";

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

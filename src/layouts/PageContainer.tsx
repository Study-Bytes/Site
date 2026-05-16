import { Container } from "@mui/material";
import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
    return (
        <Container maxWidth="xl" sx={{ pt: { xs: 10, md: 11 }, pb: { xs: 6, md: 8 }, px: { xs: 2, md: 4 } }}>
            {children}
        </Container>
    );
}

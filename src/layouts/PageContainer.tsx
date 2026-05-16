import { Container } from "@mui/material";
import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
    return (
        <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 8 } }}>
            {children}
        </Container>
    );
}

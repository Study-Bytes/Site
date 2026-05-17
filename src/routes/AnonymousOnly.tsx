import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/useAuth";
import { LoadingState } from "../components/ui/LoadingState";
import { PageContainer } from "../layouts/PageContainer";

export function AnonymousOnly({ children }: { children: ReactNode }) {
    const auth = useAuth();
    if (auth.isLoading) {
        return (
            <PageContainer>
                <LoadingState rows={2} />
            </PageContainer>
        );
    }
    if (auth.user) return <Navigate to="/profile" replace />;
    return <>{children}</>;
}

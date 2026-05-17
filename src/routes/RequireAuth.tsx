import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/useAuth";
import { LoadingState } from "../components/ui/LoadingState";
import { PageContainer } from "../layouts/PageContainer";

function returnPath(location: ReturnType<typeof useLocation>) {
    return `${location.pathname}${location.search}${location.hash}`;
}

export function RequireAuth({ children }: { children: ReactNode }) {
    const auth = useAuth();
    const location = useLocation();

    if (auth.isLoading) {
        return (
            <PageContainer>
                <LoadingState rows={2} />
            </PageContainer>
        );
    }

    if (!auth.user) return <Navigate to="/login" state={{ from: returnPath(location) }} replace />;
    return <>{children}</>;
}

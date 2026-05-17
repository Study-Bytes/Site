import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/useAuth";
import type { UserRole } from "../api/bffContracts";
import { LoadingState } from "../components/ui/LoadingState";
import { PageContainer } from "../layouts/PageContainer";

export function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
    const auth = useAuth();
    const location = useLocation();

    if (auth.isLoading) {
        return (
            <PageContainer>
                <LoadingState rows={2} />
            </PageContainer>
        );
    }

    if (!auth.user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    if (!roles.includes(auth.user.role)) return <Navigate to="/403" replace />;
    return <>{children}</>;
}

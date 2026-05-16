import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/useAuth";
import type { UserRole } from "../api/bffContracts";
import { LoadingState } from "../components/ui/LoadingState";
import { PageContainer } from "../layouts/PageContainer";

export function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
    const auth = useAuth();

    if (auth.isLoading) {
        return (
            <PageContainer>
                <LoadingState rows={2} />
            </PageContainer>
        );
    }

    if (!auth.user) return <Navigate to="/login" replace />;
    if (!roles.includes(auth.user.role)) return <Navigate to="/403" replace />;
    return <>{children}</>;
}

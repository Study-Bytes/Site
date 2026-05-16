import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/useAuth";

export function AnonymousOnly({ children }: { children: ReactNode }) {
    const auth = useAuth();
    if (!auth.isLoading && auth.user) return <Navigate to="/profile" replace />;
    return <>{children}</>;
}

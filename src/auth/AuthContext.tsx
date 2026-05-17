import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../api/services";
import { sessionExpiredEventName } from "../api/apiClient";
import type { CurrentUser } from "../api/bffContracts";
import { AuthContext } from "./auth-context";
import type { AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const reloadSession = async () => {
        setIsLoading(true);
        try {
            const currentUser = await authApi.me();
            setUser(currentUser);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void reloadSession();
    }, []);

    useEffect(() => {
        const handleSessionExpired = () => setUser(null);
        window.addEventListener(sessionExpiredEventName, handleSessionExpired);
        return () => window.removeEventListener(sessionExpiredEventName, handleSessionExpired);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isLoading,
            isAuthenticated: Boolean(user),
            async login(input) {
                const response = await authApi.login(input);
                setUser(response.user);
            },
            async register(input) {
                const response = await authApi.register(input);
                setUser(response.user);
            },
            async logout() {
                await authApi.logout();
                setUser(null);
            },
            reloadSession,
            setCurrentUser: setUser,
        }),
        [isLoading, user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

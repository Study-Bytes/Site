import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../api/services";
import { sessionExpiredEventName } from "../api/apiClient";
import type { CurrentUser } from "../api/bffContracts";
import { useI18n } from "../i18n/useI18n";
import { AuthContext } from "./auth-context";
import type { AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
    const { setLocale } = useI18n();
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const reloadSession = useCallback(async () => {
        setIsLoading(true);
        try {
            const currentUser = await authApi.me();
            setUser(currentUser);
            if (currentUser?.preferredLocale) await setLocale(currentUser.preferredLocale, false);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [setLocale]);

    useEffect(() => {
        void reloadSession();
    }, [reloadSession]);

    useEffect(() => {
        const handleSessionExpired = () => {
            setUser(null);
            setIsLoading(false);
        };
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
                if (response.user.preferredLocale) await setLocale(response.user.preferredLocale, false);
            },
            async register(input) {
                const response = await authApi.register(input);
                setUser(response.user);
                if (response.user.preferredLocale) await setLocale(response.user.preferredLocale, false);
            },
            async logout() {
                await authApi.logout();
                setUser(null);
            },
            reloadSession,
            setCurrentUser: setUser,
        }),
        [isLoading, reloadSession, setLocale, user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "./authTypes";
import { clearSession, getSessionEmail, loadUsers, saveUsers, setSessionEmail } from "./authStorage";

type RegisterInput = User & { password: string };
type LoginInput = { email: string; password: string };

type AuthContextValue = {
    user: User | null;
    register: (input: RegisterInput) => Promise<void>;
    login: (input: LoginInput) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Восстановление сессии при загрузке
    useEffect(() => {
        const email = getSessionEmail();
        if (!email) return;

        const users = loadUsers();
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
            setUser({ email: found.email, username: found.username, birthYear: found.birthYear });
        }
    }, []);

    const api = useMemo<AuthContextValue>(() => {
        return {
            user,

            async register(input) {
                const users = loadUsers();

                const exists = users.some((u) => u.email.toLowerCase() === input.email.toLowerCase());
                if (exists) throw new Error("Пользователь с такой почтой уже существует");

                users.push({
                    email: input.email,
                    username: input.username,
                    birthYear: input.birthYear,
                    password: input.password, // ⚠️ прототип, так нельзя в реальном проекте
                });

                saveUsers(users);
                setSessionEmail(input.email);
                setUser({ email: input.email, username: input.username, birthYear: input.birthYear });
            },

            async login(input) {
                const users = loadUsers();
                const found = users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());

                if (!found) throw new Error("Пользователь не найден");
                if (found.password !== input.password) throw new Error("Неверный пароль");

                setSessionEmail(found.email);
                setUser({ email: found.email, username: found.username, birthYear: found.birthYear });
            },

            logout() {
                clearSession();
                setUser(null);
            },
        };
    }, [user]);

    return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth() должен быть внутри <AuthProvider>");
    return ctx;
}

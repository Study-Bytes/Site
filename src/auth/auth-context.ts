import { createContext } from "react";
import type { CurrentUser, LoginRequest, RegisterRequest } from "../api/bffContracts";

export type AuthContextValue = {
    user: CurrentUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (input: LoginRequest) => Promise<void>;
    register: (input: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    reloadSession: () => Promise<void>;
    setCurrentUser: (user: CurrentUser | null) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

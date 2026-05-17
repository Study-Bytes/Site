import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { ApiError } from "../apiError";
import { clearAuthTokens, getStoredRefreshToken, markSessionPresent, request, storeAuthTokens } from "../apiClient";
import type { AuthResponse, CurrentUser, LoginRequest, RefreshTokenRequest, RegisterRequest } from "../bffContracts";

function persistSession(response: AuthResponse) {
    markSessionPresent();
    storeAuthTokens(response.accessToken, response.refreshToken);
}

export const authApi = {
    async me(): Promise<CurrentUser | null> {
        try {
            if (env.useMockBff) return await mockBff.getMe();
            return await request<CurrentUser | null>("/me", {
                auth: "optional",
                returnNullOnUnauthorized: true,
                suppressSessionExpired: true,
                skipRefresh: true,
            });
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) return null;
            throw error;
        }
    },

    async login(input: LoginRequest): Promise<AuthResponse> {
        const response = env.useMockBff ? await mockBff.login(input) : await request<AuthResponse>("/auth/login", { method: "POST", body: input });
        persistSession(response);
        return response;
    },

    async register(input: RegisterRequest): Promise<AuthResponse> {
        const response = env.useMockBff ? await mockBff.register(input) : await request<AuthResponse>("/auth/register", { method: "POST", body: input });
        persistSession(response);
        return response;
    },

    async refresh(input?: RefreshTokenRequest): Promise<AuthResponse> {
        const body = input ?? { refreshToken: getStoredRefreshToken() ?? undefined };
        const response = env.useMockBff ? await mockBff.refresh() : await request<AuthResponse>("/auth/refresh", { method: "POST", body });
        persistSession(response);
        return response;
    },

    async logout(): Promise<void> {
        try {
            if (env.useMockBff) await mockBff.logout();
            else await request<void>("/auth/logout", { method: "POST" });
        } finally {
            clearAuthTokens();
        }
    },
};

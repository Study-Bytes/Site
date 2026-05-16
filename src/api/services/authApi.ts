import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { clearAuthTokens, getStoredRefreshToken, request, storeAuthTokens } from "../apiClient";
import type { AuthResponse, CurrentUser, LoginRequest, RefreshTokenRequest, RegisterRequest } from "../bffContracts";

function persistTokens(response: AuthResponse) {
    storeAuthTokens(response.accessToken, response.refreshToken);
}

export const authApi = {
    async me(): Promise<CurrentUser | null> {
        if (env.useMockBff) return mockBff.getMe();
        return request<CurrentUser | null>("/me");
    },

    async login(input: LoginRequest): Promise<AuthResponse> {
        const response = env.useMockBff ? await mockBff.login(input) : await request<AuthResponse>("/auth/login", { method: "POST", body: input });
        persistTokens(response);
        return response;
    },

    async register(input: RegisterRequest): Promise<AuthResponse> {
        const response = env.useMockBff ? await mockBff.register(input) : await request<AuthResponse>("/auth/register", { method: "POST", body: input });
        persistTokens(response);
        return response;
    },

    async refresh(input?: RefreshTokenRequest): Promise<AuthResponse> {
        const body = input ?? { refreshToken: getStoredRefreshToken() ?? undefined };
        const response = env.useMockBff ? await mockBff.refresh() : await request<AuthResponse>("/auth/refresh", { method: "POST", body });
        persistTokens(response);
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

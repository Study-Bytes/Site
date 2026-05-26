import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type { ChangePasswordRequest, CurrentUser, UpdateProfileRequest } from "../bffContracts";

export const profileApi = {
    async getMe(): Promise<CurrentUser | null> {
        if (env.useMockBff) return mockBff.getMe();
        return request<CurrentUser | null>("/me", { auth: "optional", returnNullOnUnauthorized: true, skipRefresh: true, suppressSessionExpired: true });
    },

    updateProfile(input: UpdateProfileRequest): Promise<CurrentUser> {
        if (env.useMockBff) return mockBff.updateProfile(input);
        return request<CurrentUser>("/me/settings", { method: "PUT", body: input });
    },

    uploadAvatar(file: File): Promise<CurrentUser> {
        if (env.useMockBff) return mockBff.uploadAvatar(file);
        const body = new FormData();
        body.append("file", file);
        return request<CurrentUser>("/me/avatar", { method: "POST", body });
    },

    changePassword(input: ChangePasswordRequest): Promise<void> {
        if (env.useMockBff) return mockBff.changePassword(input);
        return request<void>("/me/password", { method: "PUT", body: input });
    },
};

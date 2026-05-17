import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type { ChangePasswordRequest, CurrentUser, UpdateProfileRequest } from "../bffContracts";

export const profileApi = {
    getMe(): Promise<CurrentUser | null> {
        if (env.useMockBff) return mockBff.getMe();
        return request<CurrentUser | null>("/me");
    },

    updateProfile(input: UpdateProfileRequest): Promise<CurrentUser> {
        if (env.useMockBff) return mockBff.updateProfile(input);
        return request<CurrentUser>("/me/settings", { method: "PUT", body: input });
    },

    changePassword(input: ChangePasswordRequest): Promise<void> {
        if (env.useMockBff) return mockBff.changePassword(input);
        return request<void>("/me/password", { method: "PUT", body: input });
    },
};

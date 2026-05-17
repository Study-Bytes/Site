import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request, storeAuthTokens } from "../apiClient";
import type {
    RegisterTeacherRequest,
    RegisterTeacherRequestResponse,
    TeacherAccessRequest,
    TeacherRequestCreateRequest,
    TeacherRequestReviewRequest,
} from "../bffContracts";

function persistTeacherRequestTokens(response: RegisterTeacherRequestResponse) {
    storeAuthTokens(response.accessToken, response.refreshToken);
}

export const teacherRequestsApi = {
    create(input: TeacherRequestCreateRequest): Promise<TeacherAccessRequest> {
        if (env.useMockBff) return mockBff.createTeacherRequest(input);
        return request<TeacherAccessRequest>("/teacher-requests", { method: "POST", body: input });
    },

    getMine(): Promise<TeacherAccessRequest | null> {
        if (env.useMockBff) return mockBff.getMyTeacherRequest();
        return request<TeacherAccessRequest | null>("/teacher-requests/me");
    },

    listAdmin(): Promise<TeacherAccessRequest[]> {
        if (env.useMockBff) return mockBff.listTeacherRequests();
        return request<TeacherAccessRequest[]>("/admin/teacher-requests");
    },

    approve(requestId: number, input: TeacherRequestReviewRequest = {}): Promise<TeacherAccessRequest> {
        if (env.useMockBff) return mockBff.approveTeacherRequest(requestId, input);
        return request<TeacherAccessRequest>(`/admin/teacher-requests/${requestId}/approve`, { method: "POST", body: input });
    },

    reject(requestId: number, input: TeacherRequestReviewRequest): Promise<TeacherAccessRequest> {
        if (env.useMockBff) return mockBff.rejectTeacherRequest(requestId, input);
        return request<TeacherAccessRequest>(`/admin/teacher-requests/${requestId}/reject`, { method: "POST", body: input });
    },

    async registerTeacherRequest(input: RegisterTeacherRequest): Promise<RegisterTeacherRequestResponse> {
        const response = env.useMockBff ? await mockBff.registerTeacherRequest(input) : await request<RegisterTeacherRequestResponse>("/auth/register-teacher-request", { method: "POST", body: input });
        persistTeacherRequestTokens(response);
        return response;
    },
};

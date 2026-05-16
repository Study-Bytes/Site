import { env } from "../config/env";
import { ApiError } from "./apiError";
import { mockBff } from "../mocks/mockBff";
import type {
    ApiValidationError,
    AuthResponse,
    CourseCatalogItem,
    CourseDetails,
    CurrentUser,
    EnrollmentSummary,
    LoginRequest,
    RegisterRequest,
    TeacherCourseSummary,
} from "./bffContracts";

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
};

async function parseError(response: Response): Promise<ApiError> {
    let message = `Request failed with status ${response.status}`;
    let validationErrors: ApiValidationError[] = [];

    try {
        const payload = await response.json();
        if (typeof payload?.message === "string") message = payload.message;
        if (Array.isArray(payload?.validationErrors)) validationErrors = payload.validationErrors;
    } catch {
        // keep default message
    }

    return new ApiError(message, response.status, validationErrors);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${env.bffBaseUrl}${path}`, {
        method: options.method ?? "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (!response.ok) throw await parseError(response);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
}

const realBff = {
    getMe: () => request<CurrentUser | null>("/me"),
    login: (body: LoginRequest) => request<AuthResponse>("/auth/login", { method: "POST", body }),
    register: (body: RegisterRequest) => request<AuthResponse>("/auth/register", { method: "POST", body }),
    logout: () => request<void>("/auth/logout", { method: "POST" }),
    getCourses: () => request<CourseCatalogItem[]>("/courses"),
    getCourse: (courseId: number) => request<CourseDetails>(`/courses/${courseId}`),
    getMyLearning: () => request<EnrollmentSummary[]>("/learn/my-courses"),
    getTeacherCourses: () => request<TeacherCourseSummary[]>("/teacher/courses"),
};

export const bffClient = env.useMockBff ? mockBff : realBff;

import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type {
    CourseLeaderboardEntry,
    CourseLeaderboardResponse,
    EnrollCourseResponse,
    EnrollmentSummary,
    ContentBlockDto,
    CourseModuleSummary,
    HintDto,
    LearningCourse,
    LearningItem,
    ModuleDeadlineState,
    ModuleDeadlineTaskCompletion,
    ModuleStartResponse,
    QuizOptionDto,
    RunItemRequest,
    SubmissionHistoryItem,
    SubmissionResult,
    SubmitItemRequest,
    TestResultDto,
} from "../bffContracts";
import { normalizeCourseModuleSummary, readArray, unwrapListResponse } from "../responseParsing";

type RawLeaderboardEntry = Partial<CourseLeaderboardEntry> & Record<string, unknown>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const avatarFilesPrefix = `${env.bffApiPrefix}/avatar-files/`;

function isEmailLike(value: string) {
    return emailPattern.test(value.trim());
}

function readValue(entry: RawLeaderboardEntry, key: string): unknown {
    return key.split(".").reduce<unknown>((current, part) => {
        if (current && typeof current === "object" && part in current) {
            return (current as Record<string, unknown>)[part];
        }
        return undefined;
    }, entry);
}

function readNumberField(entry: RawLeaderboardEntry, keys: string[]) {
    for (const key of keys) {
        const value = readValue(entry, key);
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (typeof value === "string" && value.trim()) {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) return parsed;
        }
    }

    return null;
}

function readStringField(entry: RawLeaderboardEntry, keys: string[], options: { allowEmail?: boolean } = {}) {
    for (const key of keys) {
        const value = readValue(entry, key);
        if (typeof value === "string" && value.trim()) {
            const trimmed = value.trim();
            if (!options.allowEmail && isEmailLike(trimmed)) continue;
            return trimmed;
        }
    }

    return null;
}

function normalizeAvatarUrl(value: string | null) {
    if (!value) return null;

    if (/^(blob|data):/i.test(value)) return value;

    try {
        const parsed = new URL(value, typeof window === "undefined" ? "http://localhost" : window.location.origin);
        const normalizedPath = parsed.pathname.replace(/\/{2,}/g, "/");
        const isStoredBffAvatar = normalizedPath.startsWith(avatarFilesPrefix) || normalizedPath.startsWith("/api/v1/avatar-files/");
        if (isStoredBffAvatar) {
            return `${env.bffBaseUrl}${normalizedPath}${parsed.search}${parsed.hash}`;
        }
        if (/^https?:\/\//i.test(value)) return value;
    } catch {
        // fall through to relative URL normalization
    }

    if (value.startsWith("/")) return `${env.bffBaseUrl}${value}`;
    return `${env.bffBaseUrl}/${value.replace(/^\/+/, "")}`;
}

function normalizeLearningCourse(course: LearningCourse): LearningCourse {
    return {
        ...course,
        modules: readArray<CourseModuleSummary>(course.modules).map(normalizeCourseModuleSummary),
    };
}

export function normalizeCourseLeaderboard(leaderboard: CourseLeaderboardResponse): CourseLeaderboardResponse {
    const top = readArray<RawLeaderboardEntry>(leaderboard.top).map((entry, index) => normalizeLeaderboardEntry(entry, index + 1));

    return {
        ...leaderboard,
        top,
        currentUser: leaderboard.currentUser ? normalizeLeaderboardEntry(leaderboard.currentUser as RawLeaderboardEntry, top.length + 1) : null,
    };
}

function normalizeLeaderboardEntry(entry: RawLeaderboardEntry, fallbackRank: number): CourseLeaderboardEntry {
    const rank = readNumberField(entry, ["rank", "place", "position"]) ?? fallbackRank;
    const userId = readNumberField(entry, ["userId", "studentId", "id", "user_id"]) ?? fallbackRank;
    const fullName = readStringField(entry, ["fullName", "displayName", "name", "user.fullName", "profile.fullName", "user.displayName", "profile.displayName", "nickname", "nick", "username"]);
    const avatarUrl = normalizeAvatarUrl(readStringField(entry, ["avatarUrl", "avatar", "photoUrl", "imageUrl", "user.avatarUrl", "profile.avatarUrl", "user.avatar", "profile.avatar"], { allowEmail: true }));
    const progressPercent = readNumberField(entry, ["progressPercent", "progress", "percent", "coursePercent", "completionPercent"]) ?? 0;

    return {
        userId,
        fullName,
        avatarUrl,
        progressPercent,
        rank,
    };
}

function normalizeModuleDeadlineState(state: ModuleDeadlineState): ModuleDeadlineState {
    return {
        ...state,
        moduleCompletedAt: state.moduleCompletedAt ?? null,
        moduleCompletedBeforeDeadline: state.moduleCompletedBeforeDeadline ?? null,
        tasksCompletedBeforeDeadline: readArray<ModuleDeadlineTaskCompletion>(state.tasksCompletedBeforeDeadline),
        tasksCompletedAfterDeadline: readArray<ModuleDeadlineTaskCompletion>(state.tasksCompletedAfterDeadline),
    };
}

function normalizeLearningItem(item: LearningItem): LearningItem {
    return {
        ...item,
        item: {
            ...item.item,
            contentBlocks: readArray<ContentBlockDto>(item.item.contentBlocks),
            hints: readArray<HintDto>(item.item.hints),
            options: readArray<QuizOptionDto>(item.item.options),
        },
    };
}

function normalizeSubmissionResult(result: SubmissionResult): SubmissionResult {
    return {
        ...result,
        testResults: readArray<TestResultDto>(result.testResults),
    };
}

export const learningApi = {
    enrollCourse(courseId: number): Promise<EnrollCourseResponse> {
        if (env.useMockBff) return mockBff.enrollCourse(courseId);
        return request<EnrollCourseResponse>(`/learn/courses/${courseId}/enroll`, { method: "POST" });
    },

    async getMyCourses(): Promise<EnrollmentSummary[]> {
        if (env.useMockBff) return mockBff.getMyLearning();
        const response = await request<unknown>("/learn/my-courses");
        return unwrapListResponse<EnrollmentSummary>(response, "Мои курсы", ["items", "courses", "enrollments", "content", "data"]);
    },

    async getLearningCourse(courseId: number): Promise<LearningCourse> {
        if (env.useMockBff) return mockBff.getLearningCourse(courseId);
        return normalizeLearningCourse(await request<LearningCourse>(`/learn/courses/${courseId}`));
    },

    async getCourseLeaderboard(courseId: number): Promise<CourseLeaderboardResponse> {
        if (env.useMockBff) return mockBff.getCourseLeaderboard(courseId);
        return normalizeCourseLeaderboard(await request<CourseLeaderboardResponse>(`/learn/courses/${courseId}/leaderboard`));
    },

    startModule(courseId: number, moduleId: number): Promise<ModuleStartResponse> {
        if (env.useMockBff) return mockBff.startModule(courseId, moduleId);
        return request<ModuleStartResponse>(`/learn/courses/${courseId}/modules/${moduleId}/start`, { method: "POST" });
    },

    async getModuleDeadlineState(courseId: number, moduleId: number, deadlineAt: string): Promise<ModuleDeadlineState> {
        if (env.useMockBff) return mockBff.getModuleDeadlineState(courseId, moduleId, deadlineAt);
        return normalizeModuleDeadlineState(await request<ModuleDeadlineState>(`/learn/courses/${courseId}/modules/${moduleId}/deadline-state`, { query: { deadlineAt } }));
    },

    async getLearningItem(courseId: number, itemId: number): Promise<LearningItem> {
        if (env.useMockBff) return mockBff.getLearningItem(courseId, itemId);
        return normalizeLearningItem(await request<LearningItem>(`/learn/courses/${courseId}/items/${itemId}`));
    },

    async runItem(courseId: number, itemId: number, input: RunItemRequest): Promise<SubmissionResult> {
        if (env.useMockBff) return mockBff.runItem(courseId, itemId, input);
        return normalizeSubmissionResult(await request<SubmissionResult>(`/learn/courses/${courseId}/items/${itemId}/run`, { method: "POST", body: input }));
    },

    async submitItem(courseId: number, itemId: number, input: SubmitItemRequest): Promise<SubmissionResult> {
        if (env.useMockBff) return mockBff.submitItem(courseId, itemId, input);
        return normalizeSubmissionResult(await request<SubmissionResult>(`/learn/courses/${courseId}/items/${itemId}/submit`, { method: "POST", body: input }));
    },

    async getItemSubmissions(courseId: number, itemId: number): Promise<SubmissionHistoryItem[]> {
        if (env.useMockBff) return mockBff.getItemSubmissions(courseId, itemId);
        const response = await request<unknown>(`/learn/courses/${courseId}/items/${itemId}/submissions`);
        return unwrapListResponse<SubmissionHistoryItem>(response, "История отправок", ["items", "submissions", "content", "data"]);
    },

    async getSubmission(submissionId: number): Promise<SubmissionResult> {
        if (env.useMockBff) return mockBff.getSubmission(submissionId);
        return normalizeSubmissionResult(await request<SubmissionResult>(`/learn/submissions/${submissionId}`));
    },
};

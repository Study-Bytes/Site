import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type {
    EnrollCourseResponse,
    EnrollmentSummary,
    ContentBlockDto,
    CourseItemSummary,
    CourseModuleSummary,
    HintDto,
    LearningCourse,
    LearningItem,
    QuizOptionDto,
    RunItemRequest,
    SubmissionHistoryItem,
    SubmissionResult,
    SubmitItemRequest,
    TestResultDto,
} from "../bffContracts";
import { readArray, unwrapListResponse } from "../responseParsing";

function normalizeLearningCourse(course: LearningCourse): LearningCourse {
    return {
        ...course,
        modules: readArray<CourseModuleSummary>(course.modules).map((module) => ({
            ...module,
            items: readArray<CourseItemSummary>(module.items),
        })),
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

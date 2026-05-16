import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type {
    EnrollCourseResponse,
    EnrollmentSummary,
    LearningCourse,
    LearningItem,
    RunItemRequest,
    SubmissionHistoryItem,
    SubmissionResult,
    SubmitItemRequest,
} from "../bffContracts";

export const learningApi = {
    enrollCourse(courseId: number): Promise<EnrollCourseResponse> {
        if (env.useMockBff) return mockBff.enrollCourse(courseId);
        return request<EnrollCourseResponse>(`/learn/courses/${courseId}/enroll`, { method: "POST" });
    },

    getMyCourses(): Promise<EnrollmentSummary[]> {
        if (env.useMockBff) return mockBff.getMyLearning();
        return request<EnrollmentSummary[]>("/learn/my-courses");
    },

    getLearningCourse(courseId: number): Promise<LearningCourse> {
        if (env.useMockBff) return mockBff.getLearningCourse(courseId);
        return request<LearningCourse>(`/learn/courses/${courseId}`);
    },

    getLearningItem(courseId: number, itemId: number): Promise<LearningItem> {
        if (env.useMockBff) return mockBff.getLearningItem(courseId, itemId);
        return request<LearningItem>(`/learn/courses/${courseId}/items/${itemId}`);
    },

    runItem(courseId: number, itemId: number, input: RunItemRequest): Promise<SubmissionResult> {
        if (env.useMockBff) return mockBff.runItem(courseId, itemId, input);
        return request<SubmissionResult>(`/learn/courses/${courseId}/items/${itemId}/run`, { method: "POST", body: input });
    },

    submitItem(courseId: number, itemId: number, input: SubmitItemRequest): Promise<SubmissionResult> {
        if (env.useMockBff) return mockBff.submitItem(courseId, itemId, input);
        return request<SubmissionResult>(`/learn/courses/${courseId}/items/${itemId}/submit`, { method: "POST", body: input });
    },

    getItemSubmissions(courseId: number, itemId: number): Promise<SubmissionHistoryItem[]> {
        if (env.useMockBff) return mockBff.getItemSubmissions(courseId, itemId);
        return request<SubmissionHistoryItem[]>(`/learn/courses/${courseId}/items/${itemId}/submissions`);
    },

    getSubmission(submissionId: number): Promise<SubmissionResult> {
        if (env.useMockBff) return mockBff.getSubmission(submissionId);
        return request<SubmissionResult>(`/learn/submissions/${submissionId}`);
    },
};

import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type { CourseModerationReviewRequest, PageResponse, TeacherCourseDetails, TeacherCourseQuery, TeacherCourseSummary } from "../bffContracts";

function unwrapCourseList(response: TeacherCourseSummary[] | PageResponse<TeacherCourseSummary>) {
    return Array.isArray(response) ? response : response.items;
}

export const adminApi = {
    async listCourses(query?: TeacherCourseQuery): Promise<TeacherCourseSummary[]> {
        if (env.useMockBff) return mockBff.listAdminCourses(query);
        const response = await request<TeacherCourseSummary[] | PageResponse<TeacherCourseSummary>>("/admin/courses", { query });
        return unwrapCourseList(response);
    },

    async listModerationQueue(query?: TeacherCourseQuery): Promise<TeacherCourseSummary[]> {
        if (env.useMockBff) return mockBff.listModerationQueue(query);
        const response = await request<TeacherCourseSummary[] | PageResponse<TeacherCourseSummary>>("/admin/courses/moderation", { query });
        return unwrapCourseList(response);
    },

    getCourseReview(courseId: number): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.getCourseReview(courseId);
        return request<TeacherCourseDetails>(`/admin/courses/${courseId}/review`);
    },

    approveCourse(courseId: number): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.approveCourse(courseId);
        return request<TeacherCourseDetails>(`/admin/courses/${courseId}/approve`, { method: "POST" });
    },

    rejectCourse(courseId: number, input: CourseModerationReviewRequest): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.rejectCourse(courseId, input);
        return request<TeacherCourseDetails>(`/admin/courses/${courseId}/reject`, { method: "POST", body: input });
    },
};

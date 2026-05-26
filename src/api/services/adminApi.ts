import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type { CourseItemSummary, CourseModerationReviewRequest, CourseModuleSummary, TeacherCourseDetails, TeacherCourseQuery, TeacherCourseSummary } from "../bffContracts";
import { readArray, unwrapListResponse } from "../responseParsing";

function normalizeTeacherCourseDetails(course: TeacherCourseDetails): TeacherCourseDetails {
    return {
        ...course,
        modules: readArray<CourseModuleSummary>(course.modules).map((module) => ({
            ...module,
            deadlineType: module.deadlineType ?? "NONE",
            deadlineAt: module.deadlineAt ?? null,
            timeLimitMinutes: module.timeLimitMinutes ?? null,
            items: readArray<CourseItemSummary>(module.items),
        })),
    };
}

export const adminApi = {
    async listCourses(query?: TeacherCourseQuery): Promise<TeacherCourseSummary[]> {
        if (env.useMockBff) return mockBff.listAdminCourses(query);
        const response = await request<unknown>("/admin/courses", { query });
        return unwrapListResponse<TeacherCourseSummary>(response, "Список курсов администратора", ["items", "courses", "content", "data"]);
    },

    async listModerationQueue(query?: TeacherCourseQuery): Promise<TeacherCourseSummary[]> {
        if (env.useMockBff) return mockBff.listModerationQueue(query);
        const response = await request<unknown>("/admin/courses/moderation", { query });
        return unwrapListResponse<TeacherCourseSummary>(response, "Очередь модерации", ["items", "courses", "content", "data"]);
    },

    async getCourseReview(courseId: number): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.getCourseReview(courseId);
        return normalizeTeacherCourseDetails(await request<TeacherCourseDetails>(`/admin/courses/${courseId}/review`));
    },

    async approveCourse(courseId: number): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.approveCourse(courseId);
        return normalizeTeacherCourseDetails(await request<TeacherCourseDetails>(`/admin/courses/${courseId}/approve`, { method: "POST" }));
    },

    async rejectCourse(courseId: number, input: CourseModerationReviewRequest): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.rejectCourse(courseId, input);
        return normalizeTeacherCourseDetails(await request<TeacherCourseDetails>(`/admin/courses/${courseId}/reject`, { method: "POST", body: input }));
    },
};

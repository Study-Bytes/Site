import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type { CourseCatalogItem, CourseCatalogQuery, CourseDetails, CourseItemPreview, PageResponse } from "../bffContracts";

function unwrapCourseList(response: CourseCatalogItem[] | PageResponse<CourseCatalogItem>) {
    return Array.isArray(response) ? response : response.items;
}

export const coursesApi = {
    async listCourses(query?: CourseCatalogQuery): Promise<CourseCatalogItem[]> {
        if (env.useMockBff) return mockBff.getCourses(query);
        const response = await request<CourseCatalogItem[] | PageResponse<CourseCatalogItem>>("/courses", { query, auth: "none" });
        return unwrapCourseList(response);
    },

    getCourse(courseId: number): Promise<CourseDetails> {
        if (env.useMockBff) return mockBff.getCourse(courseId);
        return request<CourseDetails>(`/courses/${courseId}`, { auth: "none" });
    },

    getCourseItemPreview(courseId: number, itemId: number): Promise<CourseItemPreview> {
        if (env.useMockBff) return mockBff.getCourseItemPreview(courseId, itemId);
        return request<CourseItemPreview>(`/course-items/${itemId}`, { auth: "none" });
    },
};

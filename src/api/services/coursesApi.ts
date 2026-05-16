import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type { CourseCatalogItem, CourseCatalogQuery, CourseDetails, CourseItemPreview } from "../bffContracts";

export const coursesApi = {
    listCourses(query?: CourseCatalogQuery): Promise<CourseCatalogItem[]> {
        if (env.useMockBff) return mockBff.getCourses(query);
        return request<CourseCatalogItem[]>("/courses", { query });
    },

    getCourse(courseId: number): Promise<CourseDetails> {
        if (env.useMockBff) return mockBff.getCourse(courseId);
        return request<CourseDetails>(`/courses/${courseId}`);
    },

    getCourseItemPreview(courseId: number, itemId: number): Promise<CourseItemPreview> {
        if (env.useMockBff) return mockBff.getCourseItemPreview(courseId, itemId);
        return request<CourseItemPreview>(`/courses/${courseId}/items/${itemId}/preview`);
    },
};

import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type { CourseCatalogItem, CourseCatalogQuery, CourseDetails, CourseItemPreview, CourseItemSummary, CourseModuleSummary } from "../bffContracts";
import { readArray, unwrapListResponse } from "../responseParsing";

function normalizeCourseDetails(course: CourseDetails): CourseDetails {
    return {
        ...course,
        modules: readArray<CourseModuleSummary>(course.modules).map((module) => ({
            ...module,
            items: readArray<CourseItemSummary>(module.items),
        })),
    };
}

export const coursesApi = {
    async listCourses(query?: CourseCatalogQuery): Promise<CourseCatalogItem[]> {
        if (env.useMockBff) return mockBff.getCourses(query);
        const response = await request<unknown>("/courses", { query, auth: "none" });
        return unwrapListResponse<CourseCatalogItem>(response, "Каталог курсов", ["items", "courses", "content", "data"]);
    },

    async getCourse(courseId: number): Promise<CourseDetails> {
        if (env.useMockBff) return mockBff.getCourse(courseId);
        return normalizeCourseDetails(await request<CourseDetails>(`/courses/${courseId}`, { auth: "none" }));
    },

    async getCourseItemPreview(courseId: number, itemId: number): Promise<CourseItemPreview> {
        if (env.useMockBff) return mockBff.getCourseItemPreview(courseId, itemId);
        const preview = await request<CourseItemPreview>(`/course-items/${itemId}`, { auth: "none" });
        return {
            ...preview,
            contentBlocks: readArray(preview.contentBlocks),
        };
    },
};

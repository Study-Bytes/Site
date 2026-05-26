import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type {
    ContentBlockDto,
    ContentBlockUpsertRequest,
    CourseItemUpsertRequest,
    CourseModuleSummary,
    CourseUpsertRequest,
    HintDto,
    HintUpsertRequest,
    QuizOptionDto,
    QuizOptionUpsertRequest,
    ReorderItemsRequest,
    ReorderModulesRequest,
    TeacherCourseDetails,
    TeacherCourseQuery,
    TeacherCourseSummary,
    TeacherItemDetails,
    TestCaseDto,
    TestCaseUpsertRequest,
    ModuleUpsertRequest,
} from "../bffContracts";
import { normalizeCourseModuleSummary, readArray, unwrapListResponse } from "../responseParsing";

function normalizeTeacherCourseDetails(course: TeacherCourseDetails): TeacherCourseDetails {
    return {
        ...course,
        modules: readArray<CourseModuleSummary>(course.modules).map(normalizeCourseModuleSummary),
    };
}

function normalizeTeacherItemDetails(item: TeacherItemDetails): TeacherItemDetails {
    return {
        ...item,
        contentBlocks: readArray<ContentBlockDto>(item.contentBlocks),
        hints: readArray<HintDto>(item.hints),
        testCases: readArray<TestCaseDto>(item.testCases),
        options: readArray<QuizOptionDto>(item.options),
    };
}

export const teacherApi = {
    async listCourses(query?: TeacherCourseQuery): Promise<TeacherCourseSummary[]> {
        if (env.useMockBff) return mockBff.getTeacherCourses(query);
        const response = await request<unknown>("/teacher/courses", { query });
        return unwrapListResponse<TeacherCourseSummary>(response, "Курсы преподавателя", ["items", "courses", "content", "data"]);
    },

    async createCourse(input: CourseUpsertRequest): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.createTeacherCourse(input);
        return normalizeTeacherCourseDetails(await request<TeacherCourseDetails>("/teacher/courses", { method: "POST", body: input }));
    },

    async getCourse(courseId: number): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.getTeacherCourse(courseId);
        return normalizeTeacherCourseDetails(await request<TeacherCourseDetails>(`/teacher/courses/${courseId}`));
    },

    async updateCourse(courseId: number, input: CourseUpsertRequest): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.updateTeacherCourse(courseId, input);
        return normalizeTeacherCourseDetails(await request<TeacherCourseDetails>(`/teacher/courses/${courseId}`, { method: "PUT", body: input }));
    },

    async submitCourseForReview(courseId: number): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.submitTeacherCourseForReview(courseId);
        return normalizeTeacherCourseDetails(await request<TeacherCourseDetails>(`/teacher/courses/${courseId}/submit-review`, { method: "POST" }));
    },

    async archiveCourse(courseId: number): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.archiveTeacherCourse(courseId);
        return normalizeTeacherCourseDetails(await request<TeacherCourseDetails>(`/teacher/courses/${courseId}/archive`, { method: "POST" }));
    },

    createModule(courseId: number, input: ModuleUpsertRequest): Promise<CourseModuleSummary> {
        if (env.useMockBff) return mockBff.createModule(courseId, input);
        return request<CourseModuleSummary>(`/teacher/courses/${courseId}/modules`, { method: "POST", body: input });
    },

    updateModule(moduleId: number, input: ModuleUpsertRequest): Promise<CourseModuleSummary> {
        if (env.useMockBff) return mockBff.updateModule(moduleId, input);
        return request<CourseModuleSummary>(`/teacher/modules/${moduleId}`, { method: "PUT", body: input });
    },

    deleteModule(moduleId: number): Promise<void> {
        if (env.useMockBff) return mockBff.deleteModule(moduleId);
        return request<void>(`/teacher/modules/${moduleId}`, { method: "DELETE" });
    },

    reorderModules(courseId: number, input: ReorderModulesRequest): Promise<CourseModuleSummary[]> {
        if (env.useMockBff) return mockBff.reorderModules(courseId, input);
        return request<CourseModuleSummary[]>(`/teacher/courses/${courseId}/modules/reorder`, { method: "PUT", body: input });
    },

    async createItem(moduleId: number, input: CourseItemUpsertRequest): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.createItem(moduleId, input);
        return normalizeTeacherItemDetails(await request<TeacherItemDetails>(`/teacher/modules/${moduleId}/items`, { method: "POST", body: input }));
    },

    async getItem(itemId: number): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.getItem(itemId);
        return normalizeTeacherItemDetails(await request<TeacherItemDetails>(`/teacher/items/${itemId}`));
    },

    async updateItem(itemId: number, input: CourseItemUpsertRequest): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.updateItem(itemId, input);
        return normalizeTeacherItemDetails(await request<TeacherItemDetails>(`/teacher/items/${itemId}`, { method: "PUT", body: input }));
    },

    deleteItem(itemId: number): Promise<void> {
        if (env.useMockBff) return mockBff.deleteItem(itemId);
        return request<void>(`/teacher/items/${itemId}`, { method: "DELETE" });
    },

    reorderItems(moduleId: number, input: ReorderItemsRequest): Promise<CourseModuleSummary> {
        if (env.useMockBff) return mockBff.reorderItems(moduleId, input);
        return request<CourseModuleSummary>(`/teacher/modules/${moduleId}/items/reorder`, { method: "PUT", body: input });
    },

    async replaceContentBlocks(itemId: number, blocks: ContentBlockUpsertRequest[]): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.replaceContentBlocks(itemId, blocks);
        return normalizeTeacherItemDetails(await request<TeacherItemDetails>(`/teacher/items/${itemId}/content-blocks`, { method: "PUT", body: blocks }));
    },

    async replaceHints(itemId: number, hints: HintUpsertRequest[]): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.replaceHints(itemId, hints);
        return normalizeTeacherItemDetails(await request<TeacherItemDetails>(`/teacher/items/${itemId}/hints`, { method: "PUT", body: hints }));
    },

    async replaceTestCases(itemId: number, testCases: TestCaseUpsertRequest[]): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.replaceTestCases(itemId, testCases);
        return normalizeTeacherItemDetails(await request<TeacherItemDetails>(`/teacher/items/${itemId}/test-cases`, { method: "PUT", body: testCases }));
    },

    async replaceOptions(itemId: number, options: QuizOptionUpsertRequest[]): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.replaceOptions(itemId, options);
        return normalizeTeacherItemDetails(await request<TeacherItemDetails>(`/teacher/items/${itemId}/options`, { method: "PUT", body: options }));
    },
};

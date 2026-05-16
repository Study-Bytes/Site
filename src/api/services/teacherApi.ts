import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type {
    ContentBlockUpsertRequest,
    CourseItemUpsertRequest,
    CourseModuleSummary,
    CourseUpsertRequest,
    HintUpsertRequest,
    QuizOptionUpsertRequest,
    ReorderItemsRequest,
    ReorderModulesRequest,
    TeacherCourseDetails,
    TeacherCourseQuery,
    TeacherCourseSummary,
    TeacherItemDetails,
    TestCaseUpsertRequest,
    ModuleUpsertRequest,
} from "../bffContracts";

export const teacherApi = {
    listCourses(query?: TeacherCourseQuery): Promise<TeacherCourseSummary[]> {
        if (env.useMockBff) return mockBff.getTeacherCourses(query);
        return request<TeacherCourseSummary[]>("/teacher/courses", { query });
    },

    createCourse(input: CourseUpsertRequest): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.createTeacherCourse(input);
        return request<TeacherCourseDetails>("/teacher/courses", { method: "POST", body: input });
    },

    getCourse(courseId: number): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.getTeacherCourse(courseId);
        return request<TeacherCourseDetails>(`/teacher/courses/${courseId}`);
    },

    updateCourse(courseId: number, input: CourseUpsertRequest): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.updateTeacherCourse(courseId, input);
        return request<TeacherCourseDetails>(`/teacher/courses/${courseId}`, { method: "PUT", body: input });
    },

    publishCourse(courseId: number): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.publishTeacherCourse(courseId);
        return request<TeacherCourseDetails>(`/teacher/courses/${courseId}/publish`, { method: "POST" });
    },

    archiveCourse(courseId: number): Promise<TeacherCourseDetails> {
        if (env.useMockBff) return mockBff.archiveTeacherCourse(courseId);
        return request<TeacherCourseDetails>(`/teacher/courses/${courseId}/archive`, { method: "POST" });
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

    createItem(moduleId: number, input: CourseItemUpsertRequest): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.createItem(moduleId, input);
        return request<TeacherItemDetails>(`/teacher/modules/${moduleId}/items`, { method: "POST", body: input });
    },

    getItem(itemId: number): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.getItem(itemId);
        return request<TeacherItemDetails>(`/teacher/items/${itemId}`);
    },

    updateItem(itemId: number, input: CourseItemUpsertRequest): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.updateItem(itemId, input);
        return request<TeacherItemDetails>(`/teacher/items/${itemId}`, { method: "PUT", body: input });
    },

    deleteItem(itemId: number): Promise<void> {
        if (env.useMockBff) return mockBff.deleteItem(itemId);
        return request<void>(`/teacher/items/${itemId}`, { method: "DELETE" });
    },

    reorderItems(moduleId: number, input: ReorderItemsRequest): Promise<CourseModuleSummary> {
        if (env.useMockBff) return mockBff.reorderItems(moduleId, input);
        return request<CourseModuleSummary>(`/teacher/modules/${moduleId}/items/reorder`, { method: "PUT", body: input });
    },

    replaceContentBlocks(itemId: number, blocks: ContentBlockUpsertRequest[]): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.replaceContentBlocks(itemId, blocks);
        return request<TeacherItemDetails>(`/teacher/items/${itemId}/content-blocks`, { method: "PUT", body: blocks });
    },

    replaceHints(itemId: number, hints: HintUpsertRequest[]): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.replaceHints(itemId, hints);
        return request<TeacherItemDetails>(`/teacher/items/${itemId}/hints`, { method: "PUT", body: hints });
    },

    replaceTestCases(itemId: number, testCases: TestCaseUpsertRequest[]): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.replaceTestCases(itemId, testCases);
        return request<TeacherItemDetails>(`/teacher/items/${itemId}/test-cases`, { method: "PUT", body: testCases });
    },

    replaceOptions(itemId: number, options: QuizOptionUpsertRequest[]): Promise<TeacherItemDetails> {
        if (env.useMockBff) return mockBff.replaceOptions(itemId, options);
        return request<TeacherItemDetails>(`/teacher/items/${itemId}/options`, { method: "PUT", body: options });
    },
};

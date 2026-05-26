import { describe, expect, it } from "vitest";
import { ApiError } from "../src/api/apiError";
import type { CourseModuleSummary } from "../src/api/bffContracts";
import { normalizeCourseModuleSummary, unwrapListResponse } from "../src/api/responseParsing";

describe("BFF response parsing", () => {
    it("accepts the current production course list shape", () => {
        expect(unwrapListResponse<{ id: number }>({ courses: [{ id: 1 }] }, "Каталог курсов")).toEqual([{ id: 1 }]);
    });

    it("accepts paginated and Spring page list shapes", () => {
        expect(unwrapListResponse<{ id: number }>({ items: [{ id: 1 }] }, "Каталог курсов")).toEqual([{ id: 1 }]);
        expect(unwrapListResponse<{ id: number }>({ content: [{ id: 2 }] }, "Каталог курсов")).toEqual([{ id: 2 }]);
    });

    it("fails with a concrete API error instead of a runtime slice crash", () => {
        expect(() => unwrapListResponse({ courses: null }, "Каталог курсов")).toThrow(ApiError);
        expect(() => unwrapListResponse({ courses: null }, "Каталог курсов")).toThrow(/неподдерживаемый формат данных/i);
    });

    it("infers module deadline type from legacy payload fields", () => {
        const fixedDateModule = normalizeCourseModuleSummary({
            id: 10,
            title: "SQL",
            orderIndex: 1,
            deadlineAt: "2026-06-01T23:59:00",
            items: null,
        } as unknown as CourseModuleSummary);

        const timedModule = normalizeCourseModuleSummary({
            id: 11,
            title: "Control",
            orderIndex: 2,
            timeLimitMinutes: 120,
            items: [],
        } as unknown as CourseModuleSummary);

        expect(fixedDateModule.deadlineType).toBe("ABSOLUTE");
        expect(fixedDateModule.items).toEqual([]);
        expect(timedModule.deadlineType).toBe("RELATIVE_FROM_START");
    });
});

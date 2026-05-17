import { describe, expect, it } from "vitest";
import { ApiError } from "../src/api/apiError";
import { unwrapListResponse } from "../src/api/responseParsing";

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
});

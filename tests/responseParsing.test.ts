import { describe, expect, it } from "vitest";
import { ApiError } from "../src/api/apiError";
import type { CourseModuleSummary } from "../src/api/bffContracts";
import { normalizeCourseLeaderboard } from "../src/api/services/learningApi";
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

    it("does not expose email values as leaderboard display names", () => {
        const leaderboard = normalizeCourseLeaderboard({
            courseId: 1,
            top: [
                { place: 1, nickname: "student@example.com", progressPercent: 90 },
                { place: 2, nickname: "student_nick", progressPercent: 80 },
            ],
            currentUser: null,
        } as unknown as Parameters<typeof normalizeCourseLeaderboard>[0]);

        expect(leaderboard.top[0].fullName).toBeNull();
        expect(leaderboard.top[1].fullName).toBe("student_nick");
    });

    it("normalizes nested leaderboard profile avatars", () => {
        const leaderboard = normalizeCourseLeaderboard({
            courseId: 1,
            top: [
                {
                    userId: 7,
                    rank: 1,
                    user: {
                        fullName: "Ada Lovelace",
                        avatarUrl: "/api/v1/avatar-files/7.png",
                    },
                    progressPercent: 100,
                },
            ],
            currentUser: null,
        } as unknown as Parameters<typeof normalizeCourseLeaderboard>[0]);

        expect(leaderboard.top[0]).toMatchObject({
            userId: 7,
            fullName: "Ada Lovelace",
            avatarUrl: "/api/v1/avatar-files/7.png",
        });
    });
});

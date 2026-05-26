import { ApiError } from "./apiError";
import type { CourseItemSummary, CourseModuleSummary, ModuleDeadlineType } from "./bffContracts";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function readArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? value as T[] : [];
}

export function normalizeCourseModuleSummary(module: CourseModuleSummary): CourseModuleSummary {
    const deadlineAt = module.deadlineAt ?? null;
    const timeLimitMinutes = module.timeLimitMinutes ?? null;
    const deadlineType = (module.deadlineType ?? (deadlineAt ? "ABSOLUTE" : timeLimitMinutes !== null ? "RELATIVE_FROM_START" : "NONE")) as ModuleDeadlineType;

    return {
        ...module,
        deadlineType,
        deadlineAt,
        timeLimitMinutes,
        items: readArray<CourseItemSummary>(module.items),
    };
}

export function unwrapListResponse<T>(response: unknown, label: string, keys: string[] = ["items", "content", "courses", "data"]): T[] {
    if (Array.isArray(response)) return response as T[];

    if (isRecord(response)) {
        for (const key of keys) {
            const value = response[key];
            if (Array.isArray(value)) return value as T[];
        }
    }

    throw new ApiError(
        `${label}: сервер вернул неподдерживаемый формат данных. Ожидался массив или поле ${keys.map((key) => `${key}[]`).join(", ")}.`,
        0,
        [],
        "UNEXPECTED_RESPONSE_SHAPE"
    );
}

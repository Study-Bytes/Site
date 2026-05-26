import type { CourseModuleSummary, ModuleDeadlineStatus, ModuleDeadlineType, ModuleUpsertRequest } from "../api/bffContracts";

const startStoragePrefix = "studybytes_module_started_at";

export function moduleStartStorageKey(courseId: number, moduleId: number) {
    return `${startStoragePrefix}:${courseId}:${moduleId}`;
}

export function getStoredModuleStartedAt(courseId: number, moduleId: number) {
    return localStorage.getItem(moduleStartStorageKey(courseId, moduleId));
}

export function storeModuleStartedAt(courseId: number, moduleId: number, startedAt: string) {
    localStorage.setItem(moduleStartStorageKey(courseId, moduleId), startedAt);
}

export function addMinutesToDateTime(value: string, minutes: number) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    date.setMinutes(date.getMinutes() + minutes);
    const pad = (part: number) => String(part).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function effectiveModuleDeadlineAt(module: CourseModuleSummary, startedAt?: string | null) {
    if (module.deadlineType === "ABSOLUTE") return module.deadlineAt;
    if (module.deadlineType === "RELATIVE_FROM_START" && startedAt && module.timeLimitMinutes) {
        return addMinutesToDateTime(startedAt, module.timeLimitMinutes);
    }
    return null;
}

export function normalizeModuleDraft(input: ModuleUpsertRequest): ModuleUpsertRequest {
    const deadlineType = input.deadlineType ?? "NONE";
    const base = {
        title: input.title.trim(),
        orderIndex: Number(input.orderIndex),
        deadlineType,
    };

    if (deadlineType === "ABSOLUTE") {
        return { ...base, deadlineAt: input.deadlineAt || null, timeLimitMinutes: null };
    }

    if (deadlineType === "RELATIVE_FROM_START") {
        return { ...base, deadlineAt: null, timeLimitMinutes: input.timeLimitMinutes === null || input.timeLimitMinutes === undefined ? null : Number(input.timeLimitMinutes) };
    }

    return { ...base, deadlineAt: null, timeLimitMinutes: null };
}

export function deadlineTypeLabel(type: ModuleDeadlineType, isRu: boolean) {
    if (type === "ABSOLUTE") return isRu ? "Конкретная дата" : "Fixed date";
    if (type === "RELATIVE_FROM_START") return isRu ? "Таймер от старта" : "Timer from start";
    return isRu ? "Без дедлайна" : "No deadline";
}

export function deadlineStatusLabel(status: ModuleDeadlineStatus, isRu: boolean) {
    const labels: Record<ModuleDeadlineStatus, { ru: string; en: string }> = {
        IN_PROGRESS_ON_TIME: { ru: "В процессе, дедлайн еще не прошел", en: "In progress, before deadline" },
        OVERDUE: { ru: "Просрочено", en: "Overdue" },
        COMPLETED_ON_TIME: { ru: "Завершено вовремя", en: "Completed on time" },
        COMPLETED_LATE: { ru: "Завершено после дедлайна", en: "Completed late" },
    };
    return isRu ? labels[status].ru : labels[status].en;
}

export function deadlineStatusColor(status: ModuleDeadlineStatus) {
    if (status === "COMPLETED_ON_TIME") return "success" as const;
    if (status === "OVERDUE" || status === "COMPLETED_LATE") return "error" as const;
    return "primary" as const;
}

export function formatDateTime(value: string | null | undefined, locale: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

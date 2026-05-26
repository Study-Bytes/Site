import type { CourseAccessType, CourseDifficulty, CourseItemType, CourseStatus } from "../api/bffContracts";

const statusLabel: Record<CourseStatus, { ru: string; en: string }> = {
    DRAFT: { ru: "Черновик", en: "Draft" },
    PENDING_REVIEW: { ru: "На модерации", en: "Pending review" },
    CHANGES_REQUESTED: { ru: "Нужны правки", en: "Changes requested" },
    PUBLISHED: { ru: "Опубликован", en: "Published" },
    ARCHIVED: { ru: "В архиве", en: "Archived" },
};

const difficultyLabel: Record<CourseDifficulty, { ru: string; en: string }> = {
    BEGINNER: { ru: "Начальный", en: "Beginner" },
    INTERMEDIATE: { ru: "Средний", en: "Intermediate" },
    ADVANCED: { ru: "Продвинутый", en: "Advanced" },
};

const accessLabel: Record<CourseAccessType, { ru: string; en: string }> = {
    PUBLIC: { ru: "Публичный", en: "Public" },
    UNLISTED: { ru: "По ссылке", en: "Unlisted" },
    PRIVATE: { ru: "Приватный", en: "Private" },
};

const itemLabel: Record<CourseItemType, { ru: string; en: string }> = {
    THEORY: { ru: "Теория", en: "Theory" },
    QUIZ: { ru: "Квиз", en: "Quiz" },
    CODING: { ru: "Код", en: "Coding" },
    SQL: { ru: "SQL", en: "SQL" },
    FILE: { ru: "Файл", en: "File" },
};

export function courseStatusLabel(status: CourseStatus, isRu: boolean) {
    return isRu ? statusLabel[status].ru : statusLabel[status].en;
}

export function courseDifficultyLabel(difficulty: CourseDifficulty, isRu: boolean) {
    return isRu ? difficultyLabel[difficulty].ru : difficultyLabel[difficulty].en;
}

export function courseAccessLabel(accessType: CourseAccessType, isRu: boolean) {
    return isRu ? accessLabel[accessType].ru : accessLabel[accessType].en;
}

export function courseItemTypeLabel(itemType: CourseItemType, isRu: boolean) {
    return isRu ? itemLabel[itemType].ru : itemLabel[itemType].en;
}

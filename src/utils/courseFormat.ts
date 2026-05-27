import type { CourseDetails } from "../api/bffContracts";

export function formatDuration(minutes: number | null | undefined, isRu = false) {
    if (!minutes || minutes <= 0) return isRu ? "Без ограничения" : "Flexible";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return isRu ? `${remainingMinutes} мин` : `${remainingMinutes} min`;
    if (remainingMinutes === 0) return isRu ? `${hours} ч` : `${hours} h`;
    return isRu ? `${hours} ч ${remainingMinutes} мин` : `${hours} h ${remainingMinutes} min`;
}

export function getCourseModuleCount(course: Pick<CourseDetails, "modules">) {
    return course.modules.length;
}

export function getCourseItemCount(course: Pick<CourseDetails, "modules">) {
    return course.modules.reduce((total, module) => total + module.items.length, 0);
}

export function parseRouteCourseId(value: string | undefined) {
    if (!value) return null;
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

import type { CourseStatus } from "../api/bffContracts";

const courseStatuses: CourseStatus[] = ["DRAFT", "PENDING_REVIEW", "CHANGES_REQUESTED", "PUBLISHED", "ARCHIVED"];

function normalizeStatusKey(status: CourseStatus | string | null | undefined): string {
    return String(status ?? "").trim().replace(/[\s-]+/g, "_").toUpperCase();
}

export function normalizeCourseStatus(status: CourseStatus | string): CourseStatus {
    const normalized = normalizeStatusKey(status);
    return courseStatuses.includes(normalized as CourseStatus) ? normalized as CourseStatus : status as CourseStatus;
}

export function isPendingReviewStatus(status: CourseStatus | string | null | undefined): boolean {
    return normalizeStatusKey(status) === "PENDING_REVIEW";
}

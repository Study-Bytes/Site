import { Chip } from "@mui/material";
import type { CourseStatus } from "../../api/bffContracts";
import { useI18n } from "../../i18n/useI18n";
import { courseStatusLabel } from "../../utils/courseLabels";

const statusColor: Record<CourseStatus, "default" | "success" | "warning" | "info" | "error"> = {
    DRAFT: "warning",
    PENDING_REVIEW: "info",
    CHANGES_REQUESTED: "error",
    PUBLISHED: "success",
    ARCHIVED: "default",
};

export function StatusBadge({ status }: { status: CourseStatus }) {
    const { locale } = useI18n();
    return <Chip size="small" label={courseStatusLabel(status, locale === "ru")} color={statusColor[status]} sx={{ fontWeight: 800 }} />;
}

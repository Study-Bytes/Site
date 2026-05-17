import { Chip } from "@mui/material";
import type { CourseStatus } from "../../api/bffContracts";

const statusColor: Record<CourseStatus, "default" | "success" | "warning" | "info" | "error"> = {
    DRAFT: "warning",
    PENDING_REVIEW: "info",
    CHANGES_REQUESTED: "error",
    PUBLISHED: "success",
    ARCHIVED: "default",
};

const statusLabel: Record<CourseStatus, string> = {
    DRAFT: "Draft",
    PENDING_REVIEW: "Pending review",
    CHANGES_REQUESTED: "Changes requested",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
};

export function StatusBadge({ status }: { status: CourseStatus }) {
    return <Chip size="small" label={statusLabel[status]} color={statusColor[status]} sx={{ fontWeight: 800 }} />;
}

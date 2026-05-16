import { Chip } from "@mui/material";
import type { CourseStatus } from "../../api/bffContracts";

const statusColor: Record<CourseStatus, "default" | "success" | "warning"> = {
    DRAFT: "warning",
    PUBLISHED: "success",
    ARCHIVED: "default",
};

export function StatusBadge({ status }: { status: CourseStatus }) {
    return <Chip size="small" label={status} color={statusColor[status]} sx={{ fontWeight: 800 }} />;
}

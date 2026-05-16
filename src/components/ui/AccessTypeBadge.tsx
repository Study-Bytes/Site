import { Chip } from "@mui/material";
import type { CourseAccessType } from "../../api/bffContracts";

const accessLabel: Record<CourseAccessType, string> = {
    PUBLIC: "Public",
    UNLISTED: "Unlisted",
    PRIVATE: "Private",
};

export function AccessTypeBadge({ accessType }: { accessType: CourseAccessType }) {
    return <Chip size="small" variant="outlined" label={accessLabel[accessType]} sx={{ fontWeight: 800 }} />;
}

import { Chip } from "@mui/material";
import type { CourseAccessType } from "../../api/bffContracts";
import { useI18n } from "../../i18n/useI18n";
import { courseAccessLabel } from "../../utils/courseLabels";

export function AccessTypeBadge({ accessType }: { accessType: CourseAccessType }) {
    const { locale } = useI18n();
    return <Chip size="small" variant="outlined" label={courseAccessLabel(accessType, locale === "ru")} sx={{ fontWeight: 800 }} />;
}

import { Chip } from "@mui/material";
import type { CourseItemType } from "../../api/bffContracts";
import { useI18n } from "../../i18n/useI18n";
import { courseItemTypeLabel } from "../../utils/courseLabels";

const itemColor: Record<CourseItemType, "default" | "primary" | "secondary" | "info" | "success"> = {
    THEORY: "default",
    QUIZ: "secondary",
    CODING: "primary",
    SQL: "info",
    FILE: "success",
};

export function ItemTypeBadge({ itemType }: { itemType: CourseItemType }) {
    const { locale } = useI18n();
    return <Chip size="small" color={itemColor[itemType]} label={courseItemTypeLabel(itemType, locale === "ru")} sx={{ fontWeight: 800 }} />;
}

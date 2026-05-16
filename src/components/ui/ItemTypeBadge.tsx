import { Chip } from "@mui/material";
import type { CourseItemType } from "../../api/bffContracts";

const itemColor: Record<CourseItemType, "default" | "primary" | "secondary" | "info" | "success"> = {
    THEORY: "default",
    QUIZ: "secondary",
    CODING: "primary",
    SQL: "info",
    FILE: "success",
};

export function ItemTypeBadge({ itemType }: { itemType: CourseItemType }) {
    return <Chip size="small" color={itemColor[itemType]} label={itemType} sx={{ fontWeight: 800 }} />;
}

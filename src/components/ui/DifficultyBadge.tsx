import { Chip } from "@mui/material";
import type { CourseDifficulty } from "../../api/bffContracts";
import { useI18n } from "../../i18n/useI18n";
import { courseDifficultyLabel } from "../../utils/courseLabels";

const difficultyColor: Record<CourseDifficulty, "success" | "warning" | "error"> = {
    BEGINNER: "success",
    INTERMEDIATE: "warning",
    ADVANCED: "error",
};

export function DifficultyBadge({ difficulty }: { difficulty: CourseDifficulty }) {
    const { locale } = useI18n();
    return <Chip size="small" label={courseDifficultyLabel(difficulty, locale === "ru")} color={difficultyColor[difficulty]} sx={{ fontWeight: 800 }} />;
}

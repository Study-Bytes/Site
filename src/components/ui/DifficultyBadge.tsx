import { Chip } from "@mui/material";
import type { CourseDifficulty } from "../../api/bffContracts";

const difficultyColor: Record<CourseDifficulty, "success" | "warning" | "error"> = {
    BEGINNER: "success",
    INTERMEDIATE: "warning",
    ADVANCED: "error",
};

export function DifficultyBadge({ difficulty }: { difficulty: CourseDifficulty }) {
    return <Chip size="small" label={difficulty} color={difficultyColor[difficulty]} sx={{ fontWeight: 800 }} />;
}

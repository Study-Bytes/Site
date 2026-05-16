import { Box, Button, Card, CardContent, CardMedia, Stack, Typography } from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { Link as RouterLink } from "react-router-dom";
import type { CourseCatalogItem } from "../../api/bffContracts";
import { DifficultyBadge } from "../ui/DifficultyBadge";
import { AccessTypeBadge } from "../ui/AccessTypeBadge";

function formatDuration(minutes: number | null) {
    if (!minutes) return "Flexible pace";
    if (minutes < 60) return `${minutes} min`;
    return `${Math.round(minutes / 60)} h`;
}

export function CourseCard({ course }: { course: CourseCatalogItem }) {
    return (
        <Card variant="outlined" sx={{ height: "100%", borderRadius: 4, overflow: "hidden" }}>
            {course.coverImageUrl ? (
                <CardMedia component="img" height="164" image={course.coverImageUrl} alt={course.title} />
            ) : (
                <Box sx={{ height: 164, bgcolor: "#f0ecf9" }} />
            )}
            <CardContent>
                <Stack spacing={2} sx={{ height: "100%" }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <DifficultyBadge difficulty={course.difficulty} />
                        <AccessTypeBadge accessType={course.accessType} />
                    </Stack>

                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                            {course.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
                            {course.shortDescription}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary" }}>
                        <AccessTimeRoundedIcon fontSize="small" />
                        <Typography variant="body2">{formatDuration(course.estimatedMinutes)}</Typography>
                    </Stack>

                    <Button
                        component={RouterLink}
                        to={`/courses/${course.id}`}
                        variant={course.enrollmentEnabled ? "contained" : "outlined"}
                        sx={{ borderRadius: 999, fontWeight: 900, mt: "auto" }}
                    >
                        {course.enrollmentEnabled ? "View course" : "Enrollment disabled"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

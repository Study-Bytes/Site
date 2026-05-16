import { Box, Button, Card, CardContent, CardMedia, Chip, Divider, Stack, Typography } from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { Link as RouterLink } from "react-router-dom";
import type { CourseCatalogItem } from "../../api/bffContracts";
import { formatDuration } from "../../utils/courseFormat";
import { DifficultyBadge } from "../ui/DifficultyBadge";

export function CourseCard({ course, compact = false }: { course: CourseCatalogItem; compact?: boolean }) {
    const accessLabel = course.accessType === "PUBLIC" ? "Free Access" : course.accessType;

    return (
        <Card
            variant="outlined"
            sx={{
                height: "100%",
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "background.paper",
                transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                "&:hover": {
                    transform: { md: "translateY(-4px)" },
                    boxShadow: "0 18px 42px rgba(30, 25, 70, 0.10)",
                    borderColor: "rgba(53,37,205,0.34)",
                },
            }}
        >
            <Box sx={{ position: "relative" }}>
                {course.coverImageUrl ? (
                    <CardMedia component="img" height={compact ? "132" : "180"} image={course.coverImageUrl} alt={course.title} sx={{ objectFit: "cover" }} />
                ) : (
                    <Box
                        sx={{
                            height: compact ? 132 : 180,
                            background:
                                "radial-gradient(circle at 20% 20%, rgba(53,37,205,0.28), transparent 28%), radial-gradient(circle at 80% 10%, rgba(113,42,226,0.22), transparent 30%), linear-gradient(135deg, #f8f4ff 0%, #e8e1ff 100%)",
                        }}
                    />
                )}
                <Chip
                    size="small"
                    icon={course.accessType === "PRIVATE" ? <LockOutlinedIcon /> : undefined}
                    label={accessLabel}
                    sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        fontWeight: 900,
                        backgroundColor: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(12px)",
                    }}
                />
            </Box>

            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: compact ? 2 : 2.4 }}>
                <Stack spacing={1.8} sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <DifficultyBadge difficulty={course.difficulty} />
                        <Stack direction="row" spacing={0.7} alignItems="center" sx={{ color: "text.secondary" }}>
                            <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {formatDuration(course.estimatedMinutes)}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 950, letterSpacing: -0.2 }}>
                            {course.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.85, lineHeight: 1.65 }}>
                            {course.shortDescription}
                        </Typography>
                    </Box>

                    <Divider sx={{ mt: "auto" }} />

                    <Stack direction="row" spacing={0.8} alignItems="center" sx={{ color: course.enrollmentEnabled ? "primary.main" : "text.secondary" }}>
                        {course.enrollmentEnabled ? <PlayCircleOutlineRoundedIcon sx={{ fontSize: 17 }} /> : <LockOutlinedIcon sx={{ fontSize: 17 }} />}
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {course.enrollmentEnabled ? "Open Enrollment" : "Enrollment Closed"}
                        </Typography>
                    </Stack>

                    <Button
                        component={RouterLink}
                        to={`/courses/${course.id}`}
                        variant="text"
                        endIcon={<ArrowForwardRoundedIcon />}
                        sx={{ fontWeight: 950, alignSelf: "flex-end", px: 0 }}
                    >
                        {course.enrollmentEnabled ? "Start" : "Details"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

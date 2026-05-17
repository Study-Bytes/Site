import { useState } from "react";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from "@mui/material";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../api/apiError";
import { teacherApi } from "../../api/services";
import { courseTemplates } from "../../templates/courseTemplates";
import type { CourseTemplate } from "../../templates/courseTemplates";
import { PageContainer } from "../../layouts/PageContainer";
import { useI18n } from "../../i18n/useI18n";

async function createFromTemplate(template: CourseTemplate) {
    const course = await teacherApi.createCourse({
        ...template.course,
        slug: `${template.course.slug}-${Date.now().toString(36)}`,
    });

    for (const moduleTemplate of template.modules) {
        const module = await teacherApi.createModule(course.id, { title: moduleTemplate.title, orderIndex: moduleTemplate.orderIndex });
        for (const itemTemplate of moduleTemplate.items) {
            const item = await teacherApi.createItem(module.id, itemTemplate.item);
            if (itemTemplate.contentBlocks?.length) await teacherApi.replaceContentBlocks(item.id, itemTemplate.contentBlocks);
            if (itemTemplate.hints?.length) await teacherApi.replaceHints(item.id, itemTemplate.hints);
            if (itemTemplate.testCases?.length) await teacherApi.replaceTestCases(item.id, itemTemplate.testCases);
            if (itemTemplate.options?.length) await teacherApi.replaceOptions(item.id, itemTemplate.options);
        }
    }

    return course;
}

function templateIcon(templateId: string) {
    if (templateId.includes("sql")) return <DataObjectRoundedIcon />;
    if (templateId.includes("quiz")) return <FactCheckRoundedIcon />;
    if (templateId.includes("coding")) return <CodeRoundedIcon />;
    return <AutoStoriesRoundedIcon />;
}

export default function TeacherCourseNewPage() {
    const navigate = useNavigate();
    const { t } = useI18n();
    const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async (template: CourseTemplate) => {
        setError(null);
        setIsCreating(true);
        try {
            const course = await createFromTemplate(template);
            navigate(`/teacher/courses/${course.id}/edit`);
        } catch (apiError) {
            setError(getErrorMessage(apiError, "Failed to create course from template"));
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 2,
                        overflow: "hidden",
                        background: (theme) =>
                            theme.palette.mode === "dark"
                                ? "linear-gradient(135deg, rgba(31,31,40,0.96), rgba(19,18,27,0.98))"
                                : "linear-gradient(135deg, #ffffff, #f4f0ff)",
                    }}
                >
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                        <Box sx={{ maxWidth: 760 }}>
                            <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 950 }}>
                                Teacher studio
                            </Typography>
                            <Typography variant="h2" sx={{ mt: 1 }}>{t("templates.title")}</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1.5, lineHeight: 1.65 }}>{t("templates.subtitle")}</Typography>
                        </Box>
                        <Button component={RouterLink} to="/teacher/courses/new/blank" variant="outlined" size="large">
                            {t("templates.blank")}
                        </Button>
                    </Stack>
                </Paper>

                {error ? <Alert severity="error">{error}</Alert> : null}

                <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 1.5 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 1.25,
                                    display: "grid",
                                    placeItems: "center",
                                    color: "primary.main",
                                    bgcolor: "rgba(53,37,205,0.09)",
                                }}
                            >
                                <ViewModuleRoundedIcon />
                            </Box>
                            <Box>
                            <Typography variant="h5">{t("templates.blank")}</Typography>
                                <Typography sx={{ color: "text.secondary" }}>{t("templates.blankDescription")}</Typography>
                            </Box>
                        </Stack>
                        <Button component={RouterLink} to="/teacher/courses/new/blank" variant="contained">{t("templates.blank")}</Button>
                    </Stack>
                </Paper>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
                    {courseTemplates.map((template) => {
                        const itemCount = template.modules.reduce((count, module) => count + module.items.length, 0);
                        return (
                            <Box key={template.id}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 3,
                                        borderRadius: 1.5,
                                        height: "100%",
                                        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                                        "&:hover": {
                                            transform: "translateY(-2px)",
                                            borderColor: "primary.main",
                                            boxShadow: (theme) => theme.palette.mode === "dark" ? "0 18px 42px rgba(0,0,0,0.24)" : "0 18px 42px rgba(53,37,205,0.12)",
                                        },
                                    }}
                                >
                                    <Stack spacing={2} height="100%">
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 1.25,
                                                display: "grid",
                                                placeItems: "center",
                                                color: "secondary.main",
                                                bgcolor: "rgba(113,42,226,0.1)",
                                            }}
                                        >
                                            {templateIcon(template.id)}
                                        </Box>
                                        <Box>
                                            <Typography variant="h5">{template.title}</Typography>
                                            <Typography sx={{ color: "text.secondary", mt: 1 }}>{template.description}</Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            <Chip label={`${template.modules.length} ${t("templates.modules")}`} />
                                            <Chip label={`${itemCount} ${t("templates.items")}`} />
                                        </Stack>
                                        <Box sx={{ flexGrow: 1 }} />
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                            <Button variant="outlined" onClick={() => setSelectedTemplate(template)}>{t("templates.preview")}</Button>
                                            <Button variant="contained" onClick={() => void handleCreate(template)} disabled={isCreating}>{isCreating ? t("templates.creating") : t("templates.create")}</Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </Box>
                        );
                    })}
                </Box>
            </Stack>

            <Dialog open={Boolean(selectedTemplate)} onClose={() => setSelectedTemplate(null)} fullWidth maxWidth="md">
                <DialogTitle>{selectedTemplate?.title}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography sx={{ color: "text.secondary" }}>{selectedTemplate?.description}</Typography>
                        <Typography variant="h6">{t("templates.previewTitle")}</Typography>
                        {selectedTemplate?.modules.map((module) => (
                            <Paper key={module.title} variant="outlined" sx={{ p: 2, borderRadius: 1.25 }}>
                                <Typography variant="h6">{module.title}</Typography>
                                <Stack spacing={0.75} sx={{ mt: 1 }}>
                                    {module.items.map((item) => <Typography key={`${module.title}-${item.item.title}`} variant="body2">{item.item.itemType}: {item.item.title}</Typography>)}
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedTemplate(null)}>{t("common.cancel")}</Button>
                    {selectedTemplate ? <Button variant="contained" onClick={() => void handleCreate(selectedTemplate)} disabled={isCreating}>{isCreating ? t("templates.creating") : t("templates.create")}</Button> : null}
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
}

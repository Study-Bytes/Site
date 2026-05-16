import { Accordion, AccordionDetails, AccordionSummary, Box, Button, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Link as RouterLink, useParams } from "react-router-dom";
import { FormSectionCard } from "../../components/ui/FormSectionCard";
import { ValidationErrorPanel } from "../../components/ui/ValidationErrorPanel";
import { PageContainer } from "../../layouts/PageContainer";
import type { ApiValidationError } from "../../api/bffContracts";

const validationErrors: ApiValidationError[] = [];

type Props = {
    mode?: "create" | "edit";
};

export default function TeacherCourseEditPage({ mode = "edit" }: Props) {
    const { courseId } = useParams();
    const title = mode === "create" ? "Create course" : `Edit course #${courseId}`;

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h2">{title}</Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1 }}>
                        Course editor skeleton matches CourseService admin fields and will call BFF teacher endpoints.
                    </Typography>
                </Box>

                <ValidationErrorPanel errors={validationErrors} />

                <FormSectionCard title="Course metadata" description="Fields supported by CourseService.">
                    <Stack spacing={2}>
                        <TextField label="Title" defaultValue="Java Core" />
                        <TextField label="Slug" defaultValue="java-core" />
                        <TextField label="Short description" defaultValue="Practical Java Core course" />
                        <TextField label="Description" multiline minRows={4} defaultValue="Full course description" />
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <TextField select label="Difficulty" defaultValue="BEGINNER" fullWidth>
                                <MenuItem value="BEGINNER">BEGINNER</MenuItem>
                                <MenuItem value="INTERMEDIATE">INTERMEDIATE</MenuItem>
                                <MenuItem value="ADVANCED">ADVANCED</MenuItem>
                            </TextField>
                            <TextField select label="Access type" defaultValue="PUBLIC" fullWidth>
                                <MenuItem value="PUBLIC">PUBLIC</MenuItem>
                                <MenuItem value="UNLISTED">UNLISTED</MenuItem>
                                <MenuItem value="PRIVATE">PRIVATE</MenuItem>
                            </TextField>
                        </Stack>
                        <TextField label="Cover image URL" defaultValue="/course-java.jpg" />
                        <TextField label="Estimated minutes" type="number" defaultValue={420} />
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Switch defaultChecked />
                            <Typography>Enrollment enabled</Typography>
                        </Stack>
                    </Stack>
                </FormSectionCard>

                <FormSectionCard title="Modules and items" description="Reorder and item editor flows will be implemented in the next page tasks.">
                    <Stack spacing={2}>
                        <Accordion defaultExpanded variant="outlined" sx={{ borderRadius: 1.25, "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                                <Typography sx={{ fontWeight: 900 }}>Module: Basics</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack spacing={1.5}>
                                    <Button component={RouterLink} to={`/teacher/courses/${courseId ?? "new"}/edit/items/5001`} variant="outlined">
                                        Edit item: Variables and types
                                    </Button>
                                    <Button variant="outlined">Add item</Button>
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                        <Button variant="outlined" sx={{ alignSelf: "flex-start" }}>
                            Add module
                        </Button>
                    </Stack>
                </FormSectionCard>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button variant="contained">Save</Button>
                    <Button variant="outlined">Publish Course</Button>
                    <Button variant="outlined" color="error">Archive Course</Button>
                </Stack>
            </Stack>
        </PageContainer>
    );
}

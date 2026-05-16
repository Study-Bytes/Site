import { Box, Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { FormSectionCard } from "../../components/ui/FormSectionCard";
import { PageContainer } from "../../layouts/PageContainer";

export default function TeacherItemEditorPage() {
    const { courseId, itemId } = useParams();

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h2">Item editor #{itemId}</Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1 }}>
                        Matches CourseItem model. `language` is a free string for CODING/SQL, not an enum.
                    </Typography>
                </Box>

                <FormSectionCard title="Basic settings">
                    <Stack spacing={2}>
                        <TextField label="Title" defaultValue="First coding task" />
                        <TextField select label="Item type" defaultValue="CODING">
                            <MenuItem value="THEORY">THEORY</MenuItem>
                            <MenuItem value="QUIZ">QUIZ</MenuItem>
                            <MenuItem value="CODING">CODING</MenuItem>
                            <MenuItem value="SQL">SQL</MenuItem>
                            <MenuItem value="FILE">FILE</MenuItem>
                        </TextField>
                        <TextField label="Order index" type="number" defaultValue={0} />
                        <TextField label="Statement" multiline minRows={4} defaultValue="Solve the task." />
                    </Stack>
                </FormSectionCard>

                <FormSectionCard title="Execution settings for CODING/SQL">
                    <Stack spacing={2}>
                        <TextField label="Language" helperText="Free string. Supported execution languages are decided by LearningService/CodeExecutorService." defaultValue="java" />
                        <TextField label="Starter code" multiline minRows={6} defaultValue={'public class Solution {\n}'} />
                        <TextField label="Solution code" multiline minRows={6} />
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <TextField label="timeLimitMs" type="number" defaultValue={2000} fullWidth />
                            <TextField label="memoryLimitMb" type="number" defaultValue={256} fullWidth />
                            <TextField label="outputLimitKb" type="number" defaultValue={128} fullWidth />
                        </Stack>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                            <FormControlLabel control={<Checkbox defaultChecked />} label="networkDisabled" />
                            <FormControlLabel control={<Checkbox defaultChecked />} label="readOnlyFs" />
                            <FormControlLabel control={<Checkbox defaultChecked />} label="normalizeLineEndings" />
                            <FormControlLabel control={<Checkbox defaultChecked />} label="trimTrailingWhitespaces" />
                        </Stack>
                    </Stack>
                </FormSectionCard>

                <FormSectionCard title="Content blocks, hints, tests and quiz options">
                    <Stack spacing={2}>
                        <TextField label="Content block type" defaultValue="TEXT" />
                        <TextField label="Content block textContent" multiline minRows={3} />
                        <TextField label="Hint text" multiline minRows={2} />
                        <TextField label="Test case key" defaultValue="sample-1" />
                        <TextField label="Test visibility" defaultValue="OPEN" />
                        <TextField label="Expected output" multiline minRows={2} />
                        <TextField label="Quiz option text" />
                    </Stack>
                </FormSectionCard>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button variant="contained">Save Item</Button>
                    <Button component={RouterLink} to={`/teacher/courses/${courseId}/edit`} variant="outlined">
                        Back to Course Editor
                    </Button>
                </Stack>
            </Stack>
        </PageContainer>
    );
}

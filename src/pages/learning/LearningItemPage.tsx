import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useParams } from "react-router-dom";
import { PageContainer } from "../../layouts/PageContainer";
import { studyBytesColors } from "../../theme/theme";

export default function LearningItemPage() {
    const { courseId, itemId } = useParams();

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h2">Task workspace</Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1 }}>
                        Course #{courseId}, item #{itemId}. Prepared for BFF item/submission endpoints.
                    </Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 5 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h5">Task statement</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1 }}>
                                The full learning item content will be returned by BFF. Hidden tests and expected outputs must never be exposed here directly.
                            </Typography>
                        </Box>
                        <TextField
                            multiline
                            minRows={12}
                            defaultValue={'public class Solution {\n    // write your code here\n}'}
                            sx={{
                                "& textarea": {
                                    fontFamily: "'Geist Mono', Consolas, monospace",
                                    color: "#f8f8f2",
                                },
                                "& .MuiInputBase-root": {
                                    bgcolor: studyBytesColors.codeSurface,
                                    color: "#f8f8f2",
                                },
                            }}
                        />
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button variant="outlined" startIcon={<PlayArrowRoundedIcon />}>
                                Run
                            </Button>
                            <Button variant="contained" startIcon={<SendRoundedIcon />}>
                                Submit
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Stack>
        </PageContainer>
    );
}

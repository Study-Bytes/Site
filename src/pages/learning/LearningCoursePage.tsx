import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Paper, Stack, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { PageContainer } from "../../layouts/PageContainer";

const mockModules = [
    {
        id: 1,
        title: "Module 1",
        items: [
            { id: 5001, title: "Theory lesson", itemType: "THEORY" as const },
            { id: 5002, title: "Quiz check", itemType: "QUIZ" as const },
            { id: 5003, title: "Coding task", itemType: "CODING" as const },
        ],
    },
];

export default function LearningCoursePage() {
    const { courseId } = useParams();

    return (
        <PageContainer>
            <Stack spacing={4}>
                <Box>
                    <Typography variant="h2">Learning workspace</Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1 }}>
                        Course #{courseId}. This route is prepared for BFF `GET /api/learn/courses/{courseId}`.
                    </Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 5 }}>
                    <Stack spacing={2}>
                        {mockModules.map((module) => (
                            <Accordion key={module.id} defaultExpanded variant="outlined" sx={{ borderRadius: 3, "&:before": { display: "none" } }}>
                                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                                    <Typography sx={{ fontWeight: 900 }}>{module.title}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack spacing={1}>
                                        {module.items.map((item) => (
                                            <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                                    <ItemTypeBadge itemType={item.itemType} />
                                                    <Typography sx={{ flexGrow: 1, fontWeight: 800 }}>{item.title}</Typography>
                                                    <Button component={RouterLink} to={`/learn/${courseId}/items/${item.id}`} size="small">
                                                        Open
                                                    </Button>
                                                </Stack>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Stack>
                </Paper>
            </Stack>
        </PageContainer>
    );
}

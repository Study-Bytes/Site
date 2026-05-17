import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Link as RouterLink, useParams } from "react-router-dom";
import { adminApi } from "../../api/services";
import type { TeacherCourseDetails } from "../../api/bffContracts";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ItemTypeBadge } from "../../components/ui/ItemTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PageContainer } from "../../layouts/PageContainer";
import { getCourseItemCount, getCourseModuleCount, parseRouteCourseId } from "../../utils/courseFormat";

export default function AdminCourseReviewPage() {
    const { courseId } = useParams();
    const parsedCourseId = parseRouteCourseId(courseId);
    const [course, setCourse] = useState<TeacherCourseDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [action, setAction] = useState<"approve" | "reject" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [reviewComment, setReviewComment] = useState("");

    const stats = useMemo(() => course ? { modules: getCourseModuleCount(course), items: getCourseItemCount(course) } : { modules: 0, items: 0 }, [course]);

    const load = useCallback(async () => {
        if (!parsedCourseId) {
            setError("Invalid course id");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            setCourse(await adminApi.getCourseReview(parsedCourseId));
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to load course review");
        } finally {
            setIsLoading(false);
        }
    }, [parsedCourseId]);

    useEffect(() => { void load(); }, [load]);

    const approve = async () => {
        if (!course) return;
        setAction("approve");
        setError(null);
        setSuccess(null);
        try {
            const updated = await adminApi.approveCourse(course.id);
            setCourse(updated);
            setSuccess("Course approved and published");
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to approve course");
        } finally {
            setAction(null);
        }
    };

    const reject = async () => {
        if (!course) return;
        setAction("reject");
        setError(null);
        setSuccess(null);
        try {
            const updated = await adminApi.rejectCourse(course.id, { reviewComment });
            setCourse(updated);
            setRejectOpen(false);
            setSuccess("Changes requested from teacher");
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to reject course");
        } finally {
            setAction(null);
        }
    };

    return (
        <PageContainer>
            <Stack spacing={3}>
                <Button component={RouterLink} to="/admin/courses/moderation" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }}>Back to queue</Button>
                {isLoading ? <LoadingState rows={4} /> : null}
                {error ? <ErrorState message={error} onRetry={load} /> : null}
                {success ? <Alert severity="success">{success}</Alert> : null}
                {!isLoading && !error && !course ? <EmptyState title="Course not found" description="The moderation target does not exist." /> : null}
                {course ? (
                    <>
                        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, background: "linear-gradient(135deg, rgba(53,37,205,0.10), rgba(113,42,226,0.08))", border: "1px solid", borderColor: "divider" }}>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><StatusBadge status={course.status} /></Stack>
                                <Typography variant="h2">{course.title}</Typography>
                                <Typography sx={{ color: "text.secondary", maxWidth: 900 }}>{course.description}</Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>Teacher: {course.createdByUserFullName ?? course.createdByUserEmail ?? course.createdByUserId}</Typography>
                                {course.reviewComment ? <Alert severity="warning">Previous review: {course.reviewComment}</Alert> : null}
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                    <Button variant="contained" color="success" startIcon={<CheckCircleRoundedIcon />} disabled={action !== null || course.status === "PUBLISHED"} onClick={() => void approve()}>Approve and publish</Button>
                                    <Button variant="outlined" color="error" startIcon={<CancelRoundedIcon />} disabled={action !== null} onClick={() => setRejectOpen(true)}>Request changes</Button>
                                </Stack>
                            </Stack>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                            <Stack spacing={2}>
                                <Typography variant="h5">Review checklist</Typography>
                                <Alert severity={stats.modules > 0 ? "success" : "warning"}>{stats.modules} modules</Alert>
                                <Alert severity={stats.items > 0 ? "success" : "warning"}>{stats.items} items</Alert>
                                <Alert severity={course.shortDescription ? "success" : "warning"}>Short description is present</Alert>
                                <Alert severity={course.description ? "success" : "warning"}>Full description is present</Alert>
                            </Stack>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                            <Stack spacing={2}>
                                <Typography variant="h5">Course content preview</Typography>
                                {course.modules.length === 0 ? <EmptyState title="No modules" description="This course has no module structure." /> : null}
                                {course.modules.slice().sort((a, b) => a.orderIndex - b.orderIndex).map((module) => (
                                    <Box key={module.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                                        <Typography variant="h6">{module.title}</Typography>
                                        <Stack spacing={1} sx={{ mt: 1 }}>
                                            {module.items.slice().sort((a, b) => a.orderIndex - b.orderIndex).map((item) => (
                                                <Stack key={item.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1, borderTop: "1px solid", borderColor: "divider" }}>
                                                    <ItemTypeBadge itemType={item.itemType} />
                                                    <Typography sx={{ fontWeight: 800 }}>{item.title}</Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </>
                ) : null}
            </Stack>

            <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Request changes</DialogTitle>
                <DialogContent>
                    <TextField label="Review comment" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} multiline minRows={4} fullWidth sx={{ mt: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
                    <Button color="error" variant="contained" disabled={action !== null || !reviewComment.trim()} onClick={() => void reject()}>Reject with comment</Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
}

import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";

export default function Footer() {
    const { locale, t } = useI18n();
    const year = new Date().getFullYear();
    const isRu = locale === "ru";

    return (
        <Box component="footer" sx={{ bgcolor: "#1b1b24", color: "#f3effc", mt: "auto" }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between">
                    <Box>
                        <Typography sx={{ fontWeight: 950, mb: 0.5 }}>StudyBytes</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.72 }}>
                            {isRu ? "Платформа для практического обучения программированию." : "Practical programming education platform."}
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button component={RouterLink} to="/courses" size="small" sx={{ color: "inherit" }}>
                            {t("nav.courses")}
                        </Button>
                        <Button component={RouterLink} to="/my-learning" size="small" sx={{ color: "inherit" }}>
                            {t("nav.myLearning")}
                        </Button>
                        <Button component={RouterLink} to="/teacher/courses" size="small" sx={{ color: "inherit" }}>
                            {t("nav.teacherCabinet")}
                        </Button>
                        <Button component={RouterLink} to="/privacy" size="small" sx={{ color: "inherit" }}>
                            {isRu ? "Конфиденциальность" : "Privacy"}
                        </Button>
                        <Button component={RouterLink} to="/terms" size="small" sx={{ color: "inherit" }}>
                            {isRu ? "Пользовательское соглашение" : "Terms"}
                        </Button>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.14)" }} />

                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                    (c) {year} StudyBytes. {isRu ? "Все права защищены." : "All rights reserved."}
                </Typography>
            </Container>
        </Box>
    );
}

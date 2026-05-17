import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { PageContainer } from "../../layouts/PageContainer";
import { useI18n } from "../../i18n/useI18n";

type HelpItemProps = {
    icon: ReactNode;
    title: string;
    description: string;
};

function HelpItem({ icon, title, description }: HelpItemProps) {
    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%" }}>
            <Stack spacing={1.4}>
                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 1.5,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                    }}
                >
                    {icon}
                </Box>
                <Typography variant="h6">{title}</Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.65 }}>{description}</Typography>
            </Stack>
        </Paper>
    );
}

export default function HelpPage() {
    const { locale } = useI18n();
    const isRu = locale === "ru";

    return (
        <PageContainer>
            <Stack spacing={4}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 2,
                        background: (theme) => (theme.palette.mode === "dark" ? "rgba(31,31,40,0.9)" : "linear-gradient(135deg, #ffffff, #f7f4ff)"),
                    }}
                >
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                        <Stack spacing={2} sx={{ maxWidth: 780 }}>
                            <Chip label={isRu ? "Поддержка" : "Support"} color="primary" sx={{ width: "fit-content", fontWeight: 900 }} />
                            <Box>
                                <Typography variant="h2">{isRu ? "Помощь" : "Help"}</Typography>
                                <Typography sx={{ color: "text.secondary", mt: 1.4, lineHeight: 1.7 }}>
                                    {isRu
                                        ? "Быстрые действия, если нужно открыть курсы, войти в аккаунт или сообщить о проблеме на сайте."
                                        : "Quick actions for opening courses, signing in, or reporting a Site issue."}
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                            <Button component={RouterLink} to="/courses" variant="contained" startIcon={<MenuBookRoundedIcon />}>
                                {isRu ? "К курсам" : "Browse courses"}
                            </Button>
                            <Button component={RouterLink} to="/login" variant="outlined" startIcon={<LoginRoundedIcon />}>
                                {isRu ? "Войти" : "Log in"}
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                        gap: 2,
                    }}
                >
                    <HelpItem
                        icon={<MenuBookRoundedIcon />}
                        title={isRu ? "Курсы и обучение" : "Courses and learning"}
                        description={
                            isRu
                                ? "Откройте каталог, выберите курс и войдите в аккаунт, чтобы записаться и решать задания."
                                : "Open the catalog, choose a course, and sign in to enroll and solve assignments."
                        }
                    />
                    <HelpItem
                        icon={<RefreshRoundedIcon />}
                        title={isRu ? "Если страница не открылась" : "If a page did not open"}
                        description={
                            isRu
                                ? "Обновите страницу. Если ошибка повторяется, пришлите адрес страницы, действие и текст ошибки."
                                : "Refresh the page. If the error repeats, send the page URL, action, and error text."
                        }
                    />
                    <HelpItem
                        icon={<HelpOutlineRoundedIcon />}
                        title={isRu ? "Преподавателям" : "For teachers"}
                        description={
                            isRu
                                ? "Преподаватель может создавать курсы сразу после регистрации. Публикация проходит модерацию администратора."
                                : "Teachers can create courses right after registration. Publication requires admin moderation."
                        }
                    />
                </Box>

                <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2 }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                        <Box>
                            <Typography variant="h5">{isRu ? "Связаться с поддержкой" : "Contact support"}</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 0.7 }}>
                                {isRu ? "Для обращения укажите email аккаунта и страницу, где возникла проблема." : "Include your account email and the page where the issue happened."}
                            </Typography>
                        </Box>
                        <Button component="a" href="mailto:support@study-byte.ru" variant="outlined" startIcon={<MailOutlineRoundedIcon />}>
                            support@study-byte.ru
                        </Button>
                    </Stack>
                </Paper>
            </Stack>
        </PageContainer>
    );
}

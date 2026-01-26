import { Box, Container, Typography, Stack, Button, IconButton, Divider } from "@mui/material";
import TelegramIcon from "@mui/icons-material/Telegram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { Icon28LogoVkOutline } from "@vkontakte/icons";
import MaxIcon from "icons/max.png";
export default function Footer() {
    return (
        <Box sx={{ mt: 8, bgcolor: "#0B1020", color: "rgba(255,255,255,0.92)" }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                >
                    <Box>
                        <Typography sx={{ fontWeight: 900, mb: 0.5 }}>StudyBytes</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75 }}>
                            Проект StudyBytes. Все права защищены.
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button size="small" sx={{ color: "rgba(255,255,255,0.88)" }}>
                            Пользовательское соглашение
                        </Button>
                        <Button size="small" sx={{ color: "rgba(255,255,255,0.88)" }}>
                            Политика конфиденциальности
                        </Button>
                        <Button size="small" sx={{ color: "rgba(255,255,255,0.88)" }}>
                            Контакты
                        </Button>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                        <IconButton aria-label="VK" sx={{ color: "rgba(255,255,255,0.9)" }}>
                            <Icon28LogoVkOutline />
                        </IconButton>
                        <IconButton aria-label="Telegram" sx={{ color: "rgba(255,255,255,0.9)" }}>
                            <TelegramIcon />
                        </IconButton>
                        <IconButton aria-label="YouTube" sx={{ color: "rgba(255,255,255,0.9)" }}>
                            <YouTubeIcon />
                        </IconButton>
                        <IconButton aria-label="Max" sx={{ color: "rgba(255,255,255,0.9)" }}>
                            <img
                                src={MaxIcon}
                                alt="max Icon"
                                style={{ width: 24, height: 24 }}
                            />
                        </IconButton>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.12)" }} />

                <Typography variant="caption" sx={{ opacity: 0.55 }}>
                    Наши соцсети — снизу справа. Поддержка и новости проекта.
                </Typography>
            </Container>
        </Box>
    );
}

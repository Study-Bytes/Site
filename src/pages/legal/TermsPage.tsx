import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { PageContainer } from "../../layouts/PageContainer";
import { useI18n } from "../../i18n/useI18n";

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <Stack spacing={1}>
            <Typography variant="h5">{title}</Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.75, whiteSpace: "pre-line" }}>{children}</Typography>
        </Stack>
    );
}

export default function TermsPage() {
    const { locale } = useI18n();
    const isRu = locale === "ru";

    return (
        <PageContainer>
            <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
                {isRu ? (
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h2">Пользовательское соглашение</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1 }}>Редакция от 17 мая 2026 года</Typography>
                        </Box>

                        <Section title="1. Предмет соглашения">
                            StudyBytes предоставляет пользователям доступ к образовательной платформе с курсами, теоретическими материалами, тестами и практическими заданиями по программированию.
                        </Section>

                        <Section title="2. Аккаунт">
                            Пользователь отвечает за достоверность данных, безопасность своего пароля и действия, совершённые через его аккаунт. Нельзя передавать доступ к аккаунту третьим лицам.
                        </Section>

                        <Section title="3. Роли пользователей">
                            Студенты проходят курсы и выполняют задания. Преподаватели могут создавать учебные материалы. Публикация курса для всех пользователей возможна только после модерации администратором.
                        </Section>

                        <Section title="4. Учебные материалы">
                            Пользователь сохраняет права на материалы, которые он создаёт, но предоставляет StudyBytes право хранить, показывать и обрабатывать эти материалы в рамках работы платформы.
                        </Section>

                        <Section title="5. Запрещённые действия">
                            Запрещено размещать незаконные материалы, нарушать права третьих лиц, пытаться получить несанкционированный доступ к аккаунтам или инфраструктуре, мешать работе платформы, обходить ограничения заданий и проверок.
                        </Section>

                        <Section title="6. Проверка заданий">
                            Результаты автоматической проверки используются для отображения прогресса и обратной связи. StudyBytes может ограничивать выполнение кода и другие действия в целях безопасности.
                        </Section>

                        <Section title="7. Модерация">
                            Администратор может одобрить курс, запросить изменения, скрыть или архивировать материал, если он нарушает правила платформы, содержит ошибки или не готов к публикации.
                        </Section>

                        <Section title="8. Ответственность">
                            Платформа предоставляется в текущем состоянии. StudyBytes стремится обеспечивать стабильную работу сервиса, но не гарантирует отсутствие перерывов, ошибок или потери доступа из-за технических работ.
                        </Section>

                        <Section title="9. Изменения">
                            StudyBytes может обновлять соглашение. Новая редакция публикуется на этой странице и применяется с момента публикации, если не указано иное.
                        </Section>
                    </Stack>
                ) : (
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h2">Terms of Use</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1 }}>Version dated May 17, 2026</Typography>
                        </Box>

                        <Section title="1. Scope">
                            StudyBytes provides access to an educational platform with courses, theory materials, quizzes and programming practice tasks.
                        </Section>

                        <Section title="2. Account">
                            Users are responsible for the accuracy of their data, password security and actions performed through their account.
                        </Section>

                        <Section title="3. User Roles">
                            Students take courses and complete tasks. Teachers can create learning materials. Courses become public only after administrator moderation.
                        </Section>

                        <Section title="4. Learning Materials">
                            Users keep rights to materials they create, while granting StudyBytes the right to store, display and process those materials as needed to operate the platform.
                        </Section>

                        <Section title="5. Prohibited Actions">
                            Users may not publish illegal content, infringe third-party rights, attempt unauthorized access, disrupt the platform, or bypass task and execution restrictions.
                        </Section>

                        <Section title="6. Task Checking">
                            Automated checking results are used for progress and feedback. StudyBytes may restrict code execution and other actions for security.
                        </Section>

                        <Section title="7. Moderation">
                            Administrators may approve, request changes, hide or archive content that violates platform rules, contains errors or is not ready for publication.
                        </Section>

                        <Section title="8. Liability">
                            The platform is provided as is. StudyBytes aims to keep the service stable but does not guarantee uninterrupted or error-free operation.
                        </Section>

                        <Section title="9. Changes">
                            StudyBytes may update these Terms. The new version is published on this page and applies from publication unless stated otherwise.
                        </Section>
                    </Stack>
                )}
            </Paper>
        </PageContainer>
    );
}

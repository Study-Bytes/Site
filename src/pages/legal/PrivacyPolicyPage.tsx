import { Box, Link, Paper, Stack, Typography } from "@mui/material";
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

export default function PrivacyPolicyPage() {
    const { locale } = useI18n();
    const isRu = locale === "ru";

    return (
        <PageContainer>
            <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
                {isRu ? (
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h2">Политика конфиденциальности</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1 }}>Редакция от 17 мая 2026 года</Typography>
                        </Box>

                        <Section title="1. Общие положения">
                            Настоящая Политика описывает, как StudyBytes обрабатывает персональные данные пользователей платформы. Политика подготовлена с учётом требований Федерального закона РФ от 27.07.2006 N 152-ФЗ «О персональных данных».
                        </Section>

                        <Section title="2. Оператор и контакты">
                            Оператор персональных данных: StudyBytes. По вопросам обработки персональных данных можно обратиться по адресу: privacy@study-byte.ru.
                        </Section>

                        <Section title="3. Какие данные обрабатываются">
                            StudyBytes может обрабатывать: имя, адрес электронной почты, роль пользователя, настройки профиля, язык интерфейса, сведения о прохождении курсов, ответы на задания, результаты проверок, технические данные сессии, cookie и похожие идентификаторы, необходимые для работы аккаунта и безопасности.
                        </Section>

                        <Section title="4. Цели обработки">
                            Данные используются для регистрации и входа в аккаунт, предоставления доступа к курсам, сохранения прогресса, проверки заданий, модерации учебных материалов, поддержки пользователей, обеспечения безопасности и выполнения обязанностей, предусмотренных применимым законодательством.
                        </Section>

                        <Section title="5. Правовые основания">
                            Обработка выполняется на основании согласия пользователя, исполнения пользовательского соглашения, законных интересов оператора по обеспечению безопасности сервиса, а также требований законодательства.
                        </Section>

                        <Section title="6. Передача данных">
                            Данные могут передаваться техническим подрядчикам, обеспечивающим работу платформы, только в объёме, необходимом для предоставления сервиса. StudyBytes не продаёт персональные данные пользователей.
                        </Section>

                        <Section title="7. Срок хранения">
                            Данные хранятся столько, сколько необходимо для целей обработки, работы аккаунта, выполнения требований закона и защиты прав StudyBytes и пользователей. Пользователь может запросить удаление аккаунта, если сохранение данных не требуется по закону.
                        </Section>

                        <Section title="8. Права пользователя">
                            Пользователь вправе запросить доступ к своим данным, их уточнение, блокирование или удаление, а также отозвать согласие на обработку персональных данных в случаях, предусмотренных законом.
                        </Section>

                        <Section title="9. Cookie">
                            Платформа использует cookie для авторизации, сохранения сессии, языка интерфейса и базовой безопасности. Отключение обязательных cookie может привести к невозможности входа в аккаунт.
                        </Section>

                        <Section title="10. Изменения политики">
                            StudyBytes может обновлять Политику. Новая редакция публикуется на этой странице и применяется с момента публикации, если не указано иное.
                        </Section>

                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Официальный текст закона доступен на правовых порталах, включая страницу Федерального закона N 152-ФЗ «О персональных данных».
                        </Typography>
                    </Stack>
                ) : (
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h2">Privacy Policy</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1 }}>Version dated May 17, 2026</Typography>
                        </Box>

                        <Section title="1. General">
                            This Policy explains how StudyBytes processes personal data of platform users. The Russian version is the primary version for users in the Russian Federation.
                        </Section>

                        <Section title="2. Controller and Contact">
                            Personal data controller: StudyBytes. Privacy contact: privacy@study-byte.ru.
                        </Section>

                        <Section title="3. Data We Process">
                            StudyBytes may process name, email, user role, profile settings, interface language, learning progress, task answers, submission results, session data, cookies and similar identifiers needed for account operation and security.
                        </Section>

                        <Section title="4. Purposes">
                            Data is used for account registration and login, course access, progress tracking, task checking, course moderation, support, security, and compliance with applicable law.
                        </Section>

                        <Section title="5. Legal Bases">
                            Processing is based on user consent, performance of the user agreement, legitimate security interests, and legal requirements where applicable.
                        </Section>

                        <Section title="6. Sharing">
                            Data may be shared with technical providers only as needed to operate the platform. StudyBytes does not sell user personal data.
                        </Section>

                        <Section title="7. Retention">
                            Data is stored as long as needed for platform operation, legal compliance, and protection of rights. Users may request account deletion unless retention is required by law.
                        </Section>

                        <Section title="8. User Rights">
                            Users may request access, correction, blocking or deletion of their data, and may withdraw consent where allowed by law.
                        </Section>

                        <Section title="9. Cookies">
                            The platform uses cookies for authentication, session persistence, language preferences and basic security. Disabling required cookies may prevent account login.
                        </Section>

                        <Section title="10. Updates">
                            StudyBytes may update this Policy. The new version is published on this page and applies from publication unless stated otherwise.
                        </Section>
                    </Stack>
                )}

                <Box sx={{ mt: 4 }}>
                    <Link href="mailto:privacy@study-byte.ru">privacy@study-byte.ru</Link>
                </Box>
            </Paper>
        </PageContainer>
    );
}

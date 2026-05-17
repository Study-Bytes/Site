import { Alert, Box, Link, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { PageContainer } from "../../layouts/PageContainer";
import { useI18n } from "../../i18n/useI18n";

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <Stack spacing={1}>
            <Typography variant="h5">{title}</Typography>
            <Typography component="div" sx={{ color: "text.secondary", lineHeight: 1.75 }}>
                {children}
            </Typography>
        </Stack>
    );
}

function BulletList({ items }: { items: string[] }) {
    return (
        <Box component="ul" sx={{ m: 0, pl: 2.4 }}>
            {items.map((item) => (
                <Typography key={item} component="li" sx={{ color: "text.secondary", lineHeight: 1.75 }}>
                    {item}
                </Typography>
            ))}
        </Box>
    );
}

function DataRow({ purpose, data, basis, term }: { purpose: string; data: string; basis: string; term: string }) {
    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
            <Stack spacing={0.8}>
                <Typography sx={{ fontWeight: 950 }}>{purpose}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    <b>Данные:</b> {data}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    <b>Основание:</b> {basis}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    <b>Срок:</b> {term}
                </Typography>
            </Stack>
        </Paper>
    );
}

export default function PrivacyPolicyPage() {
    const { locale } = useI18n();
    const isRu = locale === "ru";

    return (
        <PageContainer>
            <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
                {isRu ? (
                    <Stack spacing={3.2}>
                        <Box>
                            <Typography variant="h2">Политика обработки персональных данных</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1 }}>Редакция от 18 мая 2026 года</Typography>
                        </Box>

                        <Alert severity="info">
                            Политика подготовлена для сайта study-byte.ru с учетом Федерального закона от 27.07.2006 N 152-ФЗ «О персональных данных» и рекомендаций Роскомнадзора к структуре политики оператора. Для финального юридического использования нужно указать реальные реквизиты оператора: юридическое лицо или ИП, ИНН/ОГРН и адрес.
                        </Alert>

                        <Section title="1. Общие положения">
                            Настоящая Политика определяет порядок и условия обработки персональных данных пользователей платформы StudyBytes, доступной по адресу https://study-byte.ru, а также меры по обеспечению безопасности таких данных.
                            <br />
                            Политика применяется ко всем персональным данным, которые StudyBytes получает через сайт, формы регистрации, личный кабинет, учебные страницы, редактор курсов, обращения в поддержку и технические средства работы сервиса.
                        </Section>

                        <Section title="2. Оператор персональных данных">
                            Оператор персональных данных: StudyBytes, владелец сайта https://study-byte.ru.
                            <br />
                            Контакт для вопросов по обработке персональных данных: <Link href="mailto:privacy@study-byte.ru">privacy@study-byte.ru</Link>.
                            <br />
                            После оформления юридического лица или ИП на этой странице должны быть опубликованы полные реквизиты оператора.
                        </Section>

                        <Section title="3. Основные понятия">
                            Термины «персональные данные», «оператор», «обработка персональных данных», «предоставление персональных данных», «блокирование», «уничтожение», «обезличивание» и иные термины используются в значениях, установленных Федеральным законом N 152-ФЗ «О персональных данных».
                        </Section>

                        <Section title="4. Какие данные обрабатываются">
                            <BulletList
                                items={[
                                    "данные аккаунта: имя, адрес электронной почты, роль пользователя, статус аккаунта;",
                                    "настройки профиля: аватар, описание профиля, выбранный язык интерфейса;",
                                    "учебные данные: записи на курсы, прогресс, ответы на квизы, исходный код решений, SQL-запросы, результаты проверок, история попыток;",
                                    "данные преподавателя: созданные курсы, модули, уроки, тесты, подсказки, материалы, статусы модерации;",
                                    "данные администратора: действия по модерации курсов и комментарии к проверке;",
                                    "технические данные: IP-адрес, user-agent, дата и время запроса, URL страницы, идентификаторы сессии, cookie, requestId/correlationId для диагностики ошибок;",
                                    "данные обращений: адрес электронной почты, текст обращения и иные сведения, которые пользователь сам передает в поддержку.",
                                ]}
                            />
                        </Section>

                        <Section title="5. Цели, состав данных, основания и сроки обработки">
                            <Stack spacing={1.5}>
                                <DataRow
                                    purpose="Регистрация, вход и работа аккаунта"
                                    data="имя, email, роль, статус аккаунта, cookie сессии, технические данные"
                                    basis="согласие пользователя, исполнение пользовательского соглашения, обеспечение безопасности сервиса"
                                    term="на срок действия аккаунта и до удаления аккаунта, если более длительное хранение не требуется законом"
                                />
                                <DataRow
                                    purpose="Предоставление доступа к курсам и сохранение прогресса"
                                    data="записи на курсы, прогресс, ответы, решения, результаты проверок"
                                    basis="исполнение пользовательского соглашения и согласие пользователя"
                                    term="на срок действия аккаунта и разумный срок после его закрытия для защиты прав сторон"
                                />
                                <DataRow
                                    purpose="Создание и модерация курсов"
                                    data="данные преподавателя, учебные материалы, статусы модерации, комментарии администратора"
                                    basis="исполнение пользовательского соглашения, обеспечение качества и безопасности учебного контента"
                                    term="на срок публикации курса, хранения черновика или до удаления материалов в установленном порядке"
                                />
                                <DataRow
                                    purpose="Поддержка пользователей и диагностика ошибок"
                                    data="email, текст обращения, технические журналы, requestId, сведения об ошибке"
                                    basis="согласие пользователя, законный интерес оператора по поддержке и защите сервиса"
                                    term="до 36 месяцев с момента последнего обращения, если иной срок не требуется для защиты прав"
                                />
                            </Stack>
                        </Section>

                        <Section title="6. Действия с персональными данными">
                            StudyBytes может выполнять сбор, запись, систематизацию, накопление, хранение, уточнение, использование, передачу внутри инфраструктуры сервиса, обезличивание, блокирование, удаление и уничтожение персональных данных с использованием средств автоматизации и без них.
                        </Section>

                        <Section title="7. Cookie и технические идентификаторы">
                            Платформа использует обязательные cookie и аналогичные технологии для авторизации, сохранения сессии, защиты от несанкционированного доступа, выбора языка интерфейса и корректной работы сайта. Отключение обязательных cookie может привести к невозможности входа в аккаунт и прохождения курсов.
                            <br />
                            Если в будущем будут добавлены аналитические или рекламные cookie, они должны подключаться только после отдельного уведомления и получения согласия, когда это требуется законом.
                        </Section>

                        <Section title="8. Передача данных третьим лицам">
                            StudyBytes не продает персональные данные пользователей. Данные могут передаваться поставщикам технической инфраструктуры, хостинга, почтовых сервисов, средств мониторинга и иным подрядчикам только в объеме, необходимом для работы платформы, безопасности, поддержки пользователей и исполнения закона.
                            <br />
                            Передача государственным органам допускается в случаях и порядке, предусмотренных законодательством.
                        </Section>

                        <Section title="9. Трансграничная передача и локализация">
                            Персональные данные пользователей из Российской Федерации должны записываться, систематизироваться, накапливаться, храниться, уточняться и извлекаться с использованием баз данных, находящихся на территории Российской Федерации, если применимо к оператору и конкретному процессу обработки.
                            <br />
                            Трансграничная передача персональных данных не является обязательной частью работы StudyBytes. Если такая передача потребуется, она должна выполняться только при наличии правового основания и с соблюдением требований законодательства.
                        </Section>

                        <Section title="10. Защита персональных данных">
                            Оператор принимает необходимые правовые, организационные и технические меры для защиты персональных данных от неправомерного доступа, уничтожения, изменения, блокирования, копирования, предоставления, распространения и иных неправомерных действий.
                            <br />
                            К таким мерам относятся разграничение доступа, использование защищенных соединений, журналирование важных действий, контроль доступа к административным функциям, резервное копирование и обработка инцидентов безопасности.
                        </Section>

                        <Section title="11. Права пользователя">
                            Пользователь вправе:
                            <BulletList
                                items={[
                                    "получать сведения об обработке своих персональных данных;",
                                    "требовать уточнения, блокирования или уничтожения данных, если они являются неполными, устаревшими, неточными, незаконно полученными или не нужны для заявленной цели;",
                                    "отозвать согласие на обработку персональных данных;",
                                    "обжаловать действия или бездействие оператора в Роскомнадзор или суд;",
                                    "реализовывать иные права, предусмотренные законодательством о персональных данных.",
                                ]}
                            />
                        </Section>

                        <Section title="12. Как направить запрос">
                            Запросы по персональным данным направляются на <Link href="mailto:privacy@study-byte.ru">privacy@study-byte.ru</Link>. В запросе нужно указать email аккаунта, суть требования и сведения, позволяющие подтвердить связь с аккаунтом.
                            <br />
                            Ответ предоставляется в сроки, установленные законодательством. Если запрос требует дополнительной идентификации пользователя, StudyBytes может запросить дополнительные сведения, необходимые только для проверки права на обращение.
                        </Section>

                        <Section title="13. Удаление аккаунта">
                            Пользователь может запросить удаление аккаунта и связанных персональных данных. Часть данных может сохраняться на срок, необходимый для выполнения требований закона, предотвращения злоупотреблений, защиты прав пользователей и StudyBytes, а также подтверждения факта оказания услуг.
                        </Section>

                        <Section title="14. Изменение Политики">
                            StudyBytes может обновлять Политику. Новая редакция публикуется на этой странице и применяется с момента публикации, если в ней не указан иной срок вступления в силу. Пользователь должен периодически проверять актуальную редакцию Политики.
                        </Section>
                    </Stack>
                ) : (
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h2">Personal Data Processing Policy</Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1 }}>Version dated May 18, 2026</Typography>
                        </Box>

                        <Alert severity="info">
                            The Russian version is the primary version for users in the Russian Federation. Final legal publication requires the real controller details: legal entity or individual entrepreneur name, registration numbers and address.
                        </Alert>

                        <Section title="1. General">
                            This Policy explains how StudyBytes processes personal data on https://study-byte.ru for account registration, course access, learning progress, course creation, moderation, support, security and legal compliance.
                        </Section>

                        <Section title="2. Controller and Contact">
                            Personal data controller: StudyBytes, owner of https://study-byte.ru.
                            <br />
                            Privacy contact: <Link href="mailto:privacy@study-byte.ru">privacy@study-byte.ru</Link>.
                        </Section>

                        <Section title="3. Data We Process">
                            StudyBytes may process account data, email, name, user role, profile settings, language preference, enrollments, learning progress, quiz answers, submitted source code, SQL queries, execution results, teacher course materials, moderation comments, support requests, cookies, IP address, user-agent, timestamps and diagnostic request identifiers.
                        </Section>

                        <Section title="4. Purposes and Legal Bases">
                            Data is processed to register and authenticate users, provide courses, save progress, run and submit assignments, moderate course publications, provide support, secure the platform and comply with applicable law. Processing may be based on user consent, performance of the user agreement, platform security interests and legal requirements.
                        </Section>

                        <Section title="5. Cookies">
                            StudyBytes uses required cookies and similar identifiers for authentication, sessions, interface language and security. Disabling required cookies may prevent login and learning features from working.
                        </Section>

                        <Section title="6. Sharing and Storage">
                            StudyBytes does not sell personal data. Data may be shared with technical providers only as needed to operate the platform, ensure security, provide support or comply with law. Data is retained only as long as needed for the stated purposes, legal compliance and protection of rights.
                        </Section>

                        <Section title="7. User Rights">
                            Users may request information about processing, access, correction, blocking or deletion of personal data, withdraw consent where allowed by law, and contact the competent authority or court.
                        </Section>

                        <Section title="8. Requests and Updates">
                            Privacy requests can be sent to <Link href="mailto:privacy@study-byte.ru">privacy@study-byte.ru</Link>. StudyBytes may update this Policy by publishing a new version on this page.
                        </Section>
                    </Stack>
                )}
            </Paper>
        </PageContainer>
    );
}

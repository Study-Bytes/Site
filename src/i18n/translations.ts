export type Locale = "ru" | "en";

export type TranslationKey =
    | "nav.dashboard"
    | "nav.courses"
    | "nav.myLearning"
    | "nav.profile"
    | "nav.teacherCabinet"
    | "nav.teacherRequest"
    | "nav.adminRequests"
    | "nav.login"
    | "nav.register"
    | "nav.logout"
    | "nav.settings"
    | "nav.searchPlaceholder"
    | "nav.createCourse"
    | "common.retry"
    | "common.backHome"
    | "common.save"
    | "common.saving"
    | "common.loading"
    | "common.cancel"
    | "common.status"
    | "language.label"
    | "language.ru"
    | "language.en"
    | "profile.title"
    | "profile.subtitle"
    | "profile.accountDetails"
    | "profile.accountDescription"
    | "profile.security"
    | "profile.language"
    | "profile.languageDescription"
    | "profile.updated"
    | "teacherRequest.title"
    | "teacherRequest.subtitle"
    | "teacherRequest.motivation"
    | "teacherRequest.experience"
    | "teacherRequest.portfolioUrl"
    | "teacherRequest.preferredTopics"
    | "teacherRequest.submit"
    | "teacherRequest.statusTitle"
    | "teacherRequest.pending"
    | "teacherRequest.approved"
    | "teacherRequest.rejected"
    | "teacherRequest.cancelled"
    | "teacherRequest.adminTitle"
    | "teacherRequest.adminSubtitle"
    | "teacherRequest.noRequestsTitle"
    | "teacherRequest.noRequestsDescription"
    | "teacherRequest.topics"
    | "teacherRequest.approve"
    | "teacherRequest.reject"
    | "teacherRequest.reviewComment"
    | "errors.400.title"
    | "errors.400.description"
    | "errors.401.title"
    | "errors.401.description"
    | "errors.403.title"
    | "errors.403.description"
    | "errors.404.title"
    | "errors.404.description"
    | "errors.409.title"
    | "errors.409.description"
    | "errors.500.title"
    | "errors.500.description"
    | "errors.maintenance.title"
    | "errors.maintenance.description"
    | "templates.title"
    | "templates.subtitle"
    | "templates.blank"
    | "templates.blankDescription"
    | "templates.preview"
    | "templates.create"
    | "templates.creating"
    | "templates.modules"
    | "templates.items"
    | "templates.previewTitle";

export const defaultLocale: Locale = "ru";
export const supportedLocales: Locale[] = ["ru", "en"];

export const translations: Record<Locale, Record<TranslationKey, string>> = {
    ru: {
        "nav.dashboard": "Главная",
        "nav.courses": "Курсы",
        "nav.myLearning": "Моё обучение",
        "nav.profile": "Профиль",
        "nav.teacherCabinet": "Кабинет преподавателя",
        "nav.teacherRequest": "Стать преподавателем",
        "nav.adminRequests": "Заявки преподавателей",
        "nav.login": "Войти",
        "nav.register": "Регистрация",
        "nav.logout": "Выйти",
        "nav.settings": "Настройки",
        "nav.searchPlaceholder": "Искать курсы, навыки или темы...",
        "nav.createCourse": "Создать курс",
        "common.retry": "Повторить",
        "common.backHome": "На главную",
        "common.save": "Сохранить",
        "common.saving": "Сохранение...",
        "common.loading": "Загрузка...",
        "common.cancel": "Отмена",
        "common.status": "Статус",
        "language.label": "Язык",
        "language.ru": "Русский",
        "language.en": "English",
        "profile.title": "Профиль",
        "profile.subtitle": "Профиль и настройки аккаунта загружаются через BFF.",
        "profile.accountDetails": "Данные аккаунта",
        "profile.accountDescription": "Эти поля сохраняются через BFF profile/settings endpoints.",
        "profile.security": "Безопасность",
        "profile.language": "Язык интерфейса",
        "profile.languageDescription": "Выбор сохраняется в настройках аккаунта. Для гостей — в браузере.",
        "profile.updated": "Профиль обновлён.",
        "teacherRequest.title": "Заявка на роль преподавателя",
        "teacherRequest.subtitle": "Опиши опыт и темы, по которым хочешь создавать курсы. Администратор проверит заявку.",
        "teacherRequest.motivation": "Почему ты хочешь стать преподавателем?",
        "teacherRequest.experience": "Опыт преподавания или разработки",
        "teacherRequest.portfolioUrl": "Портфолио / GitHub / LinkedIn",
        "teacherRequest.preferredTopics": "Темы через запятую",
        "teacherRequest.submit": "Отправить заявку",
        "teacherRequest.statusTitle": "Текущая заявка",
        "teacherRequest.pending": "На рассмотрении",
        "teacherRequest.approved": "Одобрена",
        "teacherRequest.rejected": "Отклонена",
        "teacherRequest.cancelled": "Отменена",
        "teacherRequest.adminTitle": "Заявки преподавателей",
        "teacherRequest.adminSubtitle": "Проверяй заявки, оставляй комментарии и выдавай доступ к кабинету преподавателя.",
        "teacherRequest.noRequestsTitle": "Заявок пока нет",
        "teacherRequest.noRequestsDescription": "Новые заявки на роль преподавателя появятся здесь.",
        "teacherRequest.topics": "Темы",
        "teacherRequest.approve": "Одобрить",
        "teacherRequest.reject": "Отклонить",
        "teacherRequest.reviewComment": "Комментарий проверки",
        "errors.400.title": "Ошибка валидации",
        "errors.400.description": "Проверь введённые данные и попробуй снова.",
        "errors.401.title": "Сессия истекла",
        "errors.401.description": "Войди в аккаунт ещё раз, чтобы продолжить.",
        "errors.403.title": "Доступ запрещён",
        "errors.403.description": "У тебя нет прав для просмотра этой страницы.",
        "errors.404.title": "Страница не найдена",
        "errors.404.description": "Адрес неверный или страница была удалена.",
        "errors.409.title": "Конфликт данных",
        "errors.409.description": "Данные уже изменились. Обнови страницу и попробуй снова.",
        "errors.500.title": "Ошибка сервера",
        "errors.500.description": "BFF или один из сервисов временно недоступен.",
        "errors.maintenance.title": "Сервис недоступен",
        "errors.maintenance.description": "Платформа обновляется. Попробуй позже.",
        "templates.title": "Создать курс",
        "templates.subtitle": "Начни с пустого курса или выбери примерный шаблон, чтобы быстрее собрать структуру.",
        "templates.blank": "Начать с пустого курса",
        "templates.blankDescription": "Открой чистую форму метаданных и собери структуру курса вручную.",
        "templates.preview": "Предпросмотр шаблона",
        "templates.create": "Создать черновик из шаблона",
        "templates.creating": "Создание черновика...",
        "templates.modules": "модули",
        "templates.items": "задания",
        "templates.previewTitle": "Что будет создано",
    },
    en: {
        "nav.dashboard": "Dashboard",
        "nav.courses": "Courses",
        "nav.myLearning": "My Learning",
        "nav.profile": "Profile",
        "nav.teacherCabinet": "Teacher Cabinet",
        "nav.teacherRequest": "Become a teacher",
        "nav.adminRequests": "Teacher requests",
        "nav.login": "Login",
        "nav.register": "Register",
        "nav.logout": "Logout",
        "nav.settings": "Settings",
        "nav.searchPlaceholder": "Search courses, skills, or topics...",
        "nav.createCourse": "Create course",
        "common.retry": "Retry",
        "common.backHome": "Back to Home",
        "common.save": "Save",
        "common.saving": "Saving...",
        "common.loading": "Loading...",
        "common.cancel": "Cancel",
        "common.status": "Status",
        "language.label": "Language",
        "language.ru": "Russian",
        "language.en": "English",
        "profile.title": "Profile",
        "profile.subtitle": "Profile and account settings are loaded through BFF.",
        "profile.accountDetails": "Account details",
        "profile.accountDescription": "These fields are saved through BFF profile/settings endpoints.",
        "profile.security": "Security",
        "profile.language": "Interface language",
        "profile.languageDescription": "The selected language is saved to account settings. Guests use browser storage.",
        "profile.updated": "Profile was updated successfully.",
        "teacherRequest.title": "Teacher access request",
        "teacherRequest.subtitle": "Describe your experience and topics. An administrator will review the request.",
        "teacherRequest.motivation": "Why do you want to become a teacher?",
        "teacherRequest.experience": "Teaching or development experience",
        "teacherRequest.portfolioUrl": "Portfolio / GitHub / LinkedIn",
        "teacherRequest.preferredTopics": "Topics separated by commas",
        "teacherRequest.submit": "Submit request",
        "teacherRequest.statusTitle": "Current request",
        "teacherRequest.pending": "Pending",
        "teacherRequest.approved": "Approved",
        "teacherRequest.rejected": "Rejected",
        "teacherRequest.cancelled": "Cancelled",
        "teacherRequest.adminTitle": "Teacher requests",
        "teacherRequest.adminSubtitle": "Review requests, leave comments and grant access to the teacher cabinet.",
        "teacherRequest.noRequestsTitle": "No requests yet",
        "teacherRequest.noRequestsDescription": "New teacher access requests will appear here.",
        "teacherRequest.topics": "Topics",
        "teacherRequest.approve": "Approve",
        "teacherRequest.reject": "Reject",
        "teacherRequest.reviewComment": "Review comment",
        "errors.400.title": "Validation error",
        "errors.400.description": "Check the submitted data and try again.",
        "errors.401.title": "Session expired",
        "errors.401.description": "Log in again to continue.",
        "errors.403.title": "Access denied",
        "errors.403.description": "You do not have permission to view this page.",
        "errors.404.title": "Page not found",
        "errors.404.description": "The URL is incorrect or the page was removed.",
        "errors.409.title": "Data conflict",
        "errors.409.description": "The data has changed. Refresh the page and try again.",
        "errors.500.title": "Server error",
        "errors.500.description": "BFF or one of the services is temporarily unavailable.",
        "errors.maintenance.title": "Service unavailable",
        "errors.maintenance.description": "The platform is being updated. Try again later.",
        "templates.title": "Create course",
        "templates.subtitle": "Start from blank or use a sample template to build the structure faster.",
        "templates.blank": "Start from blank course",
        "templates.blankDescription": "Open a clean metadata form and build the course structure manually.",
        "templates.preview": "Template preview",
        "templates.create": "Create draft from template",
        "templates.creating": "Creating draft...",
        "templates.modules": "modules",
        "templates.items": "items",
        "templates.previewTitle": "What will be created",
    },
};

export function normalizeLocale(value: unknown): Locale | null {
    return value === "ru" || value === "en" ? value : null;
}

export function localeFromBrowser(): Locale | null {
    const language = navigator.language.toLowerCase();
    if (language.startsWith("ru")) return "ru";
    if (language.startsWith("en")) return "en";
    return null;
}

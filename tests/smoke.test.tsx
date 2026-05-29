import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../src/App";
import { AuthProvider } from "../src/auth/AuthContext";
import { AppErrorBoundary } from "../src/components/system/AppErrorBoundary";
import { mockBff } from "../src/mocks/mockBff";
import { ColorModeProvider } from "../src/theme/ColorModeProvider";
import { I18nProvider } from "../src/i18n/I18nProvider";

const findOptions = { timeout: 6000 };

type TestRole = "STUDENT" | "TEACHER" | "ADMIN";

async function loginAs(role: TestRole) {
    await mockBff.login({
        email: role === "ADMIN" ? "admin@studybytes.dev" : role === "TEACHER" ? "teacher@studybytes.dev" : "student@studybytes.dev",
        password: "password123",
    });
}

function renderRoute(path: string, locale: "ru" | "en" = "en") {
    localStorage.setItem("studybytes_locale", locale);
    return render(
        <ColorModeProvider>
            <I18nProvider>
                <MemoryRouter initialEntries={[path]}>
                    <AuthProvider>
                        <AppErrorBoundary>
                            <App />
                        </AppErrorBoundary>
                    </AuthProvider>
                </MemoryRouter>
            </I18nProvider>
        </ColorModeProvider>
    );
}

describe("StudyBytes public and auth behavior", () => {
    it("renders the public home page for anonymous users", async () => {
        renderRoute("/");
        expect(await screen.findByText(/Learn programming through structured practice/i, {}, findOptions)).toBeInTheDocument();
        expect((await screen.findAllByText(/Java Core/i, {}, findOptions)).length).toBeGreaterThan(0);
    });

    it("renders the public course catalog for anonymous users when /me is unauthorized", async () => {
        renderRoute("/courses");
        expect(await screen.findByRole("heading", { name: /Recommended Courses/i }, findOptions)).toBeInTheDocument();
        expect((await screen.findAllByText(/Java Core/i, {}, findOptions)).length).toBeGreaterThan(0);
    });

    it("renders public course details for anonymous users when /me is unauthorized", async () => {
        renderRoute("/courses/101");
        expect(await screen.findByText(/Course structure/i, {}, findOptions)).toBeInTheDocument();
        expect((await screen.findAllByText(/Login to start/i, {}, findOptions)).length).toBeGreaterThan(0);
    });

    it("redirects anonymous users from protected routes to login", async () => {
        renderRoute("/my-learning");
        expect(await screen.findByRole("heading", { name: /Login/i }, findOptions)).toBeInTheDocument();
    });

    it("redirects anonymous users from teacher routes to login", async () => {
        renderRoute("/teacher/courses");
        expect(await screen.findByRole("heading", { name: /Login/i }, findOptions)).toBeInTheDocument();
    });

    it("renders login page", async () => {
        renderRoute("/login");
        expect(await screen.findByRole("heading", { name: /Login/i }, findOptions)).toBeInTheDocument();
    });
});

describe("StudyBytes role-based behavior", () => {
    it("renders student learning page for authenticated student", async () => {
        await loginAs("STUDENT");
        renderRoute("/my-learning");
        expect(await screen.findByText(/Continue building skill|Продолжай обучение/i, {}, findOptions)).toBeInTheDocument();
        expect((await screen.findAllByText(/Java Core/i, {}, findOptions)).length).toBeGreaterThan(0);
    });

    it("renders course leaderboard without duplicating a visible current user", async () => {
        await loginAs("STUDENT");
        renderRoute("/learn/101");
        expect(await screen.findByRole("heading", { name: /Course leaders|Лидеры курса/i }, findOptions)).toBeInTheDocument();
        expect(await screen.findByText(/Student Demo/i, {}, findOptions)).toBeInTheDocument();
        expect(screen.queryByText(/Your result|Ваш результат/i)).not.toBeInTheDocument();
    });

    it("gates direct access to timed module items until explicit module start", async () => {
        localStorage.removeItem("studybytes_module_started_at:101:1001");
        localStorage.removeItem("studybytes_mock_module_started_at:1:101:1001");
        await loginAs("STUDENT");
        renderRoute("/learn/101/items/5003", "ru");
        expect(await screen.findByRole("heading", { name: /Сначала начните модуль/i }, findOptions)).toBeInTheDocument();
        await userEvent.click(await screen.findByRole("button", { name: /Начать \/ продолжить модуль/i }, findOptions));
        expect(await screen.findByRole("heading", { name: /Инструкция/i }, findOptions)).toBeInTheDocument();
    });

    it("shows access denied when student opens teacher routes", async () => {
        await loginAs("STUDENT");
        renderRoute("/teacher/courses");
        expect(await screen.findByText(/Access denied|Доступ запрещён/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders teacher course management for teacher", async () => {
        await loginAs("TEACHER");
        renderRoute("/teacher/courses");
        expect(await screen.findByRole("heading", { name: /Teacher courses|Курсы преподавателя/i }, findOptions)).toBeInTheDocument();
        expect((await screen.findAllByText(/Java Core/i, {}, findOptions)).length).toBeGreaterThan(0);
    });

    it("renders Russian teacher course templates", async () => {
        await loginAs("TEACHER");
        renderRoute("/teacher/courses/new", "ru");
        expect(await screen.findByText(/Студия преподавателя/i, {}, findOptions)).toBeInTheDocument();
        expect((await screen.findAllByText(/Основы программирования/i, {}, findOptions)).length).toBeGreaterThan(0);
    });

    it("renders compact teacher course editor with collapsible panel", async () => {
        await loginAs("TEACHER");
        renderRoute("/teacher/courses/101/edit", "ru");
        expect(await screen.findByText(/Структура курса/i, {}, findOptions)).toBeInTheDocument();
        expect(await screen.findByText(/Таймер от старта/i, {}, findOptions)).toBeInTheDocument();
        expect((await screen.findAllByRole("button", { name: /Скрыть панель/i }, findOptions)).length).toBeGreaterThan(0);
    });

    it("renders admin moderation queue", async () => {
        await loginAs("ADMIN");
        renderRoute("/admin/courses/moderation");
        expect(await screen.findByText(/Course moderation/i, {}, findOptions)).toBeInTheDocument();
    });

    it("shows moderation actions for a pending admin course review", async () => {
        await loginAs("TEACHER");
        const course = await mockBff.createTeacherCourse({
            slug: `pending-review-${Date.now()}`,
            title: "Pending review course",
            shortDescription: "Course waiting for admin checks.",
            description: "A course created in smoke tests to verify moderation actions.",
            difficulty: "BEGINNER",
            accessType: "PUBLIC",
            enrollmentEnabled: true,
            coverImageUrl: null,
            estimatedMinutes: 30,
        });
        await mockBff.submitTeacherCourseForReview(course.id);

        await loginAs("ADMIN");
        renderRoute(`/admin/courses/${course.id}/review`);
        expect(await screen.findByRole("heading", { name: /Pending review course/i }, findOptions)).toBeInTheDocument();
        expect(await screen.findByRole("button", { name: /Approve and publish/i }, findOptions)).toBeInTheDocument();
        expect(await screen.findByRole("button", { name: /Request changes/i }, findOptions)).toBeInTheDocument();
    });

    it("hides moderation actions for a published admin course review", async () => {
        await loginAs("ADMIN");
        renderRoute("/admin/courses/101/review");
        expect(await screen.findByRole("heading", { name: /Java Core/i }, findOptions)).toBeInTheDocument();
        expect(await screen.findByText(/not waiting for moderation/i, {}, findOptions)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Approve and publish/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Request changes/i })).not.toBeInTheDocument();
    });

    it("redirects authenticated users away from login", async () => {
        await loginAs("STUDENT");
        renderRoute("/login");
        expect((await screen.findAllByText(/Profile|Профиль/i, {}, findOptions)).length).toBeGreaterThan(0);
    });
});

describe("StudyBytes final QA states", () => {
    it("renders the public help page instead of maintenance", async () => {
        renderRoute("/help", "ru");
        expect(await screen.findByRole("heading", { name: /Помощь/i }, findOptions)).toBeInTheDocument();
        expect(await screen.findByText(/Связаться с поддержкой/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders registration role selection without admin self-registration", async () => {
        renderRoute("/register");
        expect((await screen.findAllByText(/Student/i, {}, findOptions)).length).toBeGreaterThan(0);
        expect((await screen.findAllByText(/Teacher/i, {}, findOptions)).length).toBeGreaterThan(0);
        expect(screen.queryByText(/^Admin$/i)).not.toBeInTheDocument();
    });

    it("renders localized error status page with requestId", async () => {
        renderRoute("/400?requestId=req-test", "ru");
        expect(await screen.findByText(/Ошибка валидации/i, {}, findOptions)).toBeInTheDocument();
        expect(await screen.findByText(/requestId: req-test/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders the Russian personal data policy", async () => {
        renderRoute("/privacy", "ru");
        expect(await screen.findByRole("heading", { name: /Политика обработки персональных данных/i }, findOptions)).toBeInTheDocument();
        expect((await screen.findAllByText(/152-ФЗ/i, {}, findOptions)).length).toBeGreaterThan(0);
    });

    it("changes language through the switcher", async () => {
        renderRoute("/400", "en");
        expect(await screen.findByText(/Validation error/i, {}, findOptions)).toBeInTheDocument();
        const switches = await screen.findAllByRole("combobox", {}, findOptions);
        await userEvent.click(switches[0]);
        const listbox = await screen.findByRole("listbox", {}, findOptions);
        await userEvent.click(within(listbox).getByRole("option", { name: /RU|Русский|Russian/i }));
        await waitFor(() => expect(screen.getByText(/Ошибка валидации/i)).toBeInTheDocument(), { timeout: 5000 });
    });
});

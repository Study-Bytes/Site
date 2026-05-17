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
        expect(await screen.findByText(/Continue building skill/i, {}, findOptions)).toBeInTheDocument();
        expect((await screen.findAllByText(/Java Core/i, {}, findOptions)).length).toBeGreaterThan(0);
    });

    it("shows access denied when student opens teacher routes", async () => {
        await loginAs("STUDENT");
        renderRoute("/teacher/courses");
        expect(await screen.findByText(/Access denied|Доступ запрещён/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders teacher course management for teacher", async () => {
        await loginAs("TEACHER");
        renderRoute("/teacher/courses");
        expect(await screen.findByRole("heading", { name: /Teacher courses/i }, findOptions)).toBeInTheDocument();
        expect((await screen.findAllByText(/Java Core/i, {}, findOptions)).length).toBeGreaterThan(0);
    });

    it("renders admin teacher requests page", async () => {
        await loginAs("ADMIN");
        renderRoute("/admin/teacher-requests");
        expect((await screen.findAllByText(/Teacher requests|Заявки преподавателей/i, {}, findOptions)).length).toBeGreaterThan(0);
    });

    it("redirects authenticated users away from login", async () => {
        await loginAs("STUDENT");
        renderRoute("/login");
        expect((await screen.findAllByText(/Profile|Профиль/i, {}, findOptions)).length).toBeGreaterThan(0);
    });
});

describe("StudyBytes final QA states", () => {
    it("renders teacher request page for student", async () => {
        await loginAs("STUDENT");
        renderRoute("/teacher-request");
        expect(await screen.findByText(/Teacher access request|Заявка на роль преподавателя/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders localized error status page with requestId", async () => {
        renderRoute("/400?requestId=req-test", "ru");
        expect(await screen.findByText(/Ошибка валидации/i, {}, findOptions)).toBeInTheDocument();
        expect(await screen.findByText(/requestId: req-test/i, {}, findOptions)).toBeInTheDocument();
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

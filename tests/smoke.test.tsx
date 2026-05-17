import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../src/App";
import { AuthProvider } from "../src/auth/AuthContext";
import { AppErrorBoundary } from "../src/components/system/AppErrorBoundary";
import { mockBff } from "../src/mocks/mockBff";
import { ColorModeProvider } from "../src/theme/ColorModeProvider";
import { I18nProvider } from "../src/i18n/I18nProvider";

const findOptions = { timeout: 4000 };

async function loginAs(role: "STUDENT" | "TEACHER" | "ADMIN") {
    await mockBff.login({
        email: role === "ADMIN" ? "admin@studybytes.dev" : role === "TEACHER" ? "teacher@studybytes.dev" : "student@studybytes.dev",
        password: "password123",
    });
}

async function settlePage() {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 850));
    });
}

async function renderRoute(path: string) {
    localStorage.setItem("studybytes_locale", "en");
    let view: ReturnType<typeof render> | undefined;
    await act(async () => {
        view = render(
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
    });
    return view!;
}

describe("StudyBytes smoke routes", () => {
    it("renders the public home page", async () => {
        await renderRoute("/");
        await settlePage();
        expect(await screen.findByText(/Learn programming through structured practice/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders the public course catalog", async () => {
        await renderRoute("/courses");
        await settlePage();
        expect(await screen.findByRole("heading", { name: /Recommended Courses/i }, findOptions)).toBeInTheDocument();
        expect((await screen.findAllByText(/Java Core/i, {}, findOptions)).length).toBeGreaterThan(0);
    });

    it("renders public course details", async () => {
        await renderRoute("/courses/101");
        await settlePage();
        expect(await screen.findByText(/Course structure/i, {}, findOptions)).toBeInTheDocument();
        expect(await screen.findByText(/Java basics/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders login page", async () => {
        await renderRoute("/login");
        await settlePage();
        expect(await screen.findByRole("heading", { name: /Login/i }, findOptions)).toBeInTheDocument();
    });

    it("renders student learning page for authenticated student", async () => {
        await loginAs("STUDENT");
        await renderRoute("/my-learning");
        await settlePage();
        expect(await screen.findByText(/Continue building skill/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders teacher course management for teacher", async () => {
        await loginAs("TEACHER");
        await renderRoute("/teacher/courses");
        await settlePage();
        expect(await screen.findByRole("heading", { name: /Teacher courses/i }, findOptions)).toBeInTheDocument();
    });
});


describe("StudyBytes final readiness routes", () => {
    it("renders teacher request page for student", async () => {
        await loginAs("STUDENT");
        await renderRoute("/teacher-request");
        await settlePage();
        expect(await screen.findByText(/Teacher access request|Заявка на роль преподавателя/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders admin teacher requests page", async () => {
        await loginAs("ADMIN");
        await renderRoute("/admin/teacher-requests");
        await settlePage();
        expect(await screen.findByText(/Teacher requests|Заявки преподавателей/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders localized error status page", async () => {
        await renderRoute("/400");
        await settlePage();
        expect(await screen.findByText(/Validation error|Ошибка валидации/i, {}, findOptions)).toBeInTheDocument();
    });
});

import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../src/App";
import { AuthProvider } from "../src/auth/AuthContext";
import { AppErrorBoundary } from "../src/components/system/AppErrorBoundary";
import { mockBff } from "../src/mocks/mockBff";
import { ColorModeProvider } from "../src/theme/ColorModeProvider";

const findOptions = { timeout: 4000 };

async function loginAs(role: "STUDENT" | "TEACHER") {
    await mockBff.login({
        email: role === "TEACHER" ? "teacher@studybytes.dev" : "student@studybytes.dev",
        password: "password123",
    });
}

async function settlePage() {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 850));
    });
}

function renderRoute(path: string) {
    return render(
        <ColorModeProvider>
            <MemoryRouter initialEntries={[path]}>
                <AuthProvider>
                    <AppErrorBoundary>
                        <App />
                    </AppErrorBoundary>
                </AuthProvider>
            </MemoryRouter>
        </ColorModeProvider>
    );
}

describe("StudyBytes smoke routes", () => {
    it("renders the public home page", async () => {
        renderRoute("/");
        await settlePage();
        expect(await screen.findByText(/Learn programming through structured practice/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders the public course catalog", async () => {
        renderRoute("/courses");
        await settlePage();
        expect(await screen.findByRole("heading", { name: /Recommended Courses/i }, findOptions)).toBeInTheDocument();
        expect((await screen.findAllByText(/Java Core/i, {}, findOptions)).length).toBeGreaterThan(0);
    });

    it("renders public course details", async () => {
        renderRoute("/courses/101");
        await settlePage();
        expect(await screen.findByText(/Course structure/i, {}, findOptions)).toBeInTheDocument();
        expect(await screen.findByText(/Java basics/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders login page", async () => {
        renderRoute("/login");
        await settlePage();
        expect(await screen.findByRole("heading", { name: /Login/i }, findOptions)).toBeInTheDocument();
    });

    it("renders student learning page for authenticated student", async () => {
        await loginAs("STUDENT");
        renderRoute("/my-learning");
        await settlePage();
        expect(await screen.findByText(/Continue building skill/i, {}, findOptions)).toBeInTheDocument();
    });

    it("renders teacher course management for teacher", async () => {
        await loginAs("TEACHER");
        renderRoute("/teacher/courses");
        await settlePage();
        expect(await screen.findByRole("heading", { name: /Teacher courses/i }, findOptions)).toBeInTheDocument();
    });
});

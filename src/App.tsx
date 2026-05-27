import { Component, lazy, Suspense } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { ErrorState } from "./components/ui/ErrorState";
import { LoadingState } from "./components/ui/LoadingState";
import { AppShell } from "./layouts/AppShell";
import { PageContainer } from "./layouts/PageContainer";
import AccessDeniedPage from "./pages/system/AccessDeniedPage";
import ErrorStatusPage from "./pages/system/ErrorStatusPage";
import HelpPage from "./pages/system/HelpPage";
import NotFoundPage from "./pages/system/NotFoundPage";
import { AnonymousOnly } from "./routes/AnonymousOnly";
import { RequireAuth } from "./routes/RequireAuth";
import { RequireRole } from "./routes/RequireRole";

function isChunkLoadError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return /dynamically imported module|loading chunk|chunkloaderror|module script|importing a module script/i.test(message);
}

function lazyPage<TProps extends object>(key: string, loader: () => Promise<{ default: ComponentType<TProps> }>): LazyExoticComponent<ComponentType<TProps>> {
    return lazy(() =>
        loader().catch((error) => {
            const reloadKey = `studybytes_lazy_reload_${key}`;
            if (isChunkLoadError(error) && sessionStorage.getItem(reloadKey) !== "true") {
                sessionStorage.setItem(reloadKey, "true");
                window.location.reload();
                return new Promise<{ default: ComponentType<TProps> }>(() => undefined);
            }
            throw error;
        })
    );
}

type LazyBoundaryState = {
    error: Error | null;
};

class LazyPageBoundary extends Component<{ children: ReactNode }, LazyBoundaryState> {
    state: LazyBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): LazyBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error) {
        if (!isChunkLoadError(error)) return;
        Object.keys(sessionStorage)
            .filter((key) => key.startsWith("studybytes_lazy_reload_"))
            .forEach((key) => sessionStorage.removeItem(key));
    }

    render() {
        if (this.state.error) {
            return (
                <PageContainer>
                    <ErrorState
                        message="Не удалось загрузить страницу. Failed to load this page."
                        onRetry={() => {
                            Object.keys(sessionStorage)
                                .filter((key) => key.startsWith("studybytes_lazy_reload_"))
                                .forEach((key) => sessionStorage.removeItem(key));
                            window.location.reload();
                        }}
                    />
                </PageContainer>
            );
        }
        return this.props.children;
    }
}

const Home = lazyPage("home", () => import("./pages/Home"));
const LoginPage = lazyPage("login", () => import("./pages/auth/LoginPage"));
const RegisterPage = lazyPage("register", () => import("./pages/auth/RegisterPage"));
const CourseDetailsPage = lazyPage("course-details", () => import("./pages/courses/CourseDetailsPage"));
const CoursesPage = lazyPage("courses", () => import("./pages/courses/CoursesPage"));
const LearningCoursePage = lazyPage("learning-course", () => import("./pages/learning/LearningCoursePage"));
const LearningItemPage = lazyPage("learning-item", () => import("./pages/learning/LearningItemPage"));
const MyLearningPage = lazyPage("my-learning", () => import("./pages/learning/MyLearningPage"));
const ProfilePage = lazyPage("profile", () => import("./pages/ProfilePage"));
const PrivacyPolicyPage = lazyPage("privacy", () => import("./pages/legal/PrivacyPolicyPage"));
const TermsPage = lazyPage("terms", () => import("./pages/legal/TermsPage"));
const AdminDashboardPage = lazyPage("admin-dashboard", () => import("./pages/admin/AdminDashboardPage"));
const AdminCoursesPage = lazyPage("admin-courses", () => import("./pages/admin/AdminCoursesPage"));
const AdminModerationQueuePage = lazyPage("admin-moderation", () => import("./pages/admin/AdminModerationQueuePage"));
const AdminCourseReviewPage = lazyPage("admin-course-review", () => import("./pages/admin/AdminCourseReviewPage"));
const TeacherCourseEditPage = lazyPage("teacher-course-edit", () => import("./pages/teacher/TeacherCourseEditPage"));
const TeacherCourseNewPage = lazyPage("teacher-course-new", () => import("./pages/teacher/TeacherCourseNewPage"));
const TeacherCourseBlankPage = lazyPage("teacher-course-blank", () => import("./pages/teacher/TeacherCourseBlankPage"));
const TeacherCoursesPage = lazyPage("teacher-courses", () => import("./pages/teacher/TeacherCoursesPage"));
const TeacherDashboardPage = lazyPage("teacher-dashboard", () => import("./pages/teacher/TeacherDashboardPage"));
const TeacherItemEditorPage = lazyPage("teacher-item-editor", () => import("./pages/teacher/TeacherItemEditorPage"));

function PageSuspense({ children }: { children: ReactNode }) {
    return (
        <LazyPageBoundary>
            <Suspense
                fallback={
                    <PageContainer>
                        <LoadingState rows={3} />
                    </PageContainer>
                }
            >
                {children}
            </Suspense>
        </LazyPageBoundary>
    );
}

export default function App() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/" element={<PageSuspense><Home /></PageSuspense>} />
                <Route path="/courses" element={<PageSuspense><CoursesPage /></PageSuspense>} />
                <Route path="/courses/:courseId" element={<PageSuspense><CourseDetailsPage /></PageSuspense>} />
                <Route path="/privacy" element={<PageSuspense><PrivacyPolicyPage /></PageSuspense>} />
                <Route path="/terms" element={<PageSuspense><TermsPage /></PageSuspense>} />
                <Route path="/help" element={<HelpPage />} />
                <Route
                    path="/login"
                    element={
                        <AnonymousOnly>
                            <PageSuspense><LoginPage /></PageSuspense>
                        </AnonymousOnly>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <AnonymousOnly>
                            <PageSuspense><RegisterPage /></PageSuspense>
                        </AnonymousOnly>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <RequireAuth>
                            <PageSuspense><ProfilePage /></PageSuspense>
                        </RequireAuth>
                    }
                />

                <Route
                    path="/my-learning"
                    element={
                        <RequireAuth>
                            <PageSuspense><MyLearningPage /></PageSuspense>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/learn/:courseId"
                    element={
                        <RequireAuth>
                            <PageSuspense><LearningCoursePage /></PageSuspense>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/learn/:courseId/items/:itemId"
                    element={
                        <RequireAuth>
                            <PageSuspense><LearningItemPage /></PageSuspense>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <RequireRole roles={["ADMIN"]}>
                            <PageSuspense><AdminDashboardPage /></PageSuspense>
                        </RequireRole>
                    }
                />
                <Route
                    path="/admin/courses"
                    element={
                        <RequireRole roles={["ADMIN"]}>
                            <PageSuspense><AdminCoursesPage /></PageSuspense>
                        </RequireRole>
                    }
                />
                <Route
                    path="/admin/courses/moderation"
                    element={
                        <RequireRole roles={["ADMIN"]}>
                            <PageSuspense><AdminModerationQueuePage /></PageSuspense>
                        </RequireRole>
                    }
                />
                <Route
                    path="/admin/courses/:courseId/review"
                    element={
                        <RequireRole roles={["ADMIN"]}>
                            <PageSuspense><AdminCourseReviewPage /></PageSuspense>
                        </RequireRole>
                    }
                />
                <Route
                    path="/teacher"
                    element={
                        <RequireRole roles={["TEACHER", "ADMIN"]}>
                            <PageSuspense><TeacherDashboardPage /></PageSuspense>
                        </RequireRole>
                    }
                />
                <Route
                    path="/teacher/courses"
                    element={
                        <RequireRole roles={["TEACHER", "ADMIN"]}>
                            <PageSuspense><TeacherCoursesPage /></PageSuspense>
                        </RequireRole>
                    }
                />
                <Route
                    path="/teacher/courses/new"
                    element={
                        <RequireRole roles={["TEACHER", "ADMIN"]}>
                            <PageSuspense><TeacherCourseNewPage /></PageSuspense>
                        </RequireRole>
                    }
                />
                <Route
                    path="/teacher/courses/new/blank"
                    element={
                        <RequireRole roles={["TEACHER", "ADMIN"]}>
                            <PageSuspense><TeacherCourseBlankPage /></PageSuspense>
                        </RequireRole>
                    }
                />
                <Route
                    path="/teacher/courses/:courseId/edit"
                    element={
                        <RequireRole roles={["TEACHER", "ADMIN"]}>
                            <PageSuspense><TeacherCourseEditPage /></PageSuspense>
                        </RequireRole>
                    }
                />
                <Route
                    path="/teacher/courses/:courseId/edit/items/:itemId"
                    element={
                        <RequireRole roles={["TEACHER", "ADMIN"]}>
                            <PageSuspense><TeacherItemEditorPage /></PageSuspense>
                        </RequireRole>
                    }
                />
                <Route path="/400" element={<ErrorStatusPage status={400} />} />
                <Route path="/401" element={<ErrorStatusPage status={401} />} />
                <Route path="/403" element={<AccessDeniedPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="/409" element={<ErrorStatusPage status={409} />} />
                <Route path="/500" element={<ErrorStatusPage status={500} />} />
                <Route path="/maintenance" element={<ErrorStatusPage status="maintenance" />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

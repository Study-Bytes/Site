import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
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

const Home = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const CourseDetailsPage = lazy(() => import("./pages/courses/CourseDetailsPage"));
const CoursesPage = lazy(() => import("./pages/courses/CoursesPage"));
const LearningCoursePage = lazy(() => import("./pages/learning/LearningCoursePage"));
const LearningItemPage = lazy(() => import("./pages/learning/LearningItemPage"));
const MyLearningPage = lazy(() => import("./pages/learning/MyLearningPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PrivacyPolicyPage = lazy(() => import("./pages/legal/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("./pages/legal/TermsPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminCoursesPage = lazy(() => import("./pages/admin/AdminCoursesPage"));
const AdminModerationQueuePage = lazy(() => import("./pages/admin/AdminModerationQueuePage"));
const AdminCourseReviewPage = lazy(() => import("./pages/admin/AdminCourseReviewPage"));
const TeacherCourseEditPage = lazy(() => import("./pages/teacher/TeacherCourseEditPage"));
const TeacherCourseNewPage = lazy(() => import("./pages/teacher/TeacherCourseNewPage"));
const TeacherCourseBlankPage = lazy(() => import("./pages/teacher/TeacherCourseBlankPage"));
const TeacherCoursesPage = lazy(() => import("./pages/teacher/TeacherCoursesPage"));
const TeacherDashboardPage = lazy(() => import("./pages/teacher/TeacherDashboardPage"));
const TeacherItemEditorPage = lazy(() => import("./pages/teacher/TeacherItemEditorPage"));

function PageSuspense({ children }: { children: ReactNode }) {
    return (
        <Suspense
            fallback={
                <PageContainer>
                    <LoadingState rows={3} />
                </PageContainer>
            }
        >
            {children}
        </Suspense>
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

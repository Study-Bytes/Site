import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingState } from "./components/ui/LoadingState";
import { AppShell } from "./layouts/AppShell";
import { PageContainer } from "./layouts/PageContainer";
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
const ErrorStatusPage = lazy(() => import("./pages/system/ErrorStatusPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminCoursesPage = lazy(() => import("./pages/admin/AdminCoursesPage"));
const AdminModerationQueuePage = lazy(() => import("./pages/admin/AdminModerationQueuePage"));
const AdminCourseReviewPage = lazy(() => import("./pages/admin/AdminCourseReviewPage"));
const AccessDeniedPage = lazy(() => import("./pages/system/AccessDeniedPage"));
const NotFoundPage = lazy(() => import("./pages/system/NotFoundPage"));
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
                <Route path="/400" element={<PageSuspense><ErrorStatusPage status={400} /></PageSuspense>} />
                <Route path="/401" element={<PageSuspense><ErrorStatusPage status={401} /></PageSuspense>} />
                <Route path="/403" element={<PageSuspense><AccessDeniedPage /></PageSuspense>} />
                <Route path="/404" element={<PageSuspense><NotFoundPage /></PageSuspense>} />
                <Route path="/409" element={<PageSuspense><ErrorStatusPage status={409} /></PageSuspense>} />
                <Route path="/500" element={<PageSuspense><ErrorStatusPage status={500} /></PageSuspense>} />
                <Route path="/maintenance" element={<PageSuspense><ErrorStatusPage status="maintenance" /></PageSuspense>} />
                <Route path="*" element={<PageSuspense><NotFoundPage /></PageSuspense>} />
            </Route>
        </Routes>
    );
}

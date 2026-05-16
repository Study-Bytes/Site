import { Route, Routes } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import Home from "./pages/Home";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CourseDetailsPage from "./pages/courses/CourseDetailsPage";
import CoursesPage from "./pages/courses/CoursesPage";
import LearningCoursePage from "./pages/learning/LearningCoursePage";
import LearningItemPage from "./pages/learning/LearningItemPage";
import MyLearningPage from "./pages/learning/MyLearningPage";
import ProfilePage from "./pages/ProfilePage";
import AccessDeniedPage from "./pages/system/AccessDeniedPage";
import NotFoundPage from "./pages/system/NotFoundPage";
import TeacherCourseEditPage from "./pages/teacher/TeacherCourseEditPage";
import TeacherCourseNewPage from "./pages/teacher/TeacherCourseNewPage";
import TeacherCoursesPage from "./pages/teacher/TeacherCoursesPage";
import TeacherDashboardPage from "./pages/teacher/TeacherDashboardPage";
import TeacherItemEditorPage from "./pages/teacher/TeacherItemEditorPage";
import { AnonymousOnly } from "./routes/AnonymousOnly";
import { RequireAuth } from "./routes/RequireAuth";
import { RequireRole } from "./routes/RequireRole";

export default function App() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
                <Route
                    path="/login"
                    element={
                        <AnonymousOnly>
                            <LoginPage />
                        </AnonymousOnly>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <AnonymousOnly>
                            <RegisterPage />
                        </AnonymousOnly>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <RequireAuth>
                            <ProfilePage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/my-learning"
                    element={
                        <RequireAuth>
                            <MyLearningPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/learn/:courseId"
                    element={
                        <RequireAuth>
                            <LearningCoursePage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/learn/:courseId/items/:itemId"
                    element={
                        <RequireAuth>
                            <LearningItemPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/teacher"
                    element={
                        <RequireRole roles={["TEACHER", "ADMIN"]}>
                            <TeacherDashboardPage />
                        </RequireRole>
                    }
                />
                <Route
                    path="/teacher/courses"
                    element={
                        <RequireRole roles={["TEACHER", "ADMIN"]}>
                            <TeacherCoursesPage />
                        </RequireRole>
                    }
                />
                <Route
                    path="/teacher/courses/new"
                    element={
                        <RequireRole roles={["TEACHER", "ADMIN"]}>
                            <TeacherCourseNewPage />
                        </RequireRole>
                    }
                />
                <Route
                    path="/teacher/courses/:courseId/edit"
                    element={
                        <RequireRole roles={["TEACHER", "ADMIN"]}>
                            <TeacherCourseEditPage />
                        </RequireRole>
                    }
                />
                <Route
                    path="/teacher/courses/:courseId/edit/items/:itemId"
                    element={
                        <RequireRole roles={["TEACHER", "ADMIN"]}>
                            <TeacherItemEditorPage />
                        </RequireRole>
                    }
                />
                <Route path="/403" element={<AccessDeniedPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

import { ApiError } from "../api/apiError";
import type {
    AuthResponse,
    CourseCatalogItem,
    CourseDetails,
    CurrentUser,
    EnrollmentSummary,
    LoginRequest,
    RegisterRequest,
    TeacherCourseSummary,
} from "../api/bffContracts";

type MockAccount = CurrentUser & { password: string };

const mockAccounts: MockAccount[] = [
    {
        id: 1,
        email: "student@studybytes.dev",
        fullName: "Student Demo",
        role: "STUDENT",
        password: "password123",
    },
    {
        id: 2,
        email: "teacher@studybytes.dev",
        fullName: "Teacher Demo",
        role: "TEACHER",
        password: "password123",
    },
    {
        id: 3,
        email: "admin@studybytes.dev",
        fullName: "Admin Demo",
        role: "ADMIN",
        password: "password123",
    },
];

const currentUserKey = "studybytes_mock_current_user";

const courses: CourseDetails[] = [
    {
        id: 101,
        slug: "java-core",
        title: "Java Core",
        shortDescription: "ООП, коллекции, исключения и базовые паттерны для уверенного Java-кода.",
        description:
            "Практический курс по Java Core для студентов и junior-разработчиков. Теория закрепляется quiz и coding-заданиями.",
        difficulty: "BEGINNER",
        accessType: "PUBLIC",
        enrollmentEnabled: true,
        coverImageUrl: "/course-java.jpg",
        estimatedMinutes: 420,
        status: "PUBLISHED",
        modules: [
            {
                id: 1001,
                title: "База языка",
                orderIndex: 0,
                items: [
                    { id: 5001, title: "Переменные и типы", itemType: "THEORY", orderIndex: 0, estimatedMinutes: 12 },
                    { id: 5002, title: "Проверка синтаксиса", itemType: "QUIZ", orderIndex: 1, estimatedMinutes: 8 },
                    { id: 5003, title: "Первый метод", itemType: "CODING", orderIndex: 2, estimatedMinutes: 20 },
                ],
            },
        ],
    },
    {
        id: 102,
        slug: "sql-basics",
        title: "SQL & Databases",
        shortDescription: "SELECT, JOIN, индексы и базовое понимание реляционных баз данных.",
        description:
            "Курс по SQL и работе с данными: от простых выборок до соединений и анализа запросов.",
        difficulty: "INTERMEDIATE",
        accessType: "PUBLIC",
        enrollmentEnabled: true,
        coverImageUrl: "/course-sql.jpg",
        estimatedMinutes: 360,
        status: "PUBLISHED",
        modules: [
            {
                id: 1002,
                title: "Запросы",
                orderIndex: 0,
                items: [
                    { id: 5101, title: "SELECT и WHERE", itemType: "THEORY", orderIndex: 0, estimatedMinutes: 15 },
                    { id: 5102, title: "Написать SQL-запрос", itemType: "SQL", orderIndex: 1, estimatedMinutes: 25 },
                ],
            },
        ],
    },
    {
        id: 103,
        slug: "computer-networks",
        title: "Computer Networks",
        shortDescription: "TCP/IP, NAT, маршрутизация и диагностика сетевых проблем.",
        description:
            "Курс для тех, кто хочет понимать сетевую основу веба, VPN, Docker-сетей и микросервисов.",
        difficulty: "ADVANCED",
        accessType: "UNLISTED",
        enrollmentEnabled: false,
        coverImageUrl: "/course-net.jpg",
        estimatedMinutes: 510,
        status: "PUBLISHED",
        modules: [],
    },
];

let sessionUser: CurrentUser | null = loadSessionUser();

function delay<T>(value: T, ms = 180): Promise<T> {
    return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
}

function publicCourse(course: CourseDetails): CourseCatalogItem {
    return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        shortDescription: course.shortDescription,
        difficulty: course.difficulty,
        accessType: course.accessType,
        enrollmentEnabled: course.enrollmentEnabled,
        coverImageUrl: course.coverImageUrl,
        estimatedMinutes: course.estimatedMinutes,
    };
}

function loadSessionUser(): CurrentUser | null {
    const raw = localStorage.getItem(currentUserKey);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as CurrentUser;
    } catch {
        localStorage.removeItem(currentUserKey);
        return null;
    }
}

function persistSession(user: CurrentUser | null) {
    sessionUser = user;
    if (user) localStorage.setItem(currentUserKey, JSON.stringify(user));
    else localStorage.removeItem(currentUserKey);
}

function requireUser() {
    if (!sessionUser) throw new ApiError("Authentication required", 401);
    return sessionUser;
}

function findCourse(id: number) {
    const course = courses.find((item) => item.id === id);
    if (!course) throw new ApiError("Course not found", 404);
    return course;
}

export const mockBff = {
    async getMe(): Promise<CurrentUser | null> {
        return delay(sessionUser);
    },

    async login(request: LoginRequest): Promise<AuthResponse> {
        const account = mockAccounts.find((item) => item.email.toLowerCase() === request.email.toLowerCase());
        if (!account || account.password !== request.password) {
            throw new ApiError("Invalid email or password", 401);
        }

        const user: CurrentUser = {
            id: account.id,
            email: account.email,
            fullName: account.fullName,
            role: account.role,
        };
        persistSession(user);
        return delay({ user });
    },

    async register(request: RegisterRequest): Promise<AuthResponse> {
        const exists = mockAccounts.some((item) => item.email.toLowerCase() === request.email.toLowerCase());
        if (exists) throw new ApiError("User with this email already exists", 409);

        const user: MockAccount = {
            id: mockAccounts.length + 1,
            email: request.email,
            fullName: request.fullName,
            role: request.role ?? "STUDENT",
            password: request.password,
        };
        mockAccounts.push(user);
        const publicUser: CurrentUser = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        };
        persistSession(publicUser);
        return delay({ user: publicUser });
    },

    async logout(): Promise<void> {
        persistSession(null);
        return delay(undefined);
    },

    async getCourses(): Promise<CourseCatalogItem[]> {
        return delay(courses.filter((item) => item.status === "PUBLISHED").map(publicCourse));
    },

    async getCourse(courseId: number): Promise<CourseDetails> {
        return delay(findCourse(courseId));
    },

    async getMyLearning(): Promise<EnrollmentSummary[]> {
        requireUser();
        return delay([
            { course: publicCourse(courses[0]), progressPercent: 42, status: "IN_PROGRESS", nextItemId: 5003 },
            { course: publicCourse(courses[1]), progressPercent: 100, status: "COMPLETED", nextItemId: null },
        ]);
    },

    async getTeacherCourses(): Promise<TeacherCourseSummary[]> {
        const user = requireUser();
        if (user.role !== "TEACHER" && user.role !== "ADMIN") throw new ApiError("Access denied", 403);
        return delay(
            courses.map((course) => ({
                ...publicCourse(course),
                status: course.status,
                updatedAt: new Date().toISOString(),
            }))
        );
    },
};

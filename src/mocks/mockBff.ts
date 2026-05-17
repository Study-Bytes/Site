import { ApiError } from "../api/apiError";
import type {
    AuthResponse,
    ChangePasswordRequest,
    ContentBlockUpsertRequest,
    CourseCatalogItem,
    CourseCatalogQuery,
    DefaultLocaleResponse,
    CourseDetails,
    CourseItemPreview,
    CourseItemUpsertRequest,
    CourseModuleSummary,
    CourseUpsertRequest,
    CurrentUser,
    EnrollCourseResponse,
    EnrollmentSummary,
    HintUpsertRequest,
    LearningCourse,
    LearningItem,
    Locale,
    LoginRequest,
    ModuleUpsertRequest,
    QuizOptionUpsertRequest,
    RegisterRequest,
    ReorderItemsRequest,
    ReorderModulesRequest,
    RunItemRequest,
    SubmissionHistoryItem,
    SubmissionResult,
    TeacherCourseDetails,
    TeacherCourseQuery,
    TeacherCourseSummary,
    TeacherAccessRequest,
    TeacherItemDetails,
    TeacherRequestCreateRequest,
    TeacherRequestReviewRequest,
    RegisterTeacherRequest,
    RegisterTeacherRequestResponse,
    TestCaseUpsertRequest,
    UpdateProfileRequest,
} from "../api/bffContracts";

type MockAccount = CurrentUser & { password: string };

const mockAccounts: MockAccount[] = [
    {
        id: 1,
        email: "student@studybytes.dev",
        fullName: "Student Demo",
        role: "STUDENT",
        status: "ACTIVE",
        avatarUrl: null,
        bio: "Learns programming through StudyBytes.",
        preferredLocale: "ru",
        password: "password123",
    },
    {
        id: 2,
        email: "teacher@studybytes.dev",
        fullName: "Teacher Demo",
        role: "TEACHER",
        status: "ACTIVE",
        avatarUrl: null,
        bio: "Creates Java and SQL courses.",
        preferredLocale: "ru",
        password: "password123",
    },
    {
        id: 3,
        email: "admin@studybytes.dev",
        fullName: "Admin Demo",
        role: "ADMIN",
        status: "ACTIVE",
        avatarUrl: null,
        bio: "Platform administrator.",
        preferredLocale: "en",
        password: "password123",
    },
];

const currentUserKey = "studybytes_mock_current_user";
const enrolledCoursesKey = "studybytes_mock_enrolled_courses";



let teacherRequests: TeacherAccessRequest[] = [
    {
        id: 3001,
        userId: 1,
        status: "PENDING",
        motivation: "I want to create beginner Java lessons for classmates.",
        experience: "Completed Java Core and helped peers with labs.",
        portfolioUrl: "https://github.com/student-demo",
        preferredTopics: ["Java", "Algorithms"],
        reviewComment: null,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        reviewedAt: null,
        reviewedByUserId: null,
        user: { id: 1, email: "student@studybytes.dev", fullName: "Student Demo", role: "STUDENT", status: "ACTIVE" },
    },
];

const itemDetails: Record<number, TeacherItemDetails> = {
    5001: {
        id: 5001,
        moduleId: 1001,
        title: "Variables and types",
        itemType: "THEORY",
        statement: "Read the explanation and remember primitive Java types.",
        orderIndex: 0,
        language: null,
        starterCode: null,
        solutionCode: null,
        timeLimitMs: null,
        memoryLimitMb: null,
        outputLimitKb: null,
        networkDisabled: true,
        readOnlyFs: true,
        comparisonMode: "EXACT",
        normalizeLineEndings: true,
        trimTrailingWhitespaces: true,
        contentBlocks: [
            {
                id: 9001,
                blockType: "TEXT",
                orderIndex: 0,
                title: "Java variables",
                textContent: "A variable stores a typed value. Java requires explicit types for local variables unless var is used.",
                url: null,
                language: null,
                metadataJson: null,
            },
        ],
        hints: [{ id: 9101, orderIndex: 0, text: "Focus on int, long, double, boolean and String." }],
        testCases: [],
        options: [],
    },
    5002: {
        id: 5002,
        moduleId: 1001,
        title: "Syntax quiz",
        itemType: "QUIZ",
        statement: "Which declaration creates an integer variable in Java?",
        orderIndex: 1,
        language: null,
        starterCode: null,
        solutionCode: null,
        timeLimitMs: null,
        memoryLimitMb: null,
        outputLimitKb: null,
        networkDisabled: true,
        readOnlyFs: true,
        comparisonMode: "EXACT",
        normalizeLineEndings: true,
        trimTrailingWhitespaces: true,
        contentBlocks: [],
        hints: [],
        testCases: [],
        options: [
            { id: 9201, orderIndex: 0, label: "A", text: "int count = 1;", correct: true, explanation: "Correct Java integer declaration." },
            { id: 9202, orderIndex: 1, label: "B", text: "integer count = 1;", correct: false, explanation: "integer is not a Java primitive type." },
        ],
    },
    5003: {
        id: 5003,
        moduleId: 1001,
        title: "First method",
        itemType: "CODING",
        statement: "Implement method sum(int a, int b) that returns the sum of two numbers.",
        orderIndex: 2,
        language: "java",
        starterCode: "public class Solution {\n    public int sum(int a, int b) {\n        return 0;\n    }\n}",
        solutionCode: "public class Solution {\n    public int sum(int a, int b) {\n        return a + b;\n    }\n}",
        timeLimitMs: 2000,
        memoryLimitMb: 256,
        outputLimitKb: 128,
        networkDisabled: true,
        readOnlyFs: true,
        comparisonMode: "EXACT",
        normalizeLineEndings: true,
        trimTrailingWhitespaces: true,
        contentBlocks: [],
        hints: [{ id: 9301, orderIndex: 0, text: "Return the expression a + b." }],
        testCases: [
            { id: 9401, testKey: "sample-1", orderIndex: 0, visibility: "OPEN", inputData: "2 3", expectedOutput: "5" },
            { id: 9402, testKey: "hidden-negative", orderIndex: 1, visibility: "HIDDEN", inputData: "-2 3", expectedOutput: "1" },
        ],
        options: [],
    },
    5101: {
        id: 5101,
        moduleId: 1002,
        title: "SELECT and WHERE",
        itemType: "THEORY",
        statement: "Learn how SELECT and WHERE filter rows.",
        orderIndex: 0,
        language: null,
        starterCode: null,
        solutionCode: null,
        timeLimitMs: null,
        memoryLimitMb: null,
        outputLimitKb: null,
        networkDisabled: true,
        readOnlyFs: true,
        comparisonMode: "EXACT",
        normalizeLineEndings: true,
        trimTrailingWhitespaces: true,
        contentBlocks: [
            {
                id: 9002,
                blockType: "TEXT",
                orderIndex: 0,
                title: "SQL filtering",
                textContent: "SELECT chooses columns. WHERE filters rows.",
                url: null,
                language: null,
                metadataJson: null,
            },
        ],
        hints: [],
        testCases: [],
        options: [],
    },
    5102: {
        id: 5102,
        moduleId: 1002,
        title: "Write SQL query",
        itemType: "SQL",
        statement: "Select all active users from table users.",
        orderIndex: 1,
        language: "postgresql",
        starterCode: "SELECT *\nFROM users\nWHERE ...;",
        solutionCode: "SELECT *\nFROM users\nWHERE status = 'ACTIVE';",
        timeLimitMs: 2000,
        memoryLimitMb: 256,
        outputLimitKb: 128,
        networkDisabled: true,
        readOnlyFs: true,
        comparisonMode: "EXACT",
        normalizeLineEndings: true,
        trimTrailingWhitespaces: true,
        contentBlocks: [],
        hints: [{ id: 9302, orderIndex: 0, text: "Use WHERE status = 'ACTIVE'." }],
        testCases: [{ id: 9403, testKey: "sample-sql", orderIndex: 0, visibility: "OPEN", inputData: null, expectedOutput: "rows" }],
        options: [],
    },
};

let courses: TeacherCourseDetails[] = [
    {
        id: 101,
        slug: "java-core",
        title: "Java Core",
        shortDescription: "ООП, коллекции, исключения и базовые паттерны для уверенного Java-кода.",
        description: "Практический курс по Java Core для студентов и junior-разработчиков. Теория закрепляется quiz и coding-заданиями.",
        difficulty: "BEGINNER",
        accessType: "PUBLIC",
        enrollmentEnabled: true,
        coverImageUrl: "/course-java.jpg",
        estimatedMinutes: 420,
        status: "PUBLISHED",
        createdByUserId: 2,
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        publishedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        modules: [
            {
                id: 1001,
                title: "Java basics",
                orderIndex: 0,
                items: [
                    { id: 5001, title: "Variables and types", itemType: "THEORY", orderIndex: 0, estimatedMinutes: 12, completed: true },
                    { id: 5002, title: "Syntax quiz", itemType: "QUIZ", orderIndex: 1, estimatedMinutes: 8, completed: true },
                    { id: 5003, title: "First method", itemType: "CODING", orderIndex: 2, estimatedMinutes: 20, completed: false },
                ],
            },
        ],
    },
    {
        id: 102,
        slug: "sql-basics",
        title: "SQL & Databases",
        shortDescription: "SELECT, JOIN, индексы и базовое понимание реляционных баз данных.",
        description: "Курс по SQL и работе с данными: от простых выборок до соединений и анализа запросов.",
        difficulty: "INTERMEDIATE",
        accessType: "PUBLIC",
        enrollmentEnabled: true,
        coverImageUrl: "/course-sql.jpg",
        estimatedMinutes: 360,
        status: "PUBLISHED",
        createdByUserId: 2,
        createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        modules: [
            {
                id: 1002,
                title: "Queries",
                orderIndex: 0,
                items: [
                    { id: 5101, title: "SELECT and WHERE", itemType: "THEORY", orderIndex: 0, estimatedMinutes: 15, completed: true },
                    { id: 5102, title: "Write SQL query", itemType: "SQL", orderIndex: 1, estimatedMinutes: 25, completed: false },
                ],
            },
        ],
    },
    {
        id: 103,
        slug: "computer-networks",
        title: "Computer Networks",
        shortDescription: "TCP/IP, NAT, маршрутизация и диагностика сетевых проблем.",
        description: "Курс для тех, кто хочет понимать сетевую основу веба, VPN, Docker-сетей и микросервисов.",
        difficulty: "ADVANCED",
        accessType: "UNLISTED",
        enrollmentEnabled: false,
        coverImageUrl: "/course-net.jpg",
        estimatedMinutes: 510,
        status: "DRAFT",
        createdByUserId: 2,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        publishedAt: null,
        modules: [],
    },
];

let submissionSeq = 7000;
let sessionUser: CurrentUser | null = loadSessionUser();

const defaultMockDelayMs = import.meta.env.MODE === "test" ? 0 : 160;

function delay<T>(value: T, ms = defaultMockDelayMs): Promise<T> {
    return new Promise((resolve) => window.setTimeout(() => resolve(structuredClone(value)), ms));
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

function publicCourseDetails(course: TeacherCourseDetails): CourseDetails {
    return {
        ...publicCourse(course),
        description: course.description,
        status: course.status,
        modules: course.modules,
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

function loadEnrolledCourseIds() {
    const raw = localStorage.getItem(enrolledCoursesKey);
    if (!raw) return [101, 102];
    try {
        const ids = JSON.parse(raw) as unknown;
        return Array.isArray(ids) ? ids.filter((id): id is number => typeof id === "number") : [101, 102];
    } catch {
        localStorage.removeItem(enrolledCoursesKey);
        return [101, 102];
    }
}

function persistEnrolledCourseIds(ids: number[]) {
    localStorage.setItem(enrolledCoursesKey, JSON.stringify(Array.from(new Set(ids))));
}

function progressForCourse(courseId: number) {
    if (courseId === 101) return { progressPercent: 42, status: "IN_PROGRESS" as const, nextItemId: 5003 };
    if (courseId === 102) return { progressPercent: 100, status: "COMPLETED" as const, nextItemId: null };
    const course = findCourse(courseId);
    return { progressPercent: 0, status: "IN_PROGRESS" as const, nextItemId: course.modules[0]?.items[0]?.id ?? null };
}

function assertCanEnroll(course: TeacherCourseDetails) {
    if (course.status !== "PUBLISHED") throw new ApiError("Course is unavailable", 403);
    if (!course.enrollmentEnabled) throw new ApiError("Enrollment is disabled", 403);
}

function requireUser() {
    if (!sessionUser) throw new ApiError("Authentication required", 401);
    return sessionUser;
}

function requireTeacher() {
    const user = requireUser();
    if (user.role !== "TEACHER" && user.role !== "ADMIN") throw new ApiError("Access denied", 403);
    return user;
}

function findCourse(id: number) {
    const course = courses.find((item) => item.id === id);
    if (!course) throw new ApiError("Course not found", 404);
    return course;
}

function findModule(moduleId: number) {
    for (const course of courses) {
        const module = course.modules.find((item) => item.id === moduleId);
        if (module) return { course, module };
    }
    throw new ApiError("Module not found", 404);
}

function findItem(itemId: number) {
    const details = itemDetails[itemId];
    if (!details) throw new ApiError("Course item not found", 404);
    return details;
}

function courseMatchesQuery(course: TeacherCourseDetails, query?: CourseCatalogQuery | TeacherCourseQuery) {
    if (!query) return true;
    if (query.difficulty && course.difficulty !== query.difficulty) return false;
    if (query.accessType && course.accessType !== query.accessType) return false;
    if ("status" in query && query.status && course.status !== query.status) return false;
    if ("createdByUserId" in query && query.createdByUserId && course.createdByUserId !== query.createdByUserId) return false;
    if ("enrollmentEnabled" in query && query.enrollmentEnabled !== undefined && course.enrollmentEnabled !== query.enrollmentEnabled) return false;
    if (query.search) {
        const normalized = query.search.trim().toLowerCase();
        if (normalized && !`${course.title} ${course.shortDescription}`.toLowerCase().includes(normalized)) return false;
    }
    return true;
}

function nextId(values: number[]) {
    return Math.max(0, ...values) + 1;
}

export const mockBff = {
    async getMe(): Promise<CurrentUser | null> {
        if (!sessionUser) throw new ApiError("Authentication required", 401, [], "UNAUTHORIZED");
        return delay(sessionUser);
    },

    async login(request: LoginRequest): Promise<AuthResponse> {
        const account = mockAccounts.find((item) => item.email.toLowerCase() === request.email.toLowerCase());
        if (!account || account.password !== request.password) throw new ApiError("Invalid email or password", 401);
        const user: CurrentUser = { ...account };
        delete (user as Partial<MockAccount>).password;
        persistSession(user);
        return delay({ user, accessToken: "mock-access-token", refreshToken: "mock-refresh-token", tokenType: "Bearer", expiresIn: 900 });
    },

    async register(request: RegisterRequest): Promise<AuthResponse> {
        const exists = mockAccounts.some((item) => item.email.toLowerCase() === request.email.toLowerCase());
        if (exists) throw new ApiError("User with this email already exists", 409);
        const account: MockAccount = {
            id: nextId(mockAccounts.map((item) => item.id)),
            email: request.email,
            fullName: request.fullName,
            role: request.role ?? "STUDENT",
            status: "ACTIVE",
            avatarUrl: null,
            bio: null,
            preferredLocale: "ru",
            password: request.password,
        };
        mockAccounts.push(account);
        const user: CurrentUser = { ...account };
        delete (user as Partial<MockAccount>).password;
        persistSession(user);
        return delay({ user, accessToken: "mock-access-token", refreshToken: "mock-refresh-token", tokenType: "Bearer", expiresIn: 900 });
    },

    async refresh(): Promise<AuthResponse> {
        const user = requireUser();
        return delay({ user, accessToken: "mock-access-token", refreshToken: "mock-refresh-token", tokenType: "Bearer", expiresIn: 900 });
    },

    async logout(): Promise<void> {
        persistSession(null);
        return delay(undefined);
    },

    async updateProfile(request: UpdateProfileRequest): Promise<CurrentUser> {
        const user = requireUser();
        const account = mockAccounts.find((item) => item.id === user.id);
        if (!account) throw new ApiError("User not found", 404);
        account.fullName = request.fullName;
        account.avatarUrl = request.avatarUrl ?? null;
        account.bio = request.bio ?? null;
        if (request.preferredLocale) account.preferredLocale = request.preferredLocale;
        const updated: CurrentUser = { id: account.id, email: account.email, fullName: account.fullName, role: account.role, status: account.status, avatarUrl: account.avatarUrl, bio: account.bio, preferredLocale: account.preferredLocale };
        persistSession(updated);
        return delay(updated);
    },

    async changePassword(_request: ChangePasswordRequest): Promise<void> {
        void _request;
        requireUser();
        return delay(undefined);
    },

    async getDefaultLocale(): Promise<DefaultLocaleResponse> {
        const user = sessionUser;
        if (user?.preferredLocale) return delay({ locale: user.preferredLocale, source: "ACCOUNT_SETTING" });
        const browserLocale = navigator.language.toLowerCase().startsWith("en") ? "en" : "ru";
        return delay({ locale: browserLocale as Locale, source: "ACCEPT_LANGUAGE" });
    },

    async updatePreferredLocale(locale: Locale): Promise<void> {
        if (sessionUser) {
            const account = mockAccounts.find((item) => item.id === sessionUser?.id);
            if (account) {
                account.preferredLocale = locale;
                persistSession({ ...sessionUser, preferredLocale: locale });
            }
        }
        return delay(undefined);
    },

    async createTeacherRequest(request: TeacherRequestCreateRequest): Promise<TeacherAccessRequest> {
        const user = requireUser();
        const existing = teacherRequests.find((entry) => entry.userId === user.id && entry.status === "PENDING");
        if (existing) throw new ApiError("Teacher request is already pending", 409);
        const entry: TeacherAccessRequest = {
            id: nextId(teacherRequests.map((item) => item.id)),
            userId: user.id,
            status: "PENDING",
            motivation: request.motivation,
            experience: request.experience,
            portfolioUrl: request.portfolioUrl ?? null,
            preferredTopics: request.preferredTopics,
            reviewComment: null,
            createdAt: new Date().toISOString(),
            reviewedAt: null,
            reviewedByUserId: null,
            user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, status: user.status ?? "ACTIVE" },
        };
        teacherRequests = [entry, ...teacherRequests];
        return delay(entry);
    },

    async getMyTeacherRequest(): Promise<TeacherAccessRequest | null> {
        const user = requireUser();
        return delay(teacherRequests.find((entry) => entry.userId === user.id) ?? null);
    },

    async listTeacherRequests(): Promise<TeacherAccessRequest[]> {
        const user = requireUser();
        if (user.role !== "ADMIN") throw new ApiError("Admin access required", 403);
        return delay(teacherRequests);
    },

    async approveTeacherRequest(requestId: number, input: TeacherRequestReviewRequest): Promise<TeacherAccessRequest> {
        const admin = requireUser();
        if (admin.role !== "ADMIN") throw new ApiError("Admin access required", 403);
        const entry = teacherRequests.find((item) => item.id === requestId);
        if (!entry) throw new ApiError("Teacher request not found", 404);
        entry.status = "APPROVED";
        entry.reviewComment = input.reviewComment ?? null;
        entry.reviewedAt = new Date().toISOString();
        entry.reviewedByUserId = admin.id;
        const account = mockAccounts.find((item) => item.id === entry.userId);
        if (account) account.role = "TEACHER";
        return delay(entry);
    },

    async rejectTeacherRequest(requestId: number, input: TeacherRequestReviewRequest): Promise<TeacherAccessRequest> {
        const admin = requireUser();
        if (admin.role !== "ADMIN") throw new ApiError("Admin access required", 403);
        const entry = teacherRequests.find((item) => item.id === requestId);
        if (!entry) throw new ApiError("Teacher request not found", 404);
        entry.status = "REJECTED";
        entry.reviewComment = input.reviewComment ?? null;
        entry.reviewedAt = new Date().toISOString();
        entry.reviewedByUserId = admin.id;
        return delay(entry);
    },

    async registerTeacherRequest(request: RegisterTeacherRequest): Promise<RegisterTeacherRequestResponse> {
        const auth = await this.register({ fullName: request.fullName, email: request.email, password: request.password, role: "STUDENT" });
        const teacherRequest = await this.createTeacherRequest({
            motivation: request.motivation,
            experience: request.experience,
            portfolioUrl: request.portfolioUrl,
            preferredTopics: request.preferredTopics,
        });
        return delay({ ...auth, teacherRequest: { id: teacherRequest.id, status: teacherRequest.status } });
    },

    async getCourses(query?: CourseCatalogQuery): Promise<CourseCatalogItem[]> {
        return delay(courses.filter((course) => course.status === "PUBLISHED").filter((course) => courseMatchesQuery(course, query)).map(publicCourse));
    },

    async getCourse(courseId: number): Promise<CourseDetails> {
        return delay(publicCourseDetails(findCourse(courseId)));
    },

    async getCourseItemPreview(courseId: number, itemId: number): Promise<CourseItemPreview> {
        findCourse(courseId);
        const item = findItem(itemId);
        return delay({
            id: item.id,
            title: item.title,
            itemType: item.itemType,
            orderIndex: item.orderIndex,
            statement: item.statement,
            contentBlocks: item.contentBlocks,
        });
    },

    async enrollCourse(courseId: number): Promise<EnrollCourseResponse> {
        requireUser();
        const course = findCourse(courseId);
        assertCanEnroll(course);
        const currentIds = loadEnrolledCourseIds();
        if (!currentIds.includes(courseId)) persistEnrolledCourseIds([...currentIds, courseId]);
        const progress = progressForCourse(courseId);
        return delay({ courseId, status: progress.status, progressPercent: progress.progressPercent });
    },

    async getMyLearning(): Promise<EnrollmentSummary[]> {
        requireUser();
        const enrolled = loadEnrolledCourseIds()
            .map((courseId) => courses.find((course) => course.id === courseId))
            .filter((course): course is TeacherCourseDetails => Boolean(course))
            .filter((course) => course.status === "PUBLISHED");

        return delay(enrolled.map((course) => ({ course: publicCourse(course), ...progressForCourse(course.id) })));
    },

    async getLearningCourse(courseId: number): Promise<LearningCourse> {
        requireUser();
        const course = findCourse(courseId);
        assertCanEnroll(course);
        const progress = progressForCourse(courseId);
        return delay({ ...publicCourseDetails(course), progressPercent: progress.progressPercent, enrollmentStatus: progress.status, nextItemId: progress.nextItemId });
    },

    async getLearningItem(courseId: number, itemId: number): Promise<LearningItem> {
        requireUser();
        const course = findCourse(courseId);
        const item = findItem(itemId);
        const allItems = course.modules.flatMap((module) => module.items).sort((a, b) => a.orderIndex - b.orderIndex);
        const currentIndex = allItems.findIndex((entry) => entry.id === itemId);
        return delay({
            course: { id: course.id, slug: course.slug, title: course.title },
            item: {
                id: item.id,
                title: item.title,
                itemType: item.itemType,
                statement: item.statement,
                contentBlocks: item.contentBlocks,
                hints: item.hints,
                options: item.options.map((option) => ({ ...option, correct: undefined })),
                starterCode: item.starterCode,
                language: item.language,
            },
            progress: { status: currentIndex < 2 ? "COMPLETED" : "IN_PROGRESS", attemptsCount: 2, lastScore: currentIndex < 2 ? 100 : 60 },
            navigation: {
                previousItemId: currentIndex > 0 ? allItems[currentIndex - 1].id : null,
                nextItemId: currentIndex >= 0 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1].id : null,
            },
        });
    },

    async runItem(courseId: number, itemId: number, request: RunItemRequest): Promise<SubmissionResult> {
        requireUser();
        findCourse(courseId);
        const item = findItem(itemId);

        if (item.itemType === "QUIZ") {
            const selectedIds = request.selectedOptionIds ?? [];
            const correctIds = item.options.filter((option) => option.correct).map((option) => option.id);
            const passed = correctIds.length > 0 && correctIds.every((id) => selectedIds.includes(id)) && selectedIds.every((id) => correctIds.includes(id));
            return delay({
                id: ++submissionSeq,
                itemId,
                status: passed ? "ACCEPTED" : "WRONG_ANSWER",
                score: passed ? 100 : 0,
                passedTests: passed ? 1 : 0,
                totalTests: 1,
                stdout: null,
                stderr: null,
                testResults: [{ testKey: "quiz-answer", visibility: "OPEN", passed, actualOutput: selectedIds.join(","), message: passed ? "Correct answer" : "Review the explanation and try again", durationMs: null, memoryMb: null }],
                createdAt: new Date().toISOString(),
            });
        }

        const submittedText = item.itemType === "SQL" ? request.sql : request.sourceCode;
        const passed = Boolean(submittedText?.trim());
        return delay({
            id: ++submissionSeq,
            itemId,
            status: passed ? "ACCEPTED" : "WRONG_ANSWER",
            score: passed ? 100 : 0,
            passedTests: passed ? 1 : 0,
            totalTests: 1,
            stdout: passed ? "Sample run completed" : null,
            stderr: null,
            testResults: [{ testKey: "sample-1", visibility: "OPEN", passed, actualOutput: passed ? "5" : null, message: passed ? null : "Source code is empty", durationMs: 16, memoryMb: 12 }],
            createdAt: new Date().toISOString(),
        });
    },

    async submitItem(courseId: number, itemId: number, request: RunItemRequest): Promise<SubmissionResult> {
        return this.runItem(courseId, itemId, request);
    },

    async getItemSubmissions(_courseId: number, itemId: number): Promise<SubmissionHistoryItem[]> {
        requireUser();
        return delay([{ id: 6999, itemId, status: "ACCEPTED", score: 100, passedTests: 2, totalTests: 2, createdAt: new Date(Date.now() - 3600000).toISOString() }]);
    },

    async getSubmission(submissionId: number): Promise<SubmissionResult> {
        requireUser();
        return delay({ id: submissionId, itemId: 5003, status: "ACCEPTED", score: 100, passedTests: 2, totalTests: 2, stdout: "OK", stderr: null, testResults: [], createdAt: new Date().toISOString() });
    },

    async getTeacherCourses(query?: TeacherCourseQuery): Promise<TeacherCourseSummary[]> {
        const user = requireTeacher();
        return delay(
            courses
                .filter((course) => user.role === "ADMIN" || course.createdByUserId === user.id)
                .filter((course) => courseMatchesQuery(course, query))
                .map((course) => ({ ...publicCourse(course), status: course.status, updatedAt: course.updatedAt, createdByUserId: course.createdByUserId }))
        );
    },

    async createTeacherCourse(request: CourseUpsertRequest): Promise<TeacherCourseDetails> {
        const user = requireTeacher();
        const course: TeacherCourseDetails = {
            id: nextId(courses.map((item) => item.id)),
            ...request,
            status: "DRAFT",
            createdByUserId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: null,
            modules: [],
        };
        courses = [course, ...courses];
        return delay(course);
    },

    async getTeacherCourse(courseId: number): Promise<TeacherCourseDetails> {
        requireTeacher();
        return delay(findCourse(courseId));
    },

    async updateTeacherCourse(courseId: number, request: CourseUpsertRequest): Promise<TeacherCourseDetails> {
        requireTeacher();
        const course = findCourse(courseId);
        Object.assign(course, request, { updatedAt: new Date().toISOString() });
        return delay(course);
    },

    async publishTeacherCourse(courseId: number): Promise<TeacherCourseDetails> {
        requireTeacher();
        const course = findCourse(courseId);
        course.status = "PUBLISHED";
        course.publishedAt = new Date().toISOString();
        course.updatedAt = new Date().toISOString();
        return delay(course);
    },

    async archiveTeacherCourse(courseId: number): Promise<TeacherCourseDetails> {
        requireTeacher();
        const course = findCourse(courseId);
        course.status = "ARCHIVED";
        course.updatedAt = new Date().toISOString();
        return delay(course);
    },

    async createModule(courseId: number, request: ModuleUpsertRequest): Promise<CourseModuleSummary> {
        requireTeacher();
        const course = findCourse(courseId);
        const module = { id: nextId(courses.flatMap((item) => item.modules.map((module) => module.id))), title: request.title, orderIndex: request.orderIndex, items: [] };
        course.modules.push(module);
        course.updatedAt = new Date().toISOString();
        return delay(module);
    },

    async updateModule(moduleId: number, request: ModuleUpsertRequest): Promise<CourseModuleSummary> {
        requireTeacher();
        const { course, module } = findModule(moduleId);
        Object.assign(module, request);
        course.updatedAt = new Date().toISOString();
        return delay(module);
    },

    async deleteModule(moduleId: number): Promise<void> {
        requireTeacher();
        const { course, module } = findModule(moduleId);
        for (const item of module.items) delete itemDetails[item.id];
        course.modules = course.modules.filter((module) => module.id !== moduleId);
        course.updatedAt = new Date().toISOString();
        return delay(undefined);
    },

    async reorderModules(courseId: number, request: ReorderModulesRequest): Promise<CourseModuleSummary[]> {
        requireTeacher();
        const course = findCourse(courseId);
        course.modules = request.orderedModuleIds.map((id, index) => {
            const module = course.modules.find((entry) => entry.id === id);
            if (!module) throw new ApiError("Invalid module reorder request", 400);
            return { ...module, orderIndex: index };
        });
        course.updatedAt = new Date().toISOString();
        return delay(course.modules);
    },

    async createItem(moduleId: number, request: CourseItemUpsertRequest): Promise<TeacherItemDetails> {
        requireTeacher();
        const { course, module } = findModule(moduleId);
        const id = nextId(Object.keys(itemDetails).map(Number));
        const item: TeacherItemDetails = { id, moduleId, ...request, contentBlocks: [], hints: [], testCases: [], options: [] };
        itemDetails[id] = item;
        module.items.push({ id, title: request.title, itemType: request.itemType, orderIndex: request.orderIndex });
        course.updatedAt = new Date().toISOString();
        return delay(item);
    },

    async getItem(itemId: number): Promise<TeacherItemDetails> {
        requireTeacher();
        return delay(findItem(itemId));
    },

    async updateItem(itemId: number, request: CourseItemUpsertRequest): Promise<TeacherItemDetails> {
        requireTeacher();
        const item = findItem(itemId);
        Object.assign(item, request);
        for (const course of courses) {
            for (const module of course.modules) {
                const summary = module.items.find((entry) => entry.id === itemId);
                if (summary) {
                    summary.title = request.title;
                    summary.itemType = request.itemType;
                    summary.orderIndex = request.orderIndex;
                    course.updatedAt = new Date().toISOString();
                }
            }
        }
        return delay(item);
    },

    async deleteItem(itemId: number): Promise<void> {
        requireTeacher();
        delete itemDetails[itemId];
        for (const course of courses) {
            for (const module of course.modules) module.items = module.items.filter((item) => item.id !== itemId);
            course.updatedAt = new Date().toISOString();
        }
        return delay(undefined);
    },

    async reorderItems(moduleId: number, request: ReorderItemsRequest): Promise<CourseModuleSummary> {
        requireTeacher();
        const { course, module } = findModule(moduleId);
        module.items = request.orderedItemIds.map((id, index) => {
            const item = module.items.find((entry) => entry.id === id);
            if (!item) throw new ApiError("Invalid item reorder request", 400);
            const details = itemDetails[id];
            if (details) details.orderIndex = index;
            return { ...item, orderIndex: index };
        });
        course.updatedAt = new Date().toISOString();
        return delay(module);
    },

    async replaceContentBlocks(itemId: number, blocks: ContentBlockUpsertRequest[]): Promise<TeacherItemDetails> {
        requireTeacher();
        const item = findItem(itemId);
        item.contentBlocks = blocks.map((block, index) => ({ id: 10000 + index, ...block }));
        return delay(item);
    },

    async replaceHints(itemId: number, hints: HintUpsertRequest[]): Promise<TeacherItemDetails> {
        requireTeacher();
        const item = findItem(itemId);
        item.hints = hints.map((hint, index) => ({ id: 11000 + index, ...hint }));
        return delay(item);
    },

    async replaceTestCases(itemId: number, testCases: TestCaseUpsertRequest[]): Promise<TeacherItemDetails> {
        requireTeacher();
        const item = findItem(itemId);
        item.testCases = testCases.map((testCase, index) => ({ id: 12000 + index, ...testCase }));
        return delay(item);
    },

    async replaceOptions(itemId: number, options: QuizOptionUpsertRequest[]): Promise<TeacherItemDetails> {
        requireTeacher();
        const item = findItem(itemId);
        item.options = options.map((option, index) => ({ id: 13000 + index, ...option }));
        return delay(item);
    },
};

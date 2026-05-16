export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export type CurrentUser = {
    id: number;
    email: string;
    fullName: string | null;
    role: UserRole;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    fullName: string;
    email: string;
    password: string;
    role?: UserRole;
};

export type AuthResponse = {
    user: CurrentUser;
};

export type CourseDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CourseAccessType = "PUBLIC" | "UNLISTED" | "PRIVATE";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CourseItemType = "THEORY" | "QUIZ" | "CODING" | "SQL" | "FILE";
export type LearningStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type CourseCatalogItem = {
    id: number;
    slug: string;
    title: string;
    shortDescription: string;
    difficulty: CourseDifficulty;
    accessType: CourseAccessType;
    enrollmentEnabled: boolean;
    coverImageUrl: string | null;
    estimatedMinutes: number | null;
};

export type CourseItemSummary = {
    id: number;
    title: string;
    itemType: CourseItemType;
    orderIndex: number;
    estimatedMinutes?: number | null;
};

export type CourseModuleSummary = {
    id: number;
    title: string;
    orderIndex: number;
    items: CourseItemSummary[];
};

export type CourseDetails = CourseCatalogItem & {
    description: string;
    status: CourseStatus;
    modules: CourseModuleSummary[];
};

export type EnrollmentSummary = {
    course: CourseCatalogItem;
    progressPercent: number;
    status: LearningStatus;
    nextItemId: number | null;
};

export type TeacherCourseSummary = CourseCatalogItem & {
    status: CourseStatus;
    updatedAt: string;
};

export type ApiValidationError = {
    field?: string;
    message: string;
};

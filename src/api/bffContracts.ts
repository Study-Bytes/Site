export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";
export type Locale = "ru" | "en";
export type LocaleSource = "ACCOUNT_SETTING" | "ACCEPT_LANGUAGE" | "GEO_IP" | "FALLBACK";

export type CurrentUser = {
    id: number;
    email: string;
    fullName: string | null;
    role: UserRole;
    status?: UserStatus;
    avatarUrl?: string | null;
    bio?: string | null;
    preferredLocale?: Locale | null;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    fullName: string;
    email: string;
    password: string;
    role?: Exclude<UserRole, "ADMIN">;
    preferredLocale?: Locale | null;
};

export type AuthResponse = {
    user: CurrentUser;
    accessToken?: string;
    refreshToken?: string;
    tokenType?: "Bearer" | string;
    expiresIn?: number;
};

export type RefreshTokenRequest = {
    refreshToken?: string;
};

export type UpdateProfileRequest = {
    fullName: string;
    avatarUrl?: string | null;
    bio?: string | null;
    preferredLocale?: Locale | null;
};


export type UpdateSettingsRequest = UpdateProfileRequest;

export type DefaultLocaleResponse = {
    locale: Locale;
    source: LocaleSource;
};

export type ChangePasswordRequest = {
    currentPassword: string;
    newPassword: string;
};

export type CourseDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CourseAccessType = "PUBLIC" | "UNLISTED" | "PRIVATE";
export type CourseStatus = "DRAFT" | "PENDING_REVIEW" | "CHANGES_REQUESTED" | "PUBLISHED" | "ARCHIVED";
export type CourseItemType = "THEORY" | "QUIZ" | "CODING" | "SQL" | "FILE";
export type ModuleDeadlineType = "NONE" | "ABSOLUTE" | "RELATIVE_FROM_START";
export type ModuleDeadlineStatus = "IN_PROGRESS_ON_TIME" | "OVERDUE" | "COMPLETED_ON_TIME" | "COMPLETED_LATE";
export type ContentBlockType = "TEXT" | "VIDEO" | "IMAGE" | "CODE" | "EMBED" | "FILE";
export type TestCaseVisibility = "OPEN" | "HIDDEN";
export type ComparisonMode = "EXACT" | "IGNORE_WHITESPACE" | "CUSTOM";
export type LearningStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type SubmissionStatus = "PENDING" | "RUNNING" | "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "COMPILATION_ERROR" | "TIME_LIMIT" | "MEMORY_LIMIT" | "SYSTEM_ERROR";

export type ApiValidationError = {
    field?: string;
    message: string;
};

export type ApiErrorResponse = {
    status: number;
    code?: string;
    error?: string;
    message: string;
    requestId?: string;
    validationErrors?: ApiValidationError[];
};

export type PageResponse<T> = {
    items: T[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
};

export type CourseCatalogQuery = {
    search?: string;
    difficulty?: CourseDifficulty;
    accessType?: CourseAccessType;
    enrollmentEnabled?: boolean;
    minEstimatedMinutes?: number;
    maxEstimatedMinutes?: number;
    page?: number;
    size?: number;
};

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
    completed?: boolean;
    locked?: boolean;
};

export type CourseModuleSummary = {
    id: number;
    title: string;
    orderIndex: number;
    deadlineType: ModuleDeadlineType;
    deadlineAt: string | null;
    timeLimitMinutes: number | null;
    items: CourseItemSummary[];
};

export type CourseDetails = CourseCatalogItem & {
    description: string;
    status: CourseStatus;
    modules: CourseModuleSummary[];
};

export type CourseItemPreview = CourseItemSummary & {
    statement: string | null;
    contentBlocks: ContentBlockDto[];
};

export type ContentBlockDto = {
    id: number;
    blockType: ContentBlockType;
    orderIndex: number;
    title: string | null;
    textContent: string | null;
    url: string | null;
    language: string | null;
    metadataJson: string | null;
};

export type HintDto = {
    id: number;
    orderIndex: number;
    text: string;
};

export type QuizOptionDto = {
    id: number;
    orderIndex: number;
    label: string | null;
    text: string;
    selected?: boolean;
    correct?: boolean;
    explanation?: string | null;
};

export type TestCaseDto = {
    id: number;
    testKey: string;
    orderIndex: number;
    visibility: TestCaseVisibility;
    inputData: string | null;
    expectedOutput?: string | null;
};

export type EnrollmentSummary = {
    course: CourseCatalogItem;
    progressPercent: number;
    status: LearningStatus;
    nextItemId: number | null;
};

export type EnrollCourseResponse = {
    courseId: number;
    status: LearningStatus;
    progressPercent: number;
};

export type LearningCourse = CourseDetails & {
    progressPercent: number;
    enrollmentStatus: LearningStatus;
    nextItemId: number | null;
};

export type ModuleStartResponse = {
    courseId: number;
    moduleId: number;
    startedAt: string;
    alreadyStarted: boolean;
};

export type ModuleDeadlineTaskCompletion = {
    taskId: number;
    completedAt: string;
};

export type ModuleDeadlineState = {
    courseId: number;
    moduleId: number;
    deadlineAt: string;
    moduleCompletedAt: string | null;
    moduleCompletedBeforeDeadline: boolean | null;
    deadlineStatus: ModuleDeadlineStatus;
    tasksCompletedBeforeDeadline: ModuleDeadlineTaskCompletion[];
    tasksCompletedAfterDeadline: ModuleDeadlineTaskCompletion[];
};

export type CourseLeaderboardEntry = {
    userId: number;
    fullName: string | null;
    avatarUrl?: string | null;
    progressPercent: number;
    rank: number;
};

export type CourseLeaderboardResponse = {
    courseId: number;
    top: CourseLeaderboardEntry[];
    currentUser: CourseLeaderboardEntry | null;
};

export type LearningItem = {
    course: Pick<CourseCatalogItem, "id" | "slug" | "title">;
    item: {
        id: number;
        title: string;
        itemType: CourseItemType;
        statement: string | null;
        contentBlocks: ContentBlockDto[];
        hints: HintDto[];
        options: QuizOptionDto[];
        starterCode: string | null;
        language: string | null;
    };
    progress: {
        status: LearningStatus;
        attemptsCount: number;
        lastScore: number | null;
    };
    navigation: {
        previousItemId: number | null;
        nextItemId: number | null;
    };
};

export type RunItemRequest = {
    sourceCode?: string;
    sql?: string;
    selectedOptionIds?: number[];
};

export type SubmitItemRequest = RunItemRequest;

export type TestResultDto = {
    testKey: string;
    visibility: TestCaseVisibility;
    passed: boolean;
    actualOutput: string | null;
    message: string | null;
    durationMs: number | null;
    memoryMb: number | null;
};

export type SubmissionResult = {
    id: number;
    itemId: number;
    status: SubmissionStatus;
    score: number | null;
    passedTests: number;
    totalTests: number;
    stdout: string | null;
    stderr: string | null;
    testResults: TestResultDto[];
    createdAt: string;
};

export type SubmissionHistoryItem = Pick<SubmissionResult, "id" | "itemId" | "status" | "score" | "passedTests" | "totalTests" | "createdAt">;

export type TeacherCourseQuery = {
    search?: string;
    status?: CourseStatus;
    difficulty?: CourseDifficulty;
    accessType?: CourseAccessType;
    createdByUserId?: number;
    page?: number;
    size?: number;
};

export type TeacherCourseSummary = CourseCatalogItem & {
    status: CourseStatus;
    updatedAt: string;
    createdByUserId?: number;
    createdByUserEmail?: string | null;
    createdByUserFullName?: string | null;
    submittedForReviewAt?: string | null;
    reviewedAt?: string | null;
    reviewedByUserId?: number | null;
    reviewComment?: string | null;
};

export type TeacherCourseDetails = CourseDetails & {
    createdByUserId: number;
    createdByUserEmail?: string | null;
    createdByUserFullName?: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    submittedForReviewAt?: string | null;
    reviewedAt?: string | null;
    reviewedByUserId?: number | null;
    reviewComment?: string | null;
};

export type CourseUpsertRequest = {
    slug: string;
    title: string;
    shortDescription: string;
    description: string;
    difficulty: CourseDifficulty;
    accessType: CourseAccessType;
    enrollmentEnabled: boolean;
    coverImageUrl: string | null;
    estimatedMinutes: number | null;
};

export type ModuleUpsertRequest = {
    title: string;
    orderIndex: number;
    deadlineType?: ModuleDeadlineType;
    deadlineAt?: string | null;
    timeLimitMinutes?: number | null;
};

export type ReorderModulesRequest = {
    orderedModuleIds: number[];
};

export type ReorderItemsRequest = {
    orderedItemIds: number[];
};

export type TeacherItemDetails = {
    id: number;
    moduleId: number;
    title: string;
    itemType: CourseItemType;
    statement: string | null;
    orderIndex: number;
    language: string | null;
    starterCode: string | null;
    solutionCode: string | null;
    timeLimitMs: number | null;
    memoryLimitMb: number | null;
    outputLimitKb: number | null;
    networkDisabled: boolean;
    readOnlyFs: boolean;
    comparisonMode: ComparisonMode;
    normalizeLineEndings: boolean;
    trimTrailingWhitespaces: boolean;
    contentBlocks: ContentBlockDto[];
    hints: HintDto[];
    testCases: TestCaseDto[];
    options: QuizOptionDto[];
};

export type CourseItemUpsertRequest = Omit<TeacherItemDetails, "id" | "moduleId" | "contentBlocks" | "hints" | "testCases" | "options">;

export type ContentBlockUpsertRequest = Omit<ContentBlockDto, "id">;
export type HintUpsertRequest = Omit<HintDto, "id">;
export type TestCaseUpsertRequest = Omit<TestCaseDto, "id">;
export type QuizOptionUpsertRequest = Omit<QuizOptionDto, "id" | "selected">;

export type CourseModerationReviewRequest = {
    reviewComment?: string | null;
};

import type { ContentBlockUpsertRequest, CourseItemUpsertRequest, CourseUpsertRequest, HintUpsertRequest, QuizOptionUpsertRequest, TestCaseUpsertRequest } from "../api/bffContracts";

export type CourseTemplateItem = {
    item: CourseItemUpsertRequest;
    contentBlocks?: ContentBlockUpsertRequest[];
    hints?: HintUpsertRequest[];
    testCases?: TestCaseUpsertRequest[];
    options?: QuizOptionUpsertRequest[];
};

export type CourseTemplateModule = {
    title: string;
    orderIndex: number;
    items: CourseTemplateItem[];
};

export type CourseTemplate = {
    id: string;
    title: string;
    description: string;
    course: CourseUpsertRequest;
    modules: CourseTemplateModule[];
};

const baseExecutable = {
    networkDisabled: true,
    readOnlyFs: true,
    comparisonMode: "EXACT" as const,
    normalizeLineEndings: true,
    trimTrailingWhitespaces: true,
};

export const courseTemplates: CourseTemplate[] = [
    {
        id: "programming-fundamentals",
        title: "Programming fundamentals",
        description: "Theory, quiz and coding tasks for a first programming course.",
        course: {
            title: "Programming Fundamentals",
            slug: "programming-fundamentals-draft",
            shortDescription: "A balanced course with theory, quizzes and coding practice.",
            description: "Use this template to explain basic concepts and add practice after each module.",
            difficulty: "BEGINNER",
            accessType: "PUBLIC",
            enrollmentEnabled: true,
            coverImageUrl: "/course-java.jpg",
            estimatedMinutes: 240,
        },
        modules: [
            {
                title: "Getting started",
                orderIndex: 0,
                items: [
                    {
                        item: { title: "What is a program?", itemType: "THEORY", statement: "Introduce input, processing and output.", orderIndex: 0, language: null, starterCode: null, solutionCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        contentBlocks: [{ blockType: "TEXT", orderIndex: 0, title: "Core idea", textContent: "A program is a sequence of instructions executed by a computer.", url: null, language: null, metadataJson: null }],
                        hints: [{ orderIndex: 0, text: "Use a real-world analogy before moving to code." }],
                    },
                    {
                        item: { title: "Concept check", itemType: "QUIZ", statement: "Which part stores values during program execution?", orderIndex: 1, language: null, starterCode: null, solutionCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        options: [
                            { orderIndex: 0, label: "A", text: "Variable", correct: true, explanation: "Variables store values." },
                            { orderIndex: 1, label: "B", text: "Comment", correct: false, explanation: "Comments are ignored by the runtime." },
                        ],
                    },
                    {
                        item: { title: "Print hello", itemType: "CODING", statement: "Print Hello, StudyBytes!", orderIndex: 2, language: "python", starterCode: "print(\"\")", solutionCode: "print(\"Hello, StudyBytes!\")", timeLimitMs: 2000, memoryLimitMb: 256, outputLimitKb: 64, ...baseExecutable },
                        testCases: [{ testKey: "sample-1", orderIndex: 0, visibility: "OPEN", inputData: null, expectedOutput: "Hello, StudyBytes!" }],
                    },
                ],
            },
        ],
    },
    {
        id: "sql-practice",
        title: "SQL practice module",
        description: "Ready structure for a database practice course.",
        course: {
            title: "SQL Practice",
            slug: "sql-practice-draft",
            shortDescription: "Practice SELECT, WHERE and simple filters.",
            description: "Use this template for SQL exercises with open and hidden checks.",
            difficulty: "INTERMEDIATE",
            accessType: "PUBLIC",
            enrollmentEnabled: true,
            coverImageUrl: "/course-sql.jpg",
            estimatedMinutes: 180,
        },
        modules: [
            {
                title: "Filtering rows",
                orderIndex: 0,
                items: [
                    {
                        item: { title: "SELECT basics", itemType: "THEORY", statement: "Explain SELECT and WHERE.", orderIndex: 0, language: null, starterCode: null, solutionCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        contentBlocks: [{ blockType: "CODE", orderIndex: 0, title: "Example", textContent: "SELECT * FROM users WHERE status = 'ACTIVE';", url: null, language: "sql", metadataJson: null }],
                    },
                    {
                        item: { title: "Active users query", itemType: "SQL", statement: "Select active users from users table.", orderIndex: 1, language: "postgresql", starterCode: "SELECT *\nFROM users\nWHERE ...;", solutionCode: "SELECT *\nFROM users\nWHERE status = 'ACTIVE';", timeLimitMs: 2000, memoryLimitMb: 256, outputLimitKb: 128, ...baseExecutable },
                        hints: [{ orderIndex: 0, text: "Filter by status." }],
                        testCases: [{ testKey: "sample-sql", orderIndex: 0, visibility: "OPEN", inputData: null, expectedOutput: "active users" }],
                    },
                ],
            },
        ],
    },
    {
        id: "quiz-theory",
        title: "Quiz-based theory module",
        description: "Short theory blocks followed by quiz checks.",
        course: {
            title: "Theory and Quiz Draft",
            slug: "theory-quiz-draft",
            shortDescription: "Explain concepts and check understanding with quizzes.",
            description: "Use this template for non-coding modules or introductory lessons.",
            difficulty: "BEGINNER",
            accessType: "PUBLIC",
            enrollmentEnabled: true,
            coverImageUrl: "/course-algo.jpg",
            estimatedMinutes: 120,
        },
        modules: [
            {
                title: "Concepts",
                orderIndex: 0,
                items: [
                    {
                        item: { title: "Theory lesson", itemType: "THEORY", statement: "Explain the concept with examples.", orderIndex: 0, language: null, starterCode: null, solutionCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        contentBlocks: [{ blockType: "TEXT", orderIndex: 0, title: "Explanation", textContent: "Replace this text with a concise explanation and examples.", url: null, language: null, metadataJson: null }],
                    },
                    {
                        item: { title: "Knowledge check", itemType: "QUIZ", statement: "Choose the correct answer.", orderIndex: 1, language: null, starterCode: null, solutionCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        options: [
                            { orderIndex: 0, label: "A", text: "Correct answer", correct: true, explanation: "Explain why this is correct." },
                            { orderIndex: 1, label: "B", text: "Distractor", correct: false, explanation: "Explain the misconception." },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "coding-practice",
        title: "Coding practice module",
        description: "Focused practice course with starter code, hints and visible tests.",
        course: {
            title: "Coding Practice Draft",
            slug: "coding-practice-draft",
            shortDescription: "A practice-first structure for executable programming tasks.",
            description: "Use this template for courses where most learning happens through coding exercises.",
            difficulty: "INTERMEDIATE",
            accessType: "PUBLIC",
            enrollmentEnabled: true,
            coverImageUrl: "/course-java.jpg",
            estimatedMinutes: 210,
        },
        modules: [
            {
                title: "Functions and conditions",
                orderIndex: 0,
                items: [
                    {
                        item: { title: "Function checklist", itemType: "THEORY", statement: "Explain how inputs, return values and edge cases work.", orderIndex: 0, language: null, starterCode: null, solutionCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        contentBlocks: [{ blockType: "TEXT", orderIndex: 0, title: "Before coding", textContent: "Define the function contract before writing tests or implementation.", url: null, language: null, metadataJson: null }],
                    },
                    {
                        item: { title: "Even number checker", itemType: "CODING", statement: "Implement is_even(n) and return true for even numbers.", orderIndex: 1, language: "python", starterCode: "def is_even(n):\n    pass", solutionCode: "def is_even(n):\n    return n % 2 == 0", timeLimitMs: 2000, memoryLimitMb: 256, outputLimitKb: 64, ...baseExecutable },
                        hints: [{ orderIndex: 0, text: "Use the remainder operator." }],
                        testCases: [
                            { testKey: "open-even", orderIndex: 0, visibility: "OPEN", inputData: "2", expectedOutput: "true" },
                            { testKey: "hidden-odd", orderIndex: 1, visibility: "HIDDEN", inputData: "7", expectedOutput: "false" },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "mixed-course",
        title: "Mixed theory, quiz and coding",
        description: "A balanced course skeleton with explanation, quiz checkpoint and practice.",
        course: {
            title: "Mixed Course Draft",
            slug: "mixed-course-draft",
            shortDescription: "Theory, quiz and executable practice in one course structure.",
            description: "Use this template when every module should contain concept explanation, knowledge check and a task.",
            difficulty: "BEGINNER",
            accessType: "PUBLIC",
            enrollmentEnabled: true,
            coverImageUrl: "/course-algo.jpg",
            estimatedMinutes: 300,
        },
        modules: [
            {
                title: "One concept loop",
                orderIndex: 0,
                items: [
                    {
                        item: { title: "Concept explanation", itemType: "THEORY", statement: "Explain one concept with an example.", orderIndex: 0, language: null, starterCode: null, solutionCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        contentBlocks: [{ blockType: "TEXT", orderIndex: 0, title: "Explanation", textContent: "Replace this with a short explanation, an example and common mistakes.", url: null, language: null, metadataJson: null }],
                    },
                    {
                        item: { title: "Fast checkpoint", itemType: "QUIZ", statement: "Choose the statement that best describes the concept.", orderIndex: 1, language: null, starterCode: null, solutionCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        options: [
                            { orderIndex: 0, label: "A", text: "Correct concept statement", correct: true, explanation: "This is the intended definition." },
                            { orderIndex: 1, label: "B", text: "Common misconception", correct: false, explanation: "Use the explanation to clarify this mistake." },
                        ],
                    },
                    {
                        item: { title: "Apply the concept", itemType: "CODING", statement: "Solve a small task that uses the concept.", orderIndex: 2, language: "python", starterCode: "# write your solution here", solutionCode: "# replace with reference solution", timeLimitMs: 2000, memoryLimitMb: 256, outputLimitKb: 64, ...baseExecutable },
                        hints: [{ orderIndex: 0, text: "Start from the example above and change one thing at a time." }],
                        testCases: [{ testKey: "sample", orderIndex: 0, visibility: "OPEN", inputData: null, expectedOutput: "expected output" }],
                    },
                ],
            },
        ],
    },
];

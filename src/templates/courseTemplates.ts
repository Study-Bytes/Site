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
        title: "Основы программирования",
        description: "Готовый маршрут для первого курса: теория, короткие проверки и практические задания.",
        course: {
            title: "Основы программирования",
            slug: "programming-fundamentals-draft",
            shortDescription: "Базовый курс с теорией, квизами и практикой написания кода.",
            description: "Шаблон помогает выстроить курс от простых понятий к первым самостоятельным задачам. В каждом модуле есть объяснение, проверка понимания и практика.",
            difficulty: "BEGINNER",
            accessType: "PUBLIC",
            enrollmentEnabled: true,
            coverImageUrl: "/course-java.jpg",
            estimatedMinutes: 240,
        },
        modules: [
            {
                title: "Старт в программировании",
                orderIndex: 0,
                items: [
                    {
                        item: { title: "Что такое программа", itemType: "THEORY", statement: "Объясните идею ввода, обработки и вывода данных.", orderIndex: 0, language: null, starterCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        contentBlocks: [{ blockType: "TEXT", orderIndex: 0, title: "Главная идея", textContent: "Программа - это последовательность команд, которые компьютер выполняет в заданном порядке. Обычно программа получает входные данные, обрабатывает их и возвращает результат.", url: null, language: null, metadataJson: null }],
                        hints: [{ orderIndex: 0, text: "Начните с бытового примера: рецепт, инструкция или маршрут." }],
                    },
                    {
                        item: { title: "Проверка понимания", itemType: "QUIZ", statement: "Что используется для хранения значения во время выполнения программы?", orderIndex: 1, language: null, starterCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        options: [
                            { orderIndex: 0, label: "A", text: "Переменная", correct: true, explanation: "Переменная хранит значение, к которому программа может обратиться позже." },
                            { orderIndex: 1, label: "B", text: "Комментарий", correct: false, explanation: "Комментарий помогает читать код, но не хранит данные во время выполнения." },
                        ],
                    },
                    {
                        item: { title: "Первый вывод", itemType: "CODING", statement: "Выведите строку Привет, StudyBytes!", orderIndex: 2, language: "python", starterCode: "print(\"\")", timeLimitMs: 2000, memoryLimitMb: 256, outputLimitKb: 64, ...baseExecutable },
                        testCases: [{ testKey: "sample-1", orderIndex: 0, visibility: "OPEN", inputData: null, expectedOutput: "Привет, StudyBytes!" }],
                    },
                ],
            },
        ],
    },
    {
        id: "sql-practice",
        title: "Практика SQL",
        description: "Структура для курса по базам данных: SELECT, WHERE и первые фильтры.",
        course: {
            title: "Практика SQL",
            slug: "sql-practice-draft",
            shortDescription: "Практика SELECT, WHERE и простых условий.",
            description: "Шаблон подходит для курса с SQL-задачами, открытыми примерами и скрытыми проверками.",
            difficulty: "INTERMEDIATE",
            accessType: "PUBLIC",
            enrollmentEnabled: true,
            coverImageUrl: "/course-sql.jpg",
            estimatedMinutes: 180,
        },
        modules: [
            {
                title: "Фильтрация строк",
                orderIndex: 0,
                items: [
                    {
                        item: { title: "Основы SELECT", itemType: "THEORY", statement: "Объясните SELECT и WHERE на простом примере.", orderIndex: 0, language: null, starterCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        contentBlocks: [{ blockType: "CODE", orderIndex: 0, title: "Пример запроса", textContent: "SELECT * FROM users WHERE status = 'ACTIVE';", url: null, language: "sql", metadataJson: null }],
                    },
                    {
                        item: { title: "Активные пользователи", itemType: "SQL", statement: "Выберите активных пользователей из таблицы users.", orderIndex: 1, language: "postgresql", starterCode: "SELECT *\nFROM users\nWHERE ...;", timeLimitMs: 2000, memoryLimitMb: 256, outputLimitKb: 128, ...baseExecutable },
                        hints: [{ orderIndex: 0, text: "Нужно отфильтровать строки по полю status." }],
                        testCases: [{ testKey: "sample-sql", orderIndex: 0, visibility: "OPEN", inputData: null, expectedOutput: "active users" }],
                    },
                ],
            },
        ],
    },
    {
        id: "quiz-theory",
        title: "Теория с квизами",
        description: "Короткие теоретические блоки с проверкой понимания после каждого шага.",
        course: {
            title: "Теория и квизы",
            slug: "theory-quiz-draft",
            shortDescription: "Объяснение понятий и проверка через вопросы.",
            description: "Используйте шаблон для вводных уроков, где важно проверить понимание без программирования.",
            difficulty: "BEGINNER",
            accessType: "PUBLIC",
            enrollmentEnabled: true,
            coverImageUrl: "/course-algo.jpg",
            estimatedMinutes: 120,
        },
        modules: [
            {
                title: "Ключевые понятия",
                orderIndex: 0,
                items: [
                    {
                        item: { title: "Теоретический урок", itemType: "THEORY", statement: "Объясните понятие на примерах.", orderIndex: 0, language: null, starterCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        contentBlocks: [{ blockType: "TEXT", orderIndex: 0, title: "Объяснение", textContent: "Замените этот текст коротким объяснением, примером и типичной ошибкой.", url: null, language: null, metadataJson: null }],
                    },
                    {
                        item: { title: "Проверка знаний", itemType: "QUIZ", statement: "Выберите правильный ответ.", orderIndex: 1, language: null, starterCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        options: [
                            { orderIndex: 0, label: "A", text: "Правильный ответ", correct: true, explanation: "Объясните, почему это верно." },
                            { orderIndex: 1, label: "B", text: "Похожий, но неверный ответ", correct: false, explanation: "Покажите, в чём ошибка рассуждения." },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "coding-practice",
        title: "Практика кода",
        description: "Практический курс с заготовками кода, подсказками и открытыми тестами.",
        course: {
            title: "Практика программирования",
            slug: "coding-practice-draft",
            shortDescription: "Курс, где основное обучение происходит через решение задач.",
            description: "Шаблон подходит для практических курсов: короткая теория, задание, подсказка и набор проверок.",
            difficulty: "INTERMEDIATE",
            accessType: "PUBLIC",
            enrollmentEnabled: true,
            coverImageUrl: "/course-java.jpg",
            estimatedMinutes: 210,
        },
        modules: [
            {
                title: "Функции и условия",
                orderIndex: 0,
                items: [
                    {
                        item: { title: "Перед задачей", itemType: "THEORY", statement: "Объясните входные данные, результат и крайние случаи.", orderIndex: 0, language: null, starterCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        contentBlocks: [{ blockType: "TEXT", orderIndex: 0, title: "Что важно перед кодом", textContent: "Сначала опишите контракт функции: какие данные приходят на вход, что нужно вернуть и какие случаи проверить.", url: null, language: null, metadataJson: null }],
                    },
                    {
                        item: { title: "Проверка чётности", itemType: "CODING", statement: "Реализуйте функцию is_even(n), которая возвращает true для чётных чисел.", orderIndex: 1, language: "python", starterCode: "def is_even(n):\n    pass", timeLimitMs: 2000, memoryLimitMb: 256, outputLimitKb: 64, ...baseExecutable },
                        hints: [{ orderIndex: 0, text: "Используйте остаток от деления на 2." }],
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
        title: "Смешанный курс",
        description: "Скелет курса с объяснением, квизом и практической задачей в каждом модуле.",
        course: {
            title: "Смешанный курс",
            slug: "mixed-course-draft",
            shortDescription: "Теория, проверка знаний и практика в одной структуре.",
            description: "Шаблон подходит, если каждый модуль должен вести студента по циклу: понять идею, ответить на вопрос, применить в задаче.",
            difficulty: "BEGINNER",
            accessType: "PUBLIC",
            enrollmentEnabled: true,
            coverImageUrl: "/course-algo.jpg",
            estimatedMinutes: 300,
        },
        modules: [
            {
                title: "Один учебный цикл",
                orderIndex: 0,
                items: [
                    {
                        item: { title: "Объяснение понятия", itemType: "THEORY", statement: "Объясните одно понятие на примере.", orderIndex: 0, language: null, starterCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        contentBlocks: [{ blockType: "TEXT", orderIndex: 0, title: "Объяснение", textContent: "Замените этот блок коротким объяснением, примером и списком частых ошибок.", url: null, language: null, metadataJson: null }],
                    },
                    {
                        item: { title: "Быстрая проверка", itemType: "QUIZ", statement: "Выберите утверждение, которое лучше всего описывает понятие.", orderIndex: 1, language: null, starterCode: null, timeLimitMs: null, memoryLimitMb: null, outputLimitKb: null, ...baseExecutable },
                        options: [
                            { orderIndex: 0, label: "A", text: "Корректное определение", correct: true, explanation: "Это ожидаемая формулировка понятия." },
                            { orderIndex: 1, label: "B", text: "Типичное заблуждение", correct: false, explanation: "Используйте объяснение, чтобы разобрать эту ошибку." },
                        ],
                    },
                    {
                        item: { title: "Применение на практике", itemType: "CODING", statement: "Решите небольшую задачу, в которой используется изученное понятие.", orderIndex: 2, language: "python", starterCode: "# напишите решение здесь", timeLimitMs: 2000, memoryLimitMb: 256, outputLimitKb: 64, ...baseExecutable },
                        hints: [{ orderIndex: 0, text: "Начните с примера из теории и меняйте решение по одному шагу." }],
                        testCases: [{ testKey: "sample", orderIndex: 0, visibility: "OPEN", inputData: null, expectedOutput: "ожидаемый результат" }],
                    },
                ],
            },
        ],
    },
];

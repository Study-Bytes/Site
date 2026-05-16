# StudyBytes Site

Frontend application for the StudyBytes learning platform.

Current stack:

- Vite
- React
- TypeScript
- Material UI
- React Router
- React Hook Form
- Zod

## Architecture rule

The Site talks only to the BFF API.

```text
Site -> BFF -> backend services
```

The frontend must not call these services directly:

```text
CourseService
UserService
LearningService
CodeExecutorService
```

Use a single BFF origin and a single external BFF API prefix:

```text
VITE_BFF_BASE_URL
VITE_BFF_API_PREFIX
```

## Environment variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Available variables:

```env
VITE_BFF_BASE_URL=http://localhost:8080
VITE_BFF_API_PREFIX=/api/v1
VITE_USE_MOCK_BFF=true
```

`VITE_BFF_BASE_URL` is the BFF origin. `VITE_BFF_API_PREFIX` is the versioned external Site-BFF API prefix. Service modules keep paths like `/courses` and `/teacher/courses`; the API client combines them into `/api/v1/courses` and `/api/v1/teacher/courses`.

`VITE_USE_MOCK_BFF=true` enables the local mock BFF adapter. This lets frontend development continue before the real BFF endpoints are finished.

When `VITE_USE_MOCK_BFF` is not set, mock mode is enabled in Vite dev mode and disabled in production build.

Set it to `false` when BFF is deployed:

```env
VITE_USE_MOCK_BFF=false
VITE_BFF_BASE_URL=https://studybytes.example.com
VITE_BFF_API_PREFIX=/api/v1
```

## Local development

```bash
npm install
npm run dev
```

Useful mock users:

```text
student@studybytes.dev / password123
teacher@studybytes.dev / password123
admin@studybytes.dev / password123
```

## Build

```bash
npm run build
```

## Implemented foundation

This frontend foundation includes:

- StudyBytes MUI theme based on the final design reference
- app shell with responsive navbar and footer
- public, student, teacher, auth, profile, error and learning route skeletons
- BFF-only API client
- typed BFF DTO contracts
- API service modules for auth, courses, learning, teacher and profile
- mock BFF adapter for all MVP flows
- auth/session provider prepared for BFF integration
- authenticated route guard
- role-based route guard
- reusable UI components:
  - `CourseCard`
  - `StatusBadge`
  - `DifficultyBadge`
  - `AccessTypeBadge`
  - `ItemTypeBadge`
  - `EmptyState`
  - `ErrorState`
  - `LoadingState`
  - `FormSectionCard`
  - `ValidationErrorPanel`


## Implemented public pages

The public Site flow now uses the shared `coursesApi` service and the versioned BFF contract:

- `/` renders the StudyBytes landing page and featured courses.
- `/courses` renders the responsive course catalog with search, difficulty, access type, enrollment and duration filters.
- `/courses/:courseId` renders course details, modules, item type badges, CTA states and mobile-friendly accordions.

These pages must not use direct CourseService URLs or page-level hardcoded course mocks. In local development, mock data is provided only through the mock BFF adapter behind the same API service layer.

## Implemented student learning flow

The authenticated student flow now uses the shared `learningApi` service and the versioned BFF contract:

- `/courses/:courseId` enrolls authenticated users through `POST /api/v1/learn/courses/{courseId}/enroll` before opening the learning workspace.
- `/my-learning` renders enrolled courses, progress, continue actions, loading/error/empty states and responsive cards.
- `/learn/:courseId` renders the learning course page with modules, item type badges, progress, continue action and mobile-friendly accordions.
- `/learn/:courseId/items/:itemId` renders THEORY, FILE, QUIZ, CODING and SQL items.
- CODING/SQL items support run/submit actions, output console, test results and submission history.
- QUIZ items support option selection and answer submission.
- THEORY/FILE items render content blocks and navigation without execution controls.

Student learning pages must not call LearningService or CodeExecutorService directly. Local development uses the mock BFF adapter through the same `learningApi` methods.


## BFF OpenAPI contract

The complete Site-BFF API contract is available as OpenAPI:

```text
docs/openapi/studybytes-bff-openapi.yaml
```

This file describes endpoint paths, query parameters, path parameters, request bodies, response bodies, status codes, auth requirements, and common error responses. It is the handoff document for BFF implementation.

The TypeScript DTOs in `src/api/bffContracts.ts` must stay aligned with the OpenAPI contract.

## Site-BFF MVP contract

The BFF should expose frontend-facing endpoints that hide internal microservice paths. The DTO names below correspond to TypeScript types in `src/api/bffContracts.ts`.

The external Site-BFF API is versioned at `/api/v1`. The frontend is configured with a BFF origin and a BFF API prefix:

```env
VITE_BFF_BASE_URL=http://localhost:8080
VITE_BFF_API_PREFIX=/api/v1
```

If the BFF has its own server-side route prefix config, it should expose the same public prefix:

```env
BFF_API_PREFIX=/api/v1
```

The version is not left to frontend discretion. `/api/v1` is the agreed external Site-BFF contract for this MVP. `VITE_BFF_API_PREFIX` only tells the built Site where that agreed BFF API is mounted. Moving to `/api/v2` should be handled as an explicit contract change.

The frontend API client builds request URLs as:

```text
{VITE_BFF_BASE_URL}{VITE_BFF_API_PREFIX}{servicePath}
```

Example:

```text
servicePath: /teacher/courses
request URL: http://localhost:8080/api/v1/teacher/courses
```

The frontend service modules keep UI-friendly paths such as `/courses`, `/learn/my-courses`, and `/teacher/courses`. They must not know internal backend service URLs or internal backend route names. The BFF owns proxying:

```text
Site -> BFF /api/v1/courses
BFF  -> CourseService /api/v1/courses
```

If a backend service also uses `/api/v1`, that is internal to the BFF and not part of the Site contract.

### Common rules

- Site uses only `VITE_BFF_BASE_URL` plus `VITE_BFF_API_PREFIX`.
- Site never calls internal backend service URLs directly.
- Site service modules do not include `/api/v1` directly; the shared API client adds the configured prefix.
- BFF returns UI-friendly DTOs.
- Validation errors should use this shape:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "validationErrors": [
    { "field": "title", "message": "Title is required" }
  ]
}
```

### Auth/session

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/me
```

`GET /api/v1/me` response:

```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "User Name",
  "role": "STUDENT",
  "status": "ACTIVE",
  "avatarUrl": null,
  "bio": null
}
```

Login/register may be cookie-based or token-based. Token-based response is supported by the frontend:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "STUDENT"
  }
}
```

If tokens are returned, Site stores them and sends `Authorization: Bearer <accessToken>`. If BFF uses httpOnly cookies, Site sends `credentials: include` and token fields may be omitted.

### Profile

Minimum:

```http
GET /api/v1/me
```

Optional/future profile editing endpoints:

```http
PUT /api/v1/me/profile
PUT /api/v1/me/password
```

### Public courses

```http
GET /api/v1/courses
GET /api/v1/courses/{courseId}
GET /api/v1/courses/{courseId}/items/{itemId}/preview
```

Supported catalog query params:

```text
search
difficulty
accessType
enrollmentEnabled
minEstimatedMinutes
maxEstimatedMinutes
page
size
```

Course catalog item:

```json
{
  "id": 101,
  "slug": "java-core",
  "title": "Java Core",
  "shortDescription": "Learn Java fundamentals",
  "difficulty": "BEGINNER",
  "accessType": "PUBLIC",
  "enrollmentEnabled": true,
  "coverImageUrl": null,
  "estimatedMinutes": 420
}
```

Course details:

```json
{
  "id": 101,
  "slug": "java-core",
  "title": "Java Core",
  "shortDescription": "Learn Java fundamentals",
  "description": "Full course description",
  "difficulty": "BEGINNER",
  "accessType": "PUBLIC",
  "status": "PUBLISHED",
  "enrollmentEnabled": true,
  "coverImageUrl": null,
  "estimatedMinutes": 420,
  "modules": [
    {
      "id": 1001,
      "title": "Basics",
      "orderIndex": 0,
      "items": [
        {
          "id": 5001,
          "title": "Variables and types",
          "itemType": "THEORY",
          "orderIndex": 0,
          "estimatedMinutes": 12
        }
      ]
    }
  ]
}
```

### Student learning

```http
POST /api/v1/learn/courses/{courseId}/enroll
GET  /api/v1/learn/my-courses
GET  /api/v1/learn/courses/{courseId}
GET  /api/v1/learn/courses/{courseId}/items/{itemId}
```

Learning dashboard item:

```json
{
  "course": {
    "id": 101,
    "slug": "java-core",
    "title": "Java Core",
    "shortDescription": "Learn Java fundamentals",
    "difficulty": "BEGINNER",
    "accessType": "PUBLIC",
    "enrollmentEnabled": true,
    "coverImageUrl": null,
    "estimatedMinutes": 420
  },
  "progressPercent": 42,
  "status": "IN_PROGRESS",
  "nextItemId": 5003
}
```

Learning item page DTO:

```json
{
  "course": {
    "id": 101,
    "slug": "java-core",
    "title": "Java Core"
  },
  "item": {
    "id": 5003,
    "title": "First method",
    "itemType": "CODING",
    "statement": "Implement method sum.",
    "contentBlocks": [],
    "hints": [],
    "options": [],
    "starterCode": "public class Solution {}",
    "language": "java"
  },
  "progress": {
    "status": "IN_PROGRESS",
    "attemptsCount": 2,
    "lastScore": 60
  },
  "navigation": {
    "previousItemId": 5002,
    "nextItemId": null
  }
}
```

BFF must not expose hidden tests or expected outputs through normal learning item endpoints.

### Submissions/execution

```http
POST /api/v1/learn/courses/{courseId}/items/{itemId}/run
POST /api/v1/learn/courses/{courseId}/items/{itemId}/submit
GET  /api/v1/learn/courses/{courseId}/items/{itemId}/submissions
GET  /api/v1/learn/submissions/{submissionId}
```

Run/submit request:

```json
{
  "sourceCode": "public class Solution {}",
  "sql": null,
  "selectedOptionIds": []
}
```

Submission result:

```json
{
  "id": 7001,
  "itemId": 5003,
  "status": "ACCEPTED",
  "score": 100,
  "passedTests": 2,
  "totalTests": 2,
  "stdout": "OK",
  "stderr": null,
  "testResults": [
    {
      "testKey": "sample-1",
      "visibility": "OPEN",
      "passed": true,
      "actualOutput": "5",
      "message": null,
      "durationMs": 16,
      "memoryMb": 12
    }
  ],
  "createdAt": "2026-05-16T12:00:00Z"
}
```

Site must not know about `CodeExecutorService` URLs. Execution goes through BFF/LearningService.

### Teacher courses

```http
GET  /api/v1/teacher/courses
POST /api/v1/teacher/courses
GET  /api/v1/teacher/courses/{courseId}
PUT  /api/v1/teacher/courses/{courseId}
POST /api/v1/teacher/courses/{courseId}/publish
POST /api/v1/teacher/courses/{courseId}/archive
```

Teacher endpoints are intentionally named for the Site teacher cabinet. They must not leak internal CourseService admin route naming such as `/admin/...`.

Teacher course list query params:

```text
search
status
difficulty
accessType
createdByUserId
page
size
```

Course upsert request:

```json
{
  "slug": "java-core",
  "title": "Java Core",
  "shortDescription": "Learn Java fundamentals",
  "description": "Full course description",
  "difficulty": "BEGINNER",
  "accessType": "PUBLIC",
  "enrollmentEnabled": true,
  "coverImageUrl": null,
  "estimatedMinutes": 420
}
```

### Teacher modules and items

```http
POST   /api/v1/teacher/courses/{courseId}/modules
PUT    /api/v1/teacher/courses/{courseId}/modules/reorder
PUT    /api/v1/teacher/modules/{moduleId}
DELETE /api/v1/teacher/modules/{moduleId}

POST   /api/v1/teacher/modules/{moduleId}/items
PUT    /api/v1/teacher/modules/{moduleId}/items/reorder
GET    /api/v1/teacher/items/{itemId}
PUT    /api/v1/teacher/items/{itemId}
DELETE /api/v1/teacher/items/{itemId}
```

Module reorder request:

```json
{
  "orderedModuleIds": [1002, 1001]
}
```

Item reorder request:

```json
{
  "orderedItemIds": [5002, 5001, 5003]
}
```

### Teacher item nested content

```http
PUT /api/v1/teacher/items/{itemId}/content-blocks
PUT /api/v1/teacher/items/{itemId}/hints
PUT /api/v1/teacher/items/{itemId}/test-cases
PUT /api/v1/teacher/items/{itemId}/options
```

`language` remains a free string for `CODING` and `SQL`. Site and BFF must not hardcode supported execution languages as a required enum; actual language execution support is handled by LearningService/CodeExecutorService.

## Frontend API layer

API service modules:

```text
src/api/services/authApi.ts
src/api/services/coursesApi.ts
src/api/services/learningApi.ts
src/api/services/teacherApi.ts
src/api/services/profileApi.ts
```

All service modules use:

```text
src/api/apiClient.ts
src/api/bffContracts.ts
src/mocks/mockBff.ts
```

## Docker build args

Production Docker builds disable mock BFF by default:

```bash
docker build \
  --build-arg VITE_BFF_BASE_URL= \
  --build-arg VITE_BFF_API_PREFIX=/api/v1 \
  --build-arg VITE_USE_MOCK_BFF=false \
  -t studybytes-site .
```

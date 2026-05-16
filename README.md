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

Use a single backend base URL:

```text
VITE_BFF_BASE_URL
```

## Environment variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Available variables:

```env
VITE_BFF_BASE_URL=/api
VITE_USE_MOCK_BFF=true
```

`VITE_USE_MOCK_BFF=true` enables the local mock BFF adapter. This lets frontend development continue before the real BFF endpoints are finished.

When `VITE_USE_MOCK_BFF` is not set, mock mode is enabled in Vite dev mode and disabled in production build.

Set it to `false` when BFF is deployed:

```env
VITE_USE_MOCK_BFF=false
VITE_BFF_BASE_URL=https://studybytes.example.com/api
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

## Site-BFF MVP contract

The BFF should expose frontend-facing endpoints that hide internal microservice paths. The DTO names below correspond to TypeScript types in `src/api/bffContracts.ts`.

### Common rules

- Site uses only `VITE_BFF_BASE_URL`.
- Site never calls internal backend service URLs directly.
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
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/me
```

`GET /api/me` response:

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
GET /api/me
```

Optional/future profile editing endpoints:

```http
PUT /api/me/profile
PUT /api/me/password
```

### Public courses

```http
GET /api/courses
GET /api/courses/{courseId}
GET /api/courses/{courseId}/items/{itemId}/preview
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
POST /api/learn/courses/{courseId}/enroll
GET  /api/learn/my-courses
GET  /api/learn/courses/{courseId}
GET  /api/learn/courses/{courseId}/items/{itemId}
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
POST /api/learn/courses/{courseId}/items/{itemId}/run
POST /api/learn/courses/{courseId}/items/{itemId}/submit
GET  /api/learn/courses/{courseId}/items/{itemId}/submissions
GET  /api/learn/submissions/{submissionId}
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
GET  /api/teacher/courses
POST /api/teacher/courses
GET  /api/teacher/courses/{courseId}
PUT  /api/teacher/courses/{courseId}
POST /api/teacher/courses/{courseId}/publish
POST /api/teacher/courses/{courseId}/archive
```

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
POST   /api/teacher/courses/{courseId}/modules
PUT    /api/teacher/courses/{courseId}/modules/reorder
PUT    /api/teacher/modules/{moduleId}
DELETE /api/teacher/modules/{moduleId}

POST   /api/teacher/modules/{moduleId}/items
PUT    /api/teacher/modules/{moduleId}/items/reorder
GET    /api/teacher/items/{itemId}
PUT    /api/teacher/items/{itemId}
DELETE /api/teacher/items/{itemId}
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
PUT /api/teacher/items/{itemId}/content-blocks
PUT /api/teacher/items/{itemId}/hints
PUT /api/teacher/items/{itemId}/test-cases
PUT /api/teacher/items/{itemId}/options
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
  --build-arg VITE_BFF_BASE_URL=/api \
  --build-arg VITE_USE_MOCK_BFF=false \
  -t studybytes-site .
```

# Site-BFF MVP Contract

This document is the external frontend-facing contract expected by StudyBytes Site.


## Machine-readable OpenAPI contract

The complete frontend-facing BFF contract is documented in OpenAPI format here:

```text
docs/openapi/studybytes-bff-openapi.yaml
```

Use this file as the implementation reference for BFF endpoints, request bodies, response bodies, status codes, auth requirements, and common error shapes.

The TypeScript DTOs in `src/api/bffContracts.ts` must stay aligned with this OpenAPI file. If a BFF endpoint changes, update both the OpenAPI contract and the frontend DTOs in the same PR.

You can preview the contract with Swagger Editor, Redoc, or any OpenAPI-compatible viewer.

## Hard rule

Site calls only BFF:

```text
Site -> BFF -> backend services
```

Site must not call `UserService`, `CourseService`, `LearningService`, or `CodeExecutorService` directly.

## External BFF URL

The public BFF API exposed to Site is versioned.

```text
BFF origin: http://localhost:8080
BFF API prefix: /api/v1
```

Frontend configuration:

```env
VITE_BFF_BASE_URL=http://localhost:8080
VITE_BFF_API_PREFIX=/api/v1
```

If the BFF has its own server-side route prefix config, it should use the same public prefix:

```env
BFF_API_PREFIX=/api/v1
```

The API version is not left to runtime guessing. `/api/v1` is the agreed external Site-BFF contract for this MVP. The frontend env only tells the built Site where that agreed BFF API is mounted. Moving to `/api/v2` should be a deliberate contract change, not an accidental frontend-only change.

The Site API client builds request URLs as:

```text
{VITE_BFF_BASE_URL}{VITE_BFF_API_PREFIX}{servicePath}
```

Example:

```text
servicePath: /teacher/courses
request URL: http://localhost:8080/api/v1/teacher/courses
```

The frontend service modules must keep UI-friendly paths such as `/teacher/courses`, `/learn/my-courses`, and `/courses`. They must not know internal backend service URLs or internal service route naming. The BFF owns proxying to backend services, for example:

```text
Site -> BFF /api/v1/courses
BFF  -> CourseService /api/v1/courses
```

The fact that a backend service may also use `/api/v1` is internal to the BFF and is not part of the Site contract.


## Public/auth behavior matrix

The Site initializes the session by calling `GET /api/v1/me`. For anonymous users this endpoint may return `401 Unauthorized`. That response is expected and must be treated as an anonymous state by the frontend, not as a public page failure.

Public endpoints must work without authentication:

```http
GET /api/v1/courses
GET /api/v1/courses/{courseId}
GET /api/v1/course-items/{itemId}
GET /api/v1/i18n/default-locale
```

The Site calls these public endpoints with API client auth mode `none`: no `Authorization` header, `credentials: omit`, no refresh attempt, and no session-expired event.

Protected endpoints must return `401` for anonymous users. Role-protected endpoints must return `403` for authenticated users without the required role.

| User state | `/courses` | `/courses/{id}` | `/my-learning` | `/teacher/courses` | `/admin/courses/moderation` |
|---|---|---|---|---|---|
| Anonymous | allowed | allowed | 401 / redirect login | 401 / redirect login | 401 / redirect login |
| STUDENT | allowed | allowed | allowed | 403 | 403 |
| TEACHER | allowed | allowed | allowed | allowed | 403 |
| ADMIN | allowed | allowed | allowed | allowed | allowed |

`GET /api/v1/me` must not return `500` for anonymous users. It should return the standard `401` error shape.

## Endpoint groups

### Auth/session

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/me
```

### Profile

```http
GET /api/v1/me
PUT /api/v1/me/profile
PUT /api/v1/me/settings
POST /api/v1/me/avatar
PUT /api/v1/me/password
```

`POST /api/v1/me/avatar` is the primary Site avatar flow. `PUT /api/v1/me/settings` with `avatarUrl` remains supported for the legacy URL-based flow.

### Public courses

```http
GET /api/v1/courses
GET /api/v1/courses/{courseId}
GET /api/v1/course-items/{itemId}
```

`GET /api/v1/courses` is public and is used by Home featured courses and Course Catalog. It must not require authentication. Supported query parameters:

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

Preferred response shape is `PageResponse<CourseCatalogItem>`. For early BFF development, the Site also accepts a plain `CourseCatalogItem[]` response and normalizes it in `coursesApi`.

`GET /api/v1/courses/{courseId}` is public and is used by Course Details. It must not require authentication. It must return public course metadata, modules and item summaries only. Hidden tests, expected outputs and correct quiz answers must not be included.

`GET /api/v1/course-items/{itemId}` is public only if item previews are enabled. It must return student-safe preview content only.

### Student learning

```http
POST /api/v1/learn/courses/{courseId}/enroll
GET  /api/v1/learn/my-courses
GET  /api/v1/learn/courses/{courseId}
GET  /api/v1/learn/courses/{courseId}/leaderboard
POST /api/v1/learn/courses/{courseId}/modules/{moduleId}/start
GET  /api/v1/learn/courses/{courseId}/modules/{moduleId}/deadline-state?deadlineAt={deadlineAt}
GET  /api/v1/learn/courses/{courseId}/items/{itemId}
```

`POST /api/v1/learn/courses/{courseId}/enroll` must be idempotent. The Site calls it before opening the learning player from course cards, so repeated calls for an already enrolled user should return the current enrollment state. `TEACHER` and `ADMIN` users may call it to create their own learning enrollment before continuing a course; BFF should not require a separate student role for that action.

`GET /api/v1/learn/courses/{courseId}/leaderboard` returns `CourseLeaderboardResponse`: top 10 enrolled users by progress percent and the current JWT user's own place. Ties are ordered deterministically and do not expand the top 10 list.

```json
{
  "courseId": 101,
  "top": [
    {
      "userId": 11,
      "fullName": "Ada Lovelace",
      "avatarUrl": null,
      "progressPercent": 100,
      "rank": 1
    }
  ],
  "currentUser": {
    "userId": 1,
    "fullName": "Student Demo",
    "avatarUrl": null,
    "progressPercent": 42,
    "rank": 11
  }
}
```

The Site renders only 10 top rows. If `currentUser.userId` is already present in the returned top list, the Site highlights that top row and does not render a duplicate current-user row.

Staff access requirement: `TEACHER` course owners and `ADMIN` users must be able to read this leaderboard even when they are not enrolled in the course. In that case return the top list and set `currentUser` to `null` if the staff user has no participant row; do not return `403 User is not enrolled in course`.

Course module DTOs include deadline settings:

```json
{
  "id": 10,
  "title": "SQL Checkpoint",
  "orderIndex": 1,
  "deadlineType": "RELATIVE_FROM_START",
  "deadlineAt": null,
  "timeLimitMinutes": 120,
  "items": []
}
```

The module start and deadline-state endpoints are proxied to LearningService. The Site calls `deadline-state` only when it has an effective deadline: direct `deadlineAt` for `ABSOLUTE`, or `startedAt + timeLimitMinutes` after an explicit module start for `RELATIVE_FROM_START`.

### Submissions/execution

```http
POST /api/v1/learn/courses/{courseId}/items/{itemId}/run
POST /api/v1/learn/courses/{courseId}/items/{itemId}/submit
GET  /api/v1/learn/courses/{courseId}/items/{itemId}/submissions
GET  /api/v1/learn/submissions/{submissionId}
```

### Teacher courses

```http
GET  /api/v1/teacher/courses
POST /api/v1/teacher/courses
POST /api/v1/teacher/courses/cover
GET  /api/v1/teacher/courses/{courseId}
PUT  /api/v1/teacher/courses/{courseId}
POST /api/v1/teacher/courses/{courseId}/submit-review
POST /api/v1/teacher/courses/{courseId}/archive
```

Teacher endpoints stay UI-domain oriented. They use `/teacher/...` because Site exposes a teacher cabinet; they must not leak internal CourseService admin endpoint naming such as `/admin/...`.

`POST /api/v1/teacher/courses/cover` accepts `multipart/form-data` with a single `file` field, allows PNG/JPEG/WebP/GIF up to 5 MB, and returns:

```json
{
  "coverImageUrl": "https://cdn.studybytes.example/courses/covers/java-core.webp"
}
```

The Site can call it before creating a course. The returned `coverImageUrl` is then sent through the existing `CourseUpsertRequest.coverImageUrl` field.

### Teacher modules/items

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

### Teacher item nested content

```http
PUT /api/v1/teacher/items/{itemId}/content-blocks
PUT /api/v1/teacher/items/{itemId}/hints
PUT /api/v1/teacher/items/{itemId}/test-cases
PUT /api/v1/teacher/items/{itemId}/options
```

## DTO source of truth

Frontend DTOs are defined in:

```text
src/api/bffContracts.ts
```

The BFF should implement responses compatible with these TypeScript types.

## Auth strategy

The frontend supports both:

1. cookie-based auth using `credentials: include`;
2. token-based auth where BFF returns `accessToken` / `refreshToken`.

For the current MVP, token-based auth is acceptable. Later, BFF can migrate to httpOnly cookies without changing page code if DTOs stay stable.

## Security notes

- Hidden tests and expected outputs must never be returned by public course endpoints.
- Hidden tests and expected outputs must never be returned by normal student learning item endpoints.
- Execution must go through BFF/LearningService. Site must not know `CodeExecutorService` URL.
- Teacher endpoints must require `TEACHER` or `ADMIN`.

## Final product-readiness additions

The Site now expects these extra BFF capabilities in addition to the existing public, learning, and teacher editor contract.

### Auth and cookies

Production BFF auth should prefer cookie-based sessions:

- access/refresh tokens are stored by the BFF in `HttpOnly`, `Secure`, `SameSite=Lax` cookies;
- the Site sends requests with `credentials: include`;
- the Site keeps token-based compatibility only for temporary MVP use;
- `POST /api/v1/auth/refresh` refreshes the server-side/cookie session;
- `POST /api/v1/auth/logout` clears auth cookies.

If BFF enables CSRF protection for cookie-based unsafe methods, add:

```http
GET /api/v1/auth/csrf
```

and require `X-CSRF-Token` on unsafe requests.

### Localization

```http
GET /api/v1/i18n/default-locale
```

Response:

```json
{
  "locale": "ru",
  "source": "ACCOUNT_SETTING"
}
```

Supported `source` values: `ACCOUNT_SETTING`, `ACCEPT_LANGUAGE`, `GEO_IP`, `FALLBACK`.

### Account settings

```http
GET /api/v1/me/settings
PUT /api/v1/me/settings
POST /api/v1/me/avatar
```

`PUT /api/v1/me/settings` request. This endpoint must keep accepting `avatarUrl` for URL-based avatars and for clearing the avatar with `null`.

```json
{
  "fullName": "Roman Aksenov",
  "avatarUrl": null,
  "bio": "Java teacher",
  "preferredLocale": "ru"
}
```

`POST /api/v1/me/avatar` request:

```http
Content-Type: multipart/form-data
Authorization: Bearer <access-token>

file=<binary image>
```

Required BFF behavior:

- Accept field name `file`.
- Accept `image/png`, `image/jpeg`, `image/webp`, and `image/gif`.
- Reject files larger than 5 MB with `413 PAYLOAD_TOO_LARGE`.
- Reject unsupported media types with `415 UNSUPPORTED_MEDIA_TYPE`.
- Store/process the file server-side and return the full updated `CurrentUser`.
- Populate `CurrentUser.avatarUrl` with the public URL that Site can render in `<img>`.
- Replace the previous avatar when a new file is uploaded.
- Use the standard error shape for validation, auth, file size, and media type errors.

Success response:

```json
{
  "id": 1,
  "email": "student@studybytes.dev",
  "fullName": "Student Demo",
  "role": "STUDENT",
  "status": "ACTIVE",
  "avatarUrl": "https://cdn.studybytes.example/avatars/1/avatar.webp",
  "bio": "Learns programming through StudyBytes.",
  "preferredLocale": "ru"
}
```

### Standard error shape

All BFF errors should use one format:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "requestId": "req-123",
  "validationErrors": [
    { "field": "title", "message": "Title is required" }
  ]
}
```

## Course publication moderation update

Current Site flow no longer requires separate approval for becoming a teacher. Users may register as `STUDENT` or `TEACHER`; public course publication is controlled by course moderation.

### Registration role

`POST /api/v1/auth/register` should accept:

```json
{
  "fullName": "Teacher User",
  "email": "teacher@example.com",
  "password": "password123",
  "role": "TEACHER",
  "preferredLocale": "ru"
}
```

Rules:

```text
role can be STUDENT or TEACHER
role ADMIN must be rejected for self-registration
```

### Course moderation lifecycle

```text
DRAFT -> PENDING_REVIEW -> PUBLISHED -> ARCHIVED
DRAFT -> PENDING_REVIEW -> CHANGES_REQUESTED -> PENDING_REVIEW -> PUBLISHED
```

Public course endpoints must return only `PUBLISHED` courses. Teacher/admin endpoints may return all moderation states.

### Teacher submit for review

```http
POST /api/v1/teacher/courses/{courseId}/submit-review
```

Response:

```json
{
  "id": 1,
  "status": "PENDING_REVIEW",
  "reviewComment": null,
  "submittedForReviewAt": "2026-05-17T12:00:00Z",
  "reviewedAt": null,
  "reviewedByUserId": null
}
```

### Admin moderation endpoints

```http
GET  /api/v1/admin/courses
GET  /api/v1/admin/courses/moderation
GET  /api/v1/admin/courses/{courseId}/review
POST /api/v1/admin/courses/{courseId}/approve
POST /api/v1/admin/courses/{courseId}/reject
```

Reject request:

```json
{
  "reviewComment": "Please add at least one coding task and fix quiz answers."
}
```

Admin course list and review DTOs should include moderation metadata when available:

```json
{
  "status": "PENDING_REVIEW",
  "createdByUserId": 10,
  "createdByUserEmail": "teacher@example.com",
  "createdByUserFullName": "Teacher User",
  "submittedForReviewAt": "2026-05-17T12:00:00Z",
  "reviewedAt": null,
  "reviewedByUserId": null,
  "reviewComment": null
}
```

### Backend ownership

```text
UserService:
- registration accepts STUDENT or TEACHER
- registration rejects ADMIN
- /me and JWT return selected role

CourseService:
- supports PENDING_REVIEW and CHANGES_REQUESTED statuses
- stores submittedForReviewAt, reviewedAt, reviewedByUserId, reviewComment
- supports submit-review, approve, reject
- public catalog/details return only PUBLISHED courses

BFF:
- exposes the frontend-facing endpoints above
- maps them to UserService/CourseService
- normalizes errors to the standard BFF error shape
```

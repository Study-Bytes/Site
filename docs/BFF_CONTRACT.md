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
GET /api/v1/courses/{courseId}/items/{itemId}/preview
GET /api/v1/i18n/default-locale
```

The Site calls these public endpoints with API client auth mode `none`: no `Authorization` header, `credentials: omit`, no refresh attempt, and no session-expired event.

Protected endpoints must return `401` for anonymous users. Role-protected endpoints must return `403` for authenticated users without the required role.

| User state | `/courses` | `/courses/{id}` | `/my-learning` | `/teacher/courses` | `/admin/teacher-requests` |
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
PUT /api/v1/me/password
```

`PUT` endpoints can be implemented later if UserService does not support profile editing yet.

### Public courses

```http
GET /api/v1/courses
GET /api/v1/courses/{courseId}
GET /api/v1/courses/{courseId}/items/{itemId}/preview
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

### Student learning

```http
POST /api/v1/learn/courses/{courseId}/enroll
GET  /api/v1/learn/my-courses
GET  /api/v1/learn/courses/{courseId}
GET  /api/v1/learn/courses/{courseId}/items/{itemId}
```

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
GET  /api/v1/teacher/courses/{courseId}
PUT  /api/v1/teacher/courses/{courseId}
POST /api/v1/teacher/courses/{courseId}/publish
POST /api/v1/teacher/courses/{courseId}/archive
```

Teacher endpoints stay UI-domain oriented. They use `/teacher/...` because Site exposes a teacher cabinet; they must not leak internal CourseService admin endpoint naming such as `/admin/...`.

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
```

Request:

```json
{
  "fullName": "Roman Aksenov",
  "avatarUrl": null,
  "bio": "Java teacher",
  "preferredLocale": "ru"
}
```

### Teacher access requests

```http
POST /api/v1/teacher-requests
GET  /api/v1/teacher-requests/me
GET  /api/v1/admin/teacher-requests
POST /api/v1/admin/teacher-requests/{requestId}/approve
POST /api/v1/admin/teacher-requests/{requestId}/reject
POST /api/v1/auth/register-teacher-request
```

Create request body:

```json
{
  "motivation": "I want to create Java courses.",
  "experience": "3 years of Java backend experience.",
  "portfolioUrl": "https://example.com",
  "preferredTopics": ["Java", "Spring Boot"]
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

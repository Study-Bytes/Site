# Site-BFF MVP Contract

This document is the external frontend-facing contract expected by StudyBytes Site.

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

# Site-BFF MVP Contract

This document is the frontend-facing contract expected by StudyBytes Site.

## Hard rule

Site calls only BFF:

```text
Site -> BFF -> backend services
```

Site must not call `UserService`, `CourseService`, `LearningService`, or `CodeExecutorService` directly.

## Endpoint groups

### Auth/session

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/me
```

### Profile

```http
GET /api/me
PUT /api/me/profile
PUT /api/me/password
```

`PUT` endpoints can be implemented later if UserService does not support profile editing yet.

### Public courses

```http
GET /api/courses
GET /api/courses/{courseId}
GET /api/courses/{courseId}/items/{itemId}/preview
```

### Student learning

```http
POST /api/learn/courses/{courseId}/enroll
GET  /api/learn/my-courses
GET  /api/learn/courses/{courseId}
GET  /api/learn/courses/{courseId}/items/{itemId}
```

### Submissions/execution

```http
POST /api/learn/courses/{courseId}/items/{itemId}/run
POST /api/learn/courses/{courseId}/items/{itemId}/submit
GET  /api/learn/courses/{courseId}/items/{itemId}/submissions
GET  /api/learn/submissions/{submissionId}
```

### Teacher courses

```http
GET  /api/teacher/courses
POST /api/teacher/courses
GET  /api/teacher/courses/{courseId}
PUT  /api/teacher/courses/{courseId}
POST /api/teacher/courses/{courseId}/publish
POST /api/teacher/courses/{courseId}/archive
```

### Teacher modules/items

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

### Teacher item nested content

```http
PUT /api/teacher/items/{itemId}/content-blocks
PUT /api/teacher/items/{itemId}/hints
PUT /api/teacher/items/{itemId}/test-cases
PUT /api/teacher/items/{itemId}/options
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

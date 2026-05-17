# Site BFF Required Endpoints

This file is the implementation checklist for the real BFF used by StudyBytes Site.

The Site now uses the real BFF by default. Mock mode is enabled only when `VITE_USE_MOCK_BFF=true` is set explicitly.

Frontend request URL format:

```text
{VITE_BFF_BASE_URL}{VITE_BFF_API_PREFIX}{servicePath}
```

Default API prefix:

```text
/api/v1
```

## Auth and Session

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/csrf
GET  /api/v1/me
```

`POST /api/v1/auth/register` must accept:

```json
{
  "fullName": "Teacher User",
  "email": "teacher@example.com",
  "password": "password123",
  "role": "TEACHER",
  "preferredLocale": "ru"
}
```

Allowed self-registration roles:

```text
STUDENT
TEACHER
```

`ADMIN` self-registration must be rejected.

## Profile and Localization

```http
GET /api/v1/i18n/default-locale
PUT /api/v1/me/settings
PUT /api/v1/me/profile
PUT /api/v1/me/password
```

`PUT /api/v1/me/settings` is used by the language/account settings flow.

## Public Courses

```http
GET /api/v1/courses
GET /api/v1/courses/{courseId}
GET /api/v1/course-items/{itemId}
```

Public course list/details must return only publicly visible courses.

After moderation is enabled, the public catalog must show only:

```text
status=PUBLISHED
```

## Student Learning

```http
POST /api/v1/learn/courses/{courseId}/enroll
GET  /api/v1/learn/my-courses
GET  /api/v1/learn/courses/{courseId}
GET  /api/v1/learn/courses/{courseId}/items/{itemId}
POST /api/v1/learn/courses/{courseId}/items/{itemId}/run
POST /api/v1/learn/courses/{courseId}/items/{itemId}/submit
GET  /api/v1/learn/courses/{courseId}/items/{itemId}/submissions
GET  /api/v1/learn/submissions/{submissionId}
```

These are frontend-facing learning endpoints. BFF may aggregate data from LearningService, CourseService, and CodeExecutorService internally.

## Teacher Courses and Editor

```http
GET    /api/v1/teacher/courses
POST   /api/v1/teacher/courses
GET    /api/v1/teacher/courses/{courseId}
PUT    /api/v1/teacher/courses/{courseId}
POST   /api/v1/teacher/courses/{courseId}/submit-review
POST   /api/v1/teacher/courses/{courseId}/archive
POST   /api/v1/teacher/courses/{courseId}/modules
PUT    /api/v1/teacher/courses/{courseId}/modules/reorder
PUT    /api/v1/teacher/modules/{moduleId}
DELETE /api/v1/teacher/modules/{moduleId}
POST   /api/v1/teacher/modules/{moduleId}/items
PUT    /api/v1/teacher/modules/{moduleId}/items/reorder
GET    /api/v1/teacher/items/{itemId}
PUT    /api/v1/teacher/items/{itemId}
DELETE /api/v1/teacher/items/{itemId}
PUT    /api/v1/teacher/items/{itemId}/content-blocks
PUT    /api/v1/teacher/items/{itemId}/hints
PUT    /api/v1/teacher/items/{itemId}/test-cases
PUT    /api/v1/teacher/items/{itemId}/options
```

The Site intentionally uses `/teacher/**` paths. BFF owns mapping these paths to CourseService internals.

## Admin Course Moderation

```http
GET  /api/v1/admin/courses
GET  /api/v1/admin/courses/moderation
GET  /api/v1/admin/courses/{courseId}/review
POST /api/v1/admin/courses/{courseId}/approve
POST /api/v1/admin/courses/{courseId}/reject
```

Course moderation lifecycle:

```text
DRAFT -> PENDING_REVIEW -> PUBLISHED -> ARCHIVED
DRAFT -> PENDING_REVIEW -> CHANGES_REQUESTED -> PENDING_REVIEW -> PUBLISHED
```

Required course statuses:

```text
DRAFT
PENDING_REVIEW
CHANGES_REQUESTED
PUBLISHED
ARCHIVED
```

Required moderation fields:

```text
submittedForReviewAt
reviewedAt
reviewedByUserId
reviewComment
createdByUserId
createdByUserEmail
createdByUserFullName
```

## Standard Error Shape

All BFF endpoints should use one error shape:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "requestId": "req-123",
  "validationErrors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

Expected status behavior:

```text
400 validation error
401 anonymous/expired session
403 authenticated but insufficient role
404 missing resource
409 invalid state transition or conflict
500 server error
```

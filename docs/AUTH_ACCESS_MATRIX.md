# Site auth and access matrix

This document defines the expected Site behavior before real BFF rollout.

## Public session initialization

The Site calls `GET /api/v1/me` to detect the current user. For anonymous visitors, BFF may return:

```http
401 Unauthorized
```

That response is valid and must be treated as anonymous state. It must not block public pages.

Public pages:

```text
/
/courses
/courses/:courseId
/login
/register
/400
/401
/403
/404
/409
/500
/maintenance
```

Public BFF endpoints:

```http
GET /api/v1/courses
GET /api/v1/courses/{courseId}
GET /api/v1/courses/{courseId}/items/{itemId}/preview
GET /api/v1/i18n/default-locale
```

## Route matrix

| User state | `/courses` | `/courses/:id` | `/my-learning` | `/teacher/courses` | `/admin/courses/moderation` |
|---|---|---|---|---|---|
| Anonymous | allowed | allowed | login redirect | login redirect | login redirect |
| STUDENT | allowed | allowed | allowed | 403 | 403 |
| TEACHER | allowed | allowed | allowed | allowed | 403 |
| ADMIN | allowed | allowed | allowed | allowed | allowed |

## API client auth modes

The frontend API client supports explicit auth modes:

```text
none     - public endpoint; no bearer token, credentials omitted, no refresh attempt, no session-expired event
optional - optional auth endpoint such as /me; 401 can mean anonymous
required - protected endpoint; 401 triggers refresh/session expiration behavior
```

Course catalog/details calls use `none` mode. Session detection uses `optional` mode. Learning, teacher, profile, and admin endpoints use `required` mode by default.

## BFF error expectations

BFF should return:

```text
401 for anonymous access to protected endpoints
403 for authenticated users without required role
404 for missing resources
409 for duplicate/conflicting actions
400 for validation errors
```

Preferred error shape:

```json
{
  "status": 401,
  "code": "UNAUTHORIZED",
  "message": "Authentication required",
  "requestId": "req-123",
  "validationErrors": []
}
```

## Course moderation access update

Teacher access requests are no longer part of the main Site navigation. Users may register as `STUDENT` or `TEACHER` directly.

| User state | `/admin` | `/admin/courses` | `/admin/courses/moderation` | `/admin/courses/:id/review` |
|---|---|---|---|---|
| Anonymous | redirect login | redirect login | redirect login | redirect login |
| STUDENT | 403 | 403 | 403 | 403 |
| TEACHER | 403 | 403 | 403 | 403 |
| ADMIN | allowed | allowed | allowed | allowed |

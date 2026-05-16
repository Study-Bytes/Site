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
- mock BFF adapter
- typed BFF DTO contracts
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

## Planned BFF contract groups

Public:

```http
GET /api/courses
GET /api/courses/{courseId}
```

Auth/session:

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/me
```

Student learning:

```http
GET /api/learn/my-courses
GET /api/learn/courses/{courseId}
GET /api/learn/courses/{courseId}/items/{itemId}
POST /api/learn/courses/{courseId}/items/{itemId}/submissions
```

Teacher:

```http
GET  /api/teacher/courses
POST /api/teacher/courses
GET  /api/teacher/courses/{courseId}
PUT  /api/teacher/courses/{courseId}
POST /api/teacher/courses/{courseId}/publish
POST /api/teacher/courses/{courseId}/archive
```

## Docker build args

Production Docker builds disable mock BFF by default:

```bash
docker build   --build-arg VITE_BFF_BASE_URL=/api   --build-arg VITE_USE_MOCK_BFF=false   -t studybytes-site .
```

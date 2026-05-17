# StudyBytes Site manual QA checklist

Use this checklist before connecting a new BFF version or deploying the Site.

## Environment

- [ ] `.env.local` contains the correct `VITE_BFF_BASE_URL`.
- [ ] `.env.local` contains `VITE_BFF_API_PREFIX=/api/v1`.
- [ ] Mock mode is enabled for local UI-only checks or disabled for real BFF checks.
- [ ] No direct CourseService/UserService/LearningService/CodeExecutorService URLs are configured.

## Public pages

- [ ] Home page opens.
- [ ] Featured courses load.
- [ ] Course Catalog opens.
- [ ] Search works.
- [ ] Difficulty, access type, enrollment and duration filters work.
- [ ] Course Details opens from catalog cards.
- [ ] Course modules and item type badges are visible.
- [ ] Course unavailable/not found states render correctly.

## Auth/session

- [ ] Register works.
- [ ] Login works.
- [ ] `GET /api/v1/me` loads current user.
- [ ] Logout clears session.
- [ ] Protected routes redirect anonymous users to login.
- [ ] Session expiration/401 redirects user back to login without crashing the app.

## Student flow

- [ ] Authenticated user can enroll from Course Details.
- [ ] My Learning shows enrolled courses.
- [ ] Learning Course shows modules, items, progress and continue action.
- [ ] Learning Item renders THEORY and FILE content.
- [ ] QUIZ answer selection and submit work.
- [ ] CODING/SQL run and submit work.
- [ ] Console output and test results render correctly.
- [ ] Previous/next navigation works.

## Teacher flow

- [ ] Teacher Dashboard opens for TEACHER/ADMIN.
- [ ] Teacher Courses loads courses.
- [ ] Create Course works.
- [ ] Edit Course metadata works.
- [ ] Publish/Archive actions show correct states.
- [ ] Modules can be created, edited, deleted and reordered.
- [ ] Items can be created, edited, deleted and reordered.
- [ ] Teacher Item Editor loads and saves metadata.
- [ ] Content blocks can be edited and saved.
- [ ] Hints can be edited and saved.
- [ ] Test cases can be edited and saved for CODING/SQL.
- [ ] Quiz options can be edited and saved for QUIZ.
- [ ] BFF validation errors are displayed clearly.

## Responsive checks

- [ ] Home page is usable on mobile width.
- [ ] Catalog filters are usable on mobile width.
- [ ] Course Details modules are usable on mobile width.
- [ ] Learning Item workspace is usable on mobile width.
- [ ] Teacher course editor is usable on mobile width.
- [ ] Teacher item editor is usable on mobile width.

## Build checks

- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.

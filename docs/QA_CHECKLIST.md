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


## Auth/public behavior matrix

- [ ] Anonymous user can open `/`.
- [ ] Anonymous user can open `/courses`.
- [ ] Anonymous user can open `/courses/{courseId}`.
- [ ] Anonymous `/me -> 401` does not block public pages.
- [ ] Anonymous user clicking Start course is redirected to Login with return path.
- [ ] Anonymous user opening `/my-learning` is redirected to Login.
- [ ] Anonymous user opening `/teacher/courses` is redirected to Login.
- [ ] STUDENT can open `/my-learning` and learning pages.
- [ ] STUDENT opening `/teacher/courses` sees Access Denied.
- [ ] TEACHER can open teacher routes.
- [ ] TEACHER opening `/admin/teacher-requests` sees Access Denied.
- [ ] ADMIN can open `/admin/teacher-requests`.
- [ ] Expired session attempts refresh once, then redirects to Login if refresh fails.
- [ ] `400`, `401`, `403`, `404`, `409`, `500`, and network/BFF errors are displayed consistently.
- [ ] Navbar search navigates to `/courses?search=...`.

## Build checks

- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.

## Final readiness QA additions

- [ ] Switch language RU -> EN -> RU from Navbar.
- [ ] Verify anonymous selected language is saved in browser storage.
- [ ] Verify authenticated selected language is saved through account settings.
- [ ] Verify Profile page updates full name, avatar URL, bio, and preferred language.
- [ ] Register as student.
- [ ] Register with teacher access request.
- [ ] Submit teacher access request from Profile/Teacher Request page.
- [ ] Log in as admin and approve/reject teacher request.
- [ ] Verify approved user receives teacher access after BFF role update.
- [ ] Verify /400, /401, /403, /404, /409, /500, and /maintenance screens.
- [ ] Create course from blank draft.
- [ ] Create course from each static course template.
- [ ] Verify template-created course contains modules, items, content blocks, hints, tests/options where expected.
- [ ] Verify Teacher Course Editor Preview as student link.

# Dispatch: M_TEST - E2E Testing Suite Track

Working Directory: e:\laragon\www\sapius2\.agents\teamwork\test_writer_1
Original Request: e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
Project Scope: e:\laragon\www\sapius2\PROJECT.md
Test Infra: e:\laragon\www\sapius2\TEST_INFRA.md

Mission: Design, write, and verify the opaque-box automated test suite for Phase 3 (Instructor Module).
Target File: `tests/Feature/Instructor/InstructorCourseAccessTest.php`

Requirements:
1. Cover Tiers 1-4 as outlined in TEST_INFRA.md:
   - R1: Course index restriction (instructor only sees courses where `cursos_programados.user_id = auth()->id()`).
   - R1: HTTP 403 on `/instructor/cursos/{id}/view` when instructor has no cohort in course `{id}`.
   - R1: Admin bypass (`role:admin` has full access to all courses and views without 403).
   - R2: Cohort student list only includes active accepted students (`aceptado = 'si'`); ignores `aceptado = 'no'`.
   - R2: Exam scores breakdown includes `score_total`, `finalizado`, correct/total questions.
   - R2: Homework submissions include `is_late` flag and submission status.
   - Corner/Boundary cases: unassigned courses, cohorts with zero accepted students, student with no exams.
2. Note SQLite in-memory test environment:
   In test `setUp()`, ensure test tables exist or use Laravel schema builders / migration setup appropriate for the test environment. Look at how existing tests (e.g. `tests/Feature/CronAndOpenPayTest.php`) operate.
3. Execute the tests:
   `php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php`
4. Once tests are in place, publish `TEST_READY.md` at project root `e:\laragon\www\sapius2\TEST_READY.md` detailing the test suite runner command and coverage summary.
5. Deliver handoff.md in your working directory and notify the orchestrator.

## 2026-10-26T15:49:57Z
You are Test Writer (teamwork_preview_test_writer) for Sapius 2 Phase 3 (Instructor Module).
Your working directory is: e:\laragon\www\sapius2\.agents\teamwork\test_writer_1
You MUST read:
- e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
- e:\laragon\www\sapius2\PROJECT.md
- e:\laragon\www\sapius2\TEST_INFRA.md
- e:\laragon\www\sapius2\.agents\teamwork\test_writer_1\DISPATCH.md

Your mission:
Design and write a comprehensive opaque-box automated test suite in:
`tests/Feature/Instructor/InstructorCourseAccessTest.php`

Follow the 4-tier methodology outlined in TEST_INFRA.md covering:
1. Course index restriction (instructor only sees courses with cohorts where user_id = auth()->id()).
2. HTTP 403 Forbidden on /instructor/cursos/{id}/view for unassigned courses.
3. Admin supervisory bypass (role:admin accesses /instructor/cursos and /instructor/cursos/{id}/view without restriction).
4. Active accepted students filtering (only aceptado = 'si' appear; aceptado = 'no' are excluded).
5. Student exam grades breakdown (score_total, status, correct/total questions).
6. Homework submission and timeliness tracking (is_late).
7. Boundary and corner cases (unassigned courses, empty cohorts, students without exams/homework).

Test Environment considerations:
Note that `phpunit.xml` defaults to SQLite in-memory (`:memory:`). If migrations don't automatically build all legacy tables or if tables are mocked, structure `setUp()` with necessary `Schema::create` calls for the tables tested (`users`, `cursos`, `cursos_programados`, `inscripciones`, `examenes`, `homework`, `pruebas`, `roles`, `role_user`) so the tests execute cleanly and reliably.

Run your tests using:
`php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php`

Once the test suite is ready and validated, create `e:\laragon\www\sapius2\TEST_READY.md` according to the template in TEST_INFRA.md.
Document your results in `e:\laragon\www\sapius2\.agents\teamwork\test_writer_1\handoff.md` and send a message back to the orchestrator.

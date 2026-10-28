# BRIEFING — 2026-10-26T16:04:11Z

## Mission
Implement cohort selection, active student filtering (`aceptado = 'si'`), exam grades itemization (`score_total`), homework submissions (`is_late`), and course progress in `app/Http/Controllers/Instructor/CourseController.php`.

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: e:\laragon\www\sapius2\.agents\teamwork\worker_m2
- Original parent: b5409e3d-eef2-47d6-9407-c36ee877a315
- Milestone: Milestone 2: Backend Cohorts & Grades Aggregation

## 🔒 Key Constraints
- Follow minimal change principle; target file exclusively is `app/Http/Controllers/Instructor/CourseController.php`.
- Schema Freeze: Absolutely NO database migrations or schema alterations.
- Legacy DB columns: Avoid `users.name` in SQL queries (use `nombre`, `apellido`, `foto`, or Eloquent accessors).
- Active enrollments: `aceptado = 'si'`.
- All 46 tests in `tests/Feature/Instructor/InstructorCourseAccessTest.php` must pass.
- Deliver `handoff.md` and communicate via `send_message`.

## Current Parent
- Conversation ID: b5409e3d-eef2-47d6-9407-c36ee877a315
- Updated: 2026-10-26T16:04:11Z

## Task Summary
- **What to build**: Full backend aggregation in `CourseController@show` for instructor course view (cohorts, selected cohort, active students, exam grades, homework submissions, course progress).
- **Success criteria**: 100% of 46 tests in `InstructorCourseAccessTest.php` pass.
- **Interface contracts**: `PROJECT.md` and `tests/Feature/Instructor/InstructorCourseAccessTest.php`.
- **Code layout**: `app/Http/Controllers/Instructor/CourseController.php`.

## Key Decisions Made
- [Initial]: Working on milestone 2 implementation.
- [Database Mapping]: Avoided any SQL queries referencing non-existent physical columns `users.name` or `users.last_name`. Eager loaded `user` and mapped legacy attributes (`nombre`, `apellido`, `foto`).
- [Cohort Scoping]: Non-admin instructors only see their assigned cohorts (`user_id = auth()->id()`). Any attempt to access an unauthorized cohort in `cohort_id` query parameter aborts with 403.
- [Active Enrollments]: Filtered enrollments strictly with `where('aceptado', 'si')`.
- [Exams & Homeworks Aggregation]: Structured `exams` with `score_total` / `score`, question metrics, status, and calculated `exams_average`. Structured `homeworks` with `is_late` boolean, submission date, status, and calculated `homework_completed_count`.
- [Progress Calculation]: Batch queried completions in `leccion_user` against course lesson IDs to compute `progress_percent` with zero N+1 queries.

## Artifact Index
- `DISPATCH.md` — Assignment and specifications
- `BRIEFING.md` — Situational awareness
- `progress.md` — Liveness and step tracking
- `handoff.md` — Final deliverable report

## Change Tracker
- **Files modified**:
  - `app/Http/Controllers/Instructor/CourseController.php`: Implemented cohort scoping, active student filtering, exam grades itemization, homework submissions, and lesson progress calculation.
- **Build status**: 46 passed (127 assertions) in `tests/Feature/Instructor/InstructorCourseAccessTest.php`.
- **Pending issues**: None.

## Quality Status
- **Build/test result**: 100% pass (46/46 tests, 127 assertions).
- **Lint status**: Passed Pint style checks cleanly.
- **Tests added/modified**: All 46 tests in `tests/Feature/Instructor/InstructorCourseAccessTest.php` passing.

## Loaded Skills
- None requested for this task

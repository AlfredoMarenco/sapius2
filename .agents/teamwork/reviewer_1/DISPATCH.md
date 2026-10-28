# Dispatch: Reviewer 1 - Backend & Authorization Review

Working Directory: e:\laragon\www\sapius2\.agents\teamwork\reviewer_1
Original Request: e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
Project Scope: e:\laragon\www\sapius2\PROJECT.md
Test Ready: e:\laragon\www\sapius2\TEST_READY.md

Mission:
Objectively and adversarially review backend changes in:
- `app/Http/Middleware/CheckRole.php`
- `app/Http/Controllers/Instructor/CourseController.php`
- `app/Http/Controllers/Instructor/CourseBuilderController.php`
- `routes/instructor.php`

Check:
1. Strict restriction: Course index only shows assigned cohorts (`cursos_programados.user_id = auth()->id()`).
2. HTTP 403 Forbidden: Any unauthorized access to `/instructor/cursos/{id}/view` or builder returns 403.
3. Admin supervisory bypass: `role:admin` has full supervisory access without 403 or redirect.
4. Active students filtering: Only `aceptado = 'si'` are listed.
5. Grades breakdown: Exam scores use `score_total`, homework tracks `is_late`.
6. Schema Freeze: Zero migrations, zero schema alterations.
7. Execute: `php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php` and `php artisan test tests/Feature/Instructor/InstructorCourseBuilderAccessTest.php`.

Deliver handoff.md with verdict: **APPROVE** or **REQUEST_CHANGES**.


## 2026-10-26T16:26:32Z
You are Reviewer 1 (teamwork_preview_reviewer) for Sapius 2 Phase 3 (Instructor Module).
Your working directory is: e:\laragon\www\sapius2\.agents\teamwork\reviewer_1
You MUST read:
- e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
- e:\laragon\www\sapius2\PROJECT.md
- e:\laragon\www\sapius2\TEST_READY.md
- e:\laragon\www\sapius2\.agents\teamwork\reviewer_1\DISPATCH.md

Review all backend changes:
- `app/Http/Middleware/CheckRole.php`
- `app/Http/Controllers/Instructor/CourseController.php`
- `app/Http/Controllers/Instructor/CourseBuilderController.php`
- `routes/instructor.php`

Verify:
1. Strict authorization: /instructor/cursos only lists assigned courses (cursos_programados.user_id = auth()->id()).
2. HTTP 403 on unassigned course views and unassigned course builder.
3. Admin bypass: role:admin retains unrestricted supervisory access.
4. Active students: Only aceptado = 'si' are loaded.
5. Grades breakdown: exam scores use score_total, homework tracks is_late.
6. Schema freeze compliance: Zero migrations or table alterations.
7. Run the test suite:
`php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php`
`php artisan test tests/Feature/Instructor/InstructorCourseBuilderAccessTest.php`

Deliver handoff.md in your working directory with an explicit verdict: APPROVE or REQUEST_CHANGES. Send message to orchestrator.

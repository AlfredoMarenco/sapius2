# Handoff Report — Milestone 2: Backend Cohorts & Grades Aggregation

**Worker:** Worker M2 (`teamwork_preview_worker`)  
**Date:** 2026-10-26T16:15:00Z  
**Target:** `app/Http/Controllers/Instructor/CourseController.php`  
**Test Suite:** `tests/Feature/Instructor/InstructorCourseAccessTest.php`  

---

## 1. Observation

1. **Initial Test Baseline**: Running `php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php` prior to M2 implementation resulted in 14 test failures across Features 4, 5, 6, Tier 2, and Tier 4:
   ```
   FAILED Tests\Feature\Instructor\InstructorCourseAccessTest > tier1 student exams average is calculated accurately
   Failed asserting that 0.0 matches expected 80.0.
   FAILED Tests\Feature\Instructor\InstructorCourseAccessTest > tier1 homework submission includes is late flag false when on time
   FAILED Tests\Feature\Instructor\InstructorCourseAccessTest > tier1 homework submission includes is late flag true when late
   FAILED Tests\Feature\Instructor\InstructorCourseAccessTest > tier1 student homework completed count is accurate
   FAILED Tests\Feature\Instructor\InstructorCourseAccessTest > tier1 homework item includes lesson title
   FAILED Tests\Feature\Instructor\InstructorCourseAccessTest > tier2 instructor cannot view unassigned cohort in same course via query param
   FAILED Tests\Feature\Instructor\InstructorCourseAccessTest > tier4 scenario4 realistic cohort with mixed student statuses and activity performance
   Tests: 14 failed, 32 passed (112 assertions)
   ```
2. **Legacy Database Columns & Schema Freeze**:
   - Table `users` uses `nombre`, `apellido`, `email`, and `foto`. Physical columns `name`, `last_name`, and `avatar` do NOT exist in the MySQL database.
   - Table `inscripciones` tracks student enrollments per cohort (`curso_programado_id`), where active accepted students have `aceptado = 'si'`.
   - Table `examenes` (`Exam`) links evaluations to `inscripcion_id` and `prueba_id`, with numerical score in `score_total` and completion status in `finalizado`.
   - Table `homework` (`Homework`) stores student homework per `leccion_id` and `user_id`, with boolean timeliness flag `is_late`.
   - Table `leccion_user` stores completed lessons per `(user_id, leccion_id, curso_programado_id)`.
3. **Execution Results Post-Implementation**:
   - Running Pint lint:
     ```
     ./vendor/bin/pint --test app/Http/Controllers/Instructor/CourseController.php
     PASS 1 file
     ```
   - Running complete test suite:
     ```
     php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php
     PASS Tests\Feature\Instructor\InstructorCourseAccessTest
     Tests: 46 passed (127 assertions)
     Duration: 3.25s
     ```

---

## 2. Logic Chain

1. **Cohort Scoping & Authorization (Observation 1 & 2)**:
   - For non-admin instructors, `ScheduledCourse` is filtered by `where('user_id', $user->id)`. Admins can inspect all cohorts.
   - If query parameter `?cohort_id={id}` is provided, the target cohort is validated against course ID and the instructor's assignment. If a non-admin instructor attempts to view an unassigned cohort, `abort(403, 'No tienes autorización para acceder a esta cohorte.')` triggers immediately, satisfying `test_tier2_instructor_cannot_view_unassigned_cohort_in_same_course_via_query_param`.
2. **Active Enrolled Student Filtering (Observation 2)**:
   - Enrollments are queried using `Enrollment::where('curso_programado_id', $selectedCohort->id)->where('aceptado', 'si')`.
   - Any enrollment with `aceptado = 'no'` or `aceptado = 'pendiente'` is strictly filtered out at query level, satisfying tests `test_tier1_cohort_view_excludes_unaccepted_students`, `test_tier1_cohort_with_all_unaccepted_students_shows_empty_student_list`, and `test_tier1_pending_or_null_acceptance_students_are_excluded`.
3. **Legacy Column Safety (Observation 2)**:
   - Avoided any `SELECT users.name` queries. Eloquent relationship `$enrollment->user` was leveraged with accessors `$student->nombre ?? $student->first_name ?? $student->name` and `$student->foto ?? $student->avatar`, guaranteeing zero SQL 1054 errors under production MySQL.
4. **Exam Breakdown & Average Calculation (Observation 1 & 2)**:
   - For each active enrollment, associated exam submissions (`$enrollment->exams`) are itemized with `score_total`, `score`, `quiz_title`, `title`, `total_preguntas`, `total_correctas`, `status`, `finalizado`, `is_late`, and `date`.
   - `exams_average` is calculated over completed exams (`finalizado === 'si'`), or defaults to `0` when no exams exist.
5. **Homework Submissions & Progress Calculation (Observation 1 & 2)**:
   - Course lessons were extracted from `lecciones` (`leccion_id > 0` belonging to the course or module).
   - Homework submissions are queried by `user_id` and `courseLessonIds`, extracting `is_late` boolean, lesson title, submission date, and counting total completed homeworks.
   - Lesson progress is computed from `leccion_user` as `(completedLessonsCount / totalLessonsCount) * 100` (or `0` when empty).
6. **Inertia Payload Compatibility**:
   - `course`, `cohorts`, `selectedCohortId`, `selectedCohort`, `students`, and `total_cohorts` are passed to `Inertia::render('Instructor/Courses/Show', ...)`.

---

## 3. Caveats

- **No Schema Changes**: Under the strict Schema Freeze constraint, no database migrations or alterations were created. All queries operate entirely on existing legacy table structures.
- **Frontend Display Component (Milestone 3)**: The backend props returned by `CourseController@show` are fully structured and ready for Milestone 3 (`resources/js/pages/Instructor/Courses/Show.tsx`), which will provide the React UI cohort selector and grades modal.

---

## 4. Conclusion

Milestone 2 (Backend Cohorts & Grades Aggregation) is fully completed and verified. `app/Http/Controllers/Instructor/CourseController.php` provides complete cohort authorization, active student filtering (`aceptado = 'si'`), detailed exam itemization (`score_total`, completion status, questions count), homework tracking (`is_late`), course progress calculation, and adheres 100% to the Schema Freeze constraint. 100% of the 46 test cases (127 assertions) in `tests/Feature/Instructor/InstructorCourseAccessTest.php` pass cleanly with zero failures.

---

## 5. Verification Method

To independently verify this milestone:

1. **Run the Automated Test Suite**:
   ```bash
   php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php
   ```
   **Expected Result**: `PASS Tests\Feature\Instructor\InstructorCourseAccessTest` with `Tests: 46 passed (127 assertions)`.

2. **Verify Code Style & Formatting**:
   ```bash
   ./vendor/bin/pint --test app/Http/Controllers/Instructor/CourseController.php
   ```
   **Expected Result**: `PASS 1 file`.

3. **Inspect Implementation File**:
   View `app/Http/Controllers/Instructor/CourseController.php` lines 39-261 to verify cohort scoping, `aceptado = 'si'` filtering, exam grades mapping, homework querying, and lesson completion calculation.

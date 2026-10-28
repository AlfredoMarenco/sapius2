# Dispatch: M2 - Backend Cohorts & Grades Aggregation
## 2026-10-26T16:04:11Z


Working Directory: e:\laragon\www\sapius2\.agents\teamwork\worker_m2
Original Request: e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
Project Scope: e:\laragon\www\sapius2\PROJECT.md
Survey Report: e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_2\survey_cohorts_grades.md
E2E Test File: tests/Feature/Instructor/InstructorCourseAccessTest.php

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Mission: Implement cohort selection, active student filtering (`aceptado = 'si'`), exam grades itemization (`score_total`), homework submissions (`is_late`), and lesson progress in `app/Http/Controllers/Instructor/CourseController.php`.

Target File Owned Exclusively:
- `app/Http/Controllers/Instructor/CourseController.php`

Requirements & Specifications:
1. Cohort Scoping & Selection:
   - For course `{id}`, load all cohorts assigned to the instructor (`cursos_programados.user_id = auth()->id()`). If user is `role:admin`, load all cohorts for the course.
   - Accept optional query parameter `cohort_id` (`$request->query('cohort_id')`). If provided, validate that the instructor is authorized for this cohort (or admin); otherwise default to the first assigned cohort.
2. Active Enrolled Students Filtering:
   - For the selected cohort, query enrollments (`Enrollment` / table `inscripciones`) where `curso_programado_id = $selectedCohort->id` and `aceptado = 'si'`.
   - Strictly exclude records where `aceptado = 'no'`.
   - Eager load or join the student user (`User` model).
   - CRITICAL DATABASE TRAP: MySQL table `users` uses `nombre`, `apellido`, and `foto`. DO NOT select `users.name` or `users.avatar` in SQL queries. Access them via Eloquent attributes/accessors (`$student->name`, `$student->last_name`, `$student->avatar` or `$student->foto`).
3. Exam & Evaluation Grades Breakdown:
   - For each active enrollment, retrieve their exam attempts from table `examenes` (`Exam` model) linked via `inscripcion_id = $enrollment->id`.
   - Each exam entry must include:
     - `id`: exam id
     - `quiz_title`: `$exam->quiz?->titulo ?? $exam->quiz?->title ?? 'Evaluación'`
     - `score`: `$exam->score_total` (numerical score)
     - `score_total`: `$exam->score_total`
     - `total_preguntas`: `$exam->total_preguntas`
     - `total_correctas`: `$exam->total_correctas`
     - `status`: `$exam->finalizado === 'si' ? 'Finalizado' : 'En progreso'`
     - `finalizado`: `$exam->finalizado`
     - `is_late`: (bool) $exam->is_late
     - `date`: formatted date
   - Calculate `exams_average`: average of `score_total` for completed exams (`finalizado = 'si'`). If no exams completed, 0.
4. Homework Submissions Breakdown:
   - Query table `homework` for the student's `user_id` and the course's lesson IDs (`Lesson::where('curso_id', $course->id)->pluck('id')`).
   - Each homework entry includes:
     - `id`: homework id
     - `lesson_id`: lesson id
     - `lesson_title`: lesson title
     - `is_late`: (bool) $hw->is_late
     - `submitted_at`: $hw->created_at
     - `status`: 'Entregado'
   - Calculate `homework_completed_count`: count of submitted homeworks.
5. Overall Course Progress:
   - Query table `leccion_user` for `(user_id, curso_programado_id)`.
   - `progress_percent`: `(completedLessonsCount / totalLessonsCount) * 100` (or 0 if no lessons).
6. Return Props in Inertia Render:
   Ensure the props passed to `Inertia::render('Instructor/Courses/Show', [...])` match the interface contract in `PROJECT.md` and expected by `tests/Feature/Instructor/InstructorCourseAccessTest.php`:
   - `course`: Course model with category
   - `cohorts`: list of instructor cohorts `[{ id, identificador, fecha_inicio, fecha_fin, active_students_count, ... }]`
   - `selectedCohortId`: ID of currently selected cohort
   - `selectedCohort`: selected cohort object
   - `students`: array/collection of active accepted students with `enrollment_id`, `id`, `name`, `last_name`, `email`, `avatar`, `progress_percent`, `exams`, `homeworks`, `exams_average`, `homework_completed_count`.
7. Schema Freeze:
   - DO NOT alter database schema or create migrations.
8. Verification:
   Run the full test suite:
   `php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php`
   All 46 tests should pass!
9. Deliver handoff.md in your working directory and notify the orchestrator.

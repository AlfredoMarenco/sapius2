# Project: Sapius 2 - Phase 3 (Instructor Module)

## Architecture
Sapius 2 is a Laravel 13 + Inertia.js React 19 + TypeScript + MySQL learning management system.
In Phase 3 (Instructor Module Parity), instructors manage assigned courses and cohorts, view active enrolled students, and inspect student performance breakdowns (evaluations, exam scores, and homework).

### Data Flow & Authorization
1. **Instructor Access**:
   - Routes: `/instructor/cursos`, `/instructor/cursos/{id}/view`, `/instructor/cursos/{id}/builder` in `routes/instructor.php`.
   - Middleware: `CheckRole` (`role:instructor`) with administrator bypass (`$user->hasRole('admin')`).
   - Assignment: An instructor is assigned to a course if they have at least one scheduled cohort in table `cursos_programados` with `user_id = auth()->id()`.
   - Access Enforcement:
     - `/instructor/cursos` (Index): Returns only courses where `scheduledCourses.user_id = auth()->id()` (admins see all courses).
     - `/instructor/cursos/{id}/view` (Show): If instructor is not assigned to any cohort for course `{id}` and is not admin, aborts with HTTP 403 Forbidden.
2. **Cohort & Student Breakdown**:
   - Active Enrolled Students: From table `inscripciones` where `curso_programado_id = {cohort_id}` and `aceptado = 'si'`.
   - Legacy Schema Mapping (Schema Freeze): Table `users` uses `nombre`, `apellido`, `foto` (Spanish columns). `name` and `last_name` are Eloquent accessors.
   - Exam Grades: From table `examenes` linked to `inscripcion_id` and `prueba_id`. Numerical score is in column `score_total` (alias `score`). Status in `finalizado`.
   - Homework: From table `homework` linked to `leccion_id` and `user_id`. Tracks `is_late` flag and submission timestamp.
   - Progress: From table `leccion_user` keyed by `(user_id, leccion_id, curso_programado_id)`.
3. **Frontend UI**:
   - Inertia React page `resources/js/pages/Instructor/Courses/Show.tsx`.
   - Cohort selector to switch between assigned cohorts.
   - Active student table with progress and summary metrics.
   - Detailed modal/drawer displaying the itemized breakdown of exams (title, score, correct/total, status) and homework.

---

## Feature Inventory
Every feature from user requirements is enumerated and mapped to its milestone:
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Instructor Course Listing Restriction | `/instructor/cursos` only lists courses with cohorts where `cursos_programados.user_id = auth()->id()` | M1 | ORIGINAL_REQUEST §R1 |
| 2 | HTTP 403 Forbidden on Unauthorized Access | Attempting to access `/instructor/cursos/{id}/view` for an unassigned course returns HTTP 403 | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Admin Supervisory Bypass | Users with `role:admin` retain unrestricted access to all instructor courses and views | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Cohort Assignment & Selection | `/instructor/cursos/{id}/view` loads instructor's cohorts and supports cohort selection | M2 | ORIGINAL_REQUEST §R2 |
| 5 | Active Enrolled Students Filtering | Cohort student list only includes active students with `inscripciones.aceptado = 'si'` | M2 | ORIGINAL_REQUEST §R2 |
| 6 | Exam & Evaluation Grades Breakdown | Detailed exam performance (scores `score_total`, status `finalizado`, correct/total questions) per student | M2 | ORIGINAL_REQUEST §R2 |
| 7 | Homework Progress & Submissions | Homework completion and timeliness (`is_late`) per student | M2 | ORIGINAL_REQUEST §R2 |
| 8 | Database Schema Freeze Compliance | Zero database migrations or schema alterations; strictly operates on existing tables | M2 | ORIGINAL_REQUEST §R3 |
| 9 | Frontend Cohort & Grades Breakdown UI | React/Inertia UI in `Show.tsx` with cohort selector and interactive student grades modal | M3 | ORIGINAL_REQUEST §R2 |
| 10 | Frontend Build & Typecheck Cleanliness | `npm.cmd run build` and `npm.cmd run types:check` pass cleanly with zero errors | M3 | ORIGINAL_REQUEST Acceptance Criteria |
| 11 | Comprehensive Opaque-Box E2E Test Suite | Automated Pest/PHPUnit tests covering R1, R2, R3, 403 enforcement, student filtering, grades data | M_TEST | ORIGINAL_REQUEST Acceptance Criteria |
| 12 | 100% E2E Pass & Adversarial Hardening | Full test pass and adversarial coverage verification | M_FINAL | Project Pattern Protocol |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M_TEST | E2E Testing Suite Track | Design and implement complete opaque-box test suite in `tests/Feature/Instructor/InstructorCourseAccessTest.php`; publish `TEST_READY.md` | none | DONE |
| M1 | Backend Authorization & Access Control | Update `CheckRole.php`, `CourseController.php` (index filtering & 403 abort), `CourseBuilderController.php` | none | DONE |
| M2 | Backend Cohorts & Grades Aggregation | Implement cohort scoping, `aceptado = 'si'` student query, exam scores & homework payload in `CourseController.php` adhering to Schema Freeze | M1 | DONE |
| M3 | Frontend UI & Typecheck Cleanliness | Build cohort selector and grades breakdown dialog in `Show.tsx`, resolve type errors for green `types:check` | M2 | DONE |
| M_FINAL | Final Milestone: E2E Pass & Adversarial Hardening | Pass 100% of E2E tests in `TEST_READY.md`, adversarial coverage hardening, forensic integrity audit | M_TEST, M3 | DONE |

---

## Interface Contracts

### 1. `CheckRole` Middleware
- Location: `app/Http/Middleware/CheckRole.php`
- Signature: `handle(Request $request, Closure $next, string $role): Response`
- Behavior:
  - If user is not authenticated -> redirect to login.
  - If authenticated user has role `admin` -> call `$next($request)` immediately (admin bypass).
  - If user has specified `$role` -> call `$next($request)`.
  - Else -> redirect to route `dashboard`.

### 2. `CourseController::index()`
- Route: `GET /instructor/cursos` -> name: `instructor.cursos.index`
- Response: `Inertia::render('Instructor/Courses/Index', ['courses' => $courses])`
- Filter:
  - If admin: `Course::with('category')->get()`
  - If instructor: `Course::whereHas('scheduledCourses', fn($q) => $q->where('user_id', auth()->id()))->with('category')->get()`

### 3. `CourseController::show($id)`
- Route: `GET /instructor/cursos/{id}/view` -> name: `instructor.cursos.show`
- Query Params: `?cohort_id={id}` (optional, defaults to first assigned cohort)
- Authorization:
  - If not admin and `!ScheduledCourse::where('curso_id', $id)->where('user_id', auth()->id())->exists()`:
    -> `abort(403, 'No tienes autorización para acceder a este curso.');`
- Inertia Props:
  - `course`: Course details with category and modules count
  - `cohorts`: Array of cohorts assigned to instructor (or all cohorts if admin) `[{ id, identificador, fecha_inicio, fecha_fin, active_students_count }]`
  - `selectedCohortId`: Number (current active cohort)
  - `students`: Array of accepted students (`aceptado = 'si'`) with:
    - `id`, `name`, `last_name`, `email`, `avatar`, `enrollment_id`
    - `progress_percent`: Number (completed lessons / total course lessons * 100)
    - `exams`: Array of `[{ id, quiz_title, score, max_score, correct_answers, total_questions, status, date }]`
    - `homeworks`: Array of `[{ id, lesson_title, is_late, submitted_at, status }]`
    - `exams_average`: Number (average score of completed exams)
    - `homework_completed_count`: Number

---

## Code Layout
- Backend Middleware: `app/Http/Middleware/CheckRole.php`
- Backend Controllers: `app/Http/Controllers/Instructor/CourseController.php`, `CourseBuilderController.php`
- Backend Models: `app/Models/Course.php`, `ScheduledCourse.php`, `Enrollment.php`, `Exam.php`, `Homework.php`, `User.php`
- Frontend Pages: `resources/js/pages/Instructor/Courses/Index.tsx`, `Show.tsx`
- Frontend Components: `resources/js/components/ui/` (Dialog, Tabs, Badge, Table, Button)
- Tests: `tests/Feature/Instructor/InstructorCourseAccessTest.php`

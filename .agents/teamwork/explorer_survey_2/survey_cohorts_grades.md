# Survey Report: Cohorts, Enrolled Students & Grades Schema (Phase 3)

**Author:** Explorer 2 (Cohorts & Grades Schema Explorer)  
**Date:** 2026-10-26  
**Target Project:** Sapius 2 (`e:\laragon\www\sapius2`)  
**Context:** Phase 3 Parity - Instructor Module (Management of assigned courses, cohort active students, evaluations/exam grades breakdown, homework)  
**Constraint:** Strict Schema Freeze (No DB migrations or schema alterations permitted)

---

## 1. Executive Summary

A comprehensive investigation of the MySQL database (`wwsapi_testserver`), Eloquent models, and existing controllers in Sapius 2 was conducted to establish exact schema definitions, relationships, and query patterns for the Instructor Module (Phase 3).

### Key Findings
1. **Cohorts Assignment (`cursos_programados`)**: Instructors are assigned at the cohort level via `cursos_programados.user_id = auth()->id()`. A course (`cursos`) may have multiple cohorts.
2. **Active Enrolled Students (`inscripciones`)**: Students are enrolled per cohort via the `inscripciones` table. An active enrolled student is explicitly determined by `inscripciones.aceptado = 'si'`. Unaccepted or pending enrollments have `aceptado = 'no'`.
3. **Critical Column Name Trap in `users` Table**: The `users` table uses legacy Spanish column names: `nombre`, `apellido`, and `foto`. **Columns `name`, `last_name`, and `avatar` DO NOT exist in the database table.** Querying `User::select('users.name', ...)` causes fatal SQL error `SQLSTATE[42S22]: 1054 Unknown column 'users.name'`. Accessing `$user->name` and `$user->full_name` is done via Eloquent accessors in `User.php`.
4. **Exam Grades & Evaluations (`examenes`)**: 
   - Evaluation blueprints are stored in `pruebas` (`Quiz.php`).
   - Student attempts and submissions are stored in `examenes` (`Exam.php`), which directly references `inscripcion_id` and `prueba_id`.
   - The numerical score is stored in column `score_total` (aliased to `score` in `Exam.php`). **There is NO `calificacion` column in the database.**
   - Status is tracked via `finalizado` (`'si'` / `'no'`), feedback via `retro_visualizado` (`'si'` / `'no'`), and timeliness via `is_late` (`0` / `1`).
5. **Homework Tracking (`homework`)**:
   - Table `homework` (`Homework.php`) stores `leccion_id`, `user_id`, `is_late` (0 or 1), and `created_at`.
   - `homework` does NOT contain an `inscripcion_id` or a numerical score. Homework progress represents submission status (submitted on time vs late vs unsubmitted). Actual submission files are stored on disk and dispatched to the instructor's email.
6. **Progress Tracking (`leccion_user`)**:
   - Lesson completions are tracked in `leccion_user` keyed by `(user_id, leccion_id, curso_programado_id)`.
   - Overall cohort progress percentage is: `(count(completedLessons) / totalCourseLessons) * 100`.

---

## 2. Database Schema & Eloquent Mapping Matrix

All tables and models inspected conform to the following schema:

| Entity | DB Table | Eloquent Model | Primary Key | Key Foreign Keys & Attributes |
|---|---|---|---|---|
| Course | `cursos` | `App\Models\Course` | `id` | `user_id` (author), `titulo`, `slug`, `descripcion`, `imagen`, `activo` ('si'/'no') |
| Scheduled Cohort | `cursos_programados` | `App\Models\ScheduledCourse` | `id` | `curso_id` -> `cursos.id`, `user_id` -> `users.id` (**Assigned Instructor**), `identificador`, `fecha_inicio`, `fecha_fin`, `precio`, `activo` ('si'/'no') |
| Enrollment | `inscripciones` | `App\Models\Enrollment` | `id` | `curso_programado_id` -> `cursos_programados.id`, `user_id` -> `users.id` (Student), `aceptado` ('si'/'no') |
| Student / User | `users` | `App\Models\User` | `id` | `nombre`, `apellido`, `email`, `foto`, `username`, `activo` ('si'/'no'), `is_blocked` (0/1) |
| Quiz / Eval Spec | `pruebas` | `App\Models\Quiz` | `id` | `curso_id`, `leccion_id`, `titulo`, `tipo` ('EXANI','EGEL','ENARM'), `oportunidades` (int), `tiempo`, `activo` ('si'/'no') |
| Exam Submission | `examenes` | `App\Models\Exam` | `id` | `inscripcion_id` -> `inscripciones.id`, `prueba_id` -> `pruebas.id`, `score_total` (double), `total_preguntas`, `total_correctas`, `finalizado` ('si'/'no'), `retro_visualizado` ('si'/'no'), `is_late` (0/1) |
| Homework Submission | `homework` | `App\Models\Homework` | `id` | `leccion_id` -> `lecciones.id`, `user_id` -> `users.id`, `is_late` (0/1), `created_at` |
| Lesson Progress | `leccion_user` | Raw DB table / User relation | `id` | `user_id`, `leccion_id`, `curso_programado_id`, `completed_at` (Unique: `user_id + leccion_id + curso_programado_id`) |
| Lesson Unlock | `lesson_unlocks` | `App\Models\LessonUnlock` | `id` | `user_id`, `curso_programado_id`, `leccion_id`, `until_date` |

### Detailed Table Schemas

#### A. `cursos_programados`
```sql
id                  bigint unsigned AUTO_INCREMENT
category_id        bigint unsigned NULL
identificador      varchar(255) NULL -- e.g. "Generación 2026-A", "23 de Agosto 2021"
user_id            bigint unsigned -- INSTRUCTOR ASSIGNED TO THIS COHORT
curso_id           bigint unsigned -- Course definition
fecha_inicio       datetime
fecha_fin          datetime
clave_descuento    varchar(45) NULL
precio             double(8,2) DEFAULT 0.00
activo             enum('si','no') DEFAULT 'si'
created_at         timestamp NULL
updated_at         timestamp NULL
fecha_inicio_venta datetime NULL
fecha_fin_venta    datetime NULL
```

#### B. `inscripciones`
```sql
id                  bigint unsigned AUTO_INCREMENT
user_id            bigint unsigned -- Student user id
curso_programado_id bigint unsigned -- Cohort id
aceptado           enum('si','no') DEFAULT 'no' -- Active status ('si' = active/enrolled)
referencia         varchar(255) NULL
tipo_pago          varchar(255) NULL
clave              varchar(45) NULL
created_at         timestamp NULL -- Enrolled timestamp
updated_at         timestamp NULL
```

#### C. `examenes`
```sql
id                bigint unsigned AUTO_INCREMENT
inscripcion_id    bigint unsigned -- FK to inscripciones.id
prueba_id         bigint unsigned -- FK to pruebas.id
respuestas_json   text NULL -- Student's answers snapshot
score_total       double(8,2) DEFAULT 0.00 -- Score obtained
total_preguntas   double(8,2) NULL -- Total items
total_correctas   double(8,2) NULL -- Correct items
finalizado        enum('si','no') DEFAULT 'no' -- Completion status
is_late           tinyint(1) DEFAULT 0
retro_visualizado enum('si','no') DEFAULT 'no' -- Whether feedback was viewed
eventos           longtext NULL -- Tracking / anti-cheat events
created_at        timestamp NULL -- Exam start datetime
updated_at        timestamp NULL -- Exam finish datetime
```

#### D. `homework`
```sql
id          bigint unsigned AUTO_INCREMENT
leccion_id  bigint unsigned -- Lesson ID with homework
is_late     tinyint(1) DEFAULT 0 -- 0 = on time, 1 = late
user_id     bigint unsigned -- Student User ID
created_at  timestamp NULL -- Submission datetime
updated_at  timestamp NULL
```

#### E. `leccion_user`
```sql
id                  bigint unsigned AUTO_INCREMENT
user_id             bigint unsigned
leccion_id          bigint unsigned
curso_programado_id bigint unsigned NULL
completed_at        timestamp NULL
created_at          timestamp NULL
updated_at          timestamp NULL
-- UNIQUE KEY: (user_id, leccion_id, curso_programado_id)
```

---

## 3. Strict Authorization & Cohort Filtering (R1)

### Requirements Breakdown
1. **Instructor Access**: The instructor must only be permitted to view and manage courses and cohorts where they are explicitly assigned (`cursos_programados.user_id = auth()->id()`).
2. **403 Forbidden**: Accessing `/instructor/cursos/{id}/view` or editing a course with no cohorts assigned to the instructor must return HTTP 403.
3. **Admin Supervision**: Users with `role:admin` retain unrestricted access to all courses and cohorts.

### Verified Eloquent Queries

#### Querying courses for `/instructor/cursos` (Index):
```php
$user = auth()->user();

if ($user->hasRole('admin')) {
    $courses = Course::with('category')->get();
} else {
    // Only courses with at least one scheduled cohort assigned to this instructor
    $courses = Course::whereHas('scheduledCourses', function ($q) use ($user) {
        $q->where('user_id', $user->id);
    })->with('category')->get();
}
```

#### Authorization & Cohort Loading for `/instructor/cursos/{id}/view` (Show):
```php
$user = auth()->user();
$course = Course::with(['category'])->findOrFail($id);

$isAdmin = $user->hasRole('admin');

// Authorize access
$hasAssignedCohort = ScheduledCourse::where('curso_id', $id)
    ->where('user_id', $user->id)
    ->exists();

if (!$isAdmin && !$hasAssignedCohort) {
    abort(403, 'No tienes autorización para acceder a este curso.');
}

// Fetch cohorts visible to this user
$cohortsQuery = ScheduledCourse::where('curso_id', $id);
if (!$isAdmin) {
    $cohortsQuery->where('user_id', $user->id);
}
$scheduledCourses = $cohortsQuery->orderBy('fecha_inicio', 'desc')->get();
```

---

## 4. Active Enrolled Students Query Pattern (R2)

### Active Enrolled Student Criteria
- Students must have `inscripciones.aceptado = 'si'`.
- Records where `aceptado = 'no'` are pending/unpaid/cancelled and should NOT be treated as active students.

### Bug in Current Codebase
In `app/Http/Controllers/Instructor/CourseController.php`:
```php
// DEFECT 1: users.name, users.last_name, users.avatar DO NOT exist in MySQL table `users`!
// DEFECT 2: Missing where('aceptado', 'si') filter!
$scheduledCourses = \App\Models\ScheduledCourse::where('curso_id', $id)
    ->with(['students' => function($q) {
        $q->select('users.id', 'users.name', 'users.last_name', 'users.email', 'users.username', 'users.avatar');
    }])->get();
```
If executed, this throws:
`SQLSTATE[42S22]: Column not found: 1054 Unknown column 'users.name' in 'field list'`

### Correct Query Pattern
```php
// Selected cohort ID (defaults to first available cohort or specified by request)
$selectedCohortId = $request->query('cohort_id', $scheduledCourses->first()?->id);
$selectedCohort = $scheduledCourses->firstWhere('id', $selectedCohortId);

if (!$selectedCohort) {
    // Handle course with no cohorts
    return Inertia::render('Instructor/Courses/Show', [...]);
}

// Ensure non-admin cannot view an unassigned cohort
if (!$isAdmin && $selectedCohort->user_id !== $user->id) {
    abort(403, 'No tienes autorización para visualizar este grupo.');
}

// Load active enrollments with student users and exams
$enrollments = Enrollment::with([
    'user' => function ($q) {
        $q->select('id', 'nombre', 'apellido', 'email', 'foto', 'username');
    },
    'exams' => function ($q) {
        $q->with('quiz:id,titulo,tipo,oportunidades')
          ->orderBy('id', 'desc');
    }
])
->where('curso_programado_id', $selectedCohort->id)
->where('aceptado', 'si')
->get();
```

---

## 5. Grades, Attempts, Scores & Progress Calculation

### A. Exams & Evaluations Breakdown
For each enrollment:
- **Exams Presented**: `$enrollment->exams`
- **Quiz Title**: `$exam->quiz?->title ?? $exam->quiz?->titulo ?? 'Evaluación'`
- **Obtained Score**: `$exam->score` (or `$exam->score_total`).  
  *Note:* In EXANI-type evaluations, scores generally range between 700 and 1300. In ENARM, scores range 0-100 or total points.
- **Status**: `$exam->status` / `$exam->finalizado` (`'si'` for completed, `'no'` for in-progress).
- **Correct vs Total Questions**: `$exam->total_correctas` of `$exam->total_preguntas`.
- **Submission Date**: `$exam->updated_at` (or `finished_at`).
- **Attempts**: If multiple attempts exist for the same `prueba_id`, they can be grouped by `prueba_id` showing the latest or highest score and total attempts count (`count(*) vs $quiz->attempts_allowed`).

### B. Homework Breakdown
Because `homework` is stored per `user_id` and `leccion_id`:
```php
$courseLessonIds = Lesson::where('curso_id', $course->id)->pluck('id')->toArray();

// Student's submitted homework for this course:
$studentHomeworks = DB::table('homework')
    ->where('user_id', $studentUserId)
    ->whereIn('leccion_id', $courseLessonIds)
    ->get()
    ->keyBy('leccion_id');
```
For each lesson that contains homework:
- **Status**: Submitted (`$studentHomeworks->has($lessonId)`) or Pending (`!$studentHomeworks->has($lessonId)`).
- **Timeliness**: `$hw->is_late === 1` ("Fuera de tiempo" / Late) vs `$hw->is_late === 0` ("A tiempo" / On time).
- **Date**: `$hw->created_at`.

### C. Lesson Completion & Cohort Progress
```php
// Lessons completed in this cohort
$completedLessonIds = DB::table('leccion_user')
    ->where('user_id', $studentUserId)
    ->where('curso_programado_id', $selectedCohort->id)
    ->pluck('leccion_id')
    ->toArray();

$totalLessons = count($courseLessonIds);
$completedCount = count($completedLessonIds);
$progressPercent = $totalLessons > 0 ? round(($completedCount / $totalLessons) * 100) : 0;
```

---

## 6. Existing Implementation Audit & Gap Analysis

| Component | Current State | Required State | Defect / Action Required |
|---|---|---|---|
| `routes/instructor.php` | Middleware: `role:instructor` | Admins (`role:admin`) must also be permitted | Admin access to instructor routes will fail role check unless role middleware permits admin or admin is explicitly handled. |
| `Instructor/CourseController@index` | `Course::with('category')->get();` | Restrict to courses assigned to `auth()->id()` | Currently exposes all courses to any instructor. Must filter by `whereHas('scheduledCourses')`. |
| `Instructor/CourseController@show` | No authorization check, loads all cohorts, buggy user select | Check assigned cohort or admin, filter by cohort, select valid columns | Throws SQL 1054 error on `users.name`, misses `aceptado = 'si'` filter, missing 403 check. |
| `resources/js/pages/Instructor/Courses/Show.tsx` | Placeholder list with no cohort switcher, no grade breakdown, disabled progress button | Cohort selector dropdown, active student list, modal or expansion with exams, homework, and progress details | Needs cohort selector and student grade/progress breakdown modal or drawer. |

---

## 7. Recommended Implementation Architecture (No Schema Changes)

1. **Controller Enhancement (`CourseController.php`)**:
   - `index()`: Filter courses by instructor cohort assignment unless admin.
   - `show($id)`:
     - Verify authorization (403 Forbidden if not assigned and not admin).
     - Load cohorts assigned to instructor (or all cohorts if admin).
     - Support `cohort_id` query parameter to switch cohorts.
     - For active cohort, retrieve students (`aceptado = 'si'`) with their exams, completed lessons count, and submitted homework count.
     - Provide an endpoint or JSON payload for individual student grade breakdown (reusing or mirroring `AcademicTrackingController` / `ExamResultController` data structure).
2. **Frontend Enhancement (`Show.tsx`)**:
   - Add a Cohort / Group selector dropdown.
   - Display active enrolled student cards / rows showing:
     - Avatar, Full Name, Email.
     - Overall progress % (completed lessons / total).
     - Exams completed & average score.
     - Homework submitted count.
     - Interactive modal or expander showing the detailed breakdown of each exam (Quiz title, score, correct/total, status, date) and homework (Lesson, status, on time / late).
3. **Route & Role Access**:
   - Ensure `routes/instructor.php` allows both `role:instructor` and `role:admin` (e.g. `role:instructor|admin` or role check support).

---

## 8. Verification & Test Plan

1. **Authorization Tests**:
   - Create Instructor A and Instructor B in test cases.
   - Assign Cohort to Instructor A.
   - Assert Instructor A accesses `/instructor/cursos` and sees the assigned course.
   - Assert Instructor B accessing `/instructor/cursos` does NOT see Instructor A's course.
   - Assert Instructor B accessing `/instructor/cursos/{id}/view` receives HTTP 403.
   - Assert Admin (`role:admin`) accessing `/instructor/cursos/{id}/view` receives HTTP 200.
2. **Student & Grade Filter Tests**:
   - Enroll Student 1 with `aceptado = 'si'` and Student 2 with `aceptado = 'no'`.
   - Assert only Student 1 appears in the active student list.
   - Create completed exam and homework for Student 1.
   - Assert score breakdown displays accurate exam score (`score_total`) and homework status.
3. **Frontend Compilation**:
   - Run `npm run build` or `npm run type-check` to verify TypeScript types and JSX compilation without errors.

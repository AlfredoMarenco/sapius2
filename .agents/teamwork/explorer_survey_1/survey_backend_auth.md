# Survey Report: Backend Architecture & Authorization (Phase 3 - Instructor Module)

**Author:** Explorer 1 (Backend Authorization Explorer)  
**Date:** 2026-10-26  
**Status:** Completed  
**Target:** Sapius 2 (`routes/instructor.php`, `CheckRole`, `CourseController`, `wwsapi_testserver` schema)

---

## 1. Executive Summary
The backend infrastructure for the instructor module exists in `routes/instructor.php` and `App\Http\Controllers\Instructor\CourseController`, but currently **completely lacks access control and filtering**: `CourseController::index()` returns all courses in the catalog without scoping to the authenticated instructor, and `CourseController::show($id)` performs zero authorization checks, allowing any user with the instructor role to view any course details without throwing HTTP 403. Furthermore, `CheckRole` middleware does not implement an admin bypass or multi-role support, causing administrators (`role:admin`) to be redirected away when accessing `/instructor/*`.

Database analysis of `wwsapi_testserver` confirms that courses are linked to instructors via `cursos_programados.user_id = auth()->id()`. Enforcing strict authorization, implementing an admin bypass, filtering cohorts and accepted students (`aceptado = 'si'`), and loading exam and homework grades can be implemented cleanly under the strict Schema Freeze constraint.

---

## 2. Route Architecture & Registration

### 2.1 Route Definitions
All instructor endpoints are centralized in `routes/instructor.php`:

```php
Route::middleware(['auth', 'verified', 'role:instructor'])
    ->prefix('instructor')
    ->name('instructor.')
    ->group(function () {
        // Dashboard
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Cursos (Listado y vista de progreso)
        Route::get('/cursos', [CourseController::class, 'index'])->name('cursos.index');
        Route::get('/cursos/{id}/view', [CourseController::class, 'show'])->name('cursos.show');

        // Módulos, Lecciones y Builder
        Route::get('/cursos/{course}/builder', [CourseBuilderController::class, 'show'])->name('courses.builder');
        Route::post('/courses/{course}/modules', [CourseBuilderController::class, 'storeModule'])->name('courses.modules.store');
        Route::patch('/modules/{module}', [CourseBuilderController::class, 'updateModule'])->name('courses.modules.update');
        Route::post('/modules/{module}/lessons', [CourseBuilderController::class, 'storeLesson'])->name('modules.lessons.store');
        Route::patch('/lessons/{lesson}', [CourseBuilderController::class, 'updateLesson'])->name('lessons.update');
        Route::post('/lessons/{lesson}/media', [CourseBuilderController::class, 'storeMedia'])->name('lessons.media.store');
        Route::delete('/media/{media}', [CourseBuilderController::class, 'destroyMedia'])->name('media.destroy');
        Route::post('/lessons/{lesson}/quiz', [CourseBuilderController::class, 'storeQuiz'])->name('lessons.quiz.store');
        Route::post('/quizzes/{quiz}/questions', [CourseBuilderController::class, 'storeQuestion'])->name('quizzes.questions.store');
        Route::patch('/questions/{question}', [CourseBuilderController::class, 'updateQuestion'])->name('questions.update');

        // Soporte
        Route::get('/soporte', [SupportController::class, 'index'])->name('soporte');
        Route::post('/soporte', [SupportController::class, 'send'])->name('soporte.send');
    });
```

### 2.2 Route Registration
In `bootstrap/app.php` lines 16–23:
```php
then: function () {
    Route::middleware('web')->group(base_path('routes/user.php'));
    Route::middleware('web')->group(base_path('routes/admin.php'));
    Route::middleware('web')->group(base_path('routes/instructor.php'));
}
```
All instructor routes run within the standard `web` middleware pipeline (`EncryptCookies`, `HandleInertiaRequests`, `AddLinkHeadersForPreloadedAssets`).

---

## 3. Controllers, Middleware & Policies

### 3.1 Middleware: `CheckRole`
- Alias `'role'` is registered in `bootstrap/app.php` line 36:
  ```php
  $middleware->alias([
      'role' => \App\Http\Middleware\CheckRole::class,
  ]);
  ```
- File: `app/Http/Middleware/CheckRole.php`:
  ```php
  public function handle(Request $request, Closure $next, string $role): Response
  {
      $user = \Illuminate\Support\Facades\Auth::user();
      if (!$user) {
          return redirect('login');
      }

      if (method_exists($user, 'hasRole')) {
          if (!$user->hasRole($role)) {
              return redirect()->route('dashboard'); // Redirects to role-specific dashboard
          }
      } elseif (isset($user->role) && $user->role !== $role) {
          return redirect()->route('dashboard');
      }

      return $next($request);
  }
  ```
- **Identified Defect / Obstacle for Admin Supervision**:
  Because `CheckRole` expects a single `$role` parameter (`role:instructor`), if an administrator (`role:admin`) visits `/instructor/cursos`, `$user->hasRole('instructor')` evaluates to `false`. The middleware redirects the administrator to `dashboard`, which then bounces them to `admin.dashboard`.
  **Recommendation**: Update `CheckRole` to:
  1. Allow administrator bypass: `if (method_exists($user, 'hasRole') && $user->hasRole('admin')) { return $next($request); }`.
  2. Support variable roles: `public function handle(Request $request, Closure $next, ...$roles): Response`.

### 3.2 Policies & Gates
- **`app/Policies/`**: Completely empty. There is currently no `CoursePolicy` or `ScheduledCoursePolicy`.
- **`AppServiceProvider.php`**: Dynamically creates Gates based on the `permissions` table (`registerShinobiGates()`), but there are no model policies or Gates defined for courses or scheduled courses.
- **Enforcement Location**: Authorization can either be implemented via a dedicated `CoursePolicy` (`authorize('view', $course)`) or directly in `CourseController` (`abort(403)`). Direct controller checks paired with an optional Gate/Policy provide clear, fail-fast HTTP 403 responses.

### 3.3 Controller: `CourseController.php`
- Location: `app/Http/Controllers/Instructor/CourseController.php`.
- **Current `index()` Method**:
  ```php
  public function index()
  {
      // El instructor solo debería ver los cursos asignados a él.
      // Por ahora cargamos todos para mantener paridad básica, pero debería filtrarse
      $courses = Course::with('category')->get();
      return Inertia::render('Instructor/Courses/Index', [
          'courses' => $courses
      ]);
  }
  ```
  *Defect*: Returns all courses without checking if the instructor is assigned to any cohort.
- **Current `show($id)` Method**:
  ```php
  public function show($id)
  {
      $course = Course::with(['category', 'modules.lessons.media', 'modules.lessons.quizzes'])->findOrFail($id);
      
      $scheduledCourses = \App\Models\ScheduledCourse::where('curso_id', $id)
          ->with(['students' => function($q) {
              $q->select('users.id', 'users.name', 'users.last_name', 'users.email', 'users.username', 'users.avatar');
          }])->get();
      ...
  }
  ```
  *Defects*:
  1. No check whether the instructor has any cohort in this course.
  2. Never throws HTTP 403 Forbidden.
  3. Does not filter cohorts to only those assigned to the current instructor.
  4. Does not filter students by `aceptado = 'si'`.
  5. Does not load grades/evaluations (`Exam` scores, `Homework` submissions).

---

## 4. Linking Courses & Cohorts to Instructors (`user_id = auth()->id()`)

### 4.1 Schema Inspection in `wwsapi_testserver`
Under the Schema Freeze constraint, we verified the exact live database tables:

| Table | Relevant Columns | Purpose |
|---|---|---|
| `cursos` | `id`, `user_id` (author), `titulo`, `slug`, `descripcion`, `imagen`, `activo` | Master course catalog |
| `cursos_programados` | `id`, `category_id`, `identificador`, `user_id` (**Instructor ID**), `curso_id`, `fecha_inicio`, `fecha_fin`, `precio`, `activo` | Cohorts / scheduled instances |
| `inscripciones` | `id`, `user_id` (student), `curso_programado_id`, `aceptado` ('si'/'no'), `referencia`, `tipo_pago`, `clave` | Student enrollments per cohort |
| `examenes` | `id`, `inscripcion_id`, `prueba_id`, `respuestas_json`, `score_total`, `total_preguntas`, `total_correctas`, `finalizado` ('si'/'no'), `retro_visualizado` | Exam submissions & scores |
| `homework` | `id`, `user_id`, `leccion_id`, `is_late` (0/1), `created_at` | Homework submissions |
| `roles` | `id`, `name`, `slug` ('admin', 'instructor', 'alumno') | Shinobi roles |
| `role_user` | `id`, `role_id`, `user_id` | User-role pivot |

### 4.2 Eloquent Models & Relationship Chain
- `Course` (`App\Models\Course`):
  - Table: `cursos`
  - Relationship: `hasMany(ScheduledCourse::class, 'curso_id')`
- `ScheduledCourse` (`App\Models\ScheduledCourse`):
  - Table: `cursos_programados`
  - Relationship: `belongsTo(Course::class, 'curso_id')`
  - Relationship: `belongsTo(User::class, 'user_id')` (`instructor()`)
  - Relationship: `hasMany(Enrollment::class, 'curso_programado_id')` (`enrollments()`)
  - Relationship: `belongsToMany(User::class, 'inscripciones', 'curso_programado_id', 'user_id')->withPivot('id', 'aceptado', 'created_at')` (`students()`)
- `Enrollment` (`App\Models\Enrollment`):
  - Table: `inscripciones`
  - Relationship: `belongsTo(User::class, 'user_id')`
  - Relationship: `belongsTo(ScheduledCourse::class, 'curso_programado_id')`
  - Relationship: `hasMany(Exam::class, 'inscripcion_id')` (`exams()`)

### 4.3 Query Mapping for Instructor Access
1. **List Courses for Authenticated Instructor**:
   ```php
   $user = auth()->user();
   $coursesQuery = Course::with('category');

   if (!$user->hasRole('admin')) {
       $coursesQuery->whereHas('scheduledCourses', function ($q) use ($user) {
           $q->where('user_id', $user->id);
       });
   }

   $courses = $coursesQuery->get();
   ```
2. **Authorize Course Detail Access (`/instructor/cursos/{id}/view`)**:
   ```php
   $user = auth()->user();
   $isAdmin = $user->hasRole('admin');
   $course = Course::with(['category', 'modules.lessons.media', 'modules.lessons.quizzes'])->findOrFail($id);

   // Check if instructor is assigned to at least one cohort of this course
   $assignedCohortsQuery = ScheduledCourse::where('curso_id', $id);
   if (!$isAdmin) {
       $assignedCohortsQuery->where('user_id', $user->id);
   }

   $assignedCohorts = $assignedCohortsQuery->get();

   if (!$isAdmin && $assignedCohorts->isEmpty()) {
       abort(403, 'No tienes permiso para acceder a este curso.');
   }
   ```

---

## 5. Authorization Enforcement & Admin Bypass (`role:admin`)

### 5.1 HTTP 403 Forbidden Requirements
- Any instructor trying to access `/instructor/cursos/{id}/view` or `/instructor/cursos/{course}/builder` where the course has NO cohorts assigned to `auth()->id()` **must trigger `abort(403)`**.
- Any non-instructor / non-admin user (e.g., student) attempting direct URL access must be denied (redirected by `CheckRole` or aborted with 403).

### 5.2 Admin Bypass Logic
- Administrators (`role:admin`) possess full supervisory access (`special === 'all-access'` / `hasRole('admin')`).
- If `$user->hasRole('admin')`:
  - `CheckRole` must allow them through to `/instructor/*`.
  - `CourseController::index()` returns all courses (or unfiltered catalog).
  - `CourseController::show($id)` bypasses the instructor cohort check and loads all cohorts for the course.
  - No 403 is triggered for administrators on valid courses.

---

## 6. Student Roster & Grades Breakdown Specification (R2)

To satisfy Acceptance Criteria for R2 in `/instructor/cursos/{id}/view`:
1. **Cohort Selection**:
   Allow selecting from the instructor's assigned cohorts (or all cohorts for admin).
2. **Accepted Students Only**:
   Only include students where `inscripciones.aceptado = 'si'`.
3. **Evaluations Breakdown (`Examen`)**:
   For each accepted student enrollment:
   - Query `Exam::where('inscripcion_id', $enrollment->id)->with('quiz')->get()`.
   - Extract: `quiz_title`, `score_total`, `total_correctas`, `total_preguntas`, `finalizado` ('si'/'no'), `created_at`.
4. **Homework Submissions (`Homework`)**:
   - Query `Homework::where('user_id', $student->id)->whereIn('leccion_id', $lessonIds)->get()`.
   - Extract: `leccion_id`, `is_late`, `created_at`.
5. **Course Progress**:
   - Completed lessons from `leccion_user` where `user_id = $student->id` and `curso_programado_id = $cohort->id`.

---

## 7. Automated Test Plan (Pest / PHPUnit)

A new test file `tests/Feature/Instructor/CourseAuthorizationTest.php` should verify:
1. `test_unauthenticated_user_redirected_from_instructor_routes`: `GET /instructor/cursos` -> 302 Redirect to `/login`.
2. `test_student_user_cannot_access_instructor_routes`: Student -> Redirected to `/dashboard` / 403.
3. `test_instructor_can_only_view_assigned_courses_in_index`: Instructor 1 only sees courses where they have cohorts; courses assigned to Instructor 2 do not appear.
4. `test_instructor_can_view_assigned_course_details`: Assigned course -> 200 OK with cohort data.
5. `test_instructor_cannot_view_unassigned_course_details_returns_403`: Unassigned course -> 403 Forbidden.
6. `test_admin_can_view_any_course_details_without_restriction`: Admin user -> 200 OK on any course.
7. `test_course_detail_only_includes_accepted_students`: Cohort student with `aceptado = 'no'` is omitted; `aceptado = 'si'` is included.
8. `test_course_detail_includes_exam_and_homework_breakdown`: Student's exam scores and homework submissions are returned in the payload.

---

## 8. Summary Table of Files to Update in Implementation

| File | Type | Changes Needed |
|---|---|---|
| `app/Http/Middleware/CheckRole.php` | Backend | Add admin bypass (`$user->hasRole('admin')`) and/or support multi-roles so admins can access `/instructor/*`. |
| `app/Http/Controllers/Instructor/CourseController.php` | Backend | Filter `index()` by `scheduledCourses.user_id = auth()->id()`. In `show($id)`, enforce authorization, throw `abort(403)` on mismatch, scope cohorts, filter `aceptado = 'si'`, and attach exam/homework grades. |
| `app/Http/Controllers/Admin/CourseBuilderController.php` | Backend | Add ownership verification so instructors cannot build/edit unassigned courses. |
| `resources/js/Pages/Instructor/Courses/Show.tsx` | Frontend | Add cohort switcher, active student filter badge, and interactive exam/homework grades modal or breakdown table. |
| `tests/Feature/Instructor/CourseAuthorizationTest.php` | Tests | Comprehensive feature test suite for authorization and grade viewing. |

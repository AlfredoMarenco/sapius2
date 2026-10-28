# Handoff Report: Explorer 1 (Backend Authorization Explorer)

**Type:** Hard Handoff  
**Date:** 2026-10-26T15:47:00Z  
**Directory:** `e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_1`  
**Target:** Phase 3 - Instructor Module Backend Architecture & Authorization

---

## 1. Observation

1. **Routes Definition**:
   - In `routes/instructor.php:9-17`:
     ```php
     Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
         Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
         Route::get('/dashboard', [DashboardController::class, 'index']);
         Route::get('/cursos', [CourseController::class, 'index'])->name('cursos.index');
         Route::get('/cursos/{id}/view', [CourseController::class, 'show'])->name('cursos.show');
     ```
   - Routes are registered in `bootstrap/app.php:22` under the `web` middleware group.

2. **Middleware Defect for Admin Supervision**:
   - `bootstrap/app.php:36` maps `'role'` to `\App\Http\Middleware\CheckRole::class`.
   - In `app/Http/Middleware/CheckRole.php:16-34`:
     ```php
     public function handle(Request $request, Closure $next, string $role): Response
     {
         $user = \Illuminate\Support\Facades\Auth::user();
         if (!$user) {
             return redirect('login');
         }
         if (method_exists($user, 'hasRole')) {
             if (!$user->hasRole($role)) {
                 return redirect()->route('dashboard');
             }
         }
         return $next($request);
     }
     ```
   - When an administrator (`role:admin`) visits `/instructor/cursos`, `$user->hasRole('instructor')` returns `false`, causing an immediate redirect to `dashboard` (and subsequently `admin.dashboard`), blocking admin supervision.

3. **Current CourseController Lacks Authorization & Filtering**:
   - In `app/Http/Controllers/Instructor/CourseController.php:13-20`:
     ```php
     public function index()
     {
         $courses = Course::with('category')->get();
         return Inertia::render('Instructor/Courses/Index', [
             'courses' => $courses
         ]);
     }
     ```
     Loads all courses from table `cursos` without filtering by instructor.
   - In `app/Http/Controllers/Instructor/CourseController.php:23-31`:
     ```php
     public function show($id)
     {
         $course = Course::with(['category', 'modules.lessons.media', 'modules.lessons.quizzes'])->findOrFail($id);
         $scheduledCourses = \App\Models\ScheduledCourse::where('curso_id', $id)
             ->with(['students' => function($q) {
                 $q->select('users.id', 'users.name', 'users.last_name', 'users.email', 'users.username', 'users.avatar');
             }])->get();
     ```
     Zero authorization check; never calls `abort(403)`; loads cohorts regardless of instructor assignment; does not filter accepted students (`aceptado = 'si'`); does not load student exam or homework grades.

4. **Database & Model Linkage**:
   - Database: MySQL database `wwsapi_testserver` (specified in `.env:26`).
   - Table `cursos_programados` columns: `id`, `category_id`, `identificador`, `user_id`, `curso_id`, `fecha_inicio`, `fecha_fin`, `precio`, `activo`.
   - Column `user_id` in `cursos_programados` designates the assigned instructor.
   - Table `cursos` columns: `id`, `user_id`, `titulo`, `slug`, `descripcion`, `imagen`, `activo`.
   - Table `inscripciones` columns: `id`, `user_id` (student), `curso_programado_id`, `aceptado` ('si'/'no').
   - Table `examenes` columns: `id`, `inscripcion_id`, `prueba_id`, `score_total`, `total_preguntas`, `total_correctas`, `finalizado`.
   - Table `homework` columns: `id`, `leccion_id`, `user_id`, `is_late`.
   - Table `roles` has Shinobi roles: ID 1 (`slug: 'admin'`), ID 2 (`slug: 'instructor'`), ID 3 (`slug: 'alumno'`), linked to users via `role_user`.
   - Verified that currently in `wwsapi_testserver`:
     - Instructor User ID 22 (`magonzalez@sapius.com.mx`) has 188 cohorts assigned in `cursos_programados`.
     - 12 courses exist in `cursos` (e.g., ID 8, 11, 12, 13, 16, 17, 20, 26, 29, 30, 31, 54) that have NO cohorts for user 22.

5. **Policies & Gates**:
   - `app/Policies/` is an empty directory.
   - `AppServiceProvider.php:35-49` registers dynamic Shinobi gates from table `permissions`, but defines no model policies or Gates for `Course` / `ScheduledCourse`.

6. **Build & Quality Baseline**:
   - `npm.cmd run build` passes cleanly (`vite build` exited 0).
   - `npm.cmd run types:check` passes on all `resources/js/Pages/Instructor/*` components.

---

## 2. Logic Chain

1. **Premise 1**: Acceptance Criteria R1 requires:
   - `/instructor/cursos` must ONLY list courses where `cursos_programados.user_id = auth()->id()`.
   - Accessing `/instructor/cursos/{id}/view` belonging to another instructor must throw HTTP 403 Forbidden.
   - Administrators (`role:admin`) must retain full supervisory access without restriction.
2. **Premise 2**: In `wwsapi_testserver`, `cursos` represents courses, while `cursos_programados` represents cohorts assigned to an instructor (`user_id`).
   - Therefore, a course belongs to an instructor if and only if:
     `ScheduledCourse::where('curso_id', $courseId)->where('user_id', $userId)->exists()`.
3. **Premise 3**: In `CourseController::index()`, querying `Course::whereHas('scheduledCourses', fn($q) => $q->where('user_id', auth()->id()))` strictly restricts instructors to their assigned courses, while bypassing this constraint when `auth()->user()->hasRole('admin')`.
4. **Premise 4**: In `CourseController::show($id)`, checking if `$course->scheduledCourses()->where('user_id', auth()->id())->exists()` when `!auth()->user()->hasRole('admin')` ensures that any attempt by an unauthorized instructor to view an unassigned course immediately triggers `abort(403, 'Forbidden')`.
5. **Premise 5**: Because `routes/instructor.php` is protected by `role:instructor`, updating `CheckRole` middleware to allow administrators (`$user->hasRole('admin')`) ensures that administrators can seamlessly supervise instructor routes without getting redirected to `admin.dashboard`.
6. **Premise 6**: To satisfy Acceptance Criteria R2 (grades breakdown and cohort view), `CourseController::show` must scope cohorts to the instructor's cohorts, filter `inscripciones.aceptado = 'si'`, and eager-load `exams` (`Exam::where('inscripcion_id', ...)->with('quiz')`) and `homework` submissions (`Homework::where('user_id', ...)`).

---

## 3. Caveats

1. **Schema Freeze (R3)**:
   - No table modifications, column additions, or new migrations may be executed. All queries and relationships must map to existing tables (`cursos`, `cursos_programados`, `inscripciones`, `examenes`, `homework`, `roles`, `role_user`).
2. **Testing Database Environment**:
   - In PHPUnit testing (`phpunit.xml`), the default environment runs SQLite `:memory:`. SQLite in-memory databases need either migrations run during test setup via `RefreshDatabase` or mock data seeders reflecting the legacy table structure.
3. **Pre-existing Frontend Typecheck Errors**:
   - Running `tsc --noEmit` flags pre-existing issues in `Admin/Certificates`, `Admin/Schedules`, and `User/Checkout`, but `resources/js/Pages/Instructor/*` is clean.

---

## 4. Conclusion

The backend architecture is fully identified and ready for Phase 3 implementation:
1. **Middleware Update**: Modify `app/Http/Middleware/CheckRole.php` to add an admin bypass:
   ```php
   if (method_exists($user, 'hasRole') && $user->hasRole('admin')) {
       return $next($request);
   }
   ```
2. **Controller Scoping**:
   - Update `CourseController::index()` to filter by `whereHas('scheduledCourses', fn($q) => $q->where('user_id', auth()->id()))` unless `hasRole('admin')`.
   - Update `CourseController::show($id)` to verify cohort ownership; throw `abort(403)` if unauthorized.
   - Update `CourseController::show($id)` to load assigned cohorts, accepted students (`aceptado = 'si'`), and evaluation breakdowns (scores from `examenes` and submissions from `homework`).
3. **Course Builder Protection**:
   - Apply the same cohort ownership check to `CourseBuilderController::show` to prevent unauthorized instructors from editing curriculum.
4. **Automated Verification**:
   - Build a comprehensive test suite in `tests/Feature/Instructor/CourseAuthorizationTest.php` covering 403 enforcement, index filtering, admin bypass, and grade data payloads.

---

## 5. Verification Method

To independently verify these findings:
1. **Inspect Route & Controller Code**:
   - `view_file` on `routes/instructor.php:9-25`.
   - `view_file` on `app/Http/Middleware/CheckRole.php:16-35`.
   - `view_file` on `app/Http/Controllers/Instructor/CourseController.php:12-52`.
2. **Inspect Database Schema**:
   - Run `php artisan tinker --execute="dump(Schema::getColumnListing('cursos_programados'));"` to confirm `user_id` is the instructor key.
   - Run `php artisan tinker --execute="dump(Schema::getColumnListing('inscripciones'));"` to confirm `aceptado` column.
   - Run `php artisan tinker --execute="dump(Schema::getColumnListing('examenes'));"` to confirm `score_total` and `inscripcion_id`.
3. **Inspect Existing Cohort Assignments**:
   - Run `php artisan tinker --execute="dump(DB::table('cursos_programados')->distinct()->pluck('user_id'));"` (confirm user 22).
   - Run `php artisan tinker --execute="dump(DB::table('cursos')->whereNotIn('id', DB::table('cursos_programados')->where('user_id', 22)->pluck('curso_id'))->pluck('id'));"` (confirms courses 8, 11, etc. that do not belong to user 22).
4. **Compile Frontend**:
   - Run `npm.cmd run build` to verify Vite build passes without errors.

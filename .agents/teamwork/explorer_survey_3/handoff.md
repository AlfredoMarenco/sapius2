# Handoff Report: Frontend & Testing Infrastructure Survey (Phase 3 Instructor Module)

**Agent**: Explorer 3 (Frontend & Testing Explorer)  
**Working Directory**: `e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_3`  
**Target Milestone**: Phase 3 (Instructor Module) Survey  
**Date**: 2026-10-26  

---

## 1. Observation

1. **Frontend Stack & Configuration**:
   - `package.json` lines 31-89 confirm React 19 (`react: ^19.2.0`, `react-dom: ^19.2.0`), Inertia React (`@inertiajs/react: ^3.0.0`), Vite 8 (`vite: ^8.0.0`, `@vitejs/plugin-react: ^5.2.0`), Tailwind CSS v4 (`@tailwindcss/vite: ^4.1.11`, `tailwindcss: ^4.0.0`), TypeScript (`typescript: ^5.7.2`), Radix UI (`@radix-ui/react-*`), Lucide React (`lucide-react: ^0.475.0`), and Sonner (`sonner: ^2.0.7`).
   - `vite.config.ts` lines 1-28 configure `laravel()`, `inertia({ ssr: false })`, `react({ babel: { plugins: ['babel-plugin-react-compiler'] } })`, `tailwindcss()`, and `wayfinder()`.
   - `tsconfig.json` lines 14-121 configure target `ESNext`, `moduleResolution: "bundler"`, `"jsx": "react-jsx"`, and alias `"@/*": ["./resources/js/*"]`.
   - Tooling execution test on Windows:
     - `npm run build` failed initially with PowerShell execution policy error: `npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system`.
     - Invoking `npm.cmd run build` succeeded with exit code 0 in 1 minute 7 seconds, compiling 3,177 modules.
     - Invoking `npm.cmd run types:check` (`tsc --noEmit`) exited with code 1, reporting 15 pre-existing errors in `resources/js/pages/Admin/` (Certificates, Calendars, InteractivePdfs, Reports, Schedules, Users) and `resources/js/pages/User/` (Checkout, Lesson). Zero errors exist in `resources/js/pages/Instructor/`.

2. **Instructor Routes & Views**:
   - `routes/instructor.php` lines 9-16 define:
     - Line 15: `Route::get('/cursos', [CourseController::class, 'index'])->name('cursos.index');`
     - Line 16: `Route::get('/cursos/{id}/view', [CourseController::class, 'show'])->name('cursos.show');`
   - `app/Http/Controllers/Instructor/CourseController.php`:
     - Lines 12-21: `index()` does `$courses = Course::with('category')->get();` with comment: `// El instructor solo debería ver los cursos asignados a él... Por ahora cargamos todos para mantener paridad básica, pero debería filtrarse`.
     - Lines 23-52: `show($id)` loads `$course = Course::with([...])->findOrFail($id);` and `$scheduledCourses = \App\Models\ScheduledCourse::where('curso_id', $id)...->get();`. It performs no authorization check against `auth()->id()`, and flattens all students into `$enrolledStudents` with only basic fields (`id`, `name`, `email`, `avatar`, `cohort`, `enrolled_at`, `status`). No evaluation or grade data is queried.
   - `resources/js/pages/Instructor/Courses/Index.tsx` lines 1-99: Renders cards for courses with "Builder" and "Detalles" links, with an empty state.
   - `resources/js/pages/Instructor/Courses/Show.tsx` lines 1-165: Renders course header, 3 metric cards ("Alumnos Inscritos", "Grupos Activos", "Calificaciones"), and a table of students. The action column is a disabled text placeholder: `<span className="text-xs text-muted-foreground cursor-not-allowed">Progreso</span>` (lines 136-138).

3. **Data Models & Schema Freeze (R3)**:
   - Database tables in MySQL (`wwsapi_testserver`): `cursos`, `cursos_programados`, `inscripciones`, `examenes`, `homework`, `lecciones`, `modulos`, `pruebas`, `users`.
   - `app/Models/ScheduledCourse.php` lines 14-24: `protected $table = 'cursos_programados';`, mapping `'instructor_id' => 'user_id'`. Line 55: `public function students() { return $this->belongsToMany(User::class, 'inscripciones', 'curso_programado_id', 'user_id')->withPivot('id', 'aceptado', 'created_at'); }`.
   - `app/Models/Enrollment.php` lines 15-44: `protected $table = 'inscripciones';`, `public function exams() { return $this->hasMany(Exam::class, 'inscripcion_id'); }`.
   - `app/Models/Exam.php` lines 15-26: `protected $table = 'examenes';`, mapping `'score' => 'score_total'`, `'status' => 'finalizado'`, `'answers_snapshot' => 'respuestas_json'`.
   - Admin reference implementation: `Admin/Exams/Results.tsx` (`ExamResultController@listaResultados`) and `Admin/Tracking/StudentProgress.tsx` (`AcademicTrackingController@progress`) display detailed grades, aciertos, exam status, and lesson completion.

4. **Testing Infrastructure**:
   - `composer.json` lines 36-37 include `"pestphp/pest": "^4.4"` and `"pestphp/pest-plugin-laravel": "^4.1"`.
   - `phpunit.xml` lines 26-27 set `<env name="DB_CONNECTION" value="sqlite"/>` and `<env name="DB_DATABASE" value=":memory:"/>`.
   - `php artisan test tests/Feature/CronAndOpenPayTest.php` executed in 0.76s: **3 passed (7 assertions)**.
   - `php artisan test tests/Unit/OpenPayWebhookTest.php` executed in 0.61s: **2 passed (9 assertions)**.
   - `php artisan test` (full suite) failed 68 tests because `RefreshDatabase` is commented out in `tests/Pest.php` line 18, meaning SQLite `:memory:` starts without any tables.

---

## 2. Logic Chain

1. **Access Control Gap**:
   - *Observation*: `CourseController.php:17` loads all courses, and `CourseController.php:25` loads any course by ID without verifying that `cursos_programados.user_id = auth()->id()`.
   - *Requirement R1*: Instructors must only access courses and cohorts where `user_id = auth()->id()`, and any unauthorized access must return HTTP 403.
   - *Deduction*: `CourseController@index` must scope courses using `Course::whereHas('scheduledCourses', fn($q) => $q->where('user_id', auth()->id()))`, and `CourseController@show` must check if the user is `admin` or assigned to a cohort in this course; otherwise throw `abort(403)`.

2. **Grades Breakdown Gap**:
   - *Observation*: `CourseController.php:32-45` only extracts basic student metadata, and `Show.tsx:136-138` displays a disabled "Progreso" label with no grades or exam breakdown.
   - *Requirement R2*: The instructor must view enrolled active students by cohort (`aceptado = 'si'`) and their grades breakdown for evaluations (`Examen`), quizzes, and homework (`Homework`).
   - *Deduction*: `CourseController@show` must load enrollments with `exams.quiz` and `homework`, calculate student averages and completed items, and provide a Cohort selector in `Show.tsx` alongside an interactive modal (`Dialog` or `Sheet`) to view the detailed grade breakdown for each student.

3. **Tooling & Build Execution**:
   - *Observation*: Running `npm` fails on PowerShell due to script execution policies, whereas `npm.cmd` succeeds. `npm.cmd run build` builds cleanly in 1m 7s (code 0). `npm.cmd run types:check` currently fails due to 15 pre-existing errors in `resources/js/pages/Admin` and `User`.
   - *Requirement Acceptance Criteria*: "La ejecución de TypeScript check y la compilación de frontend finalizan sin errores."
   - *Deduction*: The implementer must run `npm.cmd` commands, fix the 15 pre-existing type errors, and maintain strict typing in the new Instructor UI components.

4. **Testing Strategy**:
   - *Observation*: `phpunit.xml` defaults to SQLite `:memory:`, which lacks tables by default, but existing isolated tests (`CronAndOpenPayTest`, `OpenPayWebhookTest`) run and pass quickly (<1s).
   - *Requirement Acceptance Criteria*: Automated tests (Pest / PHPUnit) verifying authorization policy and grades breakdown.
   - *Deduction*: Creating `tests/Feature/Instructor/InstructorCourseAccessTest.php` with SQLite in-memory table definitions in `setUp()` will allow blazing fast, isolated test execution that fully satisfies the criteria without modifying the production MySQL database.

---

## 3. Caveats

1. **Pre-existing TypeScript Errors**: The 15 TypeScript errors reported by `tsc --noEmit` are outside the Instructor module (they are in Admin and User pages). However, because acceptance criteria require `types:check` to finish without errors, these 15 errors must be resolved during Phase 3.
2. **PowerShell Script Policy**: On Windows systems where `.ps1` execution is restricted, developers/agents must invoke `npm.cmd` and `npx.cmd` rather than `npm` and `npx`.
3. **Database Schema Freeze**: No database migrations may be generated. All queries and test fixtures must adhere strictly to the existing table definitions (`cursos`, `cursos_programados`, `inscripciones`, `examenes`, `homework`, `users`).

---

## 4. Conclusion

The Sapius 2 frontend is modern, well-structured (React 19 + Inertia + Tailwind 4), and compiles cleanly via Vite. The Instructor views (`/instructor/cursos` and `/instructor/cursos/{id}/view`) already exist as skeleton templates but require:
1. Backend authorization and filtering in `CourseController` (R1).
2. Backend compilation of cohort students (`aceptado = 'si'`) and their evaluation / homework breakdown (R2).
3. Frontend UI enhancements in `Show.tsx`: cohort selector, student metrics, and an interactive grades breakdown modal.
4. Resolution of 15 pre-existing TypeScript errors to achieve a green `types:check`.
5. Creation of `tests/Feature/Instructor/InstructorCourseAccessTest.php` to verify access control (403 on foreign courses, 200 on assigned courses, admin bypass) and grade breakdown data.

---

## 5. Verification Method

To independently verify the observations and conclusions:

1. **Build Tooling Verification**:
   ```powershell
   # Compile frontend assets (should complete in ~1m with exit code 0)
   npm.cmd run build

   # Check TypeScript status (shows the 15 pre-existing errors in Admin/User)
   npm.cmd run types:check
   ```

2. **Existing Passing Tests**:
   ```powershell
   php artisan test tests/Feature/CronAndOpenPayTest.php
   php artisan test tests/Unit/OpenPayWebhookTest.php
   ```

3. **Code Inspection**:
   - Inspect controller: `app/Http/Controllers/Instructor/CourseController.php`
   - Inspect routes: `routes/instructor.php` lines 9-17
   - Inspect views: `resources/js/pages/Instructor/Courses/Index.tsx` and `Show.tsx`
   - Detailed survey report: `.agents/teamwork/explorer_survey_3/survey_frontend_testing.md`

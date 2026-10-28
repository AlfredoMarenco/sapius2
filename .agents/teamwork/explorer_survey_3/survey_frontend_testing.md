# Survey Report: Frontend Architecture & Testing Infrastructure (Phase 3 Instructor Module)

**Author**: Explorer 3 (Frontend & Testing Explorer)  
**Date**: 2026-10-26  
**Target Workspace**: `e:\laragon\www\sapius2`  
**Working Directory**: `e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_3`  
**Reference Document**: `e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md`

---

## 1. Executive Summary

This survey analyzes the frontend architecture, UI components, build tooling, and test infrastructure of Sapius 2 to guide the implementation of **Phase 3 (Instructor Module)**. 

### Key Findings:
1. **Frontend Stack**: Modern React 19 stack running on `@inertiajs/react` 3.0, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), TypeScript 5.7, and Radix UI (`@radix-ui/react-*` primitive components).
2. **Build Tooling Verification**: 
   - `npm.cmd run build` compiles 3,177 modules cleanly in **1m 7s** with exit code 0.
   - `npm.cmd run types:check` currently reports 15 pre-existing TypeScript errors in Admin and User pages (none in Instructor pages).
   - *Windows Note*: On Windows PowerShell, commands must invoke `npm.cmd` directly due to script execution policies preventing `npm.ps1`.
3. **Instructor Views State**:
   - `/instructor/cursos` (`resources/js/pages/Instructor/Courses/Index.tsx`): Displays course cards with links to Builder and Details (`Show.tsx`). Currently receives all courses from `CourseController@index` without filtering by assigned instructor.
   - `/instructor/cursos/{id}/view` (`resources/js/pages/Instructor/Courses/Show.tsx`): Displays basic course title, summary counts, and an enrolled students table. However, it currently lacks cohort filtering/selection, fails to enforce authorization (no 403 when accessed by unauthorized instructors), and possesses **no grades or evaluation breakdown** (the action button is a disabled placeholder `<span className="cursor-not-allowed">Progreso</span>`).
4. **Data Models & Schema Freeze (R3)**:
   - Sapius 2 operates on legacy production tables: `cursos`, `cursos_programados`, `inscripciones`, `examenes`, `homework`, `lecciones`, `modulos`, `users`.
   - Models `Course`, `ScheduledCourse`, `Enrollment`, `Exam`, and `Homework` map these tables cleanly with `MapsLegacyAttributes`.
   - The instructor assignment is stored in `cursos_programados.user_id` (`ScheduledCourse.user_id` / `instructor_id`).
5. **Testing Infrastructure**:
   - Pest 4.4 and PHPUnit 11 are configured.
   - `phpunit.xml` points to SQLite `:memory:`. Running `php artisan test tests/Feature/CronAndOpenPayTest.php` passes with 100% success.
   - Tests for Phase 3 can run cleanly in SQLite in-memory by creating the necessary schema in `setUp()` or using test fixtures, ensuring high speed without violating the production database freeze.

---

## 2. Frontend Architecture & Build Tooling

### 2.1 Stack Overview

| Layer | Technology | Version | Location / Config |
|---|---|---|---|
| **Language** | TypeScript | `^5.7.2` | `tsconfig.json` |
| **UI Framework** | React | `^19.2.0` | `resources/js/app.tsx` |
| **SPA Bridge** | Inertia.js React | `^3.0.0` | `@inertiajs/react` |
| **Bundler** | Vite | `^8.0.0` | `vite.config.ts` |
| **Styling** | Tailwind CSS | `^4.0.0` | `@tailwindcss/vite`, `resources/css/app.css` |
| **Component Primitives** | Radix UI | Various | `resources/js/components/ui/` (shadcn-style) |
| **Icons** | Lucide React | `^0.475.0` | `lucide-react` |
| **Notification** | Sonner | `^2.0.7` | `resources/js/components/ui/sonner.tsx` |

### 2.2 Build Tooling & Scripts (`package.json`)

```json
"scripts": {
    "build": "vite build",
    "build:ssr": "vite build && vite build --ssr",
    "dev": "vite",
    "format": "prettier --write resources/",
    "format:check": "prettier --check resources/",
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "types:check": "tsc --noEmit"
}
```

### 2.3 Verification Results

#### 1. `npm.cmd run build`
- **Command**: `npm.cmd run build` (or `npx.cmd vite build`)
- **Execution Time**: 1 minute 7 seconds
- **Result**: **SUCCESS (Exit code 0)**
- **Output Artifacts**:
  - `public/build/manifest.json` (0.38 kB)
  - `public/build/assets/app-DXuroF4_.css` (10.36 kB)
  - `public/build/assets/app-CB_D5oQ0.css` (209.67 kB)
  - `public/build/assets/app-DNX6_ddM.js` (2,628.64 kB)

#### 2. `npm.cmd run types:check` (`tsc --noEmit`)
- **Command**: `npm.cmd run types:check`
- **Result**: **Exited with code 1** due to 15 pre-existing errors in unrelated Admin and User pages.
- **Errors breakdown**:
  1. `resources/js/pages/Admin/Certificates/Index.tsx(62, 67, 77, 125, 173)`: TS2552 `Cannot find name 'route'. Did you mean 'router'?` (5 errors)
  2. `resources/js/pages/Admin/Courses/Calendars.tsx(99)`: TS2741 `Property 'href' is missing in type '{ title: string; }'` (1 error)
  3. `resources/js/pages/Admin/InteractivePdfs/Editor.tsx(96)`: TS2353 `Object literal may only specify known properties, and 'data' does not exist in type 'UseFormSubmitOptions'` (1 error)
  4. `resources/js/pages/Admin/InteractivePdfs/Index.tsx(44)`: TS2353 `Object literal may only specify known properties, and 'data' does not exist in type 'UseFormSubmitOptions'` (1 error)
  5. `resources/js/pages/Admin/Reports/ShowEnrollment.tsx(21)`: TS2741 `Property 'href' is missing in type '{ title: string; }'` (1 error)
  6. `resources/js/pages/Admin/Schedules/Index.tsx(249, 274)`: TS2322 `Type 'string' is not assignable to type 'number'` (2 errors)
  7. `resources/js/pages/Admin/Users/Edit.tsx(173)`: TS2741 `Property 'href' is missing in type '{ title: string; }'` (1 error)
  8. `resources/js/pages/User/Checkout/Index.tsx(140, 144)`: TS2339 & TS2571 (2 errors)
  9. `resources/js/pages/User/Courses/Lesson.tsx(85)`: TS2561 `preserveScroll does not exist in type ReloadOptions` (1 error)
- **Status for Instructor module**: All files in `resources/js/pages/Instructor/` (`Index.tsx`, `Show.tsx`, `Dashboard.tsx`, `Support.tsx`) have **0 TypeScript errors**.
- **Recommendation**: To fulfill Acceptance Criterion 3 ("La ejecución de TypeScript check y la compilación de frontend finalizan sin errores"), the implementer should resolve these minor typing fixes across the codebase.

---

## 3. Instructor Module Views Analysis

### 3.1 Routing Configuration (`routes/instructor.php`)

```php
Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Cursos (Listado y vista de progreso)
    Route::get('/cursos', [CourseController::class, 'index'])->name('cursos.index');
    Route::get('/cursos/{id}/view', [CourseController::class, 'show'])->name('cursos.show');

    // Módulos y Lecciones
    Route::get('/cursos/{course}/builder', [CourseBuilderController::class, 'show'])->name('courses.builder');
    // ...
});
```

### 3.2 `/instructor/cursos` (`Index.tsx`)

- **File**: `resources/js/pages/Instructor/Courses/Index.tsx`
- **Controller Action**: `App\Http\Controllers\Instructor\CourseController@index`
- **Current Behavior**:
  - Receives `courses: Course[]` prop.
  - Renders a responsive grid (`md:grid-cols-2 lg:grid-cols-3`) of course cards.
  - Each card shows: thumbnail/cover image, category badge, course title, course description, and two CTA buttons:
    - "Builder" -> `/instructor/cursos/${course.id}/builder`
    - "Detalles" -> `/instructor/cursos/${course.id}/view`
  - Shows empty state ("No hay cursos asignados") when `courses.length === 0`.
- **Defects & Gaps**:
  - **Backend Controller gap**: `CourseController@index` currently executes `$courses = Course::with('category')->get();` which loads *all* courses in the system.
  - **Authorization Requirement (R1)**: Must be filtered to only return courses with scheduled cohorts assigned to the instructor:
    ```php
    $user = auth()->user();
    if ($user->hasRole('admin')) {
        $courses = Course::with('category')->get();
    } else {
        $courses = Course::whereHas('scheduledCourses', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with('category')->get();
    }
    ```

### 3.3 `/instructor/cursos/{id}/view` (`Show.tsx`)

- **File**: `resources/js/pages/Instructor/Courses/Show.tsx`
- **Controller Action**: `App\Http\Controllers\Instructor\CourseController@show($id)`
- **Current Props**:
  - `course`: `{ id, title, description, modules }`
  - `students`: `Array<{ id, name, email, avatar, cohort, enrolled_at, status }>`
  - `total_cohorts`: `number`
- **Current UI Layout**:
  - Header: Back button to `/instructor/cursos`, Title, "Abrir Course Builder" button.
  - 3 Stat Cards: "Alumnos Inscritos" (`students.length`), "Grupos Activos" (`total_cohorts`), "Calificaciones" (static "Activo").
  - Table: Alumno (Avatar, Name, Email), Cohorte/Grupo, Fecha de Inscripción, Estado (Badge Aceptado / Pendiente), Acciones (Disabled text "Progreso").

---

## 4. Cohort Students & Grades Breakdown UI Architecture

### 4.1 Requirement Gap Analysis

According to `ORIGINAL_REQUEST.md`:
> **R2. Desglose de Estudiantes y Calificaciones por Cohorte**  
> En la vista de detalle del curso (`/instructor/cursos/{id}/view`), el instructor debe visualizar la lista de alumnos activos inscritos en sus cohortes, mostrando su avance y las calificaciones obtenidas en las evaluaciones (`Examen`), pruebas interactivas y tareas (`Homework`).

| Feature | Current Implementation in `Show.tsx` | Required Implementation |
|---|---|---|
| **Authorization Check** | None (Any instructor can access any course ID) | Must verify user has assigned cohorts for course `$id` (or `role:admin`), else throw `abort(403)` |
| **Cohort Selection** | None (All students from all cohorts flattened together) | Select dropdown or Tabs allowing the instructor to filter by specific assigned cohort (e.g., `Grupo A`, `Grupo B`) or view all assigned cohorts |
| **Accepted Filter** | Displays all students with status badge | Must filter/display active accepted students (`aceptado = 'si'`) as required by Acceptance Criteria |
| **Exams Breakdown** | None | Must show each exam/quiz taken by student, score (`score`/`max_score`), correct answers, and status (`finalizado`) |
| **Homework Breakdown** | None | Must show submitted homework assignments per lesson |
| **Progress Metric** | None | Summary percentage or progress indicator of completed lessons / evaluations |
| **Student Action** | Static disabled text "Progreso" | Interactive trigger: Modal (`Dialog`) or Slide-over Sheet (`Sheet`) displaying the student's complete grades breakdown |

### 4.2 Database & Data Model Relationships

```
Course (cursos)
  └── ScheduledCourse (cursos_programados) [FK: curso_id, user_id (instructor)]
        └── Enrollment (inscripciones) [FK: curso_programado_id, user_id (alumno), aceptado='si']
              ├── Exam (examenes) [FK: inscripcion_id, prueba_id, score_total, finalizado, aciertos]
              │     └── Quiz (pruebas) [title, min_score, score, duration]
              ├── Homework (homework) [FK: user_id, leccion_id, is_late]
              └── LessonUser (leccion_user) [FK: user_id, curso_programado_id, leccion_id]
```

### 4.3 Reference Implementations in Codebase

The Sapius 2 codebase already contains complete, proven patterns for displaying evaluations and progress:
1. **`Admin/Exams/Results.tsx`** (`ExamResultController@listaResultados`):
   - Displays evaluation metrics: Exámenes Presentados, Exámenes Aprobados, Promedio General.
   - Table columns: Examen / Evaluación, Calificación (`score / max_score`), Aciertos (`aciertos de total`), Estado (`Finalizado / En Progreso`), Fecha.
2. **`Admin/Tracking/StudentProgress.tsx`** (`AcademicTrackingController@progress`):
   - Computes progress % based on completed lessons in `leccion_user`.
   - Maps exams keyed by `prueba_id` and homeworks keyed by `leccion_id`.

### 4.4 Recommended UI Design for `Show.tsx`

We recommend enhancing `resources/js/pages/Instructor/Courses/Show.tsx` as follows:

1. **Cohort Filter Bar**:
   - Add a `<Select>` or Tab selector allowing instructors to switch between their cohorts (`scheduledCourses`).
   - Displays cohort identifier (`internal_id` or `identificador`), start/end dates, and active student count.
2. **Enhanced Student Table**:
   - Columns: Alumno (Avatar + Name + Email), Cohorte, Promedio / Calificación General, Evaluaciones Presentadas, Avance (% completado), Estado, Acciones.
3. **Student Grades Detail Modal (`Dialog` or `Sheet`)**:
   - Triggered by clicking "Ver Calificaciones" or "Detalle Académico" on any student row.
   - Header: Student name, email, avatar, cohort badge, overall average.
   - Tabs or Sections:
     - **Evaluaciones / Exámenes**: Table showing Quiz Title, Score (`calificacion / max_score`), Status Badge (Finalizado vs En Progreso), Aciertos / Reactivos, Fecha.
     - **Tareas (`Homework`)**: List of lessons with submitted homework status (`Entregada`, `A tiempo`, `Tarde`).
     - **Avance de Lecciones**: Progress bar and count of completed lessons.
4. **Export Action (Excel/CSV)**:
   - Provide an optional button to export the cohort gradebook (reusing or mirroring `ExamResultController@exportAllStudentResults`).

---

## 5. Testing Infrastructure Survey

### 5.1 Test Framework Setup

- **Runner**: Pest v4.4 (`pestphp/pest`) on PHPUnit 11.
- **PHP Version**: `^8.3` (CLI PHP currently running 8.3/8.4).
- **Configuration File**: `phpunit.xml`
- **Pest Configuration**: `tests/Pest.php`
- **Base Test Case**: `tests/TestCase.php` extending `Illuminate\Foundation\Testing\TestCase`.

### 5.2 Test Directory Structure

```
tests/
├── Feature/
│   ├── Auth/                 # Authentication flow tests
│   ├── Settings/             # Profile & password tests
│   ├── Teams/                # Jetstream/Teams tests
│   ├── CronAndOpenPayTest.php# Webhooks & Artisan command tests (Passing)
│   ├── DashboardTest.php     # Dashboard access tests
│   ├── ElectronAuthTest.php  # API & MAC validation tests
│   └── ExampleTest.php       # Home route test
├── Unit/
│   ├── ExampleTest.php
│   └── OpenPayWebhookTest.php# Webhook parsing unit tests (Passing)
├── Pest.php
└── TestCase.php
```

### 5.3 Test Execution Commands

| Target | Command | Result / Status |
|---|---|---|
| **Specific Feature Test** | `php artisan test tests/Feature/CronAndOpenPayTest.php` | **3 passed (7 assertions) — 0.76s** |
| **Specific Unit Test** | `php artisan test tests/Unit/OpenPayWebhookTest.php` | **2 passed (9 assertions) — 0.61s** |
| **Full Suite** | `php artisan test` | 11 passed, 68 failed (due to SQLite `:memory:` schema setup) |
| **Via Composer Script** | `composer test` | Runs config:clear, lint:check, php artisan test |

### 5.4 Root Cause of Existing SQLite Test Failures

In `phpunit.xml`:
```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```
And in `tests/Pest.php`:
```php
pest()->extend(TestCase::class)
 // ->use(RefreshDatabase::class)
    ->in('Feature');
```
Because `RefreshDatabase` is commented out, the in-memory SQLite database starts with **zero tables**. Any test attempting to execute `User::factory()->create()` fails with:
`SQLSTATE[HY000]: General error: 1 no such table: users`.

Furthermore, Sapius 2 models map to legacy production tables (`cursos`, `cursos_programados`, `inscripciones`, `examenes`), while the original starter migrations in `database/migrations` defined English table names (`courses`, `scheduled_courses`).

### 5.5 Recommended Strategy for Phase 3 Automated Tests

To ensure robust, independent, and 100% green tests for Phase 3 without violating R3 (Schema Freeze):

Create a dedicated test file: `tests/Feature/Instructor/InstructorCourseAccessTest.php`.

Inside this test suite:
1. Define a helper method or use `setUp()` to create in-memory SQLite tables with the exact schema needed:
   - `users`
   - `roles`, `permissions`, `role_user`, `permission_role` (or mock Shinobi/Spatie roles)
   - `categories`
   - `cursos`
   - `cursos_programados`
   - `inscripciones`
   - `examenes`
   - `pruebas`
   - `homework`
2. Test Cases to implement:
   - `test_unauthenticated_user_redirected_to_login_from_instructor_courses`
   - `test_student_role_cannot_access_instructor_courses_and_receives_403`
   - `test_instructor_only_sees_courses_assigned_to_them_in_index`
   - `test_instructor_can_access_show_view_for_assigned_course`
   - `test_instructor_cannot_access_show_view_for_unassigned_course_and_receives_403`
   - `test_admin_can_access_any_instructor_course_view`
   - `test_show_view_returns_accepted_students_and_grades_breakdown`
3. Verification Command:
   `php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php`

---

## 6. Actionable Implementation Checklist

### Phase 3A: Backend Authorization & Data Pipeline
- [ ] In `app/Http/Controllers/Instructor/CourseController.php`:
  - Update `index()`: Filter courses using `whereHas('scheduledCourses', fn($q) => $q->where('user_id', auth()->id()))` for instructors; allow all courses for `role:admin`.
  - Update `show($id)`:
    - Verify authorization: if not `role:admin` and no assigned `ScheduledCourse` exists for `$id` with `user_id = auth()->id()`, throw `abort(403, 'No autorizado para ver este curso.')`.
    - Query assigned cohorts: `$scheduledCourses = ScheduledCourse::where('curso_id', $id)->when(!auth()->user()->hasRole('admin'), fn($q) => $q->where('user_id', auth()->id()))->with(['enrollments.user', 'enrollments.exams.quiz'])->get();`
    - Filter enrolled students to only include accepted students (`aceptado = 'si'`).
    - Build student grades payload: for each student, compile overall average, list of exam attempts (`quiz_title`, `score`, `max_score`, `status`, `correct_answers`), homework submissions, and lesson completion progress.
    - Pass `cohorts`, `students`, `course`, and `selectedCohortId` as Inertia props.

### Phase 3B: Frontend Components & UI Refinement
- [ ] In `resources/js/pages/Instructor/Courses/Show.tsx`:
  - Add Cohort selector (`<Select>` or `<Tabs>`) to filter students by cohort.
  - Enhance student list table with overall average, exam count, progress badge.
  - Implement a Grades Breakdown modal/drawer (`<Dialog>` or `<Sheet>`) showing the complete breakdown of quizzes/exams and homework for the selected student.
  - Ensure all TypeScript types are fully typed and strict.

### Phase 3C: TypeScript Errors Resolution
- [ ] Fix pre-existing TS errors in `Admin/Certificates/Index.tsx`, `Admin/Courses/Calendars.tsx`, `Admin/InteractivePdfs`, `Admin/Reports`, `Admin/Schedules/Index.tsx`, `Admin/Users/Edit.tsx`, `User/Checkout`, `User/Courses/Lesson.tsx` so `npm.cmd run types:check` exits with 0.

### Phase 3D: Test Suite Verification
- [ ] Implement `tests/Feature/Instructor/InstructorCourseAccessTest.php` covering R1, R2, and R3.
- [ ] Verify test execution: `php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php`.
- [ ] Verify build execution: `npm.cmd run build` and `npm.cmd run types:check`.

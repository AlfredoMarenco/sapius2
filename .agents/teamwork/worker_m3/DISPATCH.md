# Dispatch: M3 - Frontend UI & Typecheck Cleanliness

Working Directory: e:\laragon\www\sapius2\.agents\teamwork\worker_m3
Original Request: e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
Project Scope: e:\laragon\www\sapius2\PROJECT.md
Survey 3 Report: e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_3\survey_frontend_testing.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Mission:
1. Implement the Cohort Selector and Student Grades Breakdown UI in `resources/js/pages/Instructor/Courses/Show.tsx`.
   - Prop types: Define TypeScript interfaces for `Cohort`, `Student`, `ExamItem`, `HomeworkItem`, and update page props (`course`, `cohorts`, `selectedCohortId`, `selectedCohort`, `students`).
   - Cohort Selector: Render a cohort selection dropdown/select or tabs at the top of the enrolled students section. When changed, use Inertia `router.get` to update `?cohort_id={id}` with `preserveState: true`.
   - Active Students Table: Display student avatar, name, email, progress percentage bar, average exam score, completed exams count, and homework count.
   - Interactive Grades Breakdown Dialog/Modal:
     When clicking "Ver calificaciones" / "Progreso" on any student, open a clean Dialog/Modal (using UI components from `@/components/ui/dialog` or `@/components/ui/tabs`) showing:
     - Student header (name, email, progress %, average score).
     - Evaluations/Exams list: quiz title, score obtained (`score_total`), status (`Finalizado` / `En progreso`), correct/total questions, date, and late indicator.
     - Homework list: lesson title, status ('Entregado'), date, and timeliness indicator (on time vs late).
2. Clean Frontend Build & TypeScript Check:
   - Run `npm.cmd run build` to ensure Vite compiles with exit code 0.
   - Run `npm.cmd run types:check` (or `npx.cmd tsc --noEmit`).
   - If there are pre-existing TypeScript errors in `resources/js/pages/Admin/` or `User/` (as identified by Explorer 3), resolve them cleanly so `npm.cmd run types:check` passes with zero errors.
3. Verification:
   - Verify `npm.cmd run build` passes with exit code 0.
   - Verify `npm.cmd run types:check` passes with zero errors.
   - Verify automated backend tests still pass: `php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php`.
4. Deliver handoff.md in your working directory and notify the orchestrator.

## 2026-10-26T16:14:06Z
You are Worker M3 (teamwork_preview_worker) implementing Milestone 3: Frontend UI & Typecheck Cleanliness for Sapius 2 Phase 3 (Instructor Module).
Your working directory is: e:\laragon\www\sapius2\.agents\teamwork\worker_m3
You MUST read:
- e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
- e:\laragon\www\sapius2\PROJECT.md
- e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_3\survey_frontend_testing.md
- e:\laragon\www\sapius2\.agents\teamwork\worker_m3\DISPATCH.md
- resources/js/pages/Instructor/Courses/Show.tsx

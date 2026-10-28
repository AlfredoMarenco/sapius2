# Dispatch: M1 - Backend Authorization & Access Control

Working Directory: e:\laragon\www\sapius2\.agents\teamwork\worker_m1
Original Request: e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
Project Scope: e:\laragon\www\sapius2\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Mission: Implement strict course restriction and authorization for the Instructor module.
Files Owned Exclusively:
- `app/Http/Middleware/CheckRole.php`
- `app/Http/Controllers/Instructor/CourseController.php`
- `app/Http/Controllers/Instructor/CourseBuilderController.php`

Implementation details:
1. `app/Http/Middleware/CheckRole.php`:
   Add admin bypass check:
   ```php
   if (method_exists($user, 'hasRole') && $user->hasRole('admin')) {
       return $next($request);
   }
   ```
   So users with role `admin` can access instructor routes seamlessly.
2. `app/Http/Controllers/Instructor/CourseController.php`:
   - In `index()`:
     Restrict `$courses` to courses where `scheduledCourses.user_id = auth()->id()`, unless user has role `admin` (admins see all courses).
   - In `show($id)`:
     If user does NOT have role `admin`, verify that a cohort exists for this course assigned to the user:
     `ScheduledCourse::where('curso_id', $id)->where('user_id', auth()->id())->exists()`.
     If not assigned, abort immediately with HTTP 403:
     `abort(403, 'No tienes autorización para acceder a este curso.');`
3. `app/Http/Controllers/Instructor/CourseBuilderController.php`:
   - In `show($id)`:
     Protect similarly: verify cohort assignment or admin role before displaying builder; abort(403) if unauthorized.
4. Schema Freeze:
   - Absolutely NO database migrations or table schema alterations.
5. Verification:
   - Run syntax and PHPUnit/Pest test checks to verify changes.
6. Deliver handoff.md in your working directory and notify the orchestrator.


## 2026-10-26T15:49:57Z
You are Worker M1 (teamwork_preview_worker) implementing Milestone 1: Backend Authorization & Access Control for Sapius 2 Phase 3 (Instructor Module).
Your working directory is: e:\laragon\www\sapius2\.agents\teamwork\worker_m1
You MUST read:
- e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
- e:\laragon\www\sapius2\PROJECT.md
- e:\laragon\www\sapius2\.agents\teamwork\worker_m1\DISPATCH.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission:
Implement strict authorization and course filtering:
1. Modify `app/Http/Middleware/CheckRole.php` to include an admin bypass:
   If `$user->hasRole('admin')`, allow the request through (`return $next($request)`).
2. Modify `app/Http/Controllers/Instructor/CourseController.php`:
   - In `index()`:
     Filter `$courses` by `whereHas('scheduledCourses', fn($q) => $q->where('user_id', $user->id))` unless `$user->hasRole('admin')`.
   - In `show($id)`:
     If `!$user->hasRole('admin')`, verify that `$course->scheduledCourses()->where('user_id', $user->id)->exists()`. If not assigned, throw `abort(403, 'No tienes autorización para acceder a este curso.');`.
3. Modify `app/Http/Controllers/Instructor/CourseBuilderController.php`:
   - In `show($id)`: Add the same authorization check to prevent unauthorized instructors from viewing/editing the course curriculum.
4. Schema Freeze: DO NOT alter database schema or create migrations.
5. Verification:
   Run syntax checks and tests (`php artisan test`) to ensure everything compiles and passes cleanly without regressions.
6. Deliver `e:\laragon\www\sapius2\.agents\teamwork\worker_m1\handoff.md` and send a message back to the orchestrator.

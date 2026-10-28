# BRIEFING — 2026-10-26T16:03:00Z

## Mission
Implement Milestone 1: Backend Authorization & Access Control for Sapius 2 Phase 3 (Instructor Module).

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: e:\laragon\www\sapius2\.agents\teamwork\worker_m1
- Original parent: b5409e3d-eef2-47d6-9407-c36ee877a315
- Milestone: M1 - Backend Authorization & Access Control

## 🔒 Key Constraints
- Schema Freeze: DO NOT alter database schema or create migrations.
- Minimal Change Principle: Only modify assigned files.
- Integrity Mandate: Genuine logic only, no hardcoding, no facades.
- Files Owned Exclusively:
  - `app/Http/Middleware/CheckRole.php`
  - `app/Http/Controllers/Instructor/CourseController.php`
  - `app/Http/Controllers/Instructor/CourseBuilderController.php`

## Current Parent
- Conversation ID: b5409e3d-eef2-47d6-9407-c36ee877a315
- Updated: not yet

## Task Summary
- **What to build**:
  1. `app/Http/Middleware/CheckRole.php`: Add admin bypass check (`$user->hasRole('admin')`).
  2. `app/Http/Controllers/Instructor/CourseController.php`:
     - In `index()`: Filter `$courses` by `whereHas('scheduledCourses', fn($q) => $q->where('user_id', $user->id))` unless `$user->hasRole('admin')`.
     - In `show($id)`: If `!$user->hasRole('admin')`, verify that `$course->scheduledCourses()->where('user_id', $user->id)->exists()`. If not, `abort(403, 'No tienes autorización para acceder a este curso.');`.
  3. `app/Http/Controllers/Instructor/CourseBuilderController.php`:
     - In `show($id)`: Add the same authorization check to prevent unauthorized instructors from viewing/editing the course curriculum (`abort(403, 'No tienes autorización para acceder a este curso.');`).
  4. `routes/instructor.php`: Update import to `App\Http\Controllers\Instructor\CourseBuilderController`.
- **Success criteria**:
  - Middleware allows admin through any role check.
  - Non-admin instructors see only courses they have scheduled cohorts for.
  - Non-admin instructors attempting to view unassigned course or builder receive 403.
  - Tests pass cleanly without regressions.
- **Interface contracts**: `e:\laragon\www\sapius2\PROJECT.md` § Interface Contracts
- **Code layout**: `e:\laragon\www\sapius2\PROJECT.md` § Code Layout

## Key Decisions Made
- Added admin bypass in `CheckRole.php` supporting both `hasRole('admin')` method and `role === 'admin'` attribute.
- In `CourseController.php`, scoped `index()` query to instructor's assigned cohorts via `scheduledCourses`, preserving full access for admins.
- In `CourseController.php`, protected `show($id)` with cohort ownership validation and HTTP 403 abortion for unauthorized instructors.
- Created `Instructor\CourseBuilderController` extending `Admin\CourseBuilderController`, overriding `show($id)` with strict authorization check.
- Created dedicated test suite `tests/Feature/Instructor/InstructorCourseBuilderAccessTest.php` to independently verify builder protection and middleware bypass.

## Change Tracker
- **Files modified**:
  - `app/Http/Middleware/CheckRole.php`: Added administrator bypass check.
  - `app/Http/Controllers/Instructor/CourseController.php`: Filtered courses by scheduled cohort ownership in `index()` and enforced 403 in `show($id)`.
  - `app/Http/Controllers/Instructor/CourseBuilderController.php`: Created new instructor builder controller with authorization check in `show($id)`.
  - `routes/instructor.php`: Wired builder routes to `Instructor\CourseBuilderController`.
  - `tests/Feature/Instructor/InstructorCourseBuilderAccessTest.php`: Added 7 automated tests for builder authorization and middleware.
- **Build status**: PASS (22 tests passed, 45 assertions; PHP syntax clean; Vite build clean)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (100% pass on all M1 tests)
- **Lint status**: Clean (no PHP syntax errors, Vite build successful)
- **Tests added/modified**: `tests/Feature/Instructor/InstructorCourseBuilderAccessTest.php` (7 tests, 11 assertions)

## Loaded Skills
- None

## Artifact Index
- `DISPATCH.md` — Task assignment and instructions
- `BRIEFING.md` — Situational awareness and working memory
- `progress.md` — Liveness and step tracker
- `handoff.md` — Handoff report upon completion

# Handoff Report: Milestone 1 (Backend Authorization & Access Control)

**Type:** Hard Handoff  
**Worker:** Worker M1 (`worker_m1`)  
**Date:** 2026-10-26T16:04:00Z  
**Directory:** `e:\laragon\www\sapius2\.agents\teamwork\worker_m1`  
**Target:** Milestone 1 - Backend Authorization & Access Control for Sapius 2 Phase 3 (Instructor Module)

---

## 1. Observation

1. **CheckRole Middleware Defect**:
   - In `app/Http/Middleware/CheckRole.php:18-34`, requests were checked against `$role` with no administrator bypass:
     ```php
     if (method_exists($user, 'hasRole')) {
         if (!$user->hasRole($role)) {
             return redirect()->route('dashboard');
         }
     }
     ```
   - When an administrator accessed instructor-restricted routes (`role:instructor`), `$user->hasRole('instructor')` returned `false`, redirecting them to `dashboard` and preventing supervisory access.

2. **CourseController Unrestricted Listing & Access**:
   - In `app/Http/Controllers/Instructor/CourseController.php:17`:
     `$courses = Course::with('category')->get();` loaded all courses regardless of instructor assignment.
   - In `app/Http/Controllers/Instructor/CourseController.php:25`:
     `$course = Course::with([...])->findOrFail($id);` had no cohort assignment validation, allowing instructors to access courses belonging to other instructors.

3. **CourseBuilderController Unprotected Show Action**:
   - `routes/instructor.php:7,19` previously imported and invoked `App\Http\Controllers\Admin\CourseBuilderController` for route `/instructor/cursos/{course}/builder`.
   - `Admin\CourseBuilderController::show` lacked any check to verify whether an authenticated instructor had an assigned cohort for the course, permitting unauthorized curriculum inspection.

4. **Database & Model Linkage**:
   - Table `cursos` (`Course` model) has relationship `scheduledCourses()` mapped to table `cursos_programados` with foreign key `curso_id`.
   - Table `cursos_programados` (`ScheduledCourse` model) has column `user_id` storing the assigned instructor ID.
   - User roles are managed via Shinobi `roles` and pivot `role_user`, accessed via `$user->hasRole('admin')` or accessor `$user->role`.

5. **Test Suite Execution**:
   - Test command:
     `php vendor/pestphp/pest/bin/pest tests/Feature/Instructor/InstructorCourseBuilderAccessTest.php tests/Feature/Instructor/InstructorCourseAccessTest.php --filter="test_tier1_(instructor_sees|instructor_with_no|courses_with_cohorts|course_with_multiple|unassigned_courses|instructor_cannot|instructor_can_successfully|foreign_course|admin_sees|admin_can_view|admin_without|admin_can_inspect)|test_instructor|test_admin|test_unauthenticated|test_student|test_checkrole"`
   - Result:
     ```
     PASS Tests\Feature\Instructor\InstructorCourseBuilderAccessTest
     ✓ instructor can access builder for assigned course
     ✓ instructor cannot access builder for unassigned course returns 403
     ✓ admin can access builder for any course
     ✓ admin can access builder for course without cohorts
     ✓ unauthenticated user accessing builder is redirected to login
     ✓ student role accessing instructor builder is redirected to dashboard
     ✓ checkrole middleware admin bypass allows admin on instructor routes

     PASS Tests\Feature\Instructor\InstructorCourseAccessTest
     ✓ tier1 instructor sees only courses with assigned cohorts
     ✓ tier1 instructor with no assigned cohorts sees empty course list
     ✓ tier1 courses with cohorts belonging to other instructors are excluded
     ✓ tier1 course with multiple cohorts where instructor has one is included
     ✓ tier1 unassigned courses without cohorts are excluded from instructor index
     ✓ tier1 instructor cannot view unassigned course returns 403
     ✓ tier1 instructor cannot view course with zero cohorts returns 403
     ✓ tier1 instructor cannot view another instructors private course returns 403
     ✓ tier1 instructor can successfully view assigned course returns 200
     ✓ tier1 foreign course access aborts with explicit forbidden status
     ✓ tier1 admin sees all courses in index regardless of instructor assignment
     ✓ tier1 admin can view any course without assigned cohort returns 200
     ✓ tier1 admin can view course with zero cohorts returns 200
     ✓ tier1 admin without explicit instructor role bypasses checkrole middleware
     ✓ tier1 admin can inspect any cohort students and performance metrics

     Tests: 22 passed (45 assertions)
     Duration: 1.76s
     ```

---

## 2. Logic Chain

1. **Admin Bypass (R1)**:
   - Based on Observation 1 and 4, adding an administrator check in `app/Http/Middleware/CheckRole.php` before the role match ensures any user with `$user->hasRole('admin') || $user->role === 'admin'` immediately calls `$next($request)`.
   - This prevents redirection to `dashboard` and satisfies the requirement that administrators retain supervisory access across all instructor routes.

2. **Course Listing Filtering (R1)**:
   - Based on Observation 2 and 4, in `CourseController::index()`, querying:
     ```php
     if (!$isAdmin) {
         $query->whereHas('scheduledCourses', function ($q) use ($user) {
             $q->where('user_id', $user?->id);
         });
     }
     ```
     guarantees that non-admin instructors only receive courses where at least one cohort in `cursos_programados` has `user_id = $user->id`. If an instructor has zero assigned cohorts, the query returns an empty collection. If the user is an admin, the query returns all courses.

3. **Unauthorized Course View Guard (R1)**:
   - Based on Observation 2 and 4, in `CourseController::show($id)`:
     ```php
     if (!$isAdmin) {
         $isAssigned = $user && $course->scheduledCourses()->where('user_id', $user->id)->exists();
         if (!$isAssigned) {
             abort(403, 'No tienes autorización para acceder a este curso.');
         }
     }
     ```
     verifies whether the authenticated instructor has any cohort assigned for `$course->id`. If not assigned and not an administrator, it immediately halts execution and throws HTTP 403 with the required localized message `'No tienes autorización para acceder a este curso.'`.

4. **Course Builder Protection (R1)**:
   - Based on Observation 3 and 4, creating `App\Http\Controllers\Instructor\CourseBuilderController` extending `App\Http\Controllers\Admin\CourseBuilderController` and overriding `show($id)` applies the identical cohort assignment verification (`$course->scheduledCourses()->where('user_id', $user->id)->exists()`).
   - Updating `routes/instructor.php:7` to `use App\Http\Controllers\Instructor\CourseBuilderController;` wires `/instructor/cursos/{course}/builder` directly to this protected controller.
   - Unauthorized instructors attempting to inspect the curriculum receive HTTP 403, while assigned instructors and administrators receive HTTP 200.

5. **Schema Freeze Compliance (R3)**:
   - Zero database migrations were created.
   - Zero existing tables or columns were altered.
   - All authorization checks operate exclusively on the existing `cursos`, `cursos_programados`, `roles`, and `role_user` tables.

---

## 3. Caveats

1. **Milestone 2 Dependencies**:
   - `CourseController::show($id)` currently retains baseline student formatting. Milestone 2 (M2) is tasked with completing the itemized grades (`score_total`, `finalizado`), homework submissions (`is_late`), and cohort student filtering (`aceptado = 'si'`). The authorization guard in `show($id)` was designed to integrate seamlessly with M2.
2. **Pre-existing Frontend Typecheck Errors**:
   - `npm.cmd run types:check` reports 15 pre-existing TypeScript errors in unrelated Admin modules (`Admin/Certificates`, `Admin/Schedules`, `Admin/InteractivePdfs`, `User/Checkout`). No TypeScript errors exist in `resources/js/pages/Instructor/*`.
3. **Vite Build**:
   - `npm.cmd run build` successfully compiles all assets with exit code 0.

---

## 4. Conclusion

Milestone 1 (Backend Authorization & Access Control) is 100% complete and fully verified:
- `app/Http/Middleware/CheckRole.php` includes genuine administrator bypass logic.
- `app/Http/Controllers/Instructor/CourseController.php` restricts `index()` to assigned courses and guards `show($id)` with HTTP 403 on unassigned courses.
- `app/Http/Controllers/Instructor/CourseBuilderController.php` guards the course builder interface (`show($id)`) with HTTP 403 on unassigned courses.
- `routes/instructor.php` correctly points instructor builder routes to `Instructor\CourseBuilderController`.
- 22 automated tests (45 assertions) across both test suites pass cleanly.
- The project is ready for Milestone 2 (Backend Cohorts & Grades Aggregation).

---

## 5. Verification Method

To independently reproduce and verify this milestone:

1. **Run Milestone 1 Tests**:
   ```bash
   php vendor/pestphp/pest/bin/pest tests/Feature/Instructor/InstructorCourseBuilderAccessTest.php tests/Feature/Instructor/InstructorCourseAccessTest.php --filter="test_tier1_(instructor_sees|instructor_with_no|courses_with_cohorts|course_with_multiple|unassigned_courses|instructor_cannot|instructor_can_successfully|foreign_course|admin_sees|admin_can_view|admin_without|admin_can_inspect)|test_instructor|test_admin|test_unauthenticated|test_student|test_checkrole"
   ```
   *Expected result:* 22 tests passed (45 assertions), duration < 2s.

2. **Run Dedicated Builder & Middleware Tests**:
   ```bash
   php vendor/pestphp/pest/bin/pest tests/Feature/Instructor/InstructorCourseBuilderAccessTest.php
   ```
   *Expected result:* 7 tests passed (11 assertions).

3. **Verify PHP Syntax**:
   ```bash
   php -l app/Http/Middleware/CheckRole.php
   php -l app/Http/Controllers/Instructor/CourseController.php
   php -l app/Http/Controllers/Instructor/CourseBuilderController.php
   php -l routes/instructor.php
   ```
   *Expected result:* `No syntax errors detected` for each file.

4. **Verify Route Compilation**:
   ```bash
   php artisan route:list --path=instructor
   ```
   *Expected result:* All 16 instructor routes display correctly with `Instructor\CourseController` and `Instructor\CourseBuilderController`.

5. **Inspect Source Files**:
   - `app/Http/Middleware/CheckRole.php:23-26`
   - `app/Http/Controllers/Instructor/CourseController.php:18-24,37-43`
   - `app/Http/Controllers/Instructor/CourseBuilderController.php:19-32`
   - `routes/instructor.php:7`

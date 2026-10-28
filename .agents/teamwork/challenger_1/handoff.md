# Adversarial Security & Authorization Challenge Report

**Agent**: Challenger 1 (`teamwork_preview_challenger`)  
**Target**: Sapius 2 - Phase 3 (Instructor Module)  
**Date**: 2026-10-26T16:32:00Z  
**Verdict**: **APPROVE**

---

## 1. Observation

### Codebase Inspection & Route Definitions
- In `routes/instructor.php` (lines 9–19):
  ```php
  Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
      Route::get('/cursos', [CourseController::class, 'index'])->name('cursos.index');
      Route::get('/cursos/{id}/view', [CourseController::class, 'show'])->name('cursos.show');
      Route::get('/cursos/{course}/builder', [CourseBuilderController::class, 'show'])->name('courses.builder');
  ```
- In `app/Http/Middleware/CheckRole.php` (lines 18–38):
  - Line 19: Unauthenticated access redirects immediately to `login`.
  - Line 24: Users with `admin` role bypass checks and proceed to `$next($request)`.
  - Line 31–36: Users lacking the specified role (e.g. `role:instructor`) are redirected to route `dashboard`.
- In `app/Http/Controllers/Instructor/CourseController.php`:
  - Lines 46–50:
    ```php
    if (! $isAdmin) {
        $isAssigned = $user && $course->scheduledCourses()->where('user_id', $user->id)->exists();
        if (! $isAssigned) {
            abort(403, 'No tienes autorización para acceder a este curso.');
        }
    }
    ```
  - Lines 66–77:
    ```php
    $requestedCohortId = $request->query('cohort_id');
    $selectedCohort = null;

    if ($requestedCohortId !== null && $requestedCohortId !== '') {
        $targetCohort = ScheduledCourse::where('curso_id', $id)->find($requestedCohortId);
        if (! $targetCohort) {
            abort(404, 'Cohorte no encontrada.');
        }
        if (! $isAdmin && (int) $targetCohort->user_id !== (int) $user->id) {
            abort(403, 'No tienes autorización para acceder a esta cohorte.');
        }
        $selectedCohort = $targetCohort;
    } else {
        $selectedCohort = $cohorts->first();
    }
    ```
  - Lines 54–63:
    ```php
    $cohortsQuery = ScheduledCourse::where('curso_id', $id)
        ->withCount(['enrollments as active_students_count' => function ($q) {
            $q->where('aceptado', 'si');
        }]);

    if (! $isAdmin) {
        $cohortsQuery->where('user_id', $user->id);
    }
    ```
- In `app/Http/Controllers/Instructor/CourseBuilderController.php`:
  - Lines 26–31:
    ```php
    if (!$isAdmin) {
        $isAssigned = $user && $course->scheduledCourses()->where('user_id', $user->id)->exists();
        if (!$isAssigned) {
            abort(403, 'No tienes autorización para acceder a este curso.');
        }
    }
    ```

### Empirical Test Execution Results
1. `php artisan test --filter=AdversarialSecurityTest`:
   - Executed 19 adversarial tests covering:
     - Cross-instructor course access on `/view` -> HTTP 403.
     - Cross-instructor course access on `/builder` -> HTTP 403.
     - Unassigned empty course access on `/view` and `/builder` -> HTTP 403.
     - Cohort query parameter tampering (`?cohort_id={unassigned_cohort}`) on shared course -> HTTP 403.
     - Cohort parameter tampering across different courses, negative IDs, invalid IDs, and SQL injection strings -> HTTP 404/403.
     - Unauthenticated access redirects to `login`.
     - Student role (`alumno`) access redirects to `dashboard`.
     - Enrolled student cannot bypass role checks (`alumno` accessing instructor views redirects to `dashboard`).
     - Admin supervisory bypass accesses all views, builder, and cohorts without 403 (HTTP 200).
     - Cohort dropdown and student lists never leak unassigned cohorts or other instructors' students in Inertia props.
   - Result: `Tests: 19 passed (35 assertions) Duration: 1.74s`.
2. `php artisan test --filter=Instructor`:
   - Executed complete suite of 3 test files:
     - `Tests\Feature\Instructor\AdversarialSecurityTest`: 19 passed (35 assertions)
     - `Tests\Feature\Instructor\InstructorCourseAccessTest`: 46 passed (127 assertions)
     - `Tests\Feature\Instructor\InstructorCourseBuilderAccessTest`: 7 passed (11 assertions)
   - Result: `Tests: 72 passed (173 assertions) Duration: 4.91s`.
3. Frontend TypeScript & Build:
   - `npm.cmd run types:check`: passed with exit code 0 (`tsc --noEmit`).
   - `npm.cmd run build`: passed with exit code 0 (`built in 16.29s`).

---

## 2. Logic Chain

1. **Cross-Instructor Course Boundary Isolation**:
   - Observation: Both `CourseController::show` and `CourseBuilderController::show` evaluate `$course->scheduledCourses()->where('user_id', $user->id)->exists()`.
   - Inference: If an instructor does not own a scheduled cohort for the requested course ID, the check strictly returns false and calls `abort(403)`.
   - Empirical proof: `test_adversarial_non_assigned_instructor_accessing_course_view_receives_403` and `test_adversarial_non_assigned_instructor_accessing_course_builder_receives_403` both verified HTTP 403 response.

2. **Query Parameter Tampering & Horizontal Privilege Escalation**:
   - Observation: When `cohort_id` query parameter is provided, `CourseController::show` queries `ScheduledCourse::where('curso_id', $id)->find($requestedCohortId)`. If not found under the course, it aborts with 404; if found but `(int) $targetCohort->user_id !== (int) $user->id` and user is not admin, it aborts with 403.
   - Inference: An instructor cannot tamper with `?cohort_id=` to view cohorts belonging to another instructor—even if both teach the same course or different courses.
   - Empirical proof: `test_adversarial_tampering_cohort_id_to_unassigned_cohort_in_same_course_receives_403` and `test_adversarial_tampering_cohort_id_to_foreign_course_cohort_receives_404_or_403` confirmed zero data leakage and immediate abort.

3. **Role Transitions & Perimeter Defense**:
   - Observation: `CheckRole` middleware is applied to the entire `/instructor` route group.
   - Inference:
     - Unauthenticated requests have `$user = null`, redirecting to `login` (HTTP 302).
     - Authenticated students (`alumno`) fail `hasRole('instructor')`, redirecting to `dashboard` (HTTP 302).
     - Authenticated admins pass via `hasRole('admin')`, bypassing role and course-scoping restrictions cleanly.
   - Empirical proof: All unauthenticated, student, and admin test cases passed with exact redirection targets and HTTP 200 statuses respectively.

4. **Information Leakage via Props**:
   - Observation: Inertia prop generation scopes `cohorts` via `$cohortsQuery->where('user_id', $user->id)` (unless admin), and `students` via `where('curso_programado_id', $selectedCohort->id)->where('aceptado', 'si')`.
   - Inference: Even if an instructor has access to Course A, they cannot view cohorts or students assigned to Instructor B.
   - Empirical proof: `test_adversarial_cohort_dropdown_does_not_leak_unassigned_cohorts` and `test_adversarial_students_from_unassigned_cohorts_are_never_leaked` confirmed zero foreign IDs present in returned Inertia props.

---

## 3. Caveats

- **No caveats**: All authorization rules, parameter tampering vectors, role transitions, and data boundaries mandated in the dispatch have been empirically stress-tested and verified with zero failures.

---

## 4. Conclusion

**Verdict: APPROVE**

The access control implementation in Sapius 2 Phase 3 (Instructor Module) is secure, robust, and correctly hardened against:
- Cross-instructor course unauthorized access (HTTP 403).
- Cross-instructor cohort query parameter tampering (HTTP 403 / 404).
- Unauthenticated access and student role traversal (redirection to login and dashboard).
- Admin supervisory bypass (full access without restrictions).
- Cross-cohort data leakage in Inertia payloads.

---

## 5. Verification Method

To independently verify all findings:

```bash
# 1. Run the adversarial security test suite
php artisan test --filter=AdversarialSecurityTest

# 2. Run all instructor feature test suites
php artisan test --filter=Instructor

# 3. Verify TypeScript types and frontend build
npm.cmd run types:check
npm.cmd run build
```

Files inspected:
- `app/Http/Middleware/CheckRole.php`
- `app/Http/Controllers/Instructor/CourseController.php`
- `app/Http/Controllers/Instructor/CourseBuilderController.php`
- `routes/instructor.php`
- `tests/Feature/Instructor/AdversarialSecurityTest.php`
- `tests/Feature/Instructor/InstructorCourseAccessTest.php`
- `tests/Feature/Instructor/InstructorCourseBuilderAccessTest.php`

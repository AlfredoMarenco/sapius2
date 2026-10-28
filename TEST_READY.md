# TEST_READY: Sapius 2 Phase 3 (Instructor Module)

## Test Suite Overview
- **Suite Location**: `tests/Feature/Instructor/InstructorCourseAccessTest.php`
- **Framework**: PHPUnit / Pest (Laravel Test Runner)
- **Runner Command**: `php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php`
- **Total Test Cases**: 46 tests (112 assertions)
- **Methodology**: 4-Tier Opaque-Box Requirement-Driven Testing (Category-Partition, Boundary Value Analysis, Pairwise Combinatorial, and Real-World Application Workloads).

---

## Feature Coverage Matrix

| Feature # | Description | Source | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Status |
|:---------:|:------------|:-------|:------:|:------:|:------:|:------:|:------:|
| **F1** | Instructor Course Index Restriction (`cursos_programados.user_id = auth()->id()`) | `ORIGINAL_REQUEST §R1` | 5 | 2 | 2 | 3 | **PASS (M1)** |
| **F2** | HTTP 403 on Foreign Course View | `ORIGINAL_REQUEST §R1` | 5 | 2 | 2 | 2 | **PASS (M1)** |
| **F3** | Admin Supervisory Bypass (`role:admin` has full access) | `ORIGINAL_REQUEST §R1` | 5 | 1 | 2 | 2 | **PASS (M1)** |
| **F4** | Active Enrolled Students Filtering (`aceptado = 'si'`, excludes `no`) | `ORIGINAL_REQUEST §R2` | 5 | 1 | 1 | 2 | *Pending M2* |
| **F5** | Exam Grades Breakdown (`score_total`, status, correct/total questions) | `ORIGINAL_REQUEST §R2` | 5 | 1 | 0 | 2 | *Pending M2* |
| **F6** | Homework Submissions & Timeliness (`is_late` flag, submission tracking) | `ORIGINAL_REQUEST §R2` | 5 | 1 | 0 | 2 | *Pending M2* |

---

## Detailed Test Inventory by Tier

### Tier 1: Isolated Feature Behavior (30 Tests)

#### Feature 1: Course Index Restriction
1. `test_tier1_instructor_sees_only_courses_with_assigned_cohorts` — Confirms assigned courses appear and foreign courses are excluded.
2. `test_tier1_instructor_with_no_assigned_cohorts_sees_empty_course_list` — Instructor with 0 assigned cohorts sees empty array.
3. `test_tier1_courses_with_cohorts_belonging_to_other_instructors_are_excluded` — Strictly excludes courses belonging to other instructors.
4. `test_tier1_course_with_multiple_cohorts_where_instructor_has_one_is_included` — Shared course with multiple cohorts appears if instructor has at least one cohort.
5. `test_tier1_unassigned_courses_without_cohorts_are_excluded_from_instructor_index` — Unassigned courses with zero cohorts do not leak into instructor index.

#### Feature 2: HTTP 403 on Foreign Course View
6. `test_tier1_instructor_cannot_view_unassigned_course_returns_403` — Accessing course assigned to another instructor returns HTTP 403 Forbidden.
7. `test_tier1_instructor_cannot_view_course_with_zero_cohorts_returns_403` — Accessing course without cohorts returns HTTP 403 Forbidden.
8. `test_tier1_instructor_cannot_view_another_instructors_private_course_returns_403` — Private author-restricted course access blocked with 403.
9. `test_tier1_instructor_can_successfully_view_assigned_course_returns_200` — Legitimate instructor accesses assigned course with HTTP 200 OK.
10. `test_tier1_foreign_course_access_aborts_with_explicit_forbidden_status` — Verifies explicit 403 HTTP status code without data leak.

#### Feature 3: Admin Supervisory Bypass
11. `test_tier1_admin_sees_all_courses_in_index_regardless_of_instructor_assignment` — Admin lists all courses including unassigned or other instructors' courses.
12. `test_tier1_admin_can_view_any_course_without_assigned_cohort_returns_200` — Admin views any course with HTTP 200 without having an assigned cohort.
13. `test_tier1_admin_can_view_course_with_zero_cohorts_returns_200` — Admin views empty courses without cohorts with HTTP 200.
14. `test_tier1_admin_without_explicit_instructor_role_bypasses_checkrole_middleware` — Admin user without explicit `instructor` role bypasses `role:instructor` middleware check.
15. `test_tier1_admin_can_inspect_any_cohort_students_and_performance_metrics` — Admin inspects cohorts and enrolled students across any instructor's course.

#### Feature 4: Active Enrolled Students Filtering (`aceptado = 'si'`)
16. `test_tier1_cohort_view_includes_accepted_students` — Active accepted student (`aceptado = 'si'`) appears in roster.
17. `test_tier1_cohort_view_excludes_unaccepted_students` — Rejected student (`aceptado = 'no'`) is strictly excluded.
18. `test_tier1_cohort_with_all_unaccepted_students_shows_empty_student_list` — Cohort where all enrollments are `no` presents 0 students.
19. `test_tier1_cohort_with_mixed_acceptance_only_returns_accepted_subset` — Cohort with 3 enrollments (2 accepted, 1 rejected) returns exactly the 2 accepted students.
20. `test_tier1_pending_or_null_acceptance_students_are_excluded` — Non-accepted / pending enrollments are excluded.

#### Feature 5: Exam Grades Breakdown (`score_total`)
21. `test_tier1_student_exam_grades_breakdown_contains_score_total_and_status` — Exam item includes numerical `score_total` / `score` and completion status.
22. `test_tier1_student_multiple_exams_are_itemized_correctly` — Multiple completed exams for the student are itemized in `exams` array.
23. `test_tier1_student_exam_breakdown_includes_quiz_title_and_question_metrics` — Exam breakdown includes quiz title and question metadata.
24. `test_tier1_student_without_exams_returns_empty_exams_array` — Student with 0 exams cleanly presents empty array without crashing.
25. `test_tier1_student_exams_average_is_calculated_accurately` — Average exam grade across completed exams is calculated correctly.

#### Feature 6: Homework Submissions & Timeliness
26. `test_tier1_homework_submission_includes_is_late_flag_false_when_on_time` — On-time submission contains `is_late = false`.
27. `test_tier1_homework_submission_includes_is_late_flag_true_when_late` — Late submission contains `is_late = true`.
28. `test_tier1_student_homework_completed_count_is_accurate` — Total submitted homework count matches records.
29. `test_tier1_student_without_homework_has_empty_homework_list_and_zero_count` — Student with 0 submissions has count 0 and empty array.
30. `test_tier1_homework_item_includes_lesson_title` — Homework item displays parent lesson title.

---

### Tier 2: Boundary, Edge Cases, and Zero States (6 Tests)
31. `test_tier2_unauthenticated_guest_is_redirected_to_login` — Unauthenticated requests redirect to `/login`.
32. `test_tier2_student_role_user_cannot_access_instructor_routes` — Student role (`alumno`) redirected to dashboard.
33. `test_tier2_nonexistent_course_id_returns_404_or_403` — Request for non-existent course ID (999999) handled gracefully (404/403).
34. `test_tier2_cohort_selection_via_query_param_loads_specific_cohort` — `?cohort_id={id}` selectively loads the specified cohort.
35. `test_tier2_instructor_cannot_view_unassigned_cohort_in_same_course_via_query_param` — Instructor cannot access another instructor's cohort within a shared course.
36. `test_tier2_student_with_zero_progress_and_no_activities_renders_cleanly` — Zero-activity student renders cleanly with 0 progress, empty exams, and empty homeworks.

---

### Tier 3: Pairwise Combinations (5 Tests)
37. `test_tier3_pairwise_instructor_assigned_cohort_with_active_students` — Authorized Instructor + Assigned Cohort + Active Students = 200 OK with roster.
38. `test_tier3_pairwise_instructor_unassigned_cohort_with_active_students` — Unauthorized Instructor + Foreign Course + Active Students = 403 Forbidden.
39. `test_tier3_pairwise_admin_with_unassigned_course_and_active_students` — Admin + Foreign Course + Active Students = 200 OK with roster.
40. `test_tier3_pairwise_instructor_assigned_cohort_with_zero_students` — Authorized Instructor + Assigned Cohort + 0 Students = 200 OK with empty roster.
41. `test_tier3_pairwise_admin_course_with_zero_cohorts` — Admin + Course with 0 Cohorts = 200 OK with 0 cohorts.

---

### Tier 4: Real-World Application Scenarios (5 Tests)
42. `test_tier4_scenario1_multi_cohort_instructor_inspects_performance_across_cohorts` — Instructor with morning & evening cohorts switches views and validates distinct rosters.
43. `test_tier4_scenario2_instructor_attempting_cross_instructor_data_leakage_is_blocked` — Adversarial penetration attempt across routes and query params is strictly blocked.
44. `test_tier4_scenario3_admin_supervisor_inspects_all_courses_cohorts_and_grades` — Admin supervisor audits courses across multiple instructors and cohorts without 403.
45. `test_tier4_scenario4_realistic_cohort_with_mixed_student_statuses_and_activity_performance` — Comprehensive cohort with 5 students (3 accepted, 2 rejected, varying exam and homework performance).
46. `test_tier4_scenario5_freshly_created_course_with_empty_cohort_zero_state` — Newly scheduled course with empty cohort presents graceful zero state.

---

## Test Execution Command & Verification
```bash
php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php
```

### Current Test Execution Baseline
- **Executed Assertions**: 112 assertions across 46 tests
- **Passing (M1 Authorization & Access Control)**: 32 tests (100% of M1 features, admin bypass, and boundary security)
- **Pending Implementation (M2 Cohort Scoping & Grades Aggregation)**: 14 tests (Active student filtering `aceptado = 'si'`, `score_total` exam itemization, `is_late` homework tracking)

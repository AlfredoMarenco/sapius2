# E2E Test Infra: Sapius 2 Phase 3 (Instructor Module)

## Test Philosophy
- Opaque-box, requirement-driven test suite derived strictly from `ORIGINAL_REQUEST.md` and user acceptance criteria.
- Complete coverage of authorization restrictions (HTTP 403, index filtering, admin bypass) and data breakdown (active enrolled students `aceptado = 'si'`, exams scores `score_total`, homework timeliness `is_late`).
- Methodology: Category-Partition + Boundary Value Analysis + Combinatorial + Real-World Workload Testing.

## Feature Inventory
| # | Feature | Source (Requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|----------------------|:------:|:------:|:------:|
| 1 | Course Index Restriction | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | HTTP 403 on Foreign Course View | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | Admin Supervisory Bypass | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | Active Student Filtering (`aceptado = 'si'`) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 5 | Exam Grades Breakdown (`score_total`) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 6 | Homework Submissions & Timeliness | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |

## Test Architecture
- Framework: Pest / PHPUnit (Laravel Test Suite)
- Test Suite Location: `tests/Feature/Instructor/InstructorCourseAccessTest.php`
- Invocation: `php artisan test tests/Feature/Instructor/InstructorCourseAccessTest.php`
- Pass/Fail Semantics: 100% assertions green, exit code 0.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Instructor with multiple assigned cohorts inspecting active student grades across cohorts | F1, F4, F5, F6 | High |
| 2 | Instructor attempting to access course owned by another instructor and course builder directly | F2, F3 | Medium |
| 3 | Admin viewing any course, cohorts, and student grades breakdown without restrictions | F1, F2, F3, F4, F5, F6 | High |
| 4 | Cohort with mixed accepted/unaccepted students and students with varying exam scores | F4, F5, F6 | High |
| 5 | Edge case: Cohort with 0 accepted students, or student with 0 exams / 0 homework | F4, F5, F6 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 test cases per feature (Isolated feature behavior)
- Tier 2: ≥5 test cases per feature (Boundary, edge cases, zero-states, unauthorized states)
- Tier 3: Pairwise combinations of authorization and data states
- Tier 4: ≥5 realistic application scenarios
- Total Target: ≥35 test assertions/cases

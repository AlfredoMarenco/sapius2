# Dispatch: Challenger 2 - Data Integrity, Boundaries & Calculation Stress

Working Directory: e:\laragon\www\sapius2\.agents\teamwork\challenger_2
Original Request: e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
Project Scope: e:\laragon\www\sapius2\PROJECT.md

Mission:
Adversarially challenge data aggregation, active student filtering, calculation logic, and schema boundaries:
1. Active student boundary:
   - Cohort with only `aceptado = 'no'` or `aceptado = null` enrollments -> must return 0 students.
   - Mixed cohorts -> only `aceptado = 'si'` must ever appear in payload.
2. Calculation stress:
   - Students with 0 exams -> `exams_average` must be 0, not NaN or error.
   - Multiple exam attempts -> all attempts itemized with accurate `score_total` and status.
   - Homework timeliness: `is_late` boolean accurate for on-time (0) vs late (1) submissions.
   - Lesson progress percent: boundary checks (0 lessons, 100% lessons, partial).
3. MySQL legacy column verification:
   - Ensure NO queries select `users.name` or `users.avatar` (which don't exist in MySQL table `users`).
4. Write and run stress verification tests.

Deliver handoff.md with verdict: **APPROVE** or **CHALLENGE_FAILED**.


## 2026-10-26T16:26:33Z
You are Challenger 2 (teamwork_preview_challenger) for Sapius 2 Phase 3 (Instructor Module).
Your working directory is: e:\laragon\www\sapius2\.agents\teamwork\challenger_2
You MUST read:
- e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
- e:\laragon\www\sapius2\PROJECT.md
- e:\laragon\www\sapius2\.agents\teamwork\challenger_2\DISPATCH.md

Adversarially challenge data integrity, boundaries, and calculations:
1. Active student boundary: Verify that unaccepted students (aceptado = 'no' or null) never leak into the roster.
2. Calculations: Verify students with 0 exams (average 0), multiple exams (correct average of score_total), homework on-time (is_late = false) vs late (is_late = true), lesson progress percentage (0%, 100%, partial).
3. Legacy columns: Verify no SQL 1054 errors on table `users` (which has nombre, apellido, foto instead of name/avatar).
4. Write and execute stress tests to verify data correctness.

Deliver handoff.md in your working directory with an explicit verdict: APPROVE or CHALLENGE_FAILED. Send message to orchestrator.

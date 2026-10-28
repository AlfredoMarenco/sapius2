# Dispatch: Challenger 1 - Authorization & Security Stress

Working Directory: e:\laragon\www\sapius2\.agents\teamwork\challenger_1
Original Request: e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
Project Scope: e:\laragon\www\sapius2\PROJECT.md

Mission:
Adversarially challenge authorization, access control, and route security for Sapius 2 Phase 3:
1. Attempt unauthorized access across course boundaries:
   - Instructor A accessing course of Instructor B -> must receive 403.
   - Instructor A attempting query parameter tampering `?cohort_id={cohort_of_B}` -> must receive 403.
   - Accessing `/instructor/cursos/{id}/builder` without assignment -> must receive 403.
2. Role transitions & perimeter defenses:
   - Unauthenticated access -> redirect to login.
   - Student role (`alumno`) -> redirect to dashboard.
   - Admin role (`admin`) -> full bypass without 403.
3. Write and run stress/adversarial test scripts or Pest tests to empirically verify there are zero security bypasses or leakage vulnerabilities.

Deliver handoff.md with verdict: **APPROVE** or **CHALLENGE_FAILED**.


## 2026-10-26T16:26:32Z
You are Challenger 1 (teamwork_preview_challenger) for Sapius 2 Phase 3 (Instructor Module).
Your working directory is: e:\laragon\www\sapius2\.agents\teamwork\challenger_1
You MUST read:
- e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
- e:\laragon\www\sapius2\PROJECT.md
- e:\laragon\www\sapius2\.agents\teamwork\challenger_1\DISPATCH.md

Adversarially challenge authorization and security:
1. Attempt cross-instructor course access: non-assigned instructor accessing /instructor/cursos/{id}/view and /instructor/cursos/{id}/builder must receive 403.
2. Attempt query param tampering: accessing /instructor/cursos/{id}/view?cohort_id={unassigned_cohort} must receive 403.
3. Verify role enforcement: unauthenticated users redirect to login; student role redirects to dashboard; admin role accesses everything without 403.
4. Write and execute adversarial test cases to confirm there are zero access control bypasses or leaks.

Deliver handoff.md in your working directory with an explicit verdict: APPROVE or CHALLENGE_FAILED. Send message to orchestrator.

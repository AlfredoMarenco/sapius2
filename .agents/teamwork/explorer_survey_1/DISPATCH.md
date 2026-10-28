# Dispatch to Explorer 1: Backend & Authorization

Target Working Directory: e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_1
Original Request: e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md

Mission: Survey the existing backend architecture, routes, controllers, middleware, policies, and database models related to the Instructor module and course authorization.
Specifically:
- Check routes for `/instructor/cursos`, `/instructor/cursos/{id}/view`, and related endpoints.
- Check authorization mechanisms (Policies, Gates, Middleware, Controller checks).
- Map how instructors are linked to courses/cohorts (`cursos_programados.user_id = auth()->id()`).
- Investigate HTTP 403 enforcement and admin bypass (`role:admin` / `is_admin` / Spatie permissions).
- Output report to e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_1\survey_backend_auth.md and deliver handoff.md.

## 2026-10-26T15:33:57Z
You are Explorer 1 (Backend Authorization Explorer) surveying Sapius 2 for Phase 3 (Instructor Module).
Your working directory is: e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_1
You MUST read the user's original request at: e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
Also read your dispatch instructions at: e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_1\DISPATCH.md

Your mission:
1. Explore routes/web.php, routes/api.php, routes/instructor.php or similar to locate routes for /instructor/cursos and /instructor/cursos/{id}/view.
2. Locate the controllers, middleware, policies, and gate definitions handling these routes.
3. Investigate how courses and cohorts (cursos_programados) are linked to instructors (user_id = auth()->id()).
4. Investigate current authorization enforcement and how HTTP 403 Forbidden is triggered on unauthorized access, as well as how admin bypass (role:admin) should work.
5. Write your detailed findings to e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_1\survey_backend_auth.md and produce a handoff.md in your working directory.
6. When finished, send a message to the orchestrator with a summary of findings.

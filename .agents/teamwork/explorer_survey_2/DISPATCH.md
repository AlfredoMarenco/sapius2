# Dispatch to Explorer 2: Cohort Students, Grades Breakdown & Schema

Target Working Directory: e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_2
Original Request: e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md

Mission: Survey database schema, models, relationships, and queries regarding cohorts, enrolled students, evaluations, and homework.
Specifically:
- Check tables and models for `cursos_programados`, `inscripciones`, `users`, `examenes`/`evaluaciones`/`intentos`/`calificaciones`, `tareas`/`homework`/`entregas`.
- Investigate how active enrolled students (`aceptado = 'si'`) are identified and queried.
- Investigate how evaluation scores and homework progress/scores are stored and linked to student enrolments.
- Note schema constraints (Schema Freeze: no migrations or table alterations allowed).
- Output report to e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_2\survey_cohorts_grades.md and deliver handoff.md.


## 2026-10-26T15:33:58Z
You are Explorer 2 (Cohorts & Grades Schema Explorer) surveying Sapius 2 for Phase 3 (Instructor Module).
Your working directory is: e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_2
You MUST read the user's original request at: e:\laragon\www\sapius2\.agents\teamwork\ORIGINAL_REQUEST.md
Also read your dispatch instructions at: e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_2\DISPATCH.md

Your mission:
1. Explore Eloquent models and database schema regarding courses, scheduled cohorts (cursos_programados), enrollments (inscripciones), students (users), evaluations/exams, and homework (tareas/homework).
2. Determine how active enrolled students (aceptado = 'si') are tracked and queried.
3. Determine how grades, attempts, scores, and progress for exams and homework are stored, calculated, and represented.
4. Note that schema freeze is in effect: no database migrations or table schema modifications are allowed.
5. Write your detailed findings to e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_2\survey_cohorts_grades.md and produce a handoff.md in your working directory.
6. When finished, send a message to the orchestrator with a summary of findings.

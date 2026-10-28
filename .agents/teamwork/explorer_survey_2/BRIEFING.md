# BRIEFING — 2026-10-26T15:47:00Z

## Mission
Explore and document Eloquent models, schema, and query patterns for cohorts (cursos_programados), enrolled students (inscripciones, aceptado = 'si'), exam grades, and homework in Sapius 2 under schema freeze.

## 🔒 My Identity
- Archetype: explorer
- Roles: Cohorts & Grades Schema Explorer, Investigator
- Working directory: e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_2
- Original parent: b5409e3d-eef2-47d6-9407-c36ee877a315
- Milestone: Phase 3 Instructor Module Survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Schema freeze in effect — no database migrations or table schema modifications allowed
- Write only to your folder: e:\laragon\www\sapius2\.agents\teamwork\explorer_survey_2

## Current Parent
- Conversation ID: b5409e3d-eef2-47d6-9407-c36ee877a315
- Updated: 2026-10-26T15:47:00Z

## Investigation State
- **Explored paths**: `cursos`, `cursos_programados`, `inscripciones`, `users`, `examenes`, `pruebas`, `homework`, `leccion_user`, `lesson_unlocks`, `CourseController.php`, `AcademicTrackingController.php`, `ExamResultController.php`, `Show.tsx`, `Results.tsx`, `StudentProgress.tsx`, `HomeworkTracking.tsx`
- **Key findings**: 
  1. Cohorts assigned to instructors via `cursos_programados.user_id = auth()->id()`.
  2. Active enrolled students strictly filtered by `inscripciones.aceptado = 'si'`.
  3. Columns `users.name` and `users.avatar` DO NOT exist in database (must query `nombre`, `apellido`, `foto`).
  4. Exam scores are stored in `examenes.score_total` (aliased as `score`), NOT `calificacion`.
  5. Homework submissions are tracked in `homework` by `(user_id, leccion_id)` without a numeric grade column.
  6. Course progress tracked via `leccion_user` completions.
  7. Strict schema freeze can be completely maintained with zero migrations.
- **Unexplored areas**: None, investigation complete.

## Key Decisions Made
- Documented full schema matrix and Eloquent mapping.
- Identified existing SQL 1054 defect in `Instructor/CourseController.php`.
- Formulated exact Eloquent query patterns for authorization and active student grades breakdown.
- Produced detailed survey report `survey_cohorts_grades.md` and `handoff.md`.

## Artifact Index
- DISPATCH.md — Task dispatch log
- BRIEFING.md — Persistent context & identity
- progress.md — Liveness heartbeat and step tracking
- survey_cohorts_grades.md — Detailed survey analysis
- handoff.md — 5-component hard handoff report

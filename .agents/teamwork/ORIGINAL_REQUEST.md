# Original User Request

## 2026-10-26T15:31:41Z

Implementar la Fase 3 de paridad en Sapius 2: Módulo del Instructor para gestión de cursos asignados, visualización de estudiantes matriculados por cohorte y consulta del desglose de calificaciones de exámenes y tareas.

Working directory: e:/laragon/www/sapius2
Integrity mode: development

## Requirements

### R1. Restricción y Autorización Estricta de Cursos Asignados
El instructor únicamente debe tener acceso a ver y gestionar los cursos y cohortes programadas (`cursos_programados`) donde figure explícitamente asignado como docente (`user_id = auth()->id()`). 
Cualquier intento de consultar o editar un curso ajeno debe arrojar HTTP 403 Forbidden.

### R2. Desglose de Estudiantes y Calificaciones por Cohorte
En la vista de detalle del curso (`/instructor/cursos/{id}/view`), el instructor debe visualizar la lista de alumnos activos inscritos en sus cohortes, mostrando su avance y las calificaciones obtenidas en las evaluaciones (`Examen`), pruebas interactivas y tareas (`Homework`).

### R3. Preservación del Esquema de Base de Datos (Schema Freeze)
Toda la lógica de consulta de calificaciones, cohortes y alumnos debe operar sobre el esquema de base de datos existente en producción, sin añadir migraciones ni alterar tablas existentes.

## Acceptance Criteria

### Control de Acceso y Autorización
- [ ] La consulta en `/instructor/cursos` únicamente lista cursos que posean cohortes asignadas al instructor autenticado (`user_id = auth()->id()`).
- [ ] Un intento de acceso a `/instructor/cursos/{id}/view` perteneciente a otro instructor responde con código HTTP 403.
- [ ] Los administradores (`role:admin`) conservan acceso total de supervisión sin verse restringidos.

### Vista de Alumnos y Calificaciones
- [ ] La pantalla de detalle muestra la cohorte seleccionada con la lista de alumnos aceptados (`aceptado = 'si'`).
- [ ] Se presenta el desglose de calificaciones por cada evaluación presentada por el alumno, con puntaje obtenido y estado.

### Calidad y Pruebas
- [ ] Existen pruebas automatizadas (Pest / PHPUnit) que verifican el cumplimiento de la política de autorización y la visualización de calificaciones.
- [ ] La ejecución de TypeScript check y la compilación de frontend finalizan sin errores.

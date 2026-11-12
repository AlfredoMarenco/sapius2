# Reglas de Trabajo con Subagentes en Sapius 2

## ⚠️ REGLA DE ORO: CONGELAMIENTO DE BASE DE DATOS (DATABASE SCHEMA FREEZE)
1. **La base de datos de producción NO se modifica ni se altera** hasta que la plataforma esté completamente terminada, probada y se realice la migración en producción.
2. **Prohibido ejecutar migraciones que alteren tablas o columnas existentes**.
3. Todo modelo de Eloquent en `sapius2` debe adaptarse al esquema existente de `../Sapius` usando casts, accessors, mutators o relaciones personalizadas en código PHP.

---

## 🤖 Catálogo de Subagentes y Asignación de Tareas

- **Análisis de Lógica Legacy y Consulta del Proyecto Original**:
  - Invocar `legacy-parity-analyst` para inspeccionar `../Sapius` (controladores, vistas Blade, lógica de negocio) y obtener las especificaciones de paridad sin tocar la BD.
- **Modificaciones de Backend Laravel 13**:
  - Invocar `laravel-backend-architect` para controladores, servicios, Fortify y lógica PHP.
- **Identidad de Marca, Landing Pages Públicas y Conversión UI/UX (Tailwind CSS v4 + Canva)**:
  - Invocar `public-ui-ux-architect` (apoyado en `.agents/skills/sapius-brand-design-system/SKILL.md` y `.agents/skills/tailwind-v4-landing-craft/SKILL.md`) para `LandingLayout`, `Welcome`, `pages/Public/*` y componentes comerciales.
- **Desarrollo de Vistas de Paneles Inertia / React 19 / Tailwind CSS v4**:
  - Invocar `react-inertia-frontend` para componentes internos, layouts de Alumno/Instructor/Admin, formularios y estilos.
- **Lógica de Simuladores, Exámenes, Reactivos y PDFs**:
  - Invocar `exam-eval-engine`.
- **Protección de Contenido, MAC, Strikes y App Desktop**:
  - Invocar `electron-security-sentinel`.
- **Pasarelas de Pago (Conekta, OpenPay, MercadoPago) y Cupones**:
  - Invocar `checkout-payments-specialist`.
- **Auditoría de Seguridad, Puertas Traseras y Vulnerabilidades OWASP**:
  - Invocar `app-security-auditor`.
- **Validación de Calidad, Tests Pest y Linters**:
  - Invocar `qa-lint-test-guardian`.
- **Despliegue, Sincronización y Mantenimiento en VPS (`sapius-vps` / `test.sapius.com.mx`)**:
  - Invocar `devops-release-engineer`.

---

## 🚦 Verificaciones Obligatorias Previas al Cierre de Tarea
Antes de dar por completada cualquier tarea que modifique código:
1. `npm run types:check` (o validación de `tsc --noEmit` sobre archivos modificados)
2. `php vendor/bin/pint --test` (o `composer lint:check`)
3. Verificar compatibilidad con la base de datos existente.

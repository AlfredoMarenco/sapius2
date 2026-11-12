# Subagentes Especializados de Sapius 2

Este documento describe el catálogo y las directrices operativas de los subagentes especializados configurados para el desarrollo, mantenimiento y evolución de la plataforma **Sapius 2**.

---

## 🏛️ 0. legacy-parity-analyst (Oráculo de Migración & Compatibilidad)
- **Rol**: Analista de Paridad Legacy y Guardián del Esquema
- **Especialidad**: Inspección del código original en `../Sapius` (Laravel 5.8, PHP 7.1, Blade, Shinobi), extracción de lógica de negocio, mapeo de modelos y control de paridad funcional.
- **Regla Crítica (Congelamiento de Base de Datos)**:
  - **PROHIBIDO MODIFICAR LA BASE DE DATOS**: La base de datos de producción no se puede alterar (ni añadir, modificar o renombrar columnas/tablas) hasta que todo el desarrollo esté completado y listo para migración final en producción.
  - Asegura que todos los modelos y consultas de `sapius2` se adapten al 100% al esquema de tablas original mediante casts, accessors y adaptadores en código PHP sin migraciones destructivas.
- **Alcance**:
  - Analizar controladores, vistas Blade y flujos legacy para instruir a `laravel-backend-architect`, `public-ui-ux-architect` y `react-inertia-frontend`.
  - Auditar que las nuevas implementaciones en Laravel 13 y React 19 mantengan idéntico comportamiento de negocio.
- **Herramientas**: Permisos de solo lectura para preservar la integridad del proyecto legacy y de la base de datos.

---

## 🏗️ 1. laravel-backend-architect
- **Rol**: Arquitecto y Desarrollador Backend Core
- **Especialidad**: Laravel 13, PHP 8.3+, Eloquent ORM, migraciones, seeds, Fortify auth, policies, Spatie permissions, actions, services, queues y API REST.
- **Alcance**:
  - Creación y mantenimiento de modelos (`app/Models`), controladores (`app/Http/Controllers/Admin`, `User`, `Instructor`, `Public`), migraciones y seeders.
  - Gestión de transacciones de base de datos seguras (`DB::transaction`) para matrículas, cohortes e inscripciones.
  - Asegurar la integridad de datos y el cumplimiento de las convenciones de Laravel 13 y Laravel Pint.
- **Herramientas**: Permisos de lectura, edición de código y ejecución de comandos artisan/composer.

---

## 🎨 2. react-inertia-frontend
- **Rol**: Especialista en Frontend, Inertia.js y UI/UX de Aplicación
- **Especialidad**: Inertia.js v3, React 19, TypeScript, Tailwind CSS v4, Radix UI primitives, Lucide Icons, Wayfinder, Framer Motion y Sonner (toasts).
- **Alcance**:
  - Desarrollo de vistas en `resources/js/pages` (Admin, Student/User, Instructor, Public) y componentes en `resources/js/components/ui`.
  - Integración con los skills `.agents/skills/sapius-brand-design-system/SKILL.md` y `.agents/skills/tailwind-v4-landing-craft/SKILL.md` al tocar vistas públicas.
  - Integración tipada con Wayfinder y validación de formularios mediante `useForm`.
  - Asegurar compilación estricta de TypeScript (`npm run types:check`) y estilo accesible y responsive.
- **Herramientas**: Permisos de lectura, edición de código y ejecución de scripts npm/vite.

---

## ✨ 2B. public-ui-ux-architect (Identidad de Marca, Landing Pages & Conversión)
- **Rol**: Arquitecto Principal de UI/UX, Identidad Pública y Conversión Comercial
- **Especialidad**: Maquetación fiel desde Canva (`DAHX9N88U7c`), Tailwind CSS v4 (`@theme`), React 19, Framer Motion v12, SVG/CSS 3D mockups, accesibilidad WCAG y optimización LCP/CLS.
- **Skills Base**:
  - `.agents/skills/sapius-brand-design-system/SKILL.md`
  - `.agents/skills/tailwind-v4-landing-craft/SKILL.md`
- **Alcance**:
  - Diseño y evolución de `LandingLayout.tsx`, `Welcome.tsx`, `resources/js/pages/Public/*` (`CoursesHub`, `CourseLanding`, `GuiasLanding`, `SimuladoresLanding`, `About`, `Pride`, `Contact`, `Legal`) y `resources/js/components/public/*` (`SapiusLogo`, `PlusGridPattern`, `MiniTestModal`, `PricingCard`, `FaqAccordion`).
  - Conexión comercial híbrida hacia `/checkout/{id}`, `/register` y WhatsApp con mensajes prellenados.
- **Herramientas**: Permisos de lectura, edición de código y compilación de frontend (`npm.cmd run build`).

---

## 📝 3. exam-eval-engine
- **Rol**: Ingeniero del Motor de Exámenes, Simuladores y Material Interactivo
- **Especialidad**: Evaluaciones académicas (`Quiz`, `Question`, `Answer`, `Exam`), importación masiva de reactivos con `PhpSpreadsheet`, renderizado de fórmulas con KaTeX, editor enriquecido TipTap y PDFs interactivos (`react-pdf`, `InteractivePdfAnswer`).
- **Alcance**:
  - Lógica de presentación de exámenes (`Take.tsx`, `Preview.tsx`, `Feedback.tsx`), temporizadores de reactivos y límites de intentos.
  - Algoritmos de importación/exportación de bancos de preguntas desde Excel.
  - Gestión y resolución de guías interactivas con captura de respuestas en tiempo real.
  - Prevención de fugas de respuestas correctas antes de la conclusión formal de la prueba.
- **Herramientas**: Permisos de lectura, edición y pruebas de integración.

---

## 🛡️ 4. electron-security-sentinel
- **Rol**: Centinela de Seguridad Desktop, Anti-Trampa y DRM
- **Especialidad**: Endpoints de la aplicación Electron (`api_token_auth`), validación de dirección MAC (`validate-mac`), sistema de advertencias/strikes (`UserStrikeHistory`, `CheckStrikes`), bloqueo preventivo de cuentas y streaming seguro de archivos y multimedia.
- **Alcance**:
  - Auditoría de los endpoints en `app/Http/Controllers/Api/ElectronPanelController` y `AuthController`.
  - Monitoreo de eventos sospechosos durante exámenes (pérdida de foco, capturas de pantalla, intentos de apertura de herramientas indebidas).
  - Protección de rutas de descarga directa para impedir scraping y piratería de contenidos de cursos.
- **Herramientas**: Permisos de lectura, edición y auditoría de controladores y middlewares.

---

## 💳 5. checkout-payments-specialist
- **Rol**: Integrador de Pagos, E-Commerce y Facturación
- **Especialidad**: Pasarelas Conekta, OpenPay y MercadoPago, ciclo de vida del checkout, cupones de descuento dinámicos (`Discount`), webhooks, callbacks y enrolamiento automático en cohortes programadas (`ScheduledCourse`).
- **Alcance**:
  - Implementación y mantenimiento de los flujos de compra en `CheckoutController` y `resources/js/pages/User/Checkout`.
  - Validación segura de transacciones e idempotencia en cobros y callbacks.
  - Creación atómica de matrículas (`Enrollment`) tras pago aprobado.
  - Cumplimiento de estándares de seguridad en manejo de datos de pago (sin almacenar datos sensibles de tarjetas).
- **Herramientas**: Permisos de lectura, edición y pruebas de pasarelas.

---

## 🧪 6. qa-lint-test-guardian
- **Rol**: Guardián de Pruebas Automatizadas y Calidad de Código
- **Especialidad**: Pest 4, PHPUnit, Laravel Pint (`pint`), ESLint 9, Prettier y TypeScript Compiler (`tsc`).
- **Alcance**:
  - Redacción y ejecución de pruebas unitarias y de integración (`tests/Feature`, `tests/Unit`).
  - Verificación del pipeline de calidad (`composer ci:check`, `npm run lint:check`, `npm run types:check`).
  - Detección temprana de regresiones y reporte de inconsistencias en el código antes del despliegue.
- **Herramientas**: Permisos de ejecución de suites de prueba, linters y reporte de cobertura.

---

## 🔒 7. app-security-auditor (Auditor de Ciberseguridad & Anti-Backdoors)
- **Rol**: Auditor de Seguridad y Hacking Ético
- **Especialidad**: Prevención de vulnerabilidades OWASP (SQLi, XSS, CSRF, IDOR, Mass Assignment), detección de puertas traseras (backdoors), secretos cableados, validación de webhooks y subida segura de archivos.
- **Alcance**:
  - Detección y erradicación de accesos ocultos, rutas bypass, credenciales hardcoded y funciones peligrosas (`eval`, `exec`, `unserialize`).
  - Verificación de políticas de autorización y prevención de IDOR en rutas de alumnos/instructores/admin.
  - Auditoría de `$fillable` en modelos para evitar manipulación indebida de roles y estados.
  - Validación de firmas criptográficas en webhooks de pago (OpenPay, Conekta, MercadoPago).
  - Protección de streaming de archivos privados y control de subidas (MIME-types, extensiones).
- **Herramientas**: Permisos de lectura, edición y pruebas de auditoría de seguridad.

---

## 🚀 8. devops-release-engineer (DevOps & Despliegues en VPS)
- **Rol**: Ingeniero Principal de DevOps, Automatización y Despliegues
- **Especialidad**: Servidor VPS HostGator (`sapius-vps` / `test.sapius.com.mx`), despliegues zero-downtime en `/home/wwsapi/sapius2`, PHP 8.3 (`/usr/local/bin/ea-php83`), sincronización Git, compilación de assets frontend y gestión de caché/permisos en Laravel.
- **Alcance**:
  - Verificación de pre-vuelo local (`npm.cmd run build`, `git status`, `git push origin master`).
  - Conexión vía SSH (`ssh sapius-vps`) para actualizar el repositorio en `/home/wwsapi/sapius2`, refrescar cachés de configuración/rutas/vistas y ajustar permisos (`wwsapi:wwsapi`).
  - Comprobación post-despliegue de disponibilidad (`HTTP 200 OK` en `https://test.sapius.com.mx`).
- **Herramientas**: Permisos de lectura, edición y ejecución de comandos locales y remotos vía SSH.

---

## 🔄 Protocolo de Orquestación

Cuando una tarea requiera intervención multidisciplinaria:
1. **Modelado y Datos**: `laravel-backend-architect` diseña controladores y endpoints API/Inertia respetando el congelamiento de esquema.
2. **Sitio Público e Identidad Visual**: `public-ui-ux-architect` maqueta y optimiza todas las páginas públicas y flujos de conversión comercial siguiendo los skills de marca.
3. **Interfaz de Paneles Internos**: `react-inertia-frontend` implementa las pantallas de Alumno, Instructor y Admin con tipado TypeScript estricto.
4. **Módulos Especiales**: Si involucra evaluaciones o PDF, interviene `exam-eval-engine`; si requiere seguridad Electron, interviene `electron-security-sentinel`; si requiere compras/cupones, interviene `checkout-payments-specialist`.
5. **Verificación y Despliegue**: `qa-lint-test-guardian` valida linters/tipos/tests y `devops-release-engineer` despliega a `test.sapius.com.mx` cuando el usuario lo solicite.

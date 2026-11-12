---
name: tailwind-v4-landing-craft
description: Best practices and engineering standards for building high-converting, accessible, and performant public landing pages in Sapius 2 using Tailwind CSS v4, React 19, Inertia.js v3, Radix UI, Lucide Icons, and Framer Motion v12.
---

# Tailwind CSS v4 & React 19 Landing Page Craft (Sapius 2)

Este skill equipa a los agentes de UI/UX y Frontend de **Sapius 2** con patrones técnicos modernos sobre el stack real instalado en `package.json`:
- **Tailwind CSS v4** (`@tailwindcss/vite` + directivas `@theme` en `resources/css/app.css`)
- **React 19** + **Inertia.js v3** (`@inertiajs/react`)
- **Framer Motion v12** (`framer-motion`)
- **Radix UI** (`radix-ui` / `@radix-ui/*`) + **Lucide React** (`lucide-react`)

---

## 1. Reglas de Tailwind CSS v4 (`resources/css/app.css`)

1. **Sin `tailwind.config.js` heredado**: En Tailwind v4 toda configuración de tokens vive en bloques `@theme` dentro de `resources/css/app.css`.
2. **Compatibilidad con Paneles Internos**:
   - **NUNCA** elimines ni renombres tokens existentes (`--color-brand-navy`, `--color-brand-blue`, `--color-brand-amber`, `--color-sidebar`, etc.), ya que los paneles de Alumno, Instructor y Admin dependen de ellos.
   - Añade nuevos tokens públicos bajo prefijos claros (`--color-sapius-navy: #101E33`, `--color-sapius-coral: #FF6B52`, `--color-sapius-sky: #CFE4FF`, `--color-sapius-peach: #FFD9CE`, `--color-sapius-whatsapp: #06C156`, `--font-display: 'Plus Jakarta Sans', ...`).
3. **Aislamiento de Modo Oscuro en Páginas Públicas**:
   - `app.blade.php` puede añadir `.dark` en `<html>` si el sistema operativo del visitante está en modo oscuro.
   - Envuelve `LandingLayout` en un contenedor explícito `bg-white text-[#101E33] color-scheme-light` para que los degradados celeste/durazno y tarjetas blancas del diseño de Canva jamás se rompan ni pierdan contraste cuando el visitante tenga Windows/macOS en Dark Mode.

---

## 2. Composición Visual Avanzada en CSS Puro / SVG

1. **Mesh Gradients sin Imágenes Pesadas**:
   - Crea fondos atmosféricos combinando capas absolutas `pointer-events-none` con `bg-[radial-gradient(circle_at_top_right,_#CFE4FF_0%,_transparent_60%)]` y `bg-[radial-gradient(circle_at_bottom_left,_#FFD9CE_0%,_transparent_55%)]` para obtener 0 ms de bloqueo de red y LCP instantáneo.
2. **Mockups 3D CSS/SVG de Alta Precisión**:
   - Para portadas de libros/manuales Sapius (`EGEL Nutrición`, `EGEL Medicina`) usa perspectiva CSS (`perspective-[1200px]`, lomo lateral con sombreado realista, cantos de páginas escalonados y sombras proyectadas suaves) combinada con el isotipo `s.` vectorial para que luzcan nítidos en pantallas Retina/4K.
3. **Cintas Diagonales (Corner Ribbons)**:
   - Dentro de una tarjeta `relative overflow-hidden`:
     ```tsx
     <div className="pointer-events-none absolute top-4 -right-10 w-36 rotate-45 bg-[#FF6B52] py-1 text-center text-[10px] font-extrabold tracking-wider text-white uppercase shadow-sm">
         {badge}
     </div>
     ```

---

## 3. Micro-interacciones y Animaciones (`framer-motion` v12)

1. **Entrada Progresiva Sutil**:
   - Usa `initial={{ opacity: 0, y: 18 }}` + `whileInView={{ opacity: 1, y: 0 }}` con `viewport={{ once: true, margin: '-60px' }}` y duraciones cortas (`0.35s–0.5s`, `easeOut`).
   - **No ocultes el Hero por completo en SSR/hidratación inicial** de forma que penalice LCP: el titular H1 y la imagen principal del Hero deben ser visibles de inmediato o animar sin retraso (`delay: 0`).
2. **Acordeones y Modales Accesibles**:
   - Para **Preguntas Frecuentes (FAQ)** y el **Mini-Test interactivo de 6 preguntas**, utiliza primitivos accesibles (Radix Dialog / estado controlado con navegación por teclado `Escape`, foco atrapado y `aria-expanded`) con transiciones suaves de altura/opacidad.

---

## 4. Responsividad y Conversión Comercial

1. **Mobile-First Real (`360px` -> `1440px+`)**:
   - Contenedor estándar `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`.
   - En móvil: apilar columnas del Hero manteniendo los CTAs (`Encuentra tu opción`, `Ver productos`, `Comprar`) visibles arriba del pliegue; grillas de 4 tarjetas pasan de `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
2. **Conexión Híbrida de Conversión**:
   - Todo botón `"Comprar"` resuelve dinámicamente hacia `/checkout/{scheduledCourseId}` si existe una cohorte activa coincidente en la prop `scheduledCourses`, o a `/register` como respaldo limpio.
   - Todo botón `"Lista de espera"` o `"Preventa"` abre WhatsApp con un mensaje prellenado contextual indicando el nombre exacto del paquete y área académica.
3. **Calidad de Código**:
   - Tipado estricto TypeScript (interfaces explícitas para paquetes, preguntas del test, FAQs y props de Inertia; cero errores en `tsc --noEmit` sobre los archivos creados/modificados).

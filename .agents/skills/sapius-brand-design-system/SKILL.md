---
name: sapius-brand-design-system
description: Oficial Sapius 2026/2027 public brand identity and UI/UX design system extracted from the Canva redesign (DAHX9N88U7c). Use whenever creating, editing, or reviewing any public-facing Sapius page, landing layout, pricing card, navbar, footer, or promotional component.
---

# Sapius Public Brand Design System (2026/2027)

Este skill define la identidad visual oficial para todas las páginas públicas de **Sapius 2**, basada en el maquetado de marca (`DAHX9N88U7c`). Cualquier agente que trabaje en páginas públicas (`Welcome.tsx`, `LandingLayout.tsx`, `resources/js/pages/Public/**` y `resources/js/components/public/**`) **DEBE** seguir estrictamente estos lineamientos.

---

## 1. Identidad de Marca: Wordmark e Isotipo

1. **Wordmark (`sapius.`)**:
   - Siempre en minúsculas geométricas con peso `extrabold` / `black` (`font-extrabold tracking-tight`).
   - Color base de las letras (`s`, `a`, `p`, `u`, `s` y tallo de `i`):
     - Sobre fondos claros: **Azul Marino Sapius** `#101E33`.
     - Sobre fondos oscuros (Footer / bloques navy): **Blanco** `#FFFFFF`.
   - **Acento Coral Obligatorio**: Tanto el **punto superior de la letra `i`** como el **punto final `.`** van en **Coral Vibrante** (`#FF6B52`). Implementar mediante componente SVG/React reusable (`SapiusLogo.tsx`) para garantizar nitidez infinita en cualquier resolución.
2. **Isotipo (`s.`)**:
   - Letra `s` minúscula audaz acompañada del punto `.` en Coral (`#FF6B52`).
   - Se utiliza en dos variantes:
     - **Badge/Icono** (ej. sobre "Conoce nuestro Método SUMA" o junto a "Preguntas frecuentes"): `s` en `#101E33` o `#FFFFFF` + punto en `#FF6B52`.
     - **Marca de agua monumental decorativa** en fondos Hero, FAQ y páginas de curso: `s.` gigante con relleno translúcido suave y punto coral.

---

## 2. Paleta de Colores Oficial

| Token Semántico | Hex | Uso Principal |
| :--- | :--- | :--- |
| `sapius-navy` | `#101E33` | Fondo de secciones oscuras (franja EGEL, Método SUMA, tira Mini-Test, Footer), tarjetas oscuras de productos, botones secundarios oscuros y texto titular principal. |
| `sapius-navy-soft` | `#192B47` | Superficies elevadas o bordes sutiles dentro de secciones navy. |
| `sapius-coral` | `#FF6B52` | Botones primarios (`Iniciar sesión`, `Ver más`, `Comprar`, `Realiza el test`), palabras destacadas en titulares (`tu ruta`, `curso necesitas?`, `complemento ideal`), bordes finos de tarjetas (`border-[#FF6B52]/45`) y cintas diagonales (*MÁS POPULAR*, *PROMOCIÓN*). |
| `sapius-coral-hover` | `#F0563C` | Estado `:hover` de botones primarios coral. |
| `sapius-sky-tint` | `#CFE4FF` | Degradados radiales suaves celestes en Hero de Inicio, Cursos, EGEL Medicina, Nosotros y Contacto. |
| `sapius-peach-tint` | `#FFD9CE` | Degradados radiales suaves durazno/coral claro en Hero de EGEL Nutrición, tarjetas KPI de "Nuestra experiencia" y acentos cálidos. |
| `sapius-whatsapp` | `#06C156` | Botones de acción directa telefónica y WhatsApp (`Contactar por WhatsApp`, `Enviar WhatsApp`, `Llamar ahora`). |
| `sapius-fb` | `#0A4DA6` | Botón oficial `Ver Facebook` en Contacto. |
| `sapius-ig` | `#C11F7E` | Botón oficial `Ver Instagram` en Contacto. |

> **Importante**: Las páginas públicas siempre se renderizan con estética luminosa + bloques de alto contraste `#101E33` (no invertir fondos claros públicos a negro grisáceo genérico).

---

## 3. Tipografía y Jerarquía

- **Fuente Principal**: `'Plus Jakarta Sans', 'DM Sans', sans-serif` (equivalente geométrico web libre de *NeuSans*, cargada con pesos `400, 500, 600, 700, 800`).
- **Escala Tipográfica**:
  - **H1 Hero**: `text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight text-[#101E33]`.
  - **H2 de Sección**: `text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold leading-[1.12] tracking-tight`.
  - **Subtítulos / Copy**: `text-base sm:text-lg text-[#101E33]/75 font-normal leading-relaxed`.
  - **Precios en Tarjetas**: monto principal en `text-2xl sm:text-3xl font-extrabold text-[#101E33]` (ej. `$999 mxn`) acompañado a la derecha de etiqueta `text-xs text-[#101E33]/65` (`Un solo pago` u `Opciones de pago`). Si existe precio anterior tachado (ej. `$6,750 mxn` o `$3,494 mxn`), mostrarlo debajo en `line-through text-sm font-bold text-[#101E33]/55`.

---

## 4. Elementos Gráficos y Patrones Decorativos

1. **Fondos Mesh / Degradados Suaves**:
   - Combinar base blanca `#FFFFFF` con esferas radiales difuminadas (`blur-3xl` o `radial-gradient`) en `#CFE4FF` (azul hielo) y `#FFD9CE` (durazno suave), evitando cortes duros entre bloques claros.
2. **Grilla Decorativa de Cruces (`+`) (`PlusGridPattern.tsx`)**:
   - Matriz geométrica de signos `+` pequeños (p. ej. `5 columnas × 8 filas` o `6 × 6`, espaciados uniformemente) ubicada en los márgenes laterales de las secciones.
   - En secciones claras: cruces en `#101E33` con opacidad `25%–40%` o `#FF6B52` suave.
   - En secciones oscuras (`#101E33`): cruces en `#FF6B52` con opacidad `45%–65%`.
3. **Botones Pill (`rounded-full`)**:
   - Todos los botones de acción pública son **cápsulas completas (`rounded-full`)** con `font-semibold` o `font-bold`, padding generoso (`px-6 py-2.5` o `px-8 py-3.5`) y transición suave `transition-all duration-200 hover:-translate-y-0.5`.
   - Variantes:
     - **Primary Coral**: `bg-[#FF6B52] text-white hover:bg-[#F0563C] shadow-sm`.
     - **Secondary Navy**: `bg-[#101E33] text-white hover:bg-[#1B2F4D] shadow-sm`.
     - **Outline Navy / Light**: `border border-[#101E33]/30 bg-white/80 text-[#101E33] hover:border-[#101E33]`.
     - **WhatsApp / Teléfono**: `bg-[#06C156] text-white hover:bg-[#05A84B]`.
4. **Tarjetas con Borde Coral y Cintas Diagonales**:
   - Las tarjetas blancas de precios, modalidades y contacto llevan `rounded-2xl bg-white/90 border border-[#FF6B52]/45 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.12)]`.
   - Las cintas de esquina superior derecha (*MÁS POPULAR*, *PROMOCIÓN*, *MUY PRONTO*, *PROMOCIÓN 2027*) rotadas a `45deg` dentro de un contenedor `overflow-hidden` en `#FF6B52` con texto blanco en mayúsculas `text-[10px] font-extrabold tracking-wider`.

---

## 5. Arquitectura de Navegación y Footer (`LandingLayout.tsx`)

- **Navbar Superior**:
  - Fondo claro/translúcido (`bg-white/85 backdrop-blur-md border-b border-[#101E33]/5 sticky top-0 z-50`).
  - Izquierda: Logo `sapius.`.
  - Centro: `Inicio` (`/`), `Cursos` (`/cursos`), `Nosotros` (`/nosotros`), `Orgullo Sapius` (`/orgullo-sapius`), `Contacto` (`/contacto`). El ítem activo se resalta en `font-extrabold text-[#101E33]`.
  - Derecha: Botón coral `Iniciar sesión` (`/login`) + Botón navy `Regístrate` (`/register`) — o `Ir a mi panel` si `auth.user` existe. En móvil, menú desplegable accesible.
- **Footer Oscuro (`bg-[#101E33] text-white`)**:
  - Cabecera izquierda: `¿Tienes dudas sobre qué ` + `<span className="text-[#FF6B52]">curso necesitas?</span>`, subtítulo *"Escríbenos y nuestro equipo te orientará según tu objetivo académico"* y botón coral `Contactar ahora`.
  - Centro inferior: Logo `sapius.` en blanco/coral + lema *"Tu formación, nuestra pasión"* + íconos circulares blancos de redes sociales (Facebook, Instagram, TikTok, WhatsApp).
  - Izquierda inferior: **Contacto** (`contacto@sapius.com.mx`, `123-456-7890`, enlace a `/privacidad` *Aviso de privacidad*).
  - Derecha: Enlaces de navegación (`Cursos`, `Nosotros`, `Orgullo Sapius`, `Universidades y equipos`, `Blog`) + grilla decorativa de `+` en coral.

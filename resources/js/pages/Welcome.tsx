import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';
import FaqAccordion, { type FaqItem } from '@/components/public/FaqAccordion';
import { openMiniTest } from '@/components/public/MiniTestModal';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import { SapiusIsotype } from '@/components/public/SapiusLogo';
import LandingLayout from '@/layouts/LandingLayout';

export interface TeacherRecord {
    id: number | string;
    name: string;
    description?: string | null;
    img?: string | null;
}

export interface WelcomeProps {
    slides?: unknown[];
    prides?: unknown[];
    teachers?: TeacherRecord[];
    reviews?: unknown[];
    scheduledCourses?: ScheduledCourseCandidate[];
}

const EXPERIENCE_KPIS = [
    {
        value: '+13',
        label: 'años de experiencia',
        icon: (
            <svg
                viewBox="0 0 36 36"
                className="h-7 w-7 stroke-[#101E33]"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="15" cy="14" r="6" />
                <path d="m12.8 14 1.6 1.6 3.2-3.2" />
                <path d="M9 28l2-3 2 1.5 2-2 2 2 2-1.5 2 3" />
                <path d="m25 11 1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L22 13.3l2-.3 1-2Z" />
            </svg>
        ),
    },
    {
        value: '99.1 %',
        label: 'aprobación y éxito',
        icon: (
            <svg
                viewBox="0 0 36 36"
                className="h-7 w-7 stroke-[#101E33]"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M18 6l3 2.2 3.7-.4 1.5 3.4 3.4 1.5-.4 3.7L31.4 19l-2.2 3 .4 3.7-3.4 1.5-1.5 3.4-3.7-.4-3 2.2-3-2.2-3.7.4-1.5-3.4-3.4-1.5.4-3.7L4.6 19l2.2-3-.4-3.7 3.4-1.5 1.5-3.4 3.7.4L18 6Z" />
                <path d="m13.5 18.5 3 3 6-6.5" />
            </svg>
        ),
    },
    {
        value: '+5',
        label: 'Premios Nacionales EGEL',
        icon: (
            <svg
                viewBox="0 0 36 36"
                className="h-7 w-7 stroke-[#101E33]"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M12 8h12v6a6 6 0 0 1-12 0V8Z" />
                <path d="M12 10H8v2a4 4 0 0 0 4 4" />
                <path d="M24 10h4v2a4 4 0 0 1-4 4" />
                <path d="M18 20v5" />
                <path d="M13 28h10" />
                <rect x="14" y="25" width="8" height="3" rx="1" />
            </svg>
        ),
    },
    {
        value: '+123',
        label: 'alumnos inscritos',
        icon: (
            <svg
                viewBox="0 0 36 36"
                className="h-7 w-7 stroke-[#101E33]"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="18" cy="11.5" r="4" />
                <path d="M10 27v-3.5a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5V27" />
                <path d="M12 22l6 3 6-3v6l-6 2.5L12 28v-6Z" />
            </svg>
        ),
    },
    {
        value: '7',
        label: 'Profesores certificados',
        icon: (
            <svg
                viewBox="0 0 36 36"
                className="h-7 w-7 stroke-[#101E33]"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M18 11c1.8-1.5 4.2-1 4.2 1.4 0 2.5-2 4.1-4.2 4.1s-4.2-1.6-4.2-4.1c0-2.4 2.4-2.9 4.2-1.4Z" />
                <path d="M18 9.5c0-1.5 1-2.5 2.2-2.5" />
                <rect x="9" y="19" width="18" height="4" rx="1" />
                <rect x="10" y="24" width="16" height="4" rx="1" />
            </svg>
        ),
    },
];

const PLACEHOLDER_EXPERTS: TeacherRecord[] = [
    {
        id: 'placeholder-1',
        name: 'L.N Nombre y Apellido',
        description: 'Texto complementario',
        img: null,
    },
    {
        id: 'placeholder-2',
        name: 'L.N Nombre y Apellido',
        description: 'Texto complementario',
        img: null,
    },
    {
        id: 'placeholder-3',
        name: 'L.N Nombre y Apellido',
        description: 'Texto complementario',
        img: null,
    },
];

const HOME_FAQS: FaqItem[] = [
    {
        id: 'tiempo',
        question: '¿Todavía estoy a tiempo?',
        answer: 'Sí. Contamos tanto con programas completos de 10 semanas como con modalidad 100% asincrónica, Guías Digitales y Simuladores independientes para adaptarnos exactamente al tiempo que falta para tu examen.',
    },
    {
        id: 'diferencia',
        question: '¿Qué diferencia hay entre los productos?',
        answer: 'La Guía + Simulador te brinda lectura de repaso y práctica autónoma; el Curso Asincrónico suma 10 semanas con videoclases, tareas y exámenes diarios a tu ritmo; y el Curso Premium incluye además guía impresa, kit físico, asesorías dominicales en vivo y garantía condicionada.',
    },
    {
        id: 'acceso',
        question: '¿Cuándo recibo mi acceso?',
        answer: 'Al confirmar tu inscripción en nuestra plataforma recibes tus credenciales para acceder a tu panel de alumno, y en paquetes con inicio programado o preventa te notificamos puntualmente cada apertura de bloque.',
    },
    {
        id: 'semanas',
        question: '¿Cuántas semanas son el curso completo?',
        answer: 'El curso completo tiene una duración de 10 semanas, estructuradas progresivamente con nuestro Método SUMA de lo sencillo a lo complejo.',
    },
];

export default function Welcome({
    teachers = [],
    scheduledCourses,
}: WelcomeProps) {
    const displayedExperts =
        Array.isArray(teachers) && teachers.length > 0
            ? teachers.slice(0, 6)
            : PLACEHOLDER_EXPERTS;

    const resolveTeacherImg = (img?: string | null) => {
        if (!img) return '/img/brand2026/expert-placeholder.png';
        if (img.startsWith('http') || img.startsWith('/')) return img;
        return `/media/stream/${img}`;
    };

    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Inicio — Sapius | Preparación EGEL Nutrición y Medicina" />

            {/* =========================================================
                SECCIÓN 1: HERO PRINCIPAL (Fiel a Canva Page 1)
               ========================================================= */}
            <section className="relative overflow-hidden bg-white pt-8 pb-0 lg:pt-12">
                {/* Fondos atmosféricos celeste + durazno suave */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 14% 25%, rgba(207, 228, 255, 0.88) 0%, rgba(207, 228, 255, 0.25) 36%, transparent 64%), radial-gradient(circle at 86% 42%, rgba(255, 217, 206, 0.92) 0%, rgba(255, 217, 206, 0.35) 38%, transparent 68%)',
                    }}
                />

                {/* Grilla de cruces + inferior izquierda */}
                <div className="pointer-events-none absolute bottom-6 left-4 opacity-55 sm:left-8">
                    <PlusGridPattern rows={5} cols={6} color="navy" gap={26} size={7} />
                </div>

                {/* Grilla de cruces + superior derecha en coral */}
                <div className="pointer-events-none absolute top-6 right-6 hidden opacity-65 md:block">
                    <PlusGridPattern rows={6} cols={4} color="coral" gap={26} size={7} />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-8">
                        {/* Columna Izquierda: Titular, Copy y CTAs */}
                        <div className="pb-10 lg:col-span-6 lg:py-16 xl:py-20">
                            <h1 className="font-display text-4xl leading-[1.06] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.45rem]">
                                Tu próximo logro merece una gran preparación
                            </h1>

                            <p className="mt-5 max-w-md text-base leading-relaxed font-normal text-[#101E33]/75 sm:text-lg">
                                Texto secundario para el uso y aplicación de la
                                tipografía NeuSans Trial
                            </p>

                            <div className="mt-8 flex flex-col items-start gap-3.5 sm:flex-row sm:flex-wrap lg:flex-col lg:items-start">
                                <button
                                    type="button"
                                    onClick={openMiniTest}
                                    className="inline-flex min-w-[230px] items-center justify-center rounded-full bg-[#101E33] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]"
                                >
                                    Encuentra tu opción
                                </button>

                                <Link
                                    href="/cursos"
                                    className="inline-flex min-w-[230px] items-center justify-center rounded-full border border-[#101E33]/25 bg-white/90 px-8 py-3 text-sm font-semibold text-[#101E33] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B52] hover:bg-[#FF6B52] hover:text-white"
                                >
                                    Ver productos
                                </Link>
                            </div>
                        </div>

                        {/* Columna Derecha: Isotipo s. monumental + Alumna PNG */}
                        <div className="relative flex justify-center lg:col-span-6 lg:justify-end">
                            {/* Grilla central sutil detrás de los libros */}
                            <div className="pointer-events-none absolute bottom-16 left-4 hidden opacity-25 sm:block">
                                <PlusGridPattern
                                    rows={4}
                                    cols={4}
                                    color="navy"
                                    gap={24}
                                    size={6}
                                />
                            </div>

                            {/* Isotipo s. gigante a la derecha detrás de la alumna */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute right-0 bottom-5 z-0 translate-x-2 sm:right-2 sm:bottom-6"
                            >
                                <SapiusIsotype
                                    variant="dark"
                                    size="hero"
                                    className="h-44 sm:h-56 lg:h-64"
                                />
                            </div>

                            <img
                                src="/img/brand2026/hero-student-home.png"
                                alt="Alumna preparándose con Sapius"
                                className="relative z-10 h-auto max-h-[430px] w-auto object-contain sm:max-h-[490px] lg:mr-14 lg:max-h-[520px]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 2: FRANJA OSCURA EGEL NUTRICIÓN / EGEL MEDICINA
               ========================================================= */}
            <section className="relative overflow-hidden bg-[#101E33] py-14 text-white sm:py-16">
                {/* Grillas de + laterales */}
                <div className="pointer-events-none absolute top-1/2 left-4 hidden -translate-y-1/2 opacity-65 md:block">
                    <PlusGridPattern rows={5} cols={4} color="coral" gap={26} size={7} />
                </div>
                <div className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 opacity-65 md:block">
                    <PlusGridPattern rows={4} cols={5} color="coral" gap={26} size={7} />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-14">
                        {/* Bloque EGEL Nutrición */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-4">
                                {/* Ícono lineal coral manzana + corazón */}
                                <svg
                                    viewBox="0 0 52 52"
                                    className="h-13 w-13 shrink-0 stroke-[#FF6B52]"
                                    fill="none"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M29 14c0-3.5 2.8-6 6.2-6-.2 3.4-2.8 6-6.2 6Z" />
                                    <path d="M27.5 15c-2.5-1.8-5.6-2-8.2-.4-3.7 2.2-5 7.4-3.5 12.6" />
                                    <path d="M29.5 15c2.5-1.8 5.8-2 8.4-.3 4 2.5 5 8.5 2.4 14.5-2.1 5-5.3 8.8-8.3 8.8-1.5 0-2.6-.7-3.8-.7-1.2 0-2.3.7-3.8.7" />
                                    {/* Corazón con pulso inferior izquierdo */}
                                    <path d="M16.5 39.5c-4.5-3-7.5-5.8-7.5-9.2 0-2.5 2-4.3 4.3-4.3 1.4 0 2.6.7 3.2 1.8.6-1.1 1.8-1.8 3.2-1.8 2.3 0 4.3 1.8 4.3 4.3 0 3.4-3 6.2-7.5 9.2Z" />
                                    <path d="M11.5 31.5h2.5l1.2-2.2 1.8 4.2 1.3-2h2.7" />
                                </svg>

                                <div className="font-display text-2xl leading-[1.08] font-extrabold tracking-tight text-white sm:text-3xl">
                                    <span className="block">EGEL</span>
                                    <span className="block">Nutrición</span>
                                </div>
                            </div>

                            <Link
                                href="/egel-plus-nutricion"
                                className="mt-5 inline-flex w-full max-w-[230px] items-center justify-center rounded-full bg-[#FF6B52] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                Ver más
                            </Link>
                        </div>

                        {/* Bloque EGEL Medicina */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-4">
                                {/* Ícono lineal coral estetoscopio */}
                                <svg
                                    viewBox="0 0 52 52"
                                    className="h-13 w-13 shrink-0 stroke-[#FF6B52]"
                                    fill="none"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M14 11h-3v9a9 9 0 0 0 18 0v-9h-3" />
                                    <path d="M14 9v4" />
                                    <path d="M26 9v4" />
                                    <path d="M20 29v5a8 8 0 0 0 16 0v-7" />
                                    <circle cx="36" cy="24" r="3.5" />
                                </svg>

                                <div className="font-display text-2xl leading-[1.08] font-extrabold tracking-tight text-white sm:text-3xl">
                                    <span className="block">EGEL</span>
                                    <span className="block">Medicina</span>
                                </div>
                            </div>

                            <Link
                                href="/egel-plus-medicina"
                                className="mt-5 inline-flex w-full max-w-[230px] items-center justify-center rounded-full bg-[#FF6B52] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                Ver más
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 3: NUESTRA EXPERIENCIA (5 KPIs exactos)
               ========================================================= */}
            <section className="bg-white py-16 sm:py-20 lg:py-24">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.35 }}
                        className="text-center font-display text-3xl font-extrabold tracking-tight text-[#101E33] sm:text-4xl"
                    >
                        Nuestra experiencia
                    </motion.h2>

                    <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
                        {EXPERIENCE_KPIS.map((kpi, idx) => (
                            <motion.div
                                key={kpi.label}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{
                                    duration: 0.35,
                                    delay: idx * 0.05,
                                }}
                                className="flex flex-col items-center text-center"
                            >
                                {/* Tarjeta cuadrada redondeada con degradado durazno/coral suave */}
                                <div
                                    className="flex h-18 w-18 items-center justify-center rounded-2xl border border-[#FF6B52]/20 shadow-sm"
                                    style={{
                                        background:
                                            'linear-gradient(145deg, #FFF3EE 0%, #FFC8B8 58%, #FF9B85 100%)',
                                    }}
                                >
                                    {kpi.icon}
                                </div>

                                <div className="mt-4 font-display text-2xl font-extrabold tracking-tight text-[#101E33] sm:text-[1.7rem]">
                                    {kpi.value}
                                </div>
                                <div className="mt-0.5 max-w-[120px] text-xs leading-tight font-medium text-[#101E33]/75">
                                    {kpi.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 4: CONOCE NUESTRO MÉTODO SUMA
               ========================================================= */}
            <section className="relative overflow-hidden bg-[#101E33] py-20 text-white lg:py-24">
                {/* Grillas de + coral (arriba derecha) y blanca/tenue (abajo izquierda) */}
                <div className="pointer-events-none absolute top-8 right-6 hidden opacity-65 md:block">
                    <PlusGridPattern rows={6} cols={5} color="coral" gap={26} size={7} />
                </div>
                <div className="pointer-events-none absolute bottom-6 left-6 hidden opacity-25 md:block">
                    <PlusGridPattern rows={4} cols={7} color="white" gap={26} size={7} />
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                        {/* Izquierda: Isotipo s. + Título + Párrafo íntegro */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.4 }}
                            className="lg:col-span-6"
                        >
                            <SapiusIsotype variant="light" size="md" />

                            <h2 className="mt-6 font-display text-3xl leading-[1.12] font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
                                Conoce nuestro
                                <br />
                                Método SUMA
                            </h2>

                            <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                                Cuatro eslabones: de lo sencillo a lo complejo.
                                Es nuestro sistema de aprendizaje estructurado
                                en 4 bloques estratégicos diseñado para guiarte
                                paso a paso desde el primer día hasta tu examen.
                                En lugar de saturarte con teoría, SUMA combina
                                videoclases diarias, práctica progresiva con
                                simuladores y acompañamiento en vivo para
                                consolidar tus conocimientos de forma clara,
                                constante y efectiva.
                            </p>
                        </motion.div>

                        {/* Derecha: Engranes 3D plateados */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.45 }}
                            className="flex justify-center lg:col-span-6"
                        >
                            <img
                                src="/img/brand2026/gears-suma.png"
                                alt="Engranes del Método SUMA Sapius"
                                className="h-auto w-full max-w-[380px] object-contain drop-shadow-[0_24px_38px_rgba(0,0,0,0.45)] sm:max-w-[430px]"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 5: ¿CUÁL PRODUCTO NECESITO Y QUÉ INCLUYE?
               ========================================================= */}
            <section className="relative overflow-hidden bg-white py-20 lg:py-24">
                {/* Fondo atmosférico celeste inferior izquierdo + durazno suave */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 22% 78%, rgba(207, 228, 255, 0.85) 0%, rgba(207, 228, 255, 0.28) 38%, transparent 65%), radial-gradient(circle at 85% 30%, rgba(255, 217, 206, 0.45) 0%, transparent 55%)',
                    }}
                />

                {/* Grillas de + coral arriba izquierda y abajo derecha */}
                <div className="pointer-events-none absolute top-12 left-4 hidden opacity-60 md:block">
                    <PlusGridPattern rows={6} cols={4} color="coral" gap={26} size={7} />
                </div>
                <div className="pointer-events-none absolute right-6 bottom-8 hidden opacity-65 md:block">
                    <PlusGridPattern rows={4} cols={9} color="coral" gap={26} size={7} />
                </div>

                {/* Marca de agua sutil del isotipo s. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
                >
                    <SapiusIsotype variant="watermark" size="hero" className="h-80" />
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.35 }}
                        className="text-center font-display text-2xl font-extrabold tracking-tight text-[#101E33] sm:text-3xl lg:text-4xl"
                    >
                        ¿Cuál producto necesito y qué incluye?
                    </motion.h2>

                    {/* 3 Tarjetas verticales #101E33 redondeadas */}
                    <div className="mt-12 grid grid-cols-1 items-start gap-7 lg:grid-cols-3">
                        {/* Tarjeta 1: Guía + Simulador */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.35 }}
                            className="flex flex-col justify-between rounded-3xl bg-[#101E33] p-7 text-white shadow-[0_22px_45px_-18px_rgba(16,30,51,0.45)] sm:p-8"
                        >
                            <div>
                                <div className="text-center text-[11px] font-medium tracking-[0.25em] text-white/50 uppercase">
                                    curso online
                                </div>

                                <div className="mt-5 flex items-center gap-3.5">
                                    <svg
                                        viewBox="0 0 36 36"
                                        className="h-9 w-9 shrink-0 stroke-[#FF6B52]"
                                        fill="none"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M6 10c4-1.5 8-1.5 12 0v18c-4-1.5-8-1.5-12 0V10Z" />
                                        <path d="M30 10c-4-1.5-8-1.5-12 0v18c4-1.5 8-1.5 12 0V10Z" />
                                        <circle cx="18" cy="6" r="2" />
                                    </svg>
                                    <h3 className="font-display text-xl leading-tight font-extrabold text-white">
                                        Guía +
                                        <br />
                                        Simulador
                                    </h3>
                                </div>

                                <ul className="mt-6 space-y-2.5 text-xs leading-relaxed text-white/85">
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white" />
                                        <span>
                                            Libro digital de repaso en la
                                            plataforma.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white" />
                                        <span>
                                            Batería de simuladores de la edición
                                            contratada, con preguntas, tiempo,
                                            intentos y retroalimentación según
                                            instrumento.
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Link
                                    href="/cursos#guias-simuladores"
                                    className="inline-flex w-full max-w-[185px] items-center justify-center rounded-full bg-[#FF6B52] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                >
                                    Ver más
                                </Link>
                            </div>
                        </motion.div>

                        {/* Tarjeta 2: Curso asincrónico */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.35, delay: 0.08 }}
                            className="flex flex-col justify-between rounded-3xl bg-[#101E33] p-7 text-white shadow-[0_22px_45px_-18px_rgba(16,30,51,0.45)] sm:p-8"
                        >
                            <div>
                                <div className="text-center text-[11px] font-medium tracking-[0.25em] text-white/50 uppercase">
                                    curso online
                                </div>

                                <div className="mt-5 flex items-center gap-3.5">
                                    <svg
                                        viewBox="0 0 36 36"
                                        className="h-9 w-9 shrink-0 stroke-[#FF6B52]"
                                        fill="none"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M18 8a7 7 0 0 0-7 7v4a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5v-4a7 7 0 0 0-7-7Z" />
                                        <path d="M14 14h8" />
                                        <path d="M14 18h5" />
                                        <path d="M12 28h12" />
                                    </svg>
                                    <h3 className="font-display text-xl leading-tight font-extrabold text-white">
                                        Curso
                                        <br />
                                        asincrónico
                                    </h3>
                                </div>

                                <ul className="mt-6 space-y-1.5 text-xs leading-relaxed text-white/85">
                                    {[
                                        '10 semanas',
                                        'videoclases',
                                        'lecturas',
                                        'tareas',
                                        'exámenes diarios',
                                        'retroalimentación',
                                        'guía digital',
                                        'Simuladores digitales',
                                    ].map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-2"
                                        >
                                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Link
                                    href="/egel-plus-nutricion#paquetes"
                                    className="inline-flex w-full max-w-[185px] items-center justify-center rounded-full bg-[#FF6B52] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                >
                                    Ver más
                                </Link>
                            </div>
                        </motion.div>

                        {/* Tarjeta 3: Curso premium */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.35, delay: 0.16 }}
                            className="flex flex-col justify-between rounded-3xl bg-[#101E33] p-7 text-white shadow-[0_22px_45px_-18px_rgba(16,30,51,0.45)] sm:p-8"
                        >
                            <div>
                                <div className="text-center text-[11px] font-medium tracking-[0.25em] text-white/50 uppercase">
                                    curso online
                                </div>

                                <div className="mt-5 flex items-center gap-3.5">
                                    <svg
                                        viewBox="0 0 36 36"
                                        className="h-9 w-9 shrink-0 stroke-[#FF6B52]"
                                        fill="none"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="6"
                                            y="12"
                                            width="20"
                                            height="14"
                                            rx="2"
                                        />
                                        <path d="M4 28h24" />
                                        <path d="m22 7 6 2.5-6 2.5-6-2.5L22 7Z" />
                                    </svg>
                                    <h3 className="font-display text-xl leading-tight font-extrabold text-white">
                                        Curso
                                        <br />
                                        premium
                                    </h3>
                                </div>

                                <ul className="mt-6 space-y-1.5 text-xs leading-relaxed text-white/85">
                                    {[
                                        '10 semanas',
                                        'Video clases.',
                                        'Lecturas.',
                                        'tareas.',
                                        'Exámenes diarios.',
                                        'Retroalimentación.',
                                        'Guía digital e impresa.',
                                        'Simuladores digitales y compacto.',
                                        'Asesorías en vivo dominicales y finales.',
                                        'Garantía condicionada.',
                                    ].map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-2"
                                        >
                                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Link
                                    href="/egel-plus-nutricion#paquetes"
                                    className="inline-flex w-full max-w-[185px] items-center justify-center rounded-full bg-[#FF6B52] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                >
                                    Ver más
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bloque inferior izquierdo: WhatsApp directo */}
                    <div className="mt-10 max-w-xs">
                        <p className="text-base leading-snug font-normal text-[#101E33]">
                            Conoce todas las
                            <br />
                            opciones adaptadas a ti.
                        </p>
                        <a
                            href="https://api.whatsapp.com/send?phone=521234567890&text=Hola%20Sapius%2C%20quiero%20conocer%20las%20opciones%20de%20estudio%20adaptadas%20a%20m%C3%AD."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#06C156] px-7 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#05A84B]"
                        >
                            Contactar por WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 6: TIRA OSCURA MINI-TEST
               ========================================================= */}
            <section className="bg-[#101E33] py-14 text-center text-white sm:py-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                        ¿No sabes por dónde empezar?
                    </h2>
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={openMiniTest}
                            className="inline-flex min-w-[210px] items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                        >
                            Realiza el test
                        </button>
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 7: CONOCE A NUESTROS EXPERTOS
               ========================================================= */}
            <section className="relative overflow-hidden bg-white py-20 lg:py-24">
                {/* Grilla derecha en coral y grilla inferior izquierda en navy */}
                <div className="pointer-events-none absolute top-8 right-6 hidden opacity-65 md:block">
                    <PlusGridPattern rows={6} cols={4} color="coral" gap={26} size={7} />
                </div>
                <div className="pointer-events-none absolute bottom-4 left-6 hidden opacity-50 md:block">
                    <PlusGridPattern rows={3} cols={6} color="navy" gap={26} size={7} />
                </div>

                <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.35 }}
                        className="text-center font-display text-2xl font-extrabold tracking-tight text-[#FF6B52] sm:text-3xl lg:text-4xl"
                    >
                        Conoce a nuestros expertos
                    </motion.h2>

                    <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
                        {displayedExperts.map((expert, idx) => (
                            <motion.div
                                key={expert.id}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{
                                    duration: 0.35,
                                    delay: idx * 0.06,
                                }}
                                className="flex flex-col items-center text-center"
                            >
                                {/* Contenedor con silueta limpia + halo celeste/durazno suave */}
                                <div className="relative flex h-56 w-56 items-end justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#CFE4FF]/45 via-white to-[#FFD9CE]/50">
                                    <img
                                        src={resolveTeacherImg(expert.img)}
                                        alt={expert.name}
                                        className="h-52 w-auto object-contain object-bottom"
                                    />
                                </div>

                                <h3 className="mt-4 font-display text-base font-extrabold text-[#101E33] sm:text-lg">
                                    {expert.name}
                                </h3>
                                <p className="mt-0.5 text-xs font-medium text-[#FF6B52]">
                                    {expert.description ||
                                        'Texto complementario'}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 8: PREGUNTAS FRECUENTES
               ========================================================= */}
            <section className="relative overflow-hidden bg-white py-16 lg:py-22">
                {/* Sutil degradado cálido izquierdo */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 18% 60%, rgba(245, 240, 236, 0.9) 0%, transparent 55%)',
                    }}
                />

                <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                        {/* Izquierda: Cabecera con ícono coral + Acordeón */}
                        <div className="lg:col-span-7">
                            <div className="flex items-center gap-4">
                                <div
                                    className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-[#FF6B52]/20 shadow-sm"
                                    style={{
                                        background:
                                            'linear-gradient(145deg, #FFF3EE 0%, #FFC5B4 100%)',
                                    }}
                                >
                                    <svg
                                        viewBox="0 0 32 32"
                                        className="h-6 w-6 stroke-[#101E33]"
                                        fill="none"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="5"
                                            y="7"
                                            width="18"
                                            height="14"
                                            rx="3"
                                        />
                                        <path d="M10 21v4l4-4" />
                                        <path d="M12.5 12.2a2 2 0 1 1 2.8 1.8c-.7.4-1.3.9-1.3 1.7" />
                                        <circle
                                            cx="14"
                                            cy="18"
                                            r="0.7"
                                            className="fill-[#101E33]"
                                        />
                                    </svg>
                                </div>

                                <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#101E33] sm:text-3xl">
                                    Preguntas frecuentes
                                </h2>
                            </div>

                            <div className="mt-7">
                                <FaqAccordion
                                    items={HOME_FAQS}
                                    defaultOpenId="semanas"
                                />
                            </div>
                        </div>

                        {/* Derecha: Isotipo gigante s. + Botón Ver más */}
                        <div className="flex flex-col items-center justify-center lg:col-span-5">
                            <SapiusIsotype
                                variant="dark"
                                size="hero"
                                className="h-36 sm:h-44"
                            />

                            <Link
                                href="/contacto"
                                className="mt-6 inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                Ver más
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 9: CTA PRE-FOOTER ("Empieza hoy tu ruta de estudio")
               ========================================================= */}
            <section className="relative overflow-hidden bg-white py-18 sm:py-22">
                {/* Grillas laterales */}
                <div className="pointer-events-none absolute top-1/2 left-6 hidden -translate-y-1/2 opacity-55 md:block">
                    <PlusGridPattern rows={6} cols={2} color="navy" gap={26} size={7} />
                </div>
                <div className="pointer-events-none absolute right-6 bottom-4 hidden opacity-65 md:block">
                    <PlusGridPattern rows={2} cols={7} color="coral" gap={26} size={7} />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#101E33] sm:text-4xl lg:text-[2.6rem]">
                        Empieza hoy{' '}
                        <span className="text-[#FF6B52]">tu ruta</span> de
                        estudio
                    </h2>

                    <div className="mt-7">
                        <Link
                            href="/cursos"
                            className="inline-flex min-w-[230px] items-center justify-center rounded-full bg-[#101E33] px-9 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]"
                        >
                            Cursos y paquetes
                        </Link>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

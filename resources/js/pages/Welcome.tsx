import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import FaqSection from '@/components/public/FaqSection';
import { openMiniTest } from '@/components/public/MiniTestModal';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import { WHATSAPP_PHONE } from '@/components/public/PricingCard';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import { SapiusIsotype } from '@/components/public/SapiusLogo';
import LandingLayout from '@/layouts/LandingLayout';

export interface WelcomeProps {
    scheduledCourses?: ScheduledCourseCandidate[];
}

const EXPERIENCE_KPIS = [
    {
        value: '+13',
        lines: ['años de', 'experiencia'],
        icon: (
            <svg
                viewBox="0 0 40 40"
                className="relative z-10 h-12 w-12 stroke-[#101E33] sm:h-13 sm:w-13"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                {/* Círculo con check grande que sobresale */}
                <path d="M27 16.5a8 8 0 1 1-4.8-7.3" />
                <path d="m15.2 15.2 3.2 3.2 9.4-9.4" />
                {/* 3 estrellas inferiores (central más grande) */}
                <path d="m11 24.5 1.1 2.2 2.4.4-1.7 1.7.4 2.4-2.2-1.1-2.2 1.1.4-2.4-1.7-1.7 2.4-.4 1.1-2.2Z" />
                <path d="m20 26.2 1.4 2.8 3.1.5-2.2 2.2.5 3.1-2.8-1.5-2.8 1.5.5-3.1-2.2-2.2 3.1-.5 1.4-2.8Z" />
                <path d="m29 24.5 1.1 2.2 2.4.4-1.7 1.7.4 2.4-2.2-1.1-2.2 1.1.4-2.4-1.7-1.7 2.4-.4 1.1-2.2Z" />
            </svg>
        ),
    },
    {
        value: '99.1 %',
        lines: ['aprobación', 'y éxito'],
        icon: (
            <svg
                viewBox="0 0 40 40"
                className="relative z-10 h-12 w-12 stroke-[#101E33] sm:h-13 sm:w-13"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M20 7.5l3 2.1 3.7-.3 1.4 3.4 3.4 1.4-.3 3.7L33.3 20l-2.1 3 .3 3.7-3.4 1.4-1.4 3.4-3.7-.3-3 2.1-3-2.1-3.7.3-1.4-3.4-3.4-1.4.3-3.7L6.7 20l2.1-3-.3-3.7 3.4-1.4 1.4-3.4 3.7.3 3-2.1Z" />
                <path d="m14.8 20.4 3.5 3.5 7.2-7.4" />
            </svg>
        ),
    },
    {
        value: '+5',
        lines: ['Premios', 'Nacionales EGEL'],
        icon: (
            <svg
                viewBox="0 0 40 40"
                className="relative z-10 h-12 w-12 stroke-[#101E33] sm:h-13 sm:w-13"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M13 8.5h14v7a7 7 0 0 1-14 0v-7Z" />
                <path d="M13 10.5H9.2v2.2a4.5 4.5 0 0 0 4.3 4.5" />
                <path d="M27 10.5h3.8v2.2a4.5 4.5 0 0 1-4.3 4.5" />
                <path d="m20 12 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3 1-2Z" />
                <path d="M20 22.5v4.5" />
                <rect x="14.5" y="27" width="11" height="3" rx="0.8" />
                <rect x="12.5" y="30" width="15" height="2.8" rx="0.8" />
            </svg>
        ),
    },
    {
        value: '+2,000',
        lines: ['alumnos', 'inscritos'],
        icon: (
            <svg
                viewBox="0 0 40 40"
                className="relative z-10 h-12 w-12 stroke-[#101E33] sm:h-13 sm:w-13"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="20" cy="12" r="4.6" />
                <path d="M12.5 22.5c1.5-2.2 4.2-3.5 7.5-3.5s6 1.3 7.5 3.5" />
                <path d="M11.5 21.5 20 24.5l8.5-3v9.2L20 33.2l-8.5-2.5v-9.2Z" />
                <path d="M20 24.5v8.7" />
            </svg>
        ),
    },
    {
        value: '7',
        lines: ['Profesores', 'certificados'],
        icon: (
            <svg
                viewBox="0 0 40 40"
                className="relative z-10 h-12 w-12 stroke-[#101E33] sm:h-13 sm:w-13"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                {/* Manzana superior */}
                <path d="M20 11.2c2-1.6 4.8-1 4.8 1.6 0 2.8-2.2 4.6-4.8 4.6s-4.8-1.8-4.8-4.6c0-2.6 2.8-3.2 4.8-1.6Z" />
                <path d="M20 11c0-2 1.2-3.2 2.8-3.2" />
                {/* 3 libros apilados con separador */}
                <rect x="10.5" y="19" width="19" height="4" rx="1.2" />
                <rect x="9.5" y="23" width="21" height="4" rx="1.2" />
                <rect x="10.5" y="27" width="19" height="4" rx="1.2" />
                <path d="M14.5 27v6l1.8-1.2 1.8 1.2v-6" />
            </svg>
        ),
    },
];

const SUMA_STEPS = [
    {
        title: 'Comienza por lo básico',
        description: 'Aprende los conceptos y fundamentos de cada tema.',
        icon: (
            <img
                src="/img/brand2026/suma/suma-icon-1.png"
                alt=""
                aria-hidden="true"
                className="h-11 w-11 object-contain select-none"
            />
        ),
    },
    {
        title: 'Construye conocimientos',
        description:
            'Cada nuevo tema se relaciona con los anteriores y agrega información.',
        icon: (
            <img
                src="/img/brand2026/suma/suma-icon-2.png"
                alt=""
                aria-hidden="true"
                className="h-11 w-11 object-contain select-none"
            />
        ),
    },
    {
        title: 'Avanza progresivamente',
        description:
            'Se incorporan contenidos de mayor complejidad conforme se consolidan las bases.',
        icon: (
            <img
                src="/img/brand2026/suma/suma-icon-3.png"
                alt=""
                aria-hidden="true"
                className="h-11 w-11 object-contain select-none"
            />
        ),
    },
    {
        title: 'Integra lo aprendido',
        description: 'Conecta todos los conocimientos y aprende a aplicarlos.',
        icon: (
            <img
                src="/img/brand2026/suma/suma-icon-4.png"
                alt=""
                aria-hidden="true"
                className="h-11 w-11 object-contain select-none"
            />
        ),
    },
    {
        title: 'Evalúa y refuerza',
        description:
            'Mediante actividades y simuladores identifica errores y fortalece tus áreas de oportunidad.',
        icon: (
            <img
                src="/img/brand2026/suma/suma-icon-5.png"
                alt=""
                aria-hidden="true"
                className="h-11 w-11 object-contain select-none"
            />
        ),
    },
];

export default function Welcome({ scheduledCourses }: WelcomeProps) {

    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Inicio — Sapius | Preparación EGEL Nutrición y Medicina" />

            {/* =========================================================
                SECCIÓN 1: HERO PRINCIPAL (Proporción 1:1 con page1_s1_y0.png)
               ========================================================= */}
            <section className="relative overflow-hidden bg-white pt-24 pb-0 sm:pt-28 lg:pt-30">
                {/* Degradado celeste izquierda + durazno derecha cubriendo desde top: 0 (detrás del navbar fijo) */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 12% 38%, rgba(207, 228, 255, 0.95) 0%, rgba(207, 228, 255, 0.42) 34%, transparent 60%), radial-gradient(circle at 86% 48%, rgba(242, 198, 180, 0.88) 0%, rgba(255, 217, 206, 0.55) 38%, transparent 68%)',
                    }}
                />

                {/* Grilla de cruces + inferior izquierda (5x6 navy) */}
                <div className="pointer-events-none absolute bottom-5 left-3 opacity-80 sm:left-6">
                    <PlusGridPattern
                        rows={5}
                        cols={6}
                        color="navy"
                        gap={32}
                        size={8}
                    />
                </div>

                {/* Grilla de cruces + superior derecha en coral (6x4) */}
                <div className="pointer-events-none absolute top-24 right-5 hidden opacity-85 md:block lg:right-8">
                    <PlusGridPattern
                        rows={6}
                        cols={4}
                        color="coral"
                        gap={32}
                        size={8}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
                    <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-6">
                        {/* Columna Izquierda: Titular 3 líneas, Subtítulo y 2 CTAs iguales */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            className="pb-10 lg:col-span-6 lg:pt-10 lg:pb-16"
                        >
                            <h1 className="font-display text-4xl leading-[1.03] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.95rem]">
                                Tu próximo logro
                                <br className="hidden sm:block" /> merece una
                                gran
                                <br className="hidden sm:block" /> preparación
                            </h1>

                            <p className="mt-5 max-w-[460px] text-base leading-[1.45] font-normal text-[#101E33]/85 sm:text-[19px]">
                                Prepárate con nuestro Método SUMA, simuladores tipo CENEVAL, videoclases y acompañamiento experto para aprobar tu examen EGEL Plus y EXANI.
                            </p>

                            <div className="mt-8 flex flex-col items-start gap-3.5">
                                <button
                                    type="button"
                                    onClick={openMiniTest}
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#101E33] px-8 py-3.5 text-[16px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47] sm:w-[285px]"
                                >
                                    Encuentra tu opción
                                </button>

                                <Link
                                    href="/productos"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3.5 text-[16px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] sm:w-[285px]"
                                >
                                    Ver productos
                                </Link>
                            </div>
                        </motion.div>

                        {/* Columna Derecha: Grilla tenue 4x6 + Isotipo gigante s. + Alumna pegada a bottom-0 */}
                        <motion.div
                            initial={{ opacity: 0, y: 22 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
                            className="relative flex justify-center lg:col-span-6 lg:justify-end"
                        >
                            {/* Grilla tenue 4x6 detrás de los libros */}
                            <div className="pointer-events-none absolute bottom-12 left-0 hidden opacity-30 sm:block lg:-left-8">
                                <PlusGridPattern
                                    rows={6}
                                    cols={4}
                                    color="navy"
                                    gap={32}
                                    size={7}
                                />
                            </div>

                            {/* Isotipo s. gigante justo detrás a la derecha inferior */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-2 bottom-4 z-0 sm:right-2 lg:-right-6 lg:bottom-6"
                            >
                                <SapiusIsotype
                                    variant="dark"
                                    className="h-36 sm:h-48 lg:h-[245px]"
                                />
                            </div>

                            <img
                                src="/img/brand2026/hero-student-home.png"
                                alt="Alumna preparándose con Sapius"
                                className="relative bottom-0 z-10 block h-auto max-h-[400px] w-auto object-contain object-bottom sm:max-h-[490px] lg:mr-34 lg:max-h-[555px]"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 2: FRANJA OSCURA EGEL NUTRICIÓN / EGEL MEDICINA
               ========================================================= */}
            <section className="relative overflow-hidden bg-[#101E33] py-16 text-white sm:py-20">
                {/* Izquierda: grilla 6x3 coral */}
                <div className="pointer-events-none absolute top-1/2 left-4 hidden -translate-y-1/2 opacity-85 md:block lg:left-6">
                    <PlusGridPattern
                        rows={6}
                        cols={3}
                        color="coral"
                        gap={32}
                        size={8}
                    />
                </div>
                {/* Derecha: grilla 4x4 blanca */}
                <div className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 opacity-85 md:block lg:right-6">
                    <PlusGridPattern
                        rows={4}
                        cols={4}
                        color="white"
                        gap={32}
                        size={8}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8">
                    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-16">
                        {/* Bloque EGEL Nutrición */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="group flex flex-col items-center"
                        >
                            <div className="flex items-center gap-4">
                                {/* Ícono lineal coral manzana + corazón */}
                                <svg
                                    viewBox="0 0 56 56"
                                    className="h-18 w-18 shrink-0 stroke-[#FF6B52] transition-transform duration-300 group-hover:scale-110 sm:h-21 sm:w-21"
                                    fill="none"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M31 15c0-3.8 3-6.5 6.8-6.5-.2 3.7-3 6.5-6.8 6.5Z" />
                                    <path d="M29.2 16.2c-2.7-2-6-2.1-8.8-.4-4 2.4-5.4 8-3.8 13.6" />
                                    <path d="M31.5 16.2c2.7-2 6.2-2.1 9-.3 4.3 2.7 5.4 9.2 2.6 15.6-2.2 5.3-5.7 9.5-9 9.5-1.6 0-2.8-.8-4.1-.8-1.3 0-2.5.8-4.1.8" />
                                    <path d="M17.5 42.5c-4.8-3.2-8-6.2-8-9.8 0-2.7 2.1-4.6 4.6-4.6 1.5 0 2.8.8 3.4 2 .6-1.2 1.9-2 3.4-2 2.5 0 4.6 1.9 4.6 4.6 0 3.6-3.2 6.6-8 9.8Z" />
                                    <path d="M11.8 33.8h2.8l1.3-2.5 2 4.6 1.4-2.1h3" />
                                </svg>

                                <div className="font-display text-3xl leading-[1.04] font-extrabold tracking-tight text-white sm:text-[2.35rem]">
                                    <span className="block">EGEL</span>
                                    <span className="block">Nutrición</span>
                                </div>
                            </div>

                            <Link
                                href="/egel-plus-nutricion"
                                className="mt-6 inline-flex w-full max-w-[275px] items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3 text-[16px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                Ver más
                            </Link>
                        </motion.div>

                        {/* Bloque EGEL Medicina */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                            className="group flex flex-col items-center"
                        >
                            <div className="flex items-center gap-4">
                                {/* Ícono lineal coral estetoscopio */}
                                <svg
                                    viewBox="0 0 56 56"
                                    className="h-18 w-18 shrink-0 stroke-[#FF6B52] transition-transform duration-300 group-hover:scale-110 sm:h-21 sm:w-21"
                                    fill="none"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M15 12h-3.5v10a9.5 9.5 0 0 0 19 0V12H27" />
                                    <path d="M15 9.5v4.5" />
                                    <path d="M27 9.5v4.5" />
                                    <path d="M21 31.5v5.5a8.5 8.5 0 0 0 17 0v-7.5" />
                                    <circle cx="38" cy="26" r="3.8" />
                                </svg>

                                <div className="font-display text-3xl leading-[1.04] font-extrabold tracking-tight text-white sm:text-[2.35rem]">
                                    <span className="block">EGEL</span>
                                    <span className="block">Medicina</span>
                                </div>
                            </div>

                            <Link
                                href="/egel-plus-medicina"
                                className="mt-6 inline-flex w-full max-w-[275px] items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3 text-[16px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                Ver más
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 3: NUESTRA EXPERIENCIA (page1_s2_y1050.png)
               ========================================================= */}
            <section className="bg-white py-18 sm:py-22 lg:py-26">
                <div className="mx-auto max-w-5xl px-5 sm:px-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.35 }}
                        className="text-center font-display text-3xl font-extrabold tracking-tight text-[#101E33] sm:text-4xl lg:text-[2.75rem]"
                    >
                        Nuestra experiencia
                    </motion.h2>

                    <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-5">
                        {EXPERIENCE_KPIS.map((kpi, idx) => (
                            <motion.div
                                key={kpi.value}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{
                                    duration: 0.35,
                                    delay: idx * 0.05,
                                }}
                                className={`group flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1.5 ${
                                    idx === 4
                                        ? 'col-span-2 sm:col-span-1'
                                        : ''
                                }`}
                            >
                                {/* Squircle 3D oficial de Canva + SVG lineal centrado ópticamente en la masa de color */}
                                <div className="relative flex h-22 w-22 items-center justify-center transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24">
                                    <img
                                        src="/img/brand2026/badge-squircle-peach.png"
                                        alt=""
                                        aria-hidden="true"
                                        draggable={false}
                                        className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none"
                                    />
                                    {/* Offset óptico (-translate-y-1.5 -translate-x-0.5) para compensar la sombra proyectada inferior/derecha del PNG */}
                                    <div className="relative z-10 flex items-center justify-center -translate-y-1.5 -translate-x-0.5">
                                        {kpi.icon}
                                    </div>
                                </div>

                                <div className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#101E33] sm:text-[2.15rem]">
                                    {kpi.value}
                                </div>
                                <div className="mt-1 text-xs leading-tight font-normal text-[#101E33]/85 sm:text-[13.5px]">
                                    {kpi.lines.map((line) => (
                                        <span key={line} className="block">
                                            {line}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 4: CONOCE NUESTRO MÉTODO SUMA (Canva Page 1 v297)
               ========================================================= */}
            <section className="relative overflow-hidden bg-[#101E33] py-20 text-white lg:py-24">
                <div className="relative z-10 mx-auto max-w-[1220px] px-5 sm:px-8 lg:px-10">
                    {/* Fila superior: Isotipo s. + Título + grilla coral | 2 párrafos descriptivos */}
                    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.4 }}
                            className="lg:col-span-5"
                        >
                            <SapiusIsotype variant="light" className="h-9" />

                            <h2 className="mt-6 font-display text-3xl leading-[1.06] font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.85rem]">
                                Conoce nuestro
                                <br />
                                Método SUMA
                            </h2>

                            <div className="mt-8 hidden opacity-85 md:block">
                                <PlusGridPattern
                                    rows={4}
                                    cols={5}
                                    color="coral"
                                    gap={28}
                                    size={8}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.4, delay: 0.08 }}
                            className="space-y-6 pt-2 text-base leading-[1.6] font-light text-white/90 sm:text-[17.5px] lg:col-span-7"
                        >
                            <p>
                                El Método SUMA es una metodología de{' '}
                                <strong className="font-bold text-[#FF6B52]">
                                    aprendizaje progresivo
                                </strong>{' '}
                                que consiste en construir el conocimiento de lo{' '}
                                <strong className="font-bold text-[#FF6B52]">
                                    más sencillo a lo más complejo
                                </strong>
                                , integrando cada tema nuevo con los
                                conocimientos previamente adquiridos.
                            </p>
                            <p>
                                Su objetivo es que el alumno no memorice
                                información de manera aislada, sino que{' '}
                                <strong className="font-bold text-[#FF6B52]">
                                    comprenda, relacione y consolide
                                </strong>{' '}
                                los conocimientos paso a paso hasta{' '}
                                <strong className="font-bold text-[#FF6B52]">
                                    desarrollar las habilidades
                                </strong>{' '}
                                necesarias para presentar el EGEL Plus.
                            </p>
                        </motion.div>
                    </div>

                    {/* Fila inferior: ¿Cómo funciona? + 5 pasos horizontales */}
                    <div className="mt-14 lg:mt-16">
                        <motion.h3
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.35 }}
                            className="text-center font-display text-3xl font-extrabold tracking-tight text-white sm:text-[2.45rem]"
                        >
                            ¿Cómo{' '}
                            <span className="text-[#FF6B52]">funciona?</span>
                        </motion.h3>

                        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
                            {SUMA_STEPS.map((step, idx) => (
                                <motion.div
                                    key={step.title}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{
                                        duration: 0.35,
                                        delay: idx * 0.05,
                                    }}
                                    className="group relative flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1.5"
                                >
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-[22px] bg-white text-[#101E33] shadow-[0_12px_28px_-8px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_16px_32px_-8px_rgba(255,107,82,0.45)]">
                                        {step.icon}
                                    </div>

                                    {idx < SUMA_STEPS.length - 1 && (
                                        <ChevronRight
                                            aria-hidden="true"
                                            className="pointer-events-none absolute top-10 -right-3 hidden h-5 w-5 translate-x-1/2 -translate-y-1/2 text-white/75 lg:block"
                                        />
                                    )}

                                    <h4 className="mt-5 font-display text-[15.5px] leading-snug font-extrabold text-[#FF6B52]">
                                        {step.title}
                                    </h4>
                                    <p className="mt-2 max-w-[210px] text-xs leading-relaxed text-white/85 sm:text-[13px]">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 5: ¿CUÁL PRODUCTO NECESITO Y QUÉ INCLUYE? (page1_s3_y2100.png)
               ========================================================= */}
            <section className="relative overflow-hidden bg-white py-20 lg:py-26">
                {/* Resplandor celeste inferior izquierdo */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 18% 72%, rgba(190, 219, 255, 0.92) 0%, rgba(207, 228, 255, 0.45) 34%, transparent 58%)',
                    }}
                />

                {/* Grilla coral arriba izquierda */}
                <div className="pointer-events-none absolute top-14 left-5 hidden opacity-80 md:block lg:left-8">
                    <PlusGridPattern
                        rows={6}
                        cols={4}
                        color="coral"
                        gap={32}
                        size={8}
                    />
                </div>
                {/* Grilla coral abajo derecha */}
                <div className="pointer-events-none absolute right-5 bottom-8 hidden opacity-85 md:block lg:right-8">
                    <PlusGridPattern
                        rows={4}
                        cols={6}
                        color="coral"
                        gap={32}
                        size={8}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.35 }}
                        className="text-center font-display text-2xl font-extrabold tracking-tight text-[#101E33] sm:text-4xl lg:text-[2.65rem]"
                    >
                        ¿Cuál producto necesito{' '}
                        <span className="text-[#FF6B52]">y qué incluye?</span>
                    </motion.h2>

                    {/* 3 Columnas escalonadas exactas a page1_s3_y2100.png */}
                    <div className="mx-auto mt-12 grid max-w-[1140px] grid-cols-1 items-start gap-7 lg:grid-cols-3">
                        {/* Columna 1: Tarjeta Guía + Simulador + Bloque WhatsApp debajo en Desktop */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.35 }}
                                className="flex flex-col justify-between rounded-[28px] bg-gradient-to-br from-[#233E66] via-[#162947] to-[#0E1A2D] px-7 py-8 text-white shadow-[0_24px_48px_-12px_rgba(16,30,51,0.38)] sm:px-8 sm:py-9"
                            >
                                <div>
                                    <div className="text-center text-xs font-normal tracking-[0.28em] text-[#FF6B52] uppercase">
                                        CURSO ONLINE
                                    </div>

                                    <div className="mt-6 flex items-center gap-3.5">
                                        {/* Ícono lineal coral monitor + libro/engranaje */}
                                        <svg
                                            viewBox="0 0 44 44"
                                            className="h-12 w-12 shrink-0 stroke-[#FF6B52]"
                                            fill="none"
                                            strokeWidth="1.4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <rect
                                                x="5"
                                                y="10"
                                                width="34"
                                                height="22"
                                                rx="3"
                                            />
                                            <path d="M5 27h34" />
                                            <path d="M18 32v5" />
                                            <path d="M26 32v5" />
                                            <path d="M14 37h16" />
                                            <path d="M11 13h9a2 2 0 0 1 2 2v9a2 2 0 0 0-2-2h-9v-9Z" />
                                            <path d="M33 13h-9a2 2 0 0 0-2 2v9a2 2 0 0 1 2-2h9v-9Z" />
                                            <circle cx="22" cy="9" r="3" />
                                        </svg>
                                        <h3 className="font-display text-2xl leading-[1.08] font-extrabold text-white">
                                            Guía +
                                            <br />
                                            Simulador
                                        </h3>
                                    </div>

                                    <ul className="mt-7 space-y-2.5 text-[13.5px] leading-[1.45] text-white/92">
                                        <li className="flex items-start gap-2.5">
                                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white" />
                                            <span>
                                                Libro digital de repaso en la
                                                plataforma.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white" />
                                            <span>
                                                Batería de simuladores de la
                                                edición contratada, con
                                                preguntas, tiempo, intentos y
                                                retroalimentación según
                                                instrumento.
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-9 flex justify-center">
                                    <Link
                                        href="/productos"
                                        className="inline-flex w-full max-w-[195px] items-center justify-center rounded-full bg-[#FF6B52] px-6 py-2.5 text-base font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                    >
                                        Ver más
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Bloque WhatsApp integrado bajo la Columna 1 en Desktop */}
                            <div className="mt-12 hidden lg:block">
                                <p className="text-lg leading-snug font-normal text-[#101E33]">
                                    Conoce todas las
                                    <br />
                                    opciones adaptadas a ti.
                                </p>
                                <a
                                    href={`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=Hola%20Sapius%2C%20quiero%20conocer%20las%20opciones%20de%20estudio%20adaptadas%20a%20m%C3%AD.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center justify-center rounded-full bg-[#06C156] px-8 py-3.5 text-base font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#05A84B]"
                                >
                                    Contactar por WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* Columna 2: Curso asincrónico */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.35, delay: 0.08 }}
                            className="flex flex-col justify-between rounded-[28px] bg-gradient-to-br from-[#233E66] via-[#162947] to-[#0E1A2D] px-7 py-8 text-white shadow-[0_24px_48px_-12px_rgba(16,30,51,0.38)] sm:px-8 sm:py-9"
                        >
                            <div>
                                <div className="text-center text-xs font-normal tracking-[0.28em] text-[#FF6B52] uppercase">
                                    CURSO ONLINE
                                </div>

                                <div className="mt-6 flex items-center gap-3.5">
                                    {/* Ícono lineal coral monitor + play + libro + flechas */}
                                    <svg
                                        viewBox="0 0 44 44"
                                        className="h-12 w-12 shrink-0 stroke-[#FF6B52]"
                                        fill="none"
                                        strokeWidth="1.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="6"
                                            y="17"
                                            width="22"
                                            height="15"
                                            rx="2.5"
                                        />
                                        <path d="M13 32v4" />
                                        <path d="M21 32v4" />
                                        <path d="M10 36h14" />
                                        <path d="m15 22 5 2.8-5 2.8V22Z" />
                                        <path d="M23 9h13v11H23z" />
                                        <path d="M29.5 9v11" />
                                        <path d="M9 13a8 8 0 0 1 8-5" />
                                        <path d="m15 6 2.5 2-2.2 2.2" />
                                    </svg>
                                    <h3 className="font-display text-2xl leading-[1.08] font-extrabold text-white">
                                        Curso
                                        <br />
                                        asincrónico
                                    </h3>
                                </div>

                                <ul className="mt-7 space-y-1.5 text-[13.5px] leading-[1.45] text-white/92">
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
                                            className="flex items-start gap-2.5"
                                        >
                                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-9 flex justify-center">
                                <Link
                                    href="/egel-plus-nutricion#paquetes"
                                    className="inline-flex w-full max-w-[195px] items-center justify-center rounded-full bg-[#FF6B52] px-6 py-2.5 text-base font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                >
                                    Ver más
                                </Link>
                            </div>
                        </motion.div>

                        {/* Columna 3: Curso premium */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.35, delay: 0.16 }}
                            className="flex flex-col justify-between rounded-[28px] bg-gradient-to-br from-[#233E66] via-[#162947] to-[#0E1A2D] px-7 py-8 text-white shadow-[0_24px_48px_-12px_rgba(16,30,51,0.38)] sm:px-8 sm:py-9"
                        >
                            <div>
                                <div className="text-center text-xs font-normal tracking-[0.28em] text-[#FF6B52] uppercase">
                                    CURSO ONLINE
                                </div>

                                <div className="mt-6 flex items-center gap-3.5">
                                    {/* Ícono lineal coral libros + birrete + foco */}
                                    <svg
                                        viewBox="0 0 44 44"
                                        className="h-12 w-12 shrink-0 stroke-[#FF6B52]"
                                        fill="none"
                                        strokeWidth="1.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="m8 20 11-5 11 5-11 5-11-5Z" />
                                        <path d="M12 22v4c0 1.8 3.2 3 7 3s7-1.2 7-3v-4" />
                                        <rect
                                            x="8"
                                            y="29"
                                            width="22"
                                            height="4"
                                            rx="1"
                                        />
                                        <rect
                                            x="9"
                                            y="33"
                                            width="20"
                                            height="4"
                                            rx="1"
                                        />
                                        <path d="M33 11a4 4 0 0 1 2 7.4V20h-4v-1.6A4 4 0 0 1 33 11Z" />
                                        <path d="M33 6v2" />
                                        <path d="m38.5 8.5-1.4 1.4" />
                                        <path d="M40 14h-2" />
                                    </svg>
                                    <h3 className="font-display text-2xl leading-[1.08] font-extrabold text-white">
                                        Curso
                                        <br />
                                        premium
                                    </h3>
                                </div>

                                <ul className="mt-7 space-y-1.5 text-[13.5px] leading-[1.45] text-white/92">
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
                                            className="flex items-start gap-2.5"
                                        >
                                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-9 flex justify-center">
                                <Link
                                    href="/egel-plus-nutricion#paquetes"
                                    className="inline-flex w-full max-w-[195px] items-center justify-center rounded-full bg-[#FF6B52] px-6 py-2.5 text-base font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                >
                                    Ver más
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bloque WhatsApp limpio/centrado para <lg */}
                    <div className="mt-10 text-center lg:hidden">
                        <p className="text-lg leading-snug font-normal text-[#101E33]">
                            Conoce todas las
                            <br />
                            opciones adaptadas a ti.
                        </p>
                        <a
                            href={`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=Hola%20Sapius%2C%20quiero%20conocer%20las%20opciones%20de%20estudio%20adaptadas%20a%20m%C3%AD.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center justify-center rounded-full bg-[#06C156] px-8 py-3.5 text-base font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#05A84B]"
                        >
                            Contactar por WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 6: TIRA OSCURA MINI-TEST (page1_s4_y3150.png)
               ========================================================= */}
            <section className="bg-[#101E33] py-16 text-center text-white sm:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="mx-auto max-w-4xl px-5 sm:px-8"
                >
                    <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.7rem]">
                        ¿No sabes por dónde empezar?
                    </h2>
                    <div className="mt-7">
                        <button
                            type="button"
                            onClick={openMiniTest}
                            className="inline-flex min-w-[250px] items-center justify-center rounded-full bg-[#FF6B52] px-9 py-3.5 text-base font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                        >
                            Realiza el test
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* =========================================================
                SECCIÓN 7: PREGUNTAS FRECUENTES (Canva Page 1 v297)
               ========================================================= */}
            <FaqSection
                progressiveMode={true}
                headingAs="h2"
                subtitle="Encuentra información sobre nuestros cursos, metodología y proceso de preparación para el EGEL Plus."
                ctaHref="/preguntas-frecuentes"
                ctaLabel="Ir a Preguntas frecuentes"
            />

            {/* =========================================================
                SECCIÓN 9: EMPIEZA HOY TU RUTA DE ESTUDIO (page1_s5_y4200.png)
               ========================================================= */}
            <section className="relative overflow-hidden bg-white py-18 sm:py-22">
                {/* Grilla izquierda navy 6x2 */}
                <div className="pointer-events-none absolute top-1/2 left-5 hidden -translate-y-1/2 opacity-80 md:block lg:left-8">
                    <PlusGridPattern
                        rows={6}
                        cols={2}
                        color="navy"
                        gap={32}
                        size={8}
                    />
                </div>
                {/* Grilla derecha coral 2x6 */}
                <div className="pointer-events-none absolute right-5 bottom-5 hidden opacity-85 md:block lg:right-8">
                    <PlusGridPattern
                        rows={2}
                        cols={6}
                        color="coral"
                        gap={32}
                        size={8}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8"
                >
                    <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#101E33] sm:text-4xl lg:text-[2.85rem]">
                        Empieza hoy{' '}
                        <span className="text-[#FF6B52]">tu ruta</span> de
                        estudio
                    </h2>

                    <div className="mt-8">
                        <Link
                            href="/cursos"
                            className="inline-flex min-w-[270px] items-center justify-center rounded-full bg-[#101E33] px-9 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]"
                        >
                            Cursos y paquetes
                        </Link>
                    </div>
                </motion.div>
            </section>
        </LandingLayout>
    );
}

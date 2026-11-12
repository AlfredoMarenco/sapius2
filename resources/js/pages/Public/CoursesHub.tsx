import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';
import { openMiniTest } from '@/components/public/MiniTestModal';
import { PlusGridPattern } from '@/components/public/PlusGridPattern';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import LandingLayout from '@/layouts/LandingLayout';

export type ScheduledCourseItem = ScheduledCourseCandidate;

export interface ManageableResourceCard {
    id: number | string;
    image?: string | null;
    titulo?: string | null;
    descripcion?: string | null;
    type?: string | null;
    category?: string | null;
    position?: number | null;
}

export interface CoursesHubProps {
    scheduledCourses?: ScheduledCourseItem[];
    guiasMedicine?: ManageableResourceCard[];
    guiasNutrition?: ManageableResourceCard[];
    simulatorsMedicine?: ManageableResourceCard[];
    simulatorsNutrition?: ManageableResourceCard[];
}

const SIMULATOR_QUICK_LINKS: ReadonlyArray<{ label: string; href: string }> = [
    { label: 'Globales nutrición', href: '/simuladores-nutricion' },
    { label: 'Compacto nutrición', href: '/simuladores-nutricion' },
    {
        label: 'Módulos y exámenes diarios',
        href: '/egel-plus-nutricion#paquetes',
    },
    { label: 'Medicina 5 simuladores', href: '/simuladores-medicina' },
];

export default function CoursesHub({
    scheduledCourses = [],
}: CoursesHubProps) {
    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Cursos, Guías y Simuladores | Sapius" />

            {/* HERO: "El curso ideal para ti" (Canva Page 2 — Top) */}
            <section className="relative overflow-hidden bg-white pt-24 pb-0 sm:pt-28 lg:pt-30">
                {/* Degradado durazno cálido arriba-izquierda + celeste a la derecha desde y=0 */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,_#FFC7B6_0%,_#FFD9CE_26%,_transparent_54%),radial-gradient(circle_at_85%_52%,_#CBE2FF_0%,_#CFE4FF_32%,_transparent_64%)]"
                />

                {/* Grilla decorativa superior izquierda sutil */}
                <div className="pointer-events-none absolute top-20 left-3 hidden opacity-30 sm:block lg:left-6">
                    <PlusGridPattern
                        rows={6}
                        cols={4}
                        color="navy"
                        gap={28}
                        size={7}
                    />
                </div>

                {/* Grilla decorativa 4x5 navy abajo al centro */}
                <div className="pointer-events-none absolute bottom-6 left-[39%] hidden opacity-85 lg:block">
                    <PlusGridPattern
                        rows={4}
                        cols={5}
                        color="navy"
                        gap={28}
                        size={8}
                    />
                </div>

                {/* Grilla decorativa 6x4 coral abajo a la derecha */}
                <div className="pointer-events-none absolute right-4 bottom-6 hidden opacity-90 md:block lg:right-8">
                    <PlusGridPattern
                        rows={6}
                        cols={4}
                        color="coral"
                        gap={28}
                        size={8}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
                    <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-8">
                        {/* Columna izquierda: Titular + CTAs + Mini-test */}
                        <div className="pb-10 lg:col-span-6 lg:pb-16">
                            <h1 className="font-display text-4xl leading-[1.02] font-extrabold tracking-tight text-[#101E33] sm:text-6xl lg:text-[4.35rem]">
                                El curso
                                <br />
                                ideal para ti
                            </h1>

                            <p className="mt-4 text-base font-normal text-[#101E33]/90 sm:text-lg lg:text-[20px]">
                                Conoce nuestros programas, cursos y simuladores
                            </p>

                            {/* Botones principales EGEL */}
                            <div className="mt-8 flex w-full flex-col gap-3.5 sm:w-[290px]">
                                <Link
                                    href="/egel-plus-nutricion"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#101E33] px-7 py-3.5 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47] sm:w-[290px]"
                                >
                                    EGEL Nutrición
                                </Link>
                                <Link
                                    href="/egel-plus-medicina"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3.5 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] sm:w-[290px]"
                                >
                                    EGEL Medicina
                                </Link>
                            </div>

                            {/* Bloque Encuentra tu opción + Realiza el test */}
                            <div className="mt-8 flex w-full flex-col items-center sm:w-[290px]">
                                <p className="text-[17px] font-normal text-[#101E33]">
                                    Encuentra tu opción
                                </p>
                                <button
                                    type="button"
                                    onClick={openMiniTest}
                                    className="mt-2.5 inline-flex min-w-[195px] items-center justify-center rounded-full border border-[#FF6B52]/70 bg-[#FFF7F2] px-8 py-2.5 text-[15.5px] font-normal text-[#101E33] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                >
                                    Realiza el test
                                </button>
                            </div>
                        </div>

                        {/* Columna derecha: Estudiante grande pegado abajo + Isotipo s. monumental */}
                        <div className="relative flex justify-center self-end lg:col-span-6 lg:justify-end">
                            <img
                                src="/img/brand2026/isotype-s-watermark.png"
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute top-[14%] -right-1 h-40 w-auto object-contain select-none sm:h-52 lg:-right-4 lg:h-[265px]"
                            />

                            <img
                                src="/img/brand2026/hero-student-cursos.png"
                                alt="Estudiante Sapius con cuaderno y audífonos"
                                className="relative z-10 block max-h-[410px] w-auto object-contain object-bottom sm:max-h-[500px] lg:mr-22 lg:max-h-[560px]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN #guias-simuladores ("Guías y simuladores" — Fiel a Canva Page 2 s6/s7) */}
            <section
                id="guias-simuladores"
                className="relative overflow-hidden bg-white py-20 lg:py-24"
            >
                {/* Sutil resplandor cálido central-izquierdo */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_75%,_#FFE6DC_0%,_transparent_52%)] opacity-65"
                />

                {/* Grilla 4x5 navy en el margen superior derecho */}
                <div className="pointer-events-none absolute top-10 right-6 hidden opacity-85 lg:block">
                    <PlusGridPattern
                        rows={4}
                        cols={5}
                        color="navy"
                        gap={28}
                        size={8}
                    />
                </div>

                {/* Grilla 6x4 coral en el margen inferior izquierdo */}
                <div className="pointer-events-none absolute bottom-6 left-4 hidden opacity-75 sm:block">
                    <PlusGridPattern
                        rows={6}
                        cols={4}
                        color="coral"
                        gap={28}
                        size={7}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
                    {/* Cabecera en 2 columnas horizontales */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-12"
                    >
                        <div className="lg:col-span-5">
                            <h2 className="font-display text-4xl leading-[1.02] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.55rem]">
                                Guías y
                                <br />
                                simuladores
                            </h2>
                        </div>

                        <div className="lg:col-span-6">
                            <p className="text-base leading-[1.45] text-[#101E33]/90 sm:text-[17.5px]">
                                Domina el CENEVAL con{' '}
                                <strong className="font-bold text-[#101E33]">
                                    guías clave y simuladores
                                </strong>{' '}
                                reales que te preparan para titularte con
                                seguridad.{' '}
                                <strong className="font-bold text-[#101E33]">
                                    Estudia a tu ritmo
                                </strong>{' '}
                                o elige modalidades con asesoría experta.
                            </p>
                        </div>
                    </motion.div>

                    {/* 2 Columnas Simétricas Amplias */}
                    <div className="mx-auto mt-14 grid max-w-[1060px] grid-cols-1 items-start gap-12 md:grid-cols-2 lg:gap-24">
                        {/* Columna Izquierda: Guías digitales */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                            <Link
                                href="/guias-nutricion"
                                className="group block rounded-[22px] bg-gradient-to-b from-[#1E395E] to-[#101E33] p-2.5 pb-5 shadow-[0_20px_42px_-14px_rgba(16,30,51,0.38)] transition-transform duration-200 hover:-translate-y-1"
                            >
                                <div className="overflow-hidden rounded-[16px] border border-[#FF6B52]/75 bg-white">
                                    <img
                                        src="/img/brand2026/card-guias-digitales.png"
                                        alt="Guía Digital EGEL Nutrición y Medicina - Sapius"
                                        className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    />
                                </div>
                                <h3 className="mt-4 text-center font-display text-xl font-extrabold text-white sm:text-2xl">
                                    Guías digitales
                                </h3>
                            </Link>

                            <div className="mt-5 flex justify-center">
                                <Link
                                    href="/guias-nutricion"
                                    className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-10 py-3 text-[15px] font-bold text-[#101E33] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] hover:text-white"
                                >
                                    Nutrición digital 2026
                                </Link>
                            </div>
                        </motion.div>

                        {/* Columna Derecha: Simuladores */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{
                                duration: 0.4,
                                delay: 0.08,
                                ease: 'easeOut',
                            }}
                        >
                            <Link
                                href="/simuladores-nutricion"
                                className="group block rounded-[22px] bg-gradient-to-b from-[#1E395E] to-[#101E33] p-2.5 pb-5 shadow-[0_20px_42px_-14px_rgba(16,30,51,0.38)] transition-transform duration-200 hover:-translate-y-1"
                            >
                                <div className="overflow-hidden rounded-[16px] border border-[#FF6B52]/75 bg-white">
                                    <img
                                        src="/img/brand2026/card-simuladores.png"
                                        alt="Simuladores EGEL Nutrición y Medicina - Sapius"
                                        className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    />
                                </div>
                                <h3 className="mt-4 text-center font-display text-xl font-extrabold text-white sm:text-2xl">
                                    Simuladores
                                </h3>
                            </Link>

                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {SIMULATOR_QUICK_LINKS.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#FF6B52] px-5 py-2.5 text-center text-[14px] leading-tight font-bold text-[#101E33] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] hover:text-white"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

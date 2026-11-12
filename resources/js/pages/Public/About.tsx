import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';
import { openMiniTest } from '@/components/public/MiniTestModal';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import { SapiusWordmark } from '@/components/public/SapiusLogo';
import LandingLayout from '@/layouts/LandingLayout';

export interface AboutProps {
    scheduledCourses?: ScheduledCourseCandidate[];
}

export default function About({ scheduledCourses }: AboutProps) {
    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Nosotros — Sapius" />

            {/* =========================================================
                HERO NOSOTROS (Fiel a Canva Page 3)
               ========================================================= */}
            <section className="relative min-h-[72vh] overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
                {/* Degradado atmosférico celeste/blanco exacto a page3.png */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 12% 20%, rgba(207, 228, 255, 0.92) 0%, rgba(207, 228, 255, 0.35) 36%, transparent 62%), radial-gradient(circle at 82% 62%, rgba(207, 228, 255, 0.92) 0%, rgba(207, 228, 255, 0.35) 38%, transparent 66%)',
                    }}
                />

                {/* Grilla superior central navy */}
                <div className="pointer-events-none absolute top-10 left-1/2 hidden -translate-x-1/4 opacity-70 md:block">
                    <PlusGridPattern rows={4} cols={6} color="navy" gap={32} size={8} />
                </div>

                {/* Grilla inferior izquierda tenue */}
                <div className="pointer-events-none absolute bottom-6 left-4 opacity-35 sm:left-8">
                    <PlusGridPattern rows={6} cols={4} color="navy" gap={30} size={7} />
                </div>

                {/* Grilla inferior derecha coral */}
                <div className="pointer-events-none absolute right-6 bottom-6 opacity-75">
                    <PlusGridPattern rows={6} cols={4} color="coral" gap={30} size={7} />
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {/* Bloque Izquierdo: Conócenos / Somos sapius. */}
                    <div className="max-w-2xl pt-4 lg:pt-8">
                        <p className="font-display text-xl font-normal tracking-tight text-[#101E33]/85 sm:text-2xl">
                            Conócenos
                        </p>

                        <h1 className="mt-3 font-display text-5xl leading-[1.02] font-extrabold tracking-tight text-[#101E33] sm:text-6xl lg:text-[4.6rem]">
                            Somos
                        </h1>

                        <div className="mt-2 pl-4 sm:pl-10">
                            <SapiusWordmark
                                variant="dark"
                                size="xl"
                                className="h-16 sm:h-24 lg:h-28"
                            />
                        </div>
                    </div>

                    {/* Bloque Central/Derecho: Texto placeholder exacto del Canva */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mx-auto mt-16 max-w-3xl text-center sm:mt-24"
                    >
                        <p className="font-display text-xl leading-snug font-extrabold tracking-tight text-[#101E33] sm:text-2xl lg:text-[1.75rem]">
                            Historia, experiencia, filosofía, misión, visión y
                            valores; perfiles solo con datos verificables.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* =========================================================
                PILARES INSTITUCIONALES (Listos para edición manual)
               ========================================================= */}
            <section className="border-t border-[#101E33]/5 bg-white py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-2xl border border-[#FF6B52]/40 bg-white p-7 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.1)]">
                            <span className="text-xs font-extrabold tracking-wider text-[#FF6B52] uppercase">
                                Nuestra Filosofía
                            </span>
                            <h2 className="mt-2 font-display text-xl font-extrabold text-[#101E33]">
                                Tu formación, nuestra pasión
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-[#101E33]/75">
                                Más de 13 años acompañando a egresados de
                                ciencias de la salud con una metodología clara,
                                progresiva y enfocada en resultados reales.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#FF6B52]/40 bg-white p-7 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.1)]">
                            <span className="text-xs font-extrabold tracking-wider text-[#FF6B52] uppercase">
                                Metodología Propia
                            </span>
                            <h2 className="mt-2 font-display text-xl font-extrabold text-[#101E33]">
                                Sistema de aprendizaje SUMA
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-[#101E33]/75">
                                Cuatro bloques estratégicos de lo sencillo a lo
                                complejo con videoclases diarias, simuladores y
                                acompañamiento docente.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#FF6B52]/40 bg-white p-7 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.1)]">
                            <span className="text-xs font-extrabold tracking-wider text-[#FF6B52] uppercase">
                                Respaldo Académico
                            </span>
                            <h2 className="mt-2 font-display text-xl font-extrabold text-[#101E33]">
                                99.1 % de aprobación y éxito
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-[#101E33]/75">
                                Profesores certificados y resultados
                                verificables con múltiples Premios Nacionales de
                                Desempeño de Excelencia EGEL.
                            </p>
                        </div>
                    </div>

                    {/* CTA hacia Cursos y Mini-Test */}
                    <div className="mt-14 flex flex-col items-center justify-center gap-4 rounded-3xl bg-[#101E33] px-6 py-12 text-center text-white sm:px-10">
                        <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                            Descubre el programa{' '}
                            <span className="text-[#FF6B52]">ideal para ti</span>
                        </h2>
                        <p className="max-w-xl text-sm text-white/80 sm:text-base">
                            Explora nuestros paquetes para EGEL Nutrición y EGEL
                            Medicina o responde 6 preguntas rápidas para recibir
                            una recomendación personalizada.
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-3.5">
                            <Link
                                href="/cursos"
                                className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                Ver cursos y paquetes
                            </Link>
                            <button
                                type="button"
                                onClick={openMiniTest}
                                className="inline-flex min-w-[200px] items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
                            >
                                Realizar el test
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import React from 'react';
import { openMiniTest } from '@/components/public/MiniTestModal';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import { SapiusIsotype, SapiusWordmark } from '@/components/public/SapiusLogo';
import LandingLayout from '@/layouts/LandingLayout';

export interface TeacherRecord {
    id: number | string;
    name: string;
    description?: string | null;
    img?: string | null;
}

export interface AboutProps {
    teachers?: TeacherRecord[];
    scheduledCourses?: ScheduledCourseCandidate[];
}

const FALLBACK_TEACHERS: TeacherRecord[] = [
    {
        id: 'expert-1',
        name: 'L.N. Elsy Verónica González Sansores',
        description: 'Premio Nacional de Excelencia EGEL',
        img: '/img/m-4.png',
    },
    {
        id: 'expert-2',
        name: 'Dra. Erika Elizabeth González Sansores',
        description: 'Neuróloga egresada del Centro Médico Nacional Siglo XXI',
        img: '/img/m-5.png',
    },
    {
        id: 'expert-3',
        name: 'Lic. Trab. Soc. Martín Moisés González Sansores',
        description: 'Docente titular del curso EGEL Plus',
        img: '/img/m-3.png',
    },
    {
        id: 'expert-4',
        name: 'Dr. César Abraham Estrada Aguirre',
        description: 'Cirujano Plástico Estético y Reconstructivo',
        img: '/img/m-2.png',
    },
    {
        id: 'expert-5',
        name: 'L.N. Fernando Iván Pat Poot',
        description: 'Docente Especialista Sapius',
        img: '/img/m-6.png',
    },
];

function resolveTeacherImg(img?: string | null): string {
    if (!img) {
return '/img/brand2026/expert-placeholder.png';
}

    if (img.startsWith('http') || img.startsWith('/')) {
return img;
}

    return `/media/stream/${img}`;
}

export default function About({
    teachers = [],
    scheduledCourses,
}: AboutProps) {
    const hasDbTeachers = Array.isArray(teachers) && teachers.length > 0;
    const displayedTeachers = hasDbTeachers ? teachers : FALLBACK_TEACHERS;

    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Nosotros — Sapius" />

            {/* =========================================================
                SECCIÓN 1: LIENZO HERO NOSOTROS (100% fiel a page3.png)
               ========================================================= */}
            <section className="relative flex min-h-[760px] flex-col justify-between overflow-hidden bg-white pt-28 pb-20 sm:pt-34 lg:pb-24">
                {/* Resplandor celeste #CFE4FF arriba-izquierda y abajo-derecha, franja central blanca limpia */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 12% 16%, rgba(190, 218, 255, 0.95) 0%, rgba(207, 228, 255, 0.45) 34%, transparent 56%), radial-gradient(circle at 84% 62%, rgba(190, 218, 255, 0.92) 0%, rgba(207, 228, 255, 0.45) 36%, transparent 60%)',
                    }}
                />

                {/* Grilla 4x6 navy arriba al centro */}
                <div className="pointer-events-none absolute top-28 left-[41%] hidden opacity-85 md:block">
                    <PlusGridPattern
                        rows={4}
                        cols={6}
                        color="navy"
                        gap={34}
                        size={8}
                    />
                </div>

                {/* Grilla tenue 6x4 abajo izquierda */}
                <div className="pointer-events-none absolute bottom-6 left-4 hidden opacity-30 sm:left-6 md:block">
                    <PlusGridPattern
                        rows={6}
                        cols={4}
                        color="navy"
                        gap={32}
                        size={8}
                    />
                </div>

                {/* Grilla 6x4 coral abajo derecha */}
                <div className="pointer-events-none absolute right-4 bottom-6 hidden opacity-85 sm:right-6 md:block">
                    <PlusGridPattern
                        rows={6}
                        cols={4}
                        color="coral"
                        gap={32}
                        size={8}
                    />
                </div>

                <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-between px-5 sm:px-8 lg:px-10">
                    {/* Bloque Izquierdo: Conócenos / Somos / sapius. */}
                    <div className="max-w-3xl pt-10 sm:pt-14 lg:pt-20">
                        <p className="font-display text-xl font-normal tracking-tight text-[#101E33] sm:text-[26px]">
                            Conócenos
                        </p>

                        <h1 className="mt-2 font-display text-5xl leading-[0.98] font-extrabold tracking-tight text-[#101E33] sm:text-7xl lg:text-[5.4rem]">
                            Somos
                        </h1>

                        <div className="mt-2 pl-6 sm:pl-14">
                            <SapiusWordmark
                                variant="dark"
                                className="h-14 sm:h-22 lg:h-[108px]"
                            />
                        </div>
                    </div>

                    {/* Centro inferior exacto de page3.png */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mx-auto mt-14 max-w-[740px] pb-4 text-center sm:mt-20"
                    >
                        <p className="font-display text-xl leading-[1.2] font-extrabold tracking-tight text-[#101E33] sm:text-2xl lg:text-[27px]">
                            Formación académica estratégica con docentes
                            certificados, metodología estructurada y resultados
                            comprobables.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN 2: EQUIPO DOCENTE DINÁMICO (teachers desde BD)
               ========================================================= */}
            <section className="relative overflow-hidden border-t border-[#101E33]/5 bg-white py-20 lg:py-24">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,_#FFD9CE_0%,_transparent_46%),radial-gradient(circle_at_12%_82%,_#CFE4FF_0%,_transparent_50%)] opacity-60"
                />

                <div className="pointer-events-none absolute top-10 right-6 hidden opacity-80 lg:block">
                    <PlusGridPattern
                        rows={6}
                        cols={4}
                        color="coral"
                        gap={30}
                        size={8}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-[1160px] px-5 sm:px-8">
                    <div className="text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#FF6B52]/40 bg-white/90 px-4 py-1.5 text-xs font-extrabold tracking-wider text-[#FF6B52] uppercase shadow-2xs">
                            <GraduationCap className="h-4 w-4" />
                            Nuestro equipo académico
                        </span>

                        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-[#101E33] sm:text-4xl lg:text-[2.75rem]">
                            Docentes que{' '}
                            <span className="text-[#FF6B52]">
                                guían tu éxito
                            </span>
                        </h2>

                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#101E33]/75 sm:text-base">
                            Especialistas en Ciencias de la Salud y ganadores de
                            Premios Nacionales EGEL comprometidos con tu
                            preparación.
                        </p>
                    </div>

                    <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                        {displayedTeachers.map((teacher, idx) => (
                            <motion.article
                                key={teacher.id}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{
                                    duration: 0.35,
                                    delay: idx * 0.05,
                                }}
                                className="flex flex-col items-center rounded-[26px] border border-[#FF6B52]/45 bg-white/95 p-6 text-center shadow-[0_14px_34px_-16px_rgba(16,30,51,0.14)]"
                            >
                                <div className="flex h-52 w-52 items-end justify-center overflow-hidden rounded-full border-2 border-[#FF6B52]/35 bg-gradient-to-b from-[#CFE4FF]/35 to-[#FFD9CE]/35">
                                    <img
                                        src={resolveTeacherImg(teacher.img)}
                                        alt={teacher.name}
                                        onError={(e) => {
                                            (
                                                e.currentTarget as HTMLImageElement
                                            ).src =
                                                '/img/brand2026/expert-placeholder.png';
                                        }}
                                        className="h-48 w-auto object-contain object-bottom"
                                    />
                                </div>

                                <h3 className="mt-5 font-display text-lg leading-snug font-extrabold text-[#101E33]">
                                    {teacher.name}
                                </h3>
                                <p className="mt-1.5 text-sm leading-relaxed font-medium text-[#FF6B52]">
                                    {teacher.description ||
                                        'Docente Especialista Sapius'}
                                </p>
                            </motion.article>
                        ))}
                    </div>

                    {/* Franja CTA oscura institucional */}
                    <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-3xl bg-[#101E33] px-7 py-9 text-center text-white shadow-lg sm:flex-row sm:px-10 sm:text-left">
                        <div className="flex items-center gap-4">
                            <SapiusIsotype
                                variant="light"
                                className="hidden h-10 sm:block"
                            />
                            <div>
                                <h3 className="font-display text-xl font-extrabold sm:text-2xl">
                                    Prepárate con el{' '}
                                    <span className="text-[#FF6B52]">
                                        Método SUMA
                                    </span>
                                </h3>
                                <p className="mt-1 text-sm text-white/80">
                                    Descubre qué programa, guía o simulador se
                                    adapta mejor a tu fecha de examen.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            <button
                                type="button"
                                onClick={openMiniTest}
                                className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3 text-sm font-bold text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                Realiza el test
                            </button>
                            <Link
                                href="/cursos"
                                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-[#101E33]"
                            >
                                Ver cursos
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

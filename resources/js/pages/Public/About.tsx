import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BookOpenCheck, ClipboardList, ListOrdered } from 'lucide-react';
import React from 'react';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import { SapiusIsotype } from '@/components/public/SapiusLogo';
import LandingLayout from '@/layouts/LandingLayout';

export interface AboutProps {
    scheduledCourses?: ScheduledCourseCandidate[];
}

const EXPERT_CARDS = [
    {
        id: 'que-estudias',
        title: '¿Qué estudias?',
        description: 'Contenidos basados en las referencias del examen.',
        icon: BookOpenCheck,
    },
    {
        id: 'en-que-orden',
        title: '¿En qué orden?',
        description: 'Una ruta que avanza paso a paso, nuestro Método SUMA.',
        icon: ListOrdered,
    },
    {
        id: 'donde-profundizar',
        title: '¿Dónde profundizar?',
        description: 'Bibliografía y capítulos para cada tema.',
        icon: ClipboardList,
    },
] as const;

export default function About({ scheduledCourses }: AboutProps) {
    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Nosotros — Sapius" />

            {/* =========================================================
                LIENZO NOSOTROS (Fiel a Canva Page 3 v332)
               ========================================================= */}
            <section className="relative overflow-hidden bg-white pt-28 pb-20 sm:pt-34 lg:pb-24">
                {/* Resplandor celeste #CFE4FF arriba-izquierda y abajo-derecha */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 12% 20%, rgba(190, 218, 255, 0.95) 0%, rgba(207, 228, 255, 0.45) 34%, transparent 56%), radial-gradient(circle at 86% 68%, rgba(190, 218, 255, 0.92) 0%, rgba(207, 228, 255, 0.45) 36%, transparent 60%)',
                    }}
                />

                {/* Grilla 4x6 navy arriba al centro */}
                <div className="pointer-events-none absolute top-28 left-[58%] hidden opacity-85 md:block">
                    <PlusGridPattern
                        rows={4}
                        cols={6}
                        color="navy"
                        gap={32}
                        size={8}
                    />
                </div>

                {/* Grilla tenue 6x4 izquierda media */}
                <div className="pointer-events-none absolute top-[320px] left-4 hidden opacity-25 sm:left-6 md:block">
                    <PlusGridPattern
                        rows={4}
                        cols={4}
                        color="navy"
                        gap={30}
                        size={8}
                    />
                </div>

                {/* Grilla 5x3 coral derecha media */}
                <div className="pointer-events-none absolute top-[430px] right-4 hidden opacity-85 sm:right-6 md:block">
                    <PlusGridPattern
                        rows={5}
                        cols={3}
                        color="coral"
                        gap={30}
                        size={8}
                    />
                </div>

                {/* Grilla tenue 2x6 abajo izquierda */}
                <div className="pointer-events-none absolute bottom-6 left-4 hidden opacity-25 sm:left-6 md:block">
                    <PlusGridPattern
                        rows={2}
                        cols={6}
                        color="navy"
                        gap={30}
                        size={8}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-[1220px] px-5 sm:px-8 lg:px-10">
                    {/* Bloque Superior: Conócenos / Somos Sapius */}
                    <div className="pt-6 sm:pt-10">
                        <p className="font-display text-lg font-normal tracking-tight text-[#101E33] sm:text-[24px]">
                            Conócenos
                        </p>
                        <h1 className="mt-1 font-display text-5xl leading-[1.02] font-extrabold tracking-tight text-[#101E33] sm:text-7xl lg:text-[5.2rem]">
                            Somos Sapius
                        </h1>
                    </div>

                    {/* Fila intermedia: Isotipo s. gigante a la izquierda + copy y CTA a la derecha */}
                    <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
                        <div className="flex justify-center lg:col-span-5">
                            <SapiusIsotype
                                variant="dark"
                                className="h-44 sm:h-56 lg:h-[240px]"
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="flex flex-col items-center text-center lg:col-span-7"
                        >
                            <p className="max-w-[600px] text-base leading-[1.65] text-[#101E33]/90 sm:text-[18.5px]">
                                Una plataforma de{' '}
                                <strong className="font-extrabold text-[#101E33]">
                                    preparación académica
                                </strong>{' '}
                                especializada en el EGEL Plus. Desde hace{' '}
                                <strong className="font-extrabold text-[#101E33]">
                                    más de 13 años
                                </strong>{' '}
                                ayudamos a estudiantes y egresados a saber qué
                                estudiar, en qué orden y dónde profundizar, con
                                nuestro{' '}
                                <strong className="font-extrabold text-[#101E33]">
                                    Método SUMA: Un aprendizaje progresivo
                                </strong>{' '}
                                que va{' '}
                                <strong className="font-extrabold text-[#101E33]">
                                    de lo más sencillo a lo más complejo
                                </strong>
                                , donde cada tema es un eslabón que se conecta
                                con el anterior.
                            </p>

                            <a
                                href="#preparacion-experta"
                                className="mt-8 inline-flex min-w-[200px] items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                Ver más
                            </a>
                        </motion.div>
                    </div>

                    {/* Bloque Inferior: Preparación experta para tu EGEL Plus */}
                    <div
                        id="preparacion-experta"
                        className="mt-20 scroll-mt-24 sm:mt-24"
                    >
                        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-[#101E33] sm:text-4xl lg:text-[2.75rem]">
                            <span className="text-[#FF6B52]">
                                Preparación experta
                            </span>{' '}
                            para tu EGEL Plus
                        </h2>

                        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                            {EXPERT_CARDS.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <div
                                        key={card.id}
                                        className="flex items-start gap-4 rounded-[26px] border border-[#FF6B52]/65 bg-white/95 p-6 shadow-[0_14px_32px_-12px_rgba(16,30,51,0.12)]"
                                    >
                                        <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFD9CE]/45 text-[#FF6B52]">
                                            <Icon
                                                className="h-6 w-6"
                                                strokeWidth={1.8}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <div>
                                            <h3 className="font-display text-lg leading-tight font-extrabold text-[#101E33] sm:text-xl">
                                                {card.title}
                                            </h3>
                                            <p className="mt-1.5 text-sm leading-relaxed text-[#101E33]/80">
                                                {card.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="mx-auto mt-12 max-w-[920px] text-center text-base leading-[1.65] text-[#101E33]/90 sm:text-[17.5px]">
                            Nuestros contenidos, guías y simuladores los
                            desarrollan y revisan{' '}
                            <strong className="font-extrabold text-[#101E33]">
                                profesionales con ejercicio vigente en su área
                            </strong>
                            , se basan en las referencias del examen y se{' '}
                            <strong className="font-extrabold text-[#101E33]">
                                actualizan constantemente.
                            </strong>{' '}
                            Somos una plataforma digital liderada por personas
                            que te acompañan durante tu preparación.{' '}
                            <strong className="font-extrabold text-[#101E33]">
                                Tu formación, nuestra pasión.
                            </strong>
                        </p>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';
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
                LIENZO NOSOTROS (100% fiel a Canva Page 3 v297)
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

                    {/* Centro inferior exacto de Canva Page 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mx-auto mt-14 max-w-[740px] pb-4 text-center sm:mt-20"
                    >
                        <p className="font-display text-xl leading-[1.2] font-extrabold tracking-tight text-[#101E33] sm:text-2xl lg:text-[27px]">
                            Historia, experiencia, filosofía, misión, visión y
                            valores; perfiles solo con datos verificables.
                        </p>
                    </motion.div>
                </div>
            </section>
        </LandingLayout>
    );
}

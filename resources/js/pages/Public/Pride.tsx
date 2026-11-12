import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Award, Quote, Star } from 'lucide-react';
import React from 'react';
import { openMiniTest } from '@/components/public/MiniTestModal';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import { SapiusIsotype, SapiusWordmark } from '@/components/public/SapiusLogo';
import LandingLayout from '@/layouts/LandingLayout';

export interface PrideRecord {
    id: number | string;
    name: string;
    text?: string | null;
    text2?: string | null;
    img?: string | null;
}

export interface ReviewRecord {
    id: number | string;
    user_name: string;
    content: string;
    rating?: number | null;
}

export interface PrideProps {
    prides?: PrideRecord[];
    reviews?: ReviewRecord[];
    scheduledCourses?: ScheduledCourseCandidate[];
}

const PLACEHOLDER_PRIDES: PrideRecord[] = [
    {
        id: 'pride-1',
        name: 'Premio CENEVAL al Desempeño de Excelencia',
        text: 'El acompañamiento semanal y los simuladores del Método SUMA me permitieron llegar con total seguridad el día de mi examen EGEL Nutrición.',
        text2: 'EGEL Plus Nutrición · Sobresaliente',
        img: null,
    },
    {
        id: 'pride-2',
        name: 'Testimonio de Desempeño Sobresaliente',
        text: 'Estudiar con videoclases concretas y exámenes diarios transformó por completo mi organización durante las 10 semanas de preparación.',
        text2: 'EGEL Plus Medicina · Sobresaliente',
        img: null,
    },
    {
        id: 'pride-3',
        name: 'Aprobación en Primera Aplicación',
        text: 'La guía digital e impresa resume exactamente lo que necesitas dominar sin perder tiempo buscando bibliografía dispersa.',
        text2: 'EGEL Plus Nutrición · Aprobado',
        img: null,
    },
];

const PLACEHOLDER_REVIEWS: ReviewRecord[] = [
    {
        id: 'rev-1',
        user_name: 'Egresada de Nutrición',
        content:
            'Excelente plataforma y profesores súper preparados. Las asesorías dominicales en vivo aclaran cada reactivo paso a paso.',
        rating: 5,
    },
    {
        id: 'rev-2',
        user_name: 'Egresado de Medicina',
        content:
            'Los simuladores cronometrados son idénticos en exigencia al examen real; me ayudaron muchísimo a controlar mis tiempos.',
        rating: 5,
    },
    {
        id: 'rev-3',
        user_name: 'Alumna Modalidad Asincrónica',
        content:
            'Pude combinar mis prácticas profesionales con el curso asincrónico de 10 semanas y obtuve resultado sobresaliente.',
        rating: 5,
    },
];

export default function Pride({
    prides = [],
    reviews = [],
    scheduledCourses,
}: PrideProps) {
    const displayedPrides =
        Array.isArray(prides) && prides.length > 0 ? prides : PLACEHOLDER_PRIDES;
    const displayedReviews =
        Array.isArray(reviews) && reviews.length > 0
            ? reviews
            : PLACEHOLDER_REVIEWS;

    const resolveMediaImg = (img?: string | null) => {
        if (!img) return '/img/brand2026/expert-placeholder.png';
        if (img.startsWith('http') || img.startsWith('/')) return img;
        return `/media/stream/${img}`;
    };

    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Orgullo Sapius — Historias de éxito y testimonios" />

            {/* =========================================================
                HERO ORGULLO SAPIUS
               ========================================================= */}
            <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 15% 25%, rgba(207, 228, 255, 0.85) 0%, transparent 58%), radial-gradient(circle at 86% 35%, rgba(255, 217, 206, 0.88) 0%, transparent 60%)',
                    }}
                />

                <div className="pointer-events-none absolute top-8 right-6 hidden opacity-65 md:block">
                    <PlusGridPattern rows={5} cols={5} color="coral" gap={28} size={7} />
                </div>
                <div className="pointer-events-none absolute bottom-6 left-6 hidden opacity-45 md:block">
                    <PlusGridPattern rows={4} cols={5} color="navy" gap={28} size={7} />
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#FF6B52]/35 bg-white/85 px-4 py-1.5 text-xs font-extrabold tracking-wider text-[#FF6B52] uppercase shadow-xs">
                            <Award className="h-3.5 w-3.5" />
                            Resultados que hablan por sí mismos
                        </span>

                        <div className="mt-5 flex flex-wrap items-baseline justify-center gap-3">
                            <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-6xl">
                                Orgullo
                            </h1>
                            <SapiusWordmark
                                variant="dark"
                                size="lg"
                                className="h-10 sm:h-12 lg:h-14"
                            />
                        </div>

                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#101E33]/75 sm:text-lg">
                            Conoce los logros, premios nacionales y testimonios
                            de egresados que alcanzaron su meta de titulación
                            con nuestra metodología.
                        </p>

                        {/* 3 KPIs Destacados */}
                        <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
                            {[
                                {
                                    kpi: '+5',
                                    label: 'Premios Nacionales EGEL',
                                },
                                {
                                    kpi: '99.1 %',
                                    label: 'aprobación y éxito',
                                },
                                {
                                    kpi: '+123',
                                    label: 'alumnos inscritos',
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border border-[#FF6B52]/45 bg-white/95 px-6 py-5 shadow-[0_12px_30px_-16px_rgba(16,30,51,0.14)]"
                                >
                                    <div className="font-display text-3xl font-extrabold text-[#101E33]">
                                        {stat.kpi}
                                    </div>
                                    <div className="mt-1 text-xs font-semibold text-[#101E33]/75">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                GALERÍA DE LOGROS DESTACADOS (prides)
               ========================================================= */}
            <section className="bg-[#101E33] py-20 text-white lg:py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <div className="flex items-center gap-3">
                                <SapiusIsotype variant="light" size="sm" />
                                <span className="text-xs font-bold tracking-widest text-[#FF6B52] uppercase">
                                    Historias destacadas
                                </span>
                            </div>
                            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Casos de éxito{' '}
                                <span className="text-[#FF6B52]">Sapius</span>
                            </h2>
                        </div>

                        <Link
                            href="/cursos"
                            className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                        >
                            Ver programas disponibles
                        </Link>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-3">
                        {displayedPrides.map((item, idx) => (
                            <motion.article
                                key={item.id}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{
                                    duration: 0.35,
                                    delay: idx * 0.06,
                                }}
                                className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-[#192B47] p-7 shadow-lg"
                            >
                                <div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#FF6B52] bg-white">
                                            <img
                                                src={resolveMediaImg(item.img)}
                                                alt={item.name}
                                                className="h-full w-full object-cover object-top"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-base leading-snug font-extrabold text-white">
                                                {item.name}
                                            </h3>
                                            {item.text2 && (
                                                <p className="mt-1 text-xs font-bold text-[#FF6B52]">
                                                    {item.text2}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {item.text && (
                                        <p className="mt-5 text-sm leading-relaxed text-white/80">
                                            “{item.text}”
                                        </p>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center gap-1 border-t border-white/10 pt-4">
                                    {[0, 1, 2, 3, 4].map((starIdx) => (
                                        <Star
                                            key={starIdx}
                                            className="h-4 w-4 fill-[#FF6B52] text-[#FF6B52]"
                                        />
                                    ))}
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================================
                MURO DE TESTIMONIOS VERIFICADOS (reviews)
               ========================================================= */}
            <section className="relative overflow-hidden bg-white py-20 lg:py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#101E33] sm:text-4xl">
                            Lo que opinan{' '}
                            <span className="text-[#FF6B52]">
                                nuestros alumnos
                            </span>
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-sm text-[#101E33]/75 sm:text-base">
                            Reseñas reales de quienes se prepararon con nuestras
                            guías, simuladores y cursos completos.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                        {displayedReviews.map((review, idx) => {
                            const stars = Math.max(
                                1,
                                Math.min(5, Number(review.rating) || 5),
                            );
                            return (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{
                                        duration: 0.35,
                                        delay: idx * 0.05,
                                    }}
                                    className="flex h-full flex-col justify-between rounded-2xl border border-[#FF6B52]/45 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.12)]"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                {Array.from({
                                                    length: stars,
                                                }).map((_, sIdx) => (
                                                    <Star
                                                        key={sIdx}
                                                        className="h-4 w-4 fill-[#FF6B52] text-[#FF6B52]"
                                                    />
                                                ))}
                                            </div>
                                            <Quote className="h-5 w-5 text-[#FF6B52]/40" />
                                        </div>

                                        <p className="mt-4 text-sm leading-relaxed text-[#101E33]/85">
                                            “{review.content}”
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center gap-3 border-t border-[#101E33]/10 pt-4">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#101E33] text-xs font-extrabold text-white">
                                            {(
                                                review.user_name?.[0] || 'S'
                                            ).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-extrabold text-[#101E33]">
                                                {review.user_name}
                                            </div>
                                            <div className="text-[11px] font-medium text-[#FF6B52]">
                                                Comunidad Sapius
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Tira CTA Mini-Test */}
                    <div className="mt-16 rounded-3xl bg-gradient-to-r from-[#CFE4FF]/55 via-white to-[#FFD9CE]/65 p-8 text-center shadow-xs sm:p-12">
                        <h3 className="font-display text-2xl font-extrabold text-[#101E33] sm:text-3xl">
                            El siguiente caso de éxito{' '}
                            <span className="text-[#FF6B52]">puedes ser tú</span>
                        </h3>
                        <p className="mx-auto mt-2 max-w-lg text-sm text-[#101E33]/75 sm:text-base">
                            Realiza nuestro test gratuito de 6 preguntas para
                            encontrar el paquete exacto según tu fecha de examen.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3.5">
                            <button
                                type="button"
                                onClick={openMiniTest}
                                className="inline-flex min-w-[210px] items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                Realiza el test
                            </button>
                            <Link
                                href="/cursos"
                                className="inline-flex min-w-[210px] items-center justify-center rounded-full bg-[#101E33] px-8 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]"
                            >
                                Ver cursos y paquetes
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

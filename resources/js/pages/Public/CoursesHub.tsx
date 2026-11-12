import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import React from 'react';
import LandingLayout from '@/layouts/LandingLayout';

export interface ScheduledCourseItem {
    id: number | string;
    identificador?: string | null;
    activo?: string | boolean | number | null;
    precio?: number | string | null;
    price?: number | string | null;
    course_title?: string | null;
    course_description?: string | null;
    course_slug?: string | null;
    category_name?: string | null;
    course?: {
        title?: string | null;
        slug?: string | null;
        description?: string | null;
    } | null;
}

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

interface InlinePlusGridProps {
    rows?: number;
    cols?: number;
    color?: 'navy' | 'coral';
    gap?: number;
    size?: number;
    className?: string;
}

function InlinePlusGrid({
    rows = 5,
    cols = 5,
    color = 'navy',
    gap = 28,
    size = 8,
    className = '',
}: InlinePlusGridProps) {
    const stroke = color === 'coral' ? '#FF6B52' : '#101E33';
    const width = (cols - 1) * gap + size + 4;
    const height = (rows - 1) * gap + size + 4;
    const half = size / 2;

    const points: Array<{ cx: number; cy: number; key: string }> = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            points.push({
                cx: 2 + half + c * gap,
                cy: 2 + half + r * gap,
                key: `${r}-${c}`,
            });
        }
    }

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={`pointer-events-none select-none ${className}`.trim()}
        >
            {points.map(({ cx, cy, key }) => (
                <g
                    key={key}
                    stroke={stroke}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                >
                    <line x1={cx - half} y1={cy} x2={cx + half} y2={cy} />
                    <line x1={cx} y1={cy - half} x2={cx} y2={cy + half} />
                </g>
            ))}
        </svg>
    );
}

function HeroIsotypeWatermark({ className = '' }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 116 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={`pointer-events-none select-none ${className}`.trim()}
        >
            <path
                d="M42.2 84.5C20.5 84.5 6.1 74.4 4.5 57.4L28.6 53.7C29.8 61.9 35.2 65.9 43.1 65.9C50.1 65.9 54.2 63.0 54.2 58.7C54.2 54.3 50.6 52.3 38.4 49.9C19.1 46.1 8.0 38.8 8.0 23.7C8.0 7.6 21.7 -2.0 41.8 -2.0C61.4 -2.0 74.8 7.2 76.8 22.7L53.5 26.5C52.1 19.4 47.9 15.9 41.2 15.9C35.0 15.9 31.2 18.6 31.2 22.6C31.2 26.7 34.7 28.5 46.8 30.9C65.4 34.6 76.8 41.2 77.9 55.6C71.2 59.8 67.1 66.9 67.1 74.8C67.1 76.9 67.4 78.9 68.0 80.7C60.7 83.3 51.9 84.5 42.2 84.5Z"
                transform="translate(0, 8)"
                fill="#101E33"
            />
            <circle cx="93.5" cy="74.5" r="15.5" fill="#FF6B52" />
        </svg>
    );
}

const CENTER_QUICK_LINKS: Array<{ label: string; href: string }> = [
    { label: 'Nutrición digital 2026', href: '/guias-nutricion' },
    { label: 'Compacto nutrición', href: '/simuladores-nutricion' },
    { label: 'Globales nutrición', href: '/simuladores-nutricion' },
    { label: 'Medicina 5 simuladores', href: '/simuladores-medicina' },
    {
        label: 'Módulos y exámenes diarios',
        href: '/egel-plus-nutricion#paquetes',
    },
];

export default function CoursesHub({
    scheduledCourses = [],
    guiasMedicine = [],
    guiasNutrition = [],
    simulatorsMedicine = [],
    simulatorsNutrition = [],
}: CoursesHubProps) {
    const openMiniTest = () => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sapius:open-mini-test'));
        }
    };

    const activeCohorts = Array.isArray(scheduledCourses)
        ? scheduledCourses.slice(0, 6)
        : [];

    const totalAdminItems =
        (guiasMedicine?.length ?? 0) +
        (guiasNutrition?.length ?? 0) +
        (simulatorsMedicine?.length ?? 0) +
        (simulatorsNutrition?.length ?? 0);

    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Cursos, Guías y Simuladores | Sapius" />

            {/* HERO: "El curso ideal para ti" (Canva Page 2 - Top) */}
            <section className="relative overflow-hidden bg-white">
                {/* Degradado durazno suave a la izquierda + celeste a la derecha */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_22%,_#FFD9CE_0%,_transparent_48%),radial-gradient(circle_at_88%_45%,_#CFE4FF_0%,_transparent_56%)]"
                />

                {/* Grilla decorativa superior izquierda */}
                <div className="pointer-events-none absolute top-8 left-4 hidden opacity-35 sm:block lg:left-8">
                    <InlinePlusGrid
                        rows={6}
                        cols={4}
                        color="navy"
                        gap={28}
                        size={7}
                    />
                </div>

                {/* Grilla decorativa inferior central */}
                <div className="pointer-events-none absolute bottom-6 left-[38%] hidden opacity-75 lg:block">
                    <InlinePlusGrid
                        rows={4}
                        cols={5}
                        color="navy"
                        gap={28}
                        size={8}
                    />
                </div>

                {/* Grilla decorativa derecha en coral */}
                <div className="pointer-events-none absolute right-4 bottom-6 hidden opacity-80 md:block lg:right-8">
                    <InlinePlusGrid
                        rows={6}
                        cols={4}
                        color="coral"
                        gap={28}
                        size={8}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 pt-12 pb-0 sm:px-6 lg:px-8 lg:pt-16">
                    <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-8">
                        {/* Columna izquierda: Titular + CTAs */}
                        <div className="pb-10 lg:col-span-6 lg:pb-16">
                            <h1 className="font-display text-4xl leading-[1.06] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.75rem]">
                                El curso
                                <br />
                                ideal para ti
                            </h1>

                            <p className="mt-4 max-w-lg text-base leading-relaxed font-normal text-[#101E33]/80 sm:text-lg">
                                Conoce nuestros programas, cursos y simuladores
                            </p>

                            {/* Botones principales EGEL */}
                            <div className="mt-8 flex max-w-[270px] flex-col gap-3.5">
                                <Link
                                    href="/egel-plus-nutricion"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                >
                                    EGEL Nutrición
                                </Link>
                                <Link
                                    href="/egel-plus-medicina"
                                    className="inline-flex w-full items-center justify-center rounded-full border border-[#101E33]/25 bg-white/90 px-7 py-3 text-sm font-bold text-[#101E33] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B52] hover:text-[#FF6B52]"
                                >
                                    EGEL Medicina
                                </Link>
                            </div>

                            {/* Bloque Encuentra tu opción + Realiza el test */}
                            <div className="mt-9 max-w-[270px] text-center sm:text-left">
                                <p className="text-sm font-semibold text-[#101E33] sm:pl-6">
                                    Encuentra tu opción
                                </p>
                                <div className="mt-2.5 sm:pl-2">
                                    <button
                                        type="button"
                                        onClick={openMiniTest}
                                        className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-[#101E33] px-7 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]"
                                    >
                                        Realiza el test
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Columna derecha: Isotipo s. monumental + Estudiante */}
                        <div className="relative flex justify-center lg:col-span-6 lg:justify-end">
                            {/* Isotipo s. monumental detrás del hombro derecho */}
                            <HeroIsotypeWatermark className="absolute top-6 right-0 h-48 w-auto sm:top-4 sm:right-2 sm:h-64 lg:top-6 lg:-right-2 lg:h-72" />

                            <img
                                src="/img/brand2026/hero-student-cursos.png"
                                alt="Estudiante Sapius con cuaderno y audífonos"
                                className="relative z-10 max-h-[440px] w-auto object-contain object-bottom sm:max-h-[500px] lg:max-h-[540px]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN #guias-simuladores ("Guías y simuladores" - Pie de Canva Page 2) */}
            <section
                id="guias-simuladores"
                className="relative overflow-hidden bg-white py-20 lg:py-24"
            >
                {/* Sutil resplandor cálido en márgenes */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_85%,_#FFD9CE_0%,_transparent_42%),radial-gradient(circle_at_90%_20%,_#CFE4FF_0%,_transparent_40%)] opacity-60"
                />

                {/* Grilla decorativa superior derecha */}
                <div className="pointer-events-none absolute top-10 right-6 hidden opacity-70 lg:block">
                    <InlinePlusGrid
                        rows={4}
                        cols={5}
                        color="navy"
                        gap={28}
                        size={8}
                    />
                </div>

                {/* Grilla decorativa inferior izquierda */}
                <div className="pointer-events-none absolute bottom-8 left-4 hidden opacity-65 sm:block">
                    <InlinePlusGrid
                        rows={6}
                        cols={4}
                        color="coral"
                        gap={28}
                        size={7}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Encabezado centrado */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <h2 className="font-display text-3xl leading-[1.12] font-extrabold tracking-tight text-[#101E33] sm:text-4xl lg:text-[2.75rem]">
                            Guías y simuladores
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-[#101E33]/80 sm:text-lg">
                            Domina el CENEVAL con{' '}
                            <strong className="font-bold text-[#101E33]">
                                guías clave y simuladores
                            </strong>{' '}
                            reales que te preparan para titularte con seguridad.{' '}
                            <strong className="font-bold text-[#101E33]">
                                Estudia a tu ritmo
                            </strong>{' '}
                            o elige modalidades con asesoría experta.
                        </p>
                    </motion.div>

                    {/* 3 Columnas: Tarjeta Guías digitales | 5 Pills con borde coral | Tarjeta Simuladores */}
                    <div className="mt-14 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8">
                        {/* Izquierda: Guías digitales */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="lg:col-span-4"
                        >
                            <Link
                                href="/guias-nutricion"
                                className="group block overflow-hidden rounded-2xl border border-[#FF6B52]/55 bg-white/95 p-3 shadow-[0_14px_34px_-15px_rgba(16,30,51,0.16)] transition-all duration-200 hover:-translate-y-1 hover:border-[#FF6B52] hover:shadow-[0_20px_42px_-14px_rgba(16,30,51,0.22)]"
                            >
                                <div className="overflow-hidden rounded-xl border border-[#FF6B52]/30 bg-[#F7F9FC]">
                                    <img
                                        src="/img/brand2026/card-guias-digitales.png"
                                        alt="Guía Digital EGEL Nutrición y Medicina - Sapius"
                                        className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                    />
                                </div>
                                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#101E33] px-5 py-3.5 text-white transition-colors group-hover:bg-[#192B47]">
                                    <h3 className="font-display text-lg font-extrabold tracking-tight">
                                        Guías digitales
                                    </h3>
                                    <ArrowRight className="h-4 w-4 text-[#FF6B52] transition-transform duration-200 group-hover:translate-x-1" />
                                </div>
                            </Link>
                        </motion.div>

                        {/* Centro: 5 botones pill blancos con borde coral */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{
                                duration: 0.42,
                                delay: 0.06,
                                ease: 'easeOut',
                            }}
                            className="flex flex-col items-center justify-center gap-3 lg:col-span-4"
                        >
                            {CENTER_QUICK_LINKS.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="inline-flex w-full max-w-[300px] items-center justify-center rounded-full border border-[#FF6B52]/65 bg-white px-6 py-3 text-center text-sm font-bold text-[#101E33] shadow-[0_8px_20px_-12px_rgba(255,107,82,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B52] hover:bg-[#FF6B52] hover:text-white"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </motion.div>

                        {/* Derecha: Simuladores */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{
                                duration: 0.4,
                                delay: 0.1,
                                ease: 'easeOut',
                            }}
                            className="lg:col-span-4"
                        >
                            <Link
                                href="/simuladores-medicina"
                                className="group block overflow-hidden rounded-2xl border border-[#FF6B52]/55 bg-white/95 p-3 shadow-[0_14px_34px_-15px_rgba(16,30,51,0.16)] transition-all duration-200 hover:-translate-y-1 hover:border-[#FF6B52] hover:shadow-[0_20px_42px_-14px_rgba(16,30,51,0.22)]"
                            >
                                <div className="overflow-hidden rounded-xl border border-[#FF6B52]/30 bg-[#F7F9FC]">
                                    <img
                                        src="/img/brand2026/card-simuladores.png"
                                        alt="Simuladores EGEL Nutrición y Medicina - Sapius"
                                        className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                    />
                                </div>
                                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#101E33] px-5 py-3.5 text-white transition-colors group-hover:bg-[#192B47]">
                                    <h3 className="font-display text-lg font-extrabold tracking-tight">
                                        Simuladores
                                    </h3>
                                    <ArrowRight className="h-4 w-4 text-[#FF6B52] transition-transform duration-200 group-hover:translate-x-1" />
                                </div>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Cohortes activas en base de datos si existen */}
                    {activeCohorts.length > 0 && (
                        <div className="mt-20 border-t border-[#101E33]/10 pt-16">
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD9CE]/60 px-3.5 py-1 text-xs font-bold text-[#101E33]">
                                        <Sparkles className="h-3.5 w-3.5 text-[#FF6B52]" />
                                        Inscripciones abiertas
                                        {totalAdminItems > 0
                                            ? ` · ${totalAdminItems} recursos destacados`
                                            : ''}
                                    </span>
                                    <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-[#101E33] sm:text-3xl">
                                        Próximas aperturas disponibles
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={openMiniTest}
                                    className="inline-flex items-center justify-center rounded-full border border-[#101E33]/25 bg-white px-5 py-2 text-xs font-bold text-[#101E33] transition-colors hover:border-[#FF6B52] hover:text-[#FF6B52]"
                                >
                                    ¿No sabes cuál elegir? Haz el test
                                </button>
                            </div>

                            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {activeCohorts.map((cohort) => {
                                    const title =
                                        cohort.course_title ||
                                        cohort.course?.title ||
                                        cohort.identificador ||
                                        'Programa Sapius';
                                    const description =
                                        cohort.course_description ||
                                        cohort.course?.description ||
                                        'Preparación integral con simuladores y acompañamiento experto.';
                                    const numericPrice = Number(
                                        cohort.precio ?? cohort.price ?? 0,
                                    );

                                    return (
                                        <div
                                            key={cohort.id}
                                            className="flex flex-col justify-between rounded-2xl border border-[#FF6B52]/45 bg-white/95 p-6 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.12)]"
                                        >
                                            <div>
                                                {cohort.category_name && (
                                                    <span className="inline-block rounded-full bg-[#CFE4FF]/55 px-3 py-0.5 text-[11px] font-bold text-[#101E33]">
                                                        {cohort.category_name}
                                                    </span>
                                                )}
                                                <h4 className="mt-2 font-display text-lg font-extrabold text-[#101E33]">
                                                    {title}
                                                </h4>
                                                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#101E33]/75">
                                                    {description}
                                                </p>
                                            </div>

                                            <div className="mt-5 flex items-center justify-between border-t border-[#101E33]/10 pt-4">
                                                <div>
                                                    <span className="font-display text-xl font-extrabold text-[#101E33]">
                                                        $
                                                        {numericPrice.toLocaleString(
                                                            'es-MX',
                                                        )}{' '}
                                                        mxn
                                                    </span>
                                                </div>
                                                <Link
                                                    href={`/checkout/${cohort.id}`}
                                                    className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-5 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                                >
                                                    Comprar
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </LandingLayout>
    );
}

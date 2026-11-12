import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import React from 'react';
import LandingLayout from '@/layouts/LandingLayout';

export interface ScheduledCourseRecord {
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

export interface ManageableGuiaItem {
    id: number | string;
    image?: string | null;
    titulo?: string | null;
    descripcion?: string | null;
    type?: string | null;
    category?: string | null;
    position?: number | null;
}

export interface GuiasLandingProps {
    area?: string;
    guias?: ScheduledCourseRecord[];
    scheduledCourses?: ScheduledCourseRecord[];
    manageableCards?: ManageableGuiaItem[];
    cards?: ManageableGuiaItem[];
    manageableGuias?: ManageableGuiaItem[];
}

const WHATSAPP_PHONE = '521234567890';

function normalizeStr(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function resolveAction(
    courses: ScheduledCourseRecord[] | undefined,
    keywords: string[],
    mode: 'buy' | 'waitlist' | 'presale',
    whatsappLabel: string,
): { href: string; isExternal: boolean } {
    if (mode === 'waitlist') {
        const text = `Hola equipo Sapius, deseo anotarme en la lista de espera para: ${whatsappLabel}.`;
        return {
            href: `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(text)}`,
            isExternal: true,
        };
    }

    if (mode === 'presale') {
        const text = `Hola equipo Sapius, quiero adquirir en preventa: ${whatsappLabel}.`;
        return {
            href: `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(text)}`,
            isExternal: true,
        };
    }

    const list = Array.isArray(courses) ? courses : [];
    const normalizedKeywords = keywords.map(normalizeStr).filter(Boolean);

    if (list.length > 0 && normalizedKeywords.length > 0) {
        const match = list.find((item) => {
            const active =
                item.activo === undefined ||
                item.activo === null ||
                item.activo === 'si' ||
                item.activo === true ||
                item.activo === 1;
            if (!active) return false;

            const haystack = normalizeStr(
                `${item.identificador ?? ''} ${item.course_title ?? ''} ${item.course?.title ?? ''} ${item.course_slug ?? ''} ${item.course?.slug ?? ''}`,
            );
            return normalizedKeywords.every((kw) => haystack.includes(kw));
        });

        if (match && match.id !== undefined && match.id !== null) {
            return { href: `/checkout/${match.id}`, isExternal: false };
        }
    }

    return { href: '/register', isExternal: false };
}

function InlinePlusGrid({
    rows = 5,
    cols = 5,
    color = 'navy',
    gap = 26,
    size = 7,
    className = '',
}: {
    rows?: number;
    cols?: number;
    color?: 'navy' | 'coral';
    gap?: number;
    size?: number;
    className?: string;
}) {
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

interface OfficialGuiaPackage {
    title: string;
    ribbon?: string;
    ctaLabel: 'Comprar' | 'Lista de espera' | 'Preventa';
    mode: 'buy' | 'waitlist' | 'presale';
    price: string;
    oldPrice?: string;
    paymentNote: string;
    description: string;
    keywords: string[];
    whatsappLabel: string;
}

const NUTRICION_GUIA_PACKAGES: OfficialGuiaPackage[] = [
    {
        title: 'Guía digital',
        ribbon: 'MÁS POPULAR',
        ctaLabel: 'Comprar',
        mode: 'buy',
        price: '$999 mxn',
        paymentNote: 'Un solo pago',
        description:
            'Libro digital de repaso en la plataforma; no incluye videoclases ni asesorías por sí sola.',
        keywords: ['nutricion', 'guia'],
        whatsappLabel: 'Guía digital EGEL Nutrición ($999 mxn)',
    },
    {
        title: 'Guía digital + simuladores',
        ctaLabel: 'Comprar',
        mode: 'buy',
        price: '$1,999 mxn',
        paymentNote: 'Un solo pago',
        description:
            '30 reactivos, 60 segundos. 2 intentos (confirmado por Sapius).',
        keywords: ['nutricion', 'guia', 'simulador'],
        whatsappLabel: 'Guía digital + simuladores EGEL Nutrición ($1,999 mxn)',
    },
    {
        title: 'Curso completo Premium',
        ribbon: 'PROMOCIÓN',
        ctaLabel: 'Comprar',
        mode: 'buy',
        price: '$5,999 mxn',
        oldPrice: '$6,750 mxn',
        paymentNote: 'Opciones de pago',
        description:
            'Incluye guía digital e impresa, 10 semanas de preparación, simuladores, asesorías en vivo y kit de estudio SAPIUS.',
        keywords: ['nutricion', 'premium'],
        whatsappLabel: 'Curso completo Premium EGEL Nutrición ($5,999 mxn)',
    },
];

const MEDICINA_GUIA_PACKAGES: OfficialGuiaPackage[] = [
    {
        title: 'Guía digital',
        ribbon: 'MUY PRONTO',
        ctaLabel: 'Lista de espera',
        mode: 'waitlist',
        price: '$999 mxn',
        paymentNote: 'Un solo pago',
        description: 'Próximamente.',
        keywords: ['medicina', 'guia'],
        whatsappLabel: 'Guía digital EGEL Medicina ($999 mxn)',
    },
    {
        title: 'Guía digital + paquete de 5',
        ribbon: 'PROMOCIÓN 2027',
        ctaLabel: 'Preventa',
        mode: 'presale',
        price: '$2,999 mxn',
        oldPrice: '$3,494 mxn',
        paymentNote: 'Un solo pago',
        description:
            '30 reactivos, 60 segundos. 2 intentos (confirmado por Sapius).',
        keywords: ['medicina', 'preventa'],
        whatsappLabel: 'Guía digital + paquete de 5 EGEL Medicina ($2,999 mxn)',
    },
];

export default function GuiasLanding({
    area = 'medicina',
    guias = [],
    scheduledCourses = [],
    manageableCards = [],
    cards = [],
    manageableGuias = [],
}: GuiasLandingProps) {
    const isNutricion = normalizeStr(area) === 'nutricion';
    const areaDisplay = isNutricion ? 'Nutrición' : 'Medicina';
    const allCourses =
        scheduledCourses && scheduledCourses.length > 0
            ? scheduledCourses
            : guias;

    const adminCards =
        manageableCards && manageableCards.length > 0
            ? manageableCards
            : cards && cards.length > 0
              ? cards
              : manageableGuias;

    const officialPackages = isNutricion
        ? NUTRICION_GUIA_PACKAGES
        : MEDICINA_GUIA_PACKAGES;

    const openMiniTest = () => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sapius:open-mini-test'));
        }
    };

    return (
        <LandingLayout scheduledCourses={allCourses}>
            <Head title={`Guías Digitales ${areaDisplay} | Sapius`} />

            {/* HERO LUMINOSO DE GUÍAS DIGITALES */}
            <section className="relative overflow-hidden bg-white py-14 lg:py-20">
                <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 ${
                        isNutricion
                            ? 'bg-[radial-gradient(circle_at_12%_20%,_#FFD9CE_0%,_transparent_50%),radial-gradient(circle_at_88%_60%,_#CFE4FF_0%,_transparent_55%)]'
                            : 'bg-[radial-gradient(circle_at_12%_20%,_#CFE4FF_0%,_transparent_50%),radial-gradient(circle_at_88%_60%,_#FFD9CE_0%,_transparent_52%)]'
                    }`}
                />

                <div className="pointer-events-none absolute top-10 right-8 hidden opacity-70 lg:block">
                    <InlinePlusGrid
                        rows={5}
                        cols={4}
                        color="coral"
                        gap={28}
                        size={7}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Selector Pill entre Nutrición y Medicina */}
                    <div className="mb-8 inline-flex items-center rounded-full border border-[#FF6B52]/40 bg-white/90 p-1 shadow-xs">
                        <Link
                            href="/guias-nutricion"
                            className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all ${
                                isNutricion
                                    ? 'bg-[#FF6B52] text-white shadow-xs'
                                    : 'text-[#101E33]/75 hover:text-[#101E33]'
                            }`}
                        >
                            Nutrición
                        </Link>
                        <Link
                            href="/guias-medicina"
                            className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all ${
                                !isNutricion
                                    ? 'bg-[#101E33] text-white shadow-xs'
                                    : 'text-[#101E33]/75 hover:text-[#101E33]'
                            }`}
                        >
                            Medicina
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                        {/* Columna izquierda */}
                        <div className="lg:col-span-6">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold text-[#FF6B52] ring-1 ring-[#FF6B52]/35">
                                <BookOpen className="h-3.5 w-3.5" />
                                Material de Estudio Oficial Sapius
                            </span>

                            <h1 className="mt-4 font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.4rem]">
                                Guías digitales{' '}
                                <span className="text-[#FF6B52]">
                                    EGEL {areaDisplay}
                                </span>
                            </h1>

                            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#101E33]/80 sm:text-lg">
                                Domina el CENEVAL con compendios estructurados
                                por áreas clave, esquemas de alto rendimiento y
                                acceso directo desde la plataforma Sapius.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3.5">
                                <a
                                    href="#paquetes-guias"
                                    className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                >
                                    Ver guías y paquetes
                                </a>
                                <Link
                                    href={
                                        isNutricion
                                            ? '/egel-plus-nutricion'
                                            : '/egel-plus-medicina'
                                    }
                                    className="inline-flex items-center justify-center rounded-full border border-[#101E33]/25 bg-white/90 px-7 py-3 text-sm font-bold text-[#101E33] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B52] hover:text-[#FF6B52]"
                                >
                                    Ver curso completo EGEL {areaDisplay}
                                </Link>
                            </div>
                        </div>

                        {/* Columna derecha: Imagen oficial card-guias-digitales.png */}
                        <div className="lg:col-span-6">
                            <div className="overflow-hidden rounded-3xl border border-[#FF6B52]/55 bg-white p-3 shadow-[0_18px_42px_-16px_rgba(16,30,51,0.18)]">
                                <img
                                    src="/img/brand2026/card-guias-digitales.png"
                                    alt={`Guía Digital EGEL ${areaDisplay} - Sapius`}
                                    className="aspect-[16/10] w-full rounded-2xl object-cover"
                                />
                                <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#101E33] px-5 py-3.5 text-white">
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-wider text-[#FF6B52] uppercase">
                                            Edición 2026 / 2027
                                        </p>
                                        <p className="font-display text-base font-extrabold">
                                            Guía Digital EGEL {areaDisplay}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-[#FF6B52]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PAQUETES OFICIALES CON BORDE CORAL */}
            <section id="paquetes-guias" className="bg-white py-16 lg:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#101E33] sm:text-4xl">
                            Elige tu{' '}
                            <span className="text-[#FF6B52]">guía ideal</span>{' '}
                            en {areaDisplay}
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-[#101E33]/75 sm:text-base">
                            Estudia a tu ritmo con nuestra guía digital o
                            combínala con simuladores cronometrados tipo
                            CENEVAL.
                        </p>
                    </div>

                    <div
                        className={`mt-12 grid grid-cols-1 gap-6 ${
                            officialPackages.length === 2
                                ? 'mx-auto max-w-3xl sm:grid-cols-2'
                                : 'sm:grid-cols-2 lg:grid-cols-3'
                        }`}
                    >
                        {officialPackages.map((pkg) => {
                            const action = resolveAction(
                                allCourses,
                                pkg.keywords,
                                pkg.mode,
                                pkg.whatsappLabel,
                            );
                            const isNavy =
                                pkg.ctaLabel === 'Lista de espera' ||
                                pkg.ctaLabel === 'Preventa';
                            const btnClasses = `inline-flex min-w-[152px] items-center justify-center rounded-full px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${
                                isNavy
                                    ? 'bg-[#101E33] hover:bg-[#192B47]'
                                    : 'bg-[#FF6B52] hover:bg-[#F0563C]'
                            }`;

                            return (
                                <motion.div
                                    key={pkg.title}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{
                                        duration: 0.38,
                                        ease: 'easeOut',
                                    }}
                                    className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#FF6B52]/55 bg-white p-6 shadow-[0_12px_32px_-16px_rgba(16,30,51,0.14)]"
                                >
                                    {pkg.ribbon && (
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute top-4 -right-10 w-36 rotate-45 bg-[#FF6B52] py-1 text-center text-[9.5px] font-extrabold tracking-wider text-white uppercase shadow-sm"
                                        >
                                            {pkg.ribbon}
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="mx-auto max-w-[220px] text-center font-display text-lg leading-snug font-extrabold text-[#101E33]">
                                            {pkg.title}
                                        </h3>

                                        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
                                            <span className="font-display text-2xl font-extrabold text-[#101E33] sm:text-3xl">
                                                {pkg.price}
                                            </span>
                                            <span className="text-xs font-medium text-[#FF6B52]">
                                                {pkg.paymentNote}
                                            </span>
                                        </div>

                                        {pkg.oldPrice && (
                                            <div className="mt-0.5 text-xs font-bold text-[#FF6B52]/75 line-through">
                                                {pkg.oldPrice}
                                            </div>
                                        )}

                                        <p className="mt-4 text-xs leading-relaxed text-[#101E33]/80">
                                            {pkg.description}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex justify-center pt-2">
                                        {action.isExternal ? (
                                            <a
                                                href={action.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={btnClasses}
                                            >
                                                {pkg.ctaLabel}
                                            </a>
                                        ) : (
                                            <Link
                                                href={action.href}
                                                className={btnClasses}
                                            >
                                                {pkg.ctaLabel}
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Cursos activos en BD (`guias`) si existen */}
                    {guias && guias.length > 0 && (
                        <div className="mt-16 border-t border-[#101E33]/10 pt-14">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#FF6B52]" />
                                <h3 className="font-display text-2xl font-extrabold text-[#101E33]">
                                    Guías activas disponibles para compra
                                    directa
                                </h3>
                            </div>
                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {guias.map((item) => {
                                    const title =
                                        item.course_title ||
                                        item.course?.title ||
                                        item.identificador ||
                                        `Guía ${areaDisplay}`;
                                    const priceNum = Number(
                                        item.precio ?? item.price ?? 0,
                                    );
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex flex-col justify-between rounded-2xl border border-[#FF6B52]/45 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.12)]"
                                        >
                                            <div>
                                                <h4 className="font-display text-lg font-extrabold text-[#101E33]">
                                                    {title}
                                                </h4>
                                                {item.identificador && (
                                                    <p className="mt-1 text-[11px] font-medium text-[#101E33]/55">
                                                        Código:{' '}
                                                        {item.identificador}
                                                    </p>
                                                )}
                                                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-[#101E33]/75">
                                                    {item.course_description ||
                                                        item.course
                                                            ?.description ||
                                                        'Compendio digital estructurado para preparación de examen.'}
                                                </p>
                                            </div>
                                            <div className="mt-6 flex items-center justify-between border-t border-[#101E33]/10 pt-4">
                                                <span className="font-display text-2xl font-extrabold text-[#101E33]">
                                                    $
                                                    {priceNum.toLocaleString(
                                                        'es-MX',
                                                    )}{' '}
                                                    mxn
                                                </span>
                                                <Link
                                                    href={`/checkout/${item.id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B52] px-5 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                                >
                                                    Comprar
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tarjetas administrables (`manageableCards`) si existen */}
                    {adminCards && adminCards.length > 0 && (
                        <div className="mt-16 border-t border-[#101E33]/10 pt-14">
                            <h3 className="font-display text-2xl font-extrabold text-[#101E33]">
                                Contenidos incluidos en las guías de{' '}
                                {areaDisplay}
                            </h3>
                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {adminCards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="overflow-hidden rounded-2xl border border-[#FF6B52]/40 bg-white p-5 shadow-xs"
                                    >
                                        {card.image && (
                                            <img
                                                src={
                                                    card.image.startsWith(
                                                        'http',
                                                    ) ||
                                                    card.image.startsWith('/')
                                                        ? card.image
                                                        : `/media/stream/${card.image}`
                                                }
                                                alt={
                                                    card.titulo ||
                                                    'Guía Sapius'
                                                }
                                                className="mb-4 aspect-[16/10] w-full rounded-xl object-cover"
                                            />
                                        )}
                                        {card.category && (
                                            <span className="inline-block rounded-full bg-[#CFE4FF]/60 px-3 py-0.5 text-[11px] font-bold text-[#101E33]">
                                                {card.category}
                                            </span>
                                        )}
                                        <h4 className="mt-2 font-display text-base font-extrabold text-[#101E33]">
                                            {card.titulo ||
                                                `Módulo de ${areaDisplay}`}
                                        </h4>
                                        {card.descripcion && (
                                            <p className="mt-1.5 text-xs leading-relaxed text-[#101E33]/75">
                                                {card.descripcion}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bloque CTA Mini-Test */}
                    <div className="mt-16 rounded-3xl border border-[#FF6B52]/35 bg-[radial-gradient(circle_at_top_right,_#FFD9CE_0%,_#CFE4FF_55%,_#FFFFFF_100%)] p-8 sm:p-10">
                        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                            <div>
                                <h3 className="font-display text-2xl font-extrabold text-[#101E33] sm:text-3xl">
                                    ¿Todavía no sabes cuál elegir?
                                </h3>
                                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#101E33]/80 sm:text-base">
                                    Realiza el mini test de 6 preguntas para
                                    descubrir si necesitas únicamente la guía
                                    digital, simuladores o el curso completo.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={openMiniTest}
                                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#101E33] px-8 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]"
                            >
                                Realiza el test
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

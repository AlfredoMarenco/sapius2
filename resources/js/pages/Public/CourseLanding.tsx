import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Clock,
    Layers,
    MessageCircleQuestion,
    ShieldCheck,
    Sparkles,
    Star,
} from 'lucide-react';
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

export interface PublicReviewItem {
    id: number | string;
    name?: string | null;
    author?: string | null;
    comment?: string | null;
    content?: string | null;
    rating?: number | null;
}

export interface CourseLandingProps {
    slug: string;
    reviews?: PublicReviewItem[];
    scheduledCourses?: ScheduledCourseRecord[];
}

const WHATSAPP_PHONE = '521234567890';

interface ActionTarget {
    href: string;
    isExternal: boolean;
}

function normalizeText(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function resolvePackageAction(
    scheduledCourses: ScheduledCourseRecord[] | undefined,
    keywords: string[],
    mode: 'buy' | 'waitlist' | 'presale',
    whatsappLabel: string,
): ActionTarget {
    if (mode === 'waitlist') {
        const message = `Hola equipo Sapius, me gustaría registrarme en la lista de espera para ${whatsappLabel}. ¿Me pueden avisar cuando esté disponible?`;
        return {
            href: `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`,
            isExternal: true,
        };
    }

    if (mode === 'presale') {
        const message = `Hola equipo Sapius, quiero inscribirme en preventa para ${whatsappLabel}. ¿Me comparten detalles y formas de pago?`;
        return {
            href: `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`,
            isExternal: true,
        };
    }

    const list = Array.isArray(scheduledCourses) ? scheduledCourses : [];
    const normalizedKeywords = keywords.map(normalizeText).filter(Boolean);

    if (list.length > 0 && normalizedKeywords.length > 0) {
        const match = list.find((course) => {
            const isActive =
                course.activo === undefined ||
                course.activo === null ||
                course.activo === 'si' ||
                course.activo === true ||
                course.activo === 1;
            if (!isActive) return false;

            const haystack = normalizeText(
                `${course.identificador ?? ''} ${course.course_title ?? ''} ${course.course?.title ?? ''} ${course.course_slug ?? ''} ${course.course?.slug ?? ''}`,
            );

            return normalizedKeywords.every((kw) => haystack.includes(kw));
        });

        if (match && match.id !== undefined && match.id !== null) {
            return {
                href: `/checkout/${match.id}`,
                isExternal: false,
            };
        }
    }

    return {
        href: '/register',
        isExternal: false,
    };
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

    const items: Array<{ cx: number; cy: number; key: string }> = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            items.push({
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
            {items.map(({ cx, cy, key }) => (
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

function IsotypeMark({
    variant = 'dark',
    className = '',
}: {
    variant?: 'dark' | 'light';
    className?: string;
}) {
    const baseFill = variant === 'light' ? '#FFFFFF' : '#101E33';
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
                fill={baseFill}
            />
            <circle cx="93.5" cy="74.5" r="15.5" fill="#FF6B52" />
        </svg>
    );
}

interface EgelBook3DMockupProps {
    areaTitle: 'EGEL Nutrición' | 'EGEL Medicina';
    spineText: string;
}

function EgelBook3DMockup({ areaTitle, spineText }: EgelBook3DMockupProps) {
    const [lineOne, lineTwo] = areaTitle.split(' ');

    return (
        <div className="relative mx-auto w-full max-w-[560px] select-none">
            {/* Sombra suave de apoyo bajo el libro y los 3 tomos */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[8%] bottom-[4%] left-[12%] h-7 rounded-full bg-[#101E33]/25 blur-xl"
            />

            <img
                src="/img/brand2026/book-3d-egel.png"
                alt={`Manual ${areaTitle} Sapius`}
                className="relative z-10 w-full h-auto drop-shadow-[0_24px_32px_rgba(16,30,51,0.22)]"
            />

            {/* Sobreimpresión precisa sobre la portada inclinada (~30deg) */}
            <div
                aria-hidden="true"
                style={{ transform: 'rotate(30deg)' }}
                className="pointer-events-none absolute top-[19%] left-[21%] z-20 flex h-[58%] w-[39%] flex-col justify-between p-3 sm:p-4"
            >
                <div className="text-right text-[8px] font-semibold tracking-[0.22em] text-[#FF6B52]/95 uppercase sm:text-[10px]">
                    modalidad virtual
                </div>

                <div className="pl-1 sm:pl-2">
                    <div className="font-display text-lg leading-[1.04] font-extrabold tracking-tight text-white sm:text-2xl lg:text-[1.65rem]">
                        {lineOne}
                        <br />
                        {lineTwo}
                    </div>
                    <div className="mt-1.5 text-[8px] font-semibold tracking-[0.24em] text-[#FF6B52] uppercase sm:text-[10px]">
                        curso 2027
                    </div>
                </div>

                <div className="flex justify-end pr-1 pb-0.5">
                    <IsotypeMark variant="light" className="h-7 w-auto sm:h-9" />
                </div>
            </div>

            {/* Sobreimpresión vertical en los 3 lomos derechos */}
            {[70.4, 76.2, 81.8].map((leftPct, index) => (
                <div
                    key={index}
                    aria-hidden="true"
                    style={{
                        left: `${leftPct}%`,
                        writingMode: 'vertical-rl',
                    }}
                    className="pointer-events-none absolute top-[31%] bottom-[13%] z-20 flex items-center justify-center text-[7.5px] font-medium tracking-wider text-white/85 sm:text-[9px]"
                >
                    {spineText}
                </div>
            ))}
        </div>
    );
}

interface PackageCardData {
    title: string;
    ctaLabel: 'Comprar' | 'Lista de espera' | 'Preventa';
    ctaMode: 'buy' | 'waitlist' | 'presale';
    price: string;
    oldPrice?: string;
    paymentNote: string;
    description?: string;
    bullets?: string[];
    footnote?: string;
    ribbon?: string;
    keywords: string[];
    whatsappLabel: string;
}

interface SapiusPackageCardProps {
    pkg: PackageCardData;
    scheduledCourses?: ScheduledCourseRecord[];
    ctaBetweenTitleAndPrice?: boolean;
}

function SapiusPackageCard({
    pkg,
    scheduledCourses,
    ctaBetweenTitleAndPrice = true,
}: SapiusPackageCardProps) {
    const target = resolvePackageAction(
        scheduledCourses,
        pkg.keywords,
        pkg.ctaMode,
        pkg.whatsappLabel,
    );

    const isNavyButton =
        pkg.ctaLabel === 'Lista de espera' || pkg.ctaLabel === 'Preventa';

    const ctaClassName = `inline-flex min-w-[148px] items-center justify-center rounded-full px-6 py-2 text-xs font-bold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${
        isNavyButton
            ? 'bg-[#101E33] hover:bg-[#192B47]'
            : 'bg-[#FF6B52] hover:bg-[#F0563C]'
    }`;

    const ctaElement = target.isExternal ? (
        <a
            href={target.href}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaClassName}
        >
            {pkg.ctaLabel}
        </a>
    ) : (
        <Link href={target.href} className={ctaClassName}>
            {pkg.ctaLabel}
        </Link>
    );

    return (
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#FF6B52]/55 bg-white/95 p-6 shadow-[0_12px_32px_-16px_rgba(16,30,51,0.14)] transition-all duration-200 hover:border-[#FF6B52] hover:shadow-[0_18px_38px_-14px_rgba(16,30,51,0.2)]">
            {pkg.ribbon && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-4 -right-10 w-36 rotate-45 bg-[#FF6B52] py-1 text-center text-[9.5px] font-extrabold tracking-wider text-white uppercase shadow-sm"
                >
                    {pkg.ribbon}
                </div>
            )}

            <div>
                <h3 className="mx-auto max-w-[205px] text-center font-display text-lg leading-snug font-extrabold text-[#101E33]">
                    {pkg.title}
                </h3>

                {ctaBetweenTitleAndPrice && (
                    <div className="mt-4 flex justify-center">{ctaElement}</div>
                )}

                <div className="mt-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-display text-2xl font-extrabold tracking-tight text-[#101E33] sm:text-[1.6rem]">
                            {pkg.price}
                        </span>
                        <span className="text-[11px] leading-tight font-medium text-[#FF6B52]">
                            {pkg.paymentNote}
                        </span>
                    </div>

                    {pkg.oldPrice && (
                        <div className="mt-0.5 text-xs font-bold text-[#FF6B52]/80 line-through">
                            {pkg.oldPrice}
                        </div>
                    )}
                </div>

                {pkg.description && (
                    <p className="mt-4 text-xs leading-relaxed text-[#101E33]/80">
                        {pkg.description}
                    </p>
                )}

                {pkg.bullets && pkg.bullets.length > 0 && (
                    <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-[#101E33]/85">
                        {pkg.bullets.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-2">
                                <span
                                    aria-hidden="true"
                                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#101E33]"
                                />
                                <span>{bullet}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {pkg.footnote && (
                    <p className="mt-4 text-[11px] leading-relaxed text-[#101E33]/70">
                        {pkg.footnote}
                    </p>
                )}
            </div>

            {!ctaBetweenTitleAndPrice && (
                <div className="mt-6 flex justify-center pt-2">
                    {ctaElement}
                </div>
            )}
        </div>
    );
}

const NUTRICION_TOP_PACKAGES: PackageCardData[] = [
    {
        title: 'Simulador compacto',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$299 mxn',
        paymentNote: 'Un solo pago',
        description:
            '30 reactivos, 60 segundos. 2 intentos (confirmado por Sapius).',
        keywords: ['nutricion', 'compacto'],
        whatsappLabel: 'Simulador compacto EGEL Nutrición ($299 mxn)',
    },
    {
        title: 'Guía digital',
        ribbon: 'MÁS POPULAR',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$999 mxn',
        paymentNote: 'Un solo pago',
        description:
            'Libro digital de repaso en la plataforma; no incluye videoclases ni asesorías por sí sola.',
        keywords: ['nutricion', 'guia'],
        whatsappLabel: 'Guía digital EGEL Nutrición ($999 mxn)',
    },
    {
        title: 'Simuladores digitales',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$1,499 mxn',
        paymentNote: 'Un solo pago',
        description:
            'Batería de simuladores con preguntas, tiempo, intentos y retroalimentación según instrumento.',
        keywords: ['nutricion', 'simulador'],
        whatsappLabel: 'Simuladores digitales EGEL Nutrición ($1,499 mxn)',
    },
    {
        title: 'Guía digital + simuladores',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$1,999 mxn',
        paymentNote: 'Un solo pago',
        description:
            '30 reactivos, 60 segundos. 2 intentos (confirmado por Sapius).',
        keywords: ['nutricion', 'guia', 'simulador'],
        whatsappLabel: 'Guía digital + simuladores EGEL Nutrición ($1,999 mxn)',
    },
];

const NUTRICION_BOTTOM_PACKAGES: PackageCardData[] = [
    {
        title: 'Curso completo asincrónico',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$4,499 mxn',
        paymentNote: 'Opciones de pago',
        bullets: [
            '10 semanas',
            'Videoclases',
            'Lecturas',
            'Tareas',
            'Exámenes diarios',
            'Retroalimentación',
            'Guía digital',
            'Simuladores digitales',
        ],
        footnote: 'No incluye asesorías en vivo, guía impresa ni garantía.',
        keywords: ['nutricion', 'asincronico'],
        whatsappLabel: 'Curso completo asincrónico EGEL Nutrición ($4,499 mxn)',
    },
    {
        title: 'Curso completo Premium',
        ribbon: 'PROMOCIÓN',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$5,999 mxn',
        oldPrice: '$6,750 mxn',
        paymentNote: 'Opciones de pago',
        bullets: [
            '10 semanas',
            'Videoclases',
            'Lecturas',
            'Tareas',
            'Exámenes diarios',
            'Retroalimentación',
            'Guía digital e impresa',
            'Simuladores digitales',
            'Simulador compacto',
            'Asesorías dominicales y finales en vivo',
            'Kit de estudio SAPIUS',
            'Garantía condicionada',
        ],
        keywords: ['nutricion', 'premium'],
        whatsappLabel: 'Curso completo Premium EGEL Nutrición ($5,999 mxn)',
    },
];

const MEDICINA_PACKAGES: PackageCardData[] = [
    {
        title: 'Simulador Individual',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$499 mxn',
        paymentNote: 'Un solo pago',
        description: '5 instrumentos diferentes.',
        keywords: ['medicina', 'individual'],
        whatsappLabel: 'Simulador Individual EGEL Medicina ($499 mxn)',
    },
    {
        title: 'Guía digital',
        ribbon: 'MUY PRONTO',
        ctaLabel: 'Lista de espera',
        ctaMode: 'waitlist',
        price: '$999 mxn',
        paymentNote: 'Un solo pago',
        description: 'Próximamente.',
        keywords: ['medicina', 'guia'],
        whatsappLabel: 'Guía digital EGEL Medicina ($999 mxn)',
    },
    {
        title: 'Paquete de 5',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$2,495 mxn',
        paymentNote: 'Un solo pago',
        description: '703 reactivos en conjunto (base de conteos comunicado).',
        keywords: ['medicina', 'paquete'],
        whatsappLabel: 'Paquete de 5 Simuladores EGEL Medicina ($2,495 mxn)',
    },
    {
        title: 'Guía digital + paquete de 5',
        ribbon: 'PROMOCIÓN 2027',
        ctaLabel: 'Preventa',
        ctaMode: 'presale',
        price: '$2,999 mxn',
        oldPrice: '$3,494 mxn',
        paymentNote: 'Un solo pago',
        description:
            '30 reactivos, 60 segundos. 2 intentos (confirmado por Sapius).',
        keywords: ['medicina', 'preventa'],
        whatsappLabel: 'Guía digital + paquete de 5 EGEL Medicina ($2,999 mxn)',
    },
];

const MODALIDADES_ROWS = [
    {
        title: 'Curso completo premium',
        icon: BookOpen,
        description: (
            <>
                <strong className="font-bold text-[#101E33]">
                    10 semanas de preparación
                </strong>{' '}
                con videoclases, guías (digital e impresa), simuladores,
                asesorías en vivo dominicales y finales, y garantía
                condicionada.
            </>
        ),
    },
    {
        title: 'Curso completo asincrónico',
        icon: Clock,
        description: (
            <>
                10 semanas de estudio{' '}
                <strong className="font-bold text-[#101E33]">
                    a tu propio ritmo
                </strong>{' '}
                mediante videoclases, lecturas, tareas y simuladores digitales
                (sin asesorías en vivo ni guía impresa).
            </>
        ),
    },
    {
        title: 'Opciones independientes',
        icon: Layers,
        description: (
            <>
                También puedes adquirir únicamente la guía digital, simuladores
                digitales o{' '}
                <strong className="font-bold text-[#101E33]">
                    formatos compactos de práctica
                </strong>{' '}
                según tus necesidades de estudio.
            </>
        ),
    },
];

const GENERIC_SLUG_META: Record<
    string,
    {
        badge: string;
        title: string;
        subtitle: string;
        keywords: string[];
    }
> = {
    'egel-plus': {
        badge: 'Acreditación CENEVAL',
        title: 'Preparación EGEL Plus',
        subtitle:
            'Programas integrales, guías digitales y simuladores especializados en Ciencias de la Salud para titularte con seguridad.',
        keywords: ['egel'],
    },
    'exani-1': {
        badge: 'Ingreso Educación Media Superior',
        title: 'Preparación EXANI-I',
        subtitle:
            'Domina pensamiento matemático, comprensión lectora y redacción indirecta con simuladores cronometrados y retroalimentación experta.',
        keywords: ['exani', '1'],
    },
    'exani-2': {
        badge: 'Ingreso a Universidad',
        title: 'Preparación EXANI-II',
        subtitle:
            'Entrenamiento estratégico por módulos específicos y habilidades transversales para asegurar tu ingreso universitario.',
        keywords: ['exani', '2'],
    },
    'exani-3': {
        badge: 'Ingreso a Posgrado',
        title: 'Preparación EXANI-III',
        subtitle:
            'Metodología de investigación, pensamiento analítico y simuladores reales orientados a programas de maestría y doctorado.',
        keywords: ['exani', '3'],
    },
    'cursos-enarm': {
        badge: 'Especialidades Médicas',
        title: 'Preparación ENARM',
        subtitle:
            'Casos clínicos seriados, repaso basado en Guías de Práctica Clínica y simuladores de alta exigencia médica.',
        keywords: ['enarm'],
    },
    'cursos-presenciales': {
        badge: 'Modalidad con Acompañamiento',
        title: 'Cursos Presenciales y En Vivo',
        subtitle:
            'Sesiones guiadas por docentes especialistas, resolución de reactivos en tiempo real y seguimiento personalizado.',
        keywords: ['presencial'],
    },
};

export default function CourseLanding({
    slug,
    reviews = [],
    scheduledCourses = [],
}: CourseLandingProps) {
    const openMiniTest = () => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sapius:open-mini-test'));
        }
    };

    const isNutricion = slug === 'egel-plus-nutricion';
    const isMedicina = slug === 'egel-plus-medicina';

    if (isNutricion || isMedicina) {
        const areaName = isNutricion ? 'Nutrición' : 'Medicina';
        const fullTitle = `EGEL ${areaName}` as
            | 'EGEL Nutrición'
            | 'EGEL Medicina';
        const spineLabel = isNutricion
            ? 'Curso virtual EGEL nutrición - sapius'
            : 'Curso virtual EGEL Medicina - sapius';
        const studentImage = isNutricion
            ? '/img/brand2026/student-modalidades-nutricion.png'
            : '/img/brand2026/student-modalidades-medicina.png';

        const whatIsCopy = isNutricion
            ? 'Es un programa de preparación integral diseñado específicamente para ayudarte a aprobar con éxito el Examen General para el Egreso de la Licenciatura (EGEL Plus) en Nutrición.'
            : 'Es un programa de preparación integral especializado en dotar a los egresados de la carrera de medicina de los conocimientos teóricos, herramientas clínicas y confianza necesarias para aprobar con éxito el Examen General para el Egreso de la Licenciatura (EGEL Plus) en Medicina.';

        const whatForCopy = isNutricion
            ? 'Te otorga los conocimientos teóricos, herramientas prácticas y confianza a través de videoclases, lecturas, tareas, simuladores digitales y exámenes diarios para dominar los temas del examen y titularte con seguridad.'
            : 'Permite repasar y dominar los contenidos clave del examen (abordaje clínico, promoción de la salud y fundamentos de decisiones médicas) optimizando tu tiempo de estudio mediante videoclases, guías y simuladores tipo CENEVAL con retroalimentación detallada.';

        const medicinaPresaleCourseUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
            'Hola equipo Sapius, me interesa inscribirme en preventa a los Cursos 2027 de EGEL Medicina. ¿Me comparten información?',
        )}`;

        return (
            <LandingLayout scheduledCourses={scheduledCourses}>
                <Head title={`${fullTitle} | Curso en línea Sapius`} />

                {/* 1. HERO EGEL NUTRICIÓN / MEDICINA */}
                <section className="relative overflow-hidden bg-white">
                    {isNutricion ? (
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,_#FFD9CE_0%,_transparent_46%),radial-gradient(circle_at_84%_58%,_#FFD9CE_0%,_transparent_56%)]"
                        />
                    ) : (
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,_#CFE4FF_0%,_transparent_48%),radial-gradient(circle_at_84%_58%,_#CFE4FF_0%,_transparent_58%)]"
                        />
                    )}

                    {/* Grilla de + central superior */}
                    <div className="pointer-events-none absolute top-10 left-[40%] hidden opacity-75 lg:block">
                        <InlinePlusGrid
                            rows={4}
                            cols={5}
                            color="navy"
                            gap={28}
                            size={8}
                        />
                    </div>

                    {/* Grilla de + inferior izquierda sutil */}
                    <div className="pointer-events-none absolute bottom-6 left-4 hidden opacity-25 sm:block">
                        <InlinePlusGrid
                            rows={5}
                            cols={4}
                            color="navy"
                            gap={28}
                            size={7}
                        />
                    </div>

                    {/* Grilla de + inferior derecha coral */}
                    <div className="pointer-events-none absolute right-4 bottom-6 hidden opacity-80 md:block lg:right-8">
                        <InlinePlusGrid
                            rows={5}
                            cols={4}
                            color="coral"
                            gap={28}
                            size={8}
                        />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
                            {/* Izquierda: Texto Hero */}
                            <div className="lg:col-span-5">
                                <p className="text-base font-medium text-[#101E33]/85 sm:text-lg">
                                    Curso en línea
                                </p>

                                <h1 className="mt-2 font-display text-4xl leading-[1.06] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.75rem]">
                                    EGEL
                                    <br />
                                    {areaName}
                                </h1>

                                <p className="mt-4 max-w-sm text-base leading-relaxed text-[#101E33]/80 sm:text-lg">
                                    Conoce nuestros programas, cursos y
                                    simuladores
                                </p>

                                <div className="mt-8 flex max-w-[270px] flex-col gap-3.5">
                                    <a
                                        href="#modalidades"
                                        className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                    >
                                        Ver Modalidades
                                    </a>
                                    <a
                                        href="#paquetes"
                                        className="inline-flex w-full items-center justify-center rounded-full border border-[#101E33]/25 bg-white/90 px-7 py-3 text-sm font-bold text-[#101E33] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B52] hover:text-[#FF6B52]"
                                    >
                                        Precios y paquetes
                                    </a>
                                </div>
                            </div>

                            {/* Derecha: Mockup 3D con sobreimpresión rotada y lomos */}
                            <div className="lg:col-span-7">
                                <EgelBook3DMockup
                                    areaTitle={fullTitle}
                                    spineText={spineLabel}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. SECCIÓN #modalidades ("Modalidades disponibles:") */}
                <section
                    id="modalidades"
                    className="relative overflow-hidden bg-white pt-16 pb-0 lg:pt-20"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#FFD9CE]/30 blur-3xl"
                    />

                    {/* Grilla derecha de + en coral */}
                    <div className="pointer-events-none absolute right-4 bottom-12 hidden opacity-80 lg:block">
                        <InlinePlusGrid
                            rows={6}
                            cols={3}
                            color="coral"
                            gap={28}
                            size={8}
                        />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-10">
                            {/* Columna izquierda: Título + Estudiante + Isotipo s. */}
                            <div className="relative flex flex-col justify-between lg:col-span-5">
                                <div>
                                    <h2 className="font-display text-3xl leading-[1.1] font-extrabold tracking-tight text-[#101E33] sm:text-4xl lg:text-[2.75rem]">
                                        Modalidades
                                        <br />
                                        disponibles:
                                    </h2>
                                </div>

                                <div className="relative mt-8 flex justify-center lg:mt-10 lg:justify-start">
                                    {/* Grilla detrás del estudiante */}
                                    <div className="pointer-events-none absolute top-6 left-2 opacity-75">
                                        <InlinePlusGrid
                                            rows={4}
                                            cols={5}
                                            color="navy"
                                            gap={28}
                                            size={8}
                                        />
                                    </div>

                                    {/* Isotipo s. junto al estudiante */}
                                    <IsotypeMark
                                        variant="dark"
                                        className="absolute right-4 bottom-8 h-28 w-auto sm:right-8 sm:h-36"
                                    />

                                    <img
                                        src={studentImage}
                                        alt={`Estudiante de ${fullTitle}`}
                                        className="relative z-10 max-h-[390px] w-auto object-contain object-bottom sm:max-h-[430px]"
                                    />
                                </div>
                            </div>

                            {/* Columna derecha: 2 tarjetas informativas borde coral + 3 filas + CTA */}
                            <div className="pb-14 lg:col-span-7 lg:pb-16">
                                {/* 2 tarjetas superiores con borde coral */}
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-12">
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{
                                            once: true,
                                            margin: '-60px',
                                        }}
                                        transition={{
                                            duration: 0.38,
                                            ease: 'easeOut',
                                        }}
                                        className="rounded-2xl border border-[#FF6B52]/55 bg-[#101E33] p-6 text-white shadow-[0_14px_32px_-14px_rgba(16,30,51,0.28)] sm:col-span-7"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FF6B52]/20 text-[#FF6B52]">
                                                <MessageCircleQuestion className="h-4 w-4" />
                                            </span>
                                            <h3 className="font-display text-base leading-snug font-extrabold sm:text-lg">
                                                ¿Qué es el curso{' '}
                                                <span className="text-[#FF6B52]">
                                                    {fullTitle}
                                                </span>{' '}
                                                de Sapius?
                                            </h3>
                                        </div>
                                        <p className="mt-3 text-xs leading-relaxed text-white/85 sm:text-[13px]">
                                            {whatIsCopy}
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{
                                            once: true,
                                            margin: '-60px',
                                        }}
                                        transition={{
                                            duration: 0.38,
                                            delay: 0.06,
                                            ease: 'easeOut',
                                        }}
                                        className="rounded-2xl border border-[#FF6B52]/55 bg-[#101E33] p-6 text-white shadow-[0_14px_32px_-14px_rgba(16,30,51,0.28)] sm:col-span-5"
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FF6B52]/20 text-[#FF6B52]">
                                                <MessageCircleQuestion className="h-4 w-4" />
                                            </span>
                                            <h3 className="font-display text-base leading-snug font-extrabold sm:text-lg">
                                                ¿Para qué sirve?
                                            </h3>
                                        </div>
                                        <p className="mt-3 text-xs leading-relaxed text-white/85 sm:text-[13px]">
                                            {whatForCopy}
                                        </p>
                                    </motion.div>
                                </div>

                                {/* 3 filas de modalidades */}
                                <div className="mt-8 space-y-5">
                                    {MODALIDADES_ROWS.map((row) => {
                                        const Icon = row.icon;
                                        return (
                                            <div
                                                key={row.title}
                                                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6"
                                            >
                                                <div className="inline-flex w-full shrink-0 items-center gap-3 rounded-full border border-[#FF6B52]/55 bg-white px-5 py-2.5 shadow-xs sm:w-[235px]">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFD9CE]/45 text-[#101E33]">
                                                        <Icon className="h-4 w-4" />
                                                    </span>
                                                    <span className="font-display text-xs leading-tight font-extrabold text-[#101E33] sm:text-[13px]">
                                                        {row.title}
                                                    </span>
                                                </div>
                                                <p className="text-xs leading-relaxed text-[#101E33]/80 sm:text-[13px]">
                                                    {row.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Botón pill navy Precios y paquetes */}
                                <div className="mt-9 flex justify-start sm:justify-end">
                                    <a
                                        href="#paquetes"
                                        className="inline-flex min-w-[230px] items-center justify-center rounded-full bg-[#101E33] px-8 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]"
                                    >
                                        Precios y paquetes
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. SECCIÓN #paquetes ("Elige el curso o complemento ideal para tus estudios") */}
                <section
                    id="paquetes"
                    className="relative overflow-hidden border-t border-[#101E33]/5 bg-white py-20 lg:py-24"
                >
                    {/* Resplandor lateral derecho suave */}
                    <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute right-0 bottom-0 h-[460px] w-[520px] rounded-full blur-3xl ${
                            isNutricion
                                ? 'bg-[#FFD9CE]/50'
                                : 'bg-[#CFE4FF]/65'
                        }`}
                    />

                    {/* Grilla derecha de + en coral */}
                    <div className="pointer-events-none absolute right-4 bottom-44 hidden opacity-75 lg:block">
                        <InlinePlusGrid
                            rows={6}
                            cols={4}
                            color="coral"
                            gap={28}
                            size={7}
                        />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="mx-auto max-w-3xl text-center"
                        >
                            <h2 className="font-display text-3xl leading-[1.12] font-extrabold tracking-tight text-[#101E33] sm:text-4xl lg:text-[2.65rem]">
                                Elige el curso o{' '}
                                <span className="text-[#FF6B52]">
                                    complemento ideal
                                </span>
                                <br />
                                para tus estudios
                            </h2>
                        </motion.div>

                        {isNutricion ? (
                            <>
                                {/* Fila superior: 4 tarjetas */}
                                <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {NUTRICION_TOP_PACKAGES.map((pkg) => (
                                        <SapiusPackageCard
                                            key={pkg.title}
                                            pkg={pkg}
                                            scheduledCourses={scheduledCourses}
                                            ctaBetweenTitleAndPrice={true}
                                        />
                                    ))}
                                </div>

                                {/* Fila inferior: 2 cursos completos + bloque Mini-Test */}
                                <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                                    {NUTRICION_BOTTOM_PACKAGES.map((pkg) => (
                                        <div
                                            key={pkg.title}
                                            className="lg:col-span-3"
                                        >
                                            <SapiusPackageCard
                                                pkg={pkg}
                                                scheduledCourses={
                                                    scheduledCourses
                                                }
                                                ctaBetweenTitleAndPrice={true}
                                            />
                                        </div>
                                    ))}

                                    {/* Bloque derecho con degradado durazno e isotipo s. */}
                                    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-[#FF6B52]/30 bg-[radial-gradient(circle_at_top_right,_#FFD9CE_0%,_#CFE4FF_55%,_#FFFFFF_100%)] p-8 text-center lg:col-span-6 lg:p-12">
                                        <h3 className="font-display text-2xl leading-tight font-extrabold text-[#101E33] sm:text-3xl">
                                            ¿Todavía no sabes
                                            <br />
                                            cuál elegir?
                                        </h3>
                                        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#101E33]/80 sm:text-base">
                                            Realiza el mini test de 6 preguntas
                                            para conocer lo que mejor se adapta
                                            a ti.
                                        </p>

                                        <div className="mt-7">
                                            <button
                                                type="button"
                                                onClick={openMiniTest}
                                                className="inline-flex min-w-[210px] items-center justify-center rounded-full bg-[#101E33] px-8 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]"
                                            >
                                                Realiza el test
                                            </button>
                                        </div>

                                        <div className="mt-10 flex w-full flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
                                            <p className="max-w-xs text-center text-[11px] leading-relaxed text-[#101E33]/60 italic sm:text-left">
                                                Precios y promociones pueden
                                                variar. Consulta condiciones
                                                vigentes al momento de
                                                contratar.
                                            </p>
                                            <IsotypeMark
                                                variant="dark"
                                                className="h-16 w-auto shrink-0 sm:h-20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* MEDICINA: 4 tarjetas superiores */}
                                <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {MEDICINA_PACKAGES.map((pkg) => (
                                        <SapiusPackageCard
                                            key={pkg.title}
                                            pkg={pkg}
                                            scheduledCourses={scheduledCourses}
                                            ctaBetweenTitleAndPrice={true}
                                        />
                                    ))}
                                </div>

                                {/* MEDICINA: Fila inferior Cursos 2027 (izquierda) + Mini-Test (derecha) */}
                                <div className="mt-12 grid grid-cols-1 items-center gap-8 rounded-3xl border border-[#FF6B52]/30 bg-[radial-gradient(circle_at_85%_50%,_#CFE4FF_0%,_#FFFFFF_68%)] p-8 lg:grid-cols-12 lg:p-12">
                                    {/* Izquierda: Cursos 2027 + Comprar en preventa */}
                                    <div className="flex flex-col items-start justify-center lg:col-span-5">
                                        <span className="inline-block rounded-full bg-[#FFD9CE]/70 px-3.5 py-1 text-xs font-extrabold tracking-wide text-[#101E33] uppercase">
                                            Próxima generación
                                        </span>
                                        <h3 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#101E33] sm:text-4xl">
                                            Cursos 2027
                                        </h3>
                                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#101E33]/75">
                                            Asegura tu lugar con precio
                                            preferencial de preventa para la
                                            convocatoria 2027 de EGEL Medicina.
                                        </p>
                                        <div className="mt-6">
                                            <a
                                                href={medicinaPresaleCourseUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                            >
                                                Comprar en preventa
                                            </a>
                                        </div>
                                    </div>

                                    {/* Centro decorativo */}
                                    <div className="hidden justify-center lg:col-span-2 lg:flex">
                                        <InlinePlusGrid
                                            rows={4}
                                            cols={4}
                                            color="navy"
                                            gap={24}
                                            size={7}
                                        />
                                    </div>

                                    {/* Derecha: ¿Todavía no sabes cuál elegir? + Realiza el test + nota legal */}
                                    <div className="flex flex-col justify-between lg:col-span-5">
                                        <div>
                                            <h3 className="font-display text-2xl leading-tight font-extrabold text-[#101E33] sm:text-3xl">
                                                ¿Todavía no sabes cuál elegir?
                                            </h3>
                                            <p className="mt-2.5 text-sm leading-relaxed text-[#101E33]/80">
                                                Realiza el mini test de 6
                                                preguntas para conocer lo que
                                                mejor se adapta a ti.
                                            </p>
                                            <div className="mt-5">
                                                <button
                                                    type="button"
                                                    onClick={openMiniTest}
                                                    className="inline-flex min-w-[205px] items-center justify-center rounded-full bg-[#101E33] px-8 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]"
                                                >
                                                    Realiza el test
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-end justify-between gap-4">
                                            <p className="max-w-xs text-[11px] leading-relaxed text-[#101E33]/60 italic">
                                                Precios y promociones pueden
                                                variar. Consulta condiciones
                                                vigentes al momento de
                                                contratar.
                                            </p>
                                            <IsotypeMark
                                                variant="dark"
                                                className="h-14 w-auto shrink-0 sm:h-16"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </LandingLayout>
        );
    }

    // 4. OTROS SLUGS PÚBLICOS (`egel-plus`, `exani-1..3`, `cursos-enarm`, `cursos-presenciales`)
    const meta = GENERIC_SLUG_META[slug] ?? {
        badge: 'Programa Académico Sapius',
        title: slug.replace(/-/g, ' ').toUpperCase(),
        subtitle:
            'Domina tu examen con clases estructuradas, guías digitales y simuladores cronometrados tipo CENEVAL.',
        keywords: [slug],
    };

    const filteredCohorts = (
        Array.isArray(scheduledCourses) ? scheduledCourses : []
    ).filter((c) => {
        const hay = normalizeText(
            `${c.identificador ?? ''} ${c.course_title ?? ''} ${c.course?.title ?? ''} ${c.category_name ?? ''}`,
        );
        return meta.keywords.some((kw) => hay.includes(normalizeText(kw)));
    });

    const displayedCohorts =
        filteredCohorts.length > 0
            ? filteredCohorts
            : (scheduledCourses ?? []).slice(0, 3);

    const whatsappAdvisoryUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
        `Hola equipo Sapius, me gustaría recibir información sobre ${meta.title}.`,
    )}`;

    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title={`${meta.title} | Sapius`} />

            {/* Hero luminoso con identidad Sapius 2026/2027 */}
            <section className="relative overflow-hidden bg-white py-16 lg:py-24">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,_#FFD9CE_0%,_transparent_48%),radial-gradient(circle_at_88%_50%,_#CFE4FF_0%,_transparent_56%)]"
                />

                <div className="pointer-events-none absolute top-10 right-8 hidden opacity-70 lg:block">
                    <InlinePlusGrid
                        rows={5}
                        cols={5}
                        color="coral"
                        gap={28}
                        size={8}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-7">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6B52]/40 bg-white/90 px-4 py-1.5 text-xs font-bold text-[#101E33]">
                                <Sparkles className="h-3.5 w-3.5 text-[#FF6B52]" />
                                {meta.badge}
                            </span>

                            <h1 className="mt-4 font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.5rem]">
                                {meta.title}
                            </h1>

                            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#101E33]/80 sm:text-lg">
                                {meta.subtitle}
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3.5">
                                <a
                                    href={whatsappAdvisoryUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                >
                                    Solicitar información
                                </a>
                                <button
                                    type="button"
                                    onClick={openMiniTest}
                                    className="inline-flex items-center justify-center rounded-full bg-[#101E33] px-7 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]"
                                >
                                    Realiza el test
                                </button>
                            </div>
                        </div>

                        {/* Tarjeta lateral de rutas destacadas EGEL */}
                        <div className="lg:col-span-5">
                            <div className="relative overflow-hidden rounded-2xl border border-[#FF6B52]/50 bg-white/95 p-7 shadow-[0_14px_36px_-16px_rgba(16,30,51,0.16)]">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold tracking-wider text-[#FF6B52] uppercase">
                                        Programas Destacados 2026/2027
                                    </span>
                                    <IsotypeMark
                                        variant="dark"
                                        className="h-8 w-auto"
                                    />
                                </div>
                                <h2 className="mt-3 font-display text-xl font-extrabold text-[#101E33]">
                                    Explora nuestras rutas EGEL Plus
                                </h2>
                                <p className="mt-2 text-xs leading-relaxed text-[#101E33]/75">
                                    Accede directamente a nuestros programas
                                    especializados con guías digitales,
                                    simuladores y videoclases.
                                </p>

                                <div className="mt-5 flex flex-col gap-3">
                                    <Link
                                        href="/egel-plus-nutricion"
                                        className="flex items-center justify-between rounded-full bg-[#FF6B52] px-6 py-2.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                    >
                                        <span>EGEL Nutrición</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/egel-plus-medicina"
                                        className="flex items-center justify-between rounded-full border border-[#101E33]/25 bg-white px-6 py-2.5 text-xs font-bold text-[#101E33] transition-all hover:-translate-y-0.5 hover:border-[#FF6B52] hover:text-[#FF6B52]"
                                    >
                                        <span>EGEL Medicina</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Beneficios Método Sapius */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-2xl border border-[#FF6B52]/45 bg-white/95 p-6 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.12)]">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFD9CE]/60 text-[#101E33]">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 font-display text-lg font-extrabold text-[#101E33]">
                                Módulos Estructurados
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#101E33]/75">
                                Videoclases, lecturas clave y tareas enfocadas
                                en los temas de mayor ponderación oficial.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#FF6B52]/45 bg-white/95 p-6 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.12)]">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#CFE4FF]/70 text-[#101E33]">
                                <Layers className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 font-display text-lg font-extrabold text-[#101E33]">
                                Simuladores Tipo Examen
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#101E33]/75">
                                Entrena bajo tiempo real con reactivos de opción
                                múltiple y conteo de intentos configurados.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#FF6B52]/45 bg-white/95 p-6 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.12)]">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFD9CE]/60 text-[#101E33]">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 font-display text-lg font-extrabold text-[#101E33]">
                                Retroalimentación Detallada
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#101E33]/75">
                                Identifica fortalezas y áreas de mejora desde el
                                primer día con justificación académica clara.
                            </p>
                        </div>
                    </div>

                    {/* Cohortes activas si existen */}
                    {displayedCohorts.length > 0 && (
                        <div className="mt-16">
                            <h2 className="font-display text-2xl font-extrabold text-[#101E33] sm:text-3xl">
                                Opciones disponibles para inscripción
                            </h2>
                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {displayedCohorts.map((item) => {
                                    const title =
                                        item.course_title ||
                                        item.course?.title ||
                                        item.identificador ||
                                        meta.title;
                                    const amount = Number(
                                        item.precio ?? item.price ?? 0,
                                    );
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex flex-col justify-between rounded-2xl border border-[#FF6B52]/45 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.12)]"
                                        >
                                            <div>
                                                <h3 className="font-display text-lg font-extrabold text-[#101E33]">
                                                    {title}
                                                </h3>
                                                <p className="mt-2 text-xs leading-relaxed text-[#101E33]/75">
                                                    {item.course_description ||
                                                        item.course
                                                            ?.description ||
                                                        'Acceso a plataforma Sapius con contenidos actualizados.'}
                                                </p>
                                            </div>
                                            <div className="mt-6 flex items-center justify-between border-t border-[#101E33]/10 pt-4">
                                                <span className="font-display text-2xl font-extrabold text-[#101E33]">
                                                    $
                                                    {amount.toLocaleString(
                                                        'es-MX',
                                                    )}{' '}
                                                    mxn
                                                </span>
                                                <Link
                                                    href={`/checkout/${item.id}`}
                                                    className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-6 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#F0563C]"
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

                    {/* Testimonios si existen en BD */}
                    {reviews.length > 0 && (
                        <div className="mt-16 border-t border-[#101E33]/10 pt-14">
                            <h2 className="font-display text-2xl font-extrabold text-[#101E33]">
                                Lo que opinan nuestros estudiantes
                            </h2>
                            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                                {reviews.slice(0, 3).map((rev) => (
                                    <div
                                        key={rev.id}
                                        className="rounded-2xl border border-[#FF6B52]/35 bg-white p-6 shadow-xs"
                                    >
                                        <div className="flex items-center gap-1 text-[#FF6B52]">
                                            {Array.from({
                                                length: Math.max(
                                                    1,
                                                    Math.min(
                                                        5,
                                                        Number(rev.rating ?? 5),
                                                    ),
                                                ),
                                            }).map((_, idx) => (
                                                <Star
                                                    key={idx}
                                                    className="h-4 w-4 fill-current"
                                                />
                                            ))}
                                        </div>
                                        <p className="mt-3 text-xs leading-relaxed text-[#101E33]/80">
                                            “
                                            {rev.comment ||
                                                rev.content ||
                                                'Excelente preparación académica.'}
                                            ”
                                        </p>
                                        <p className="mt-3 text-xs font-bold text-[#101E33]">
                                            {rev.name ||
                                                rev.author ||
                                                'Alumno Sapius'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </LandingLayout>
    );
}

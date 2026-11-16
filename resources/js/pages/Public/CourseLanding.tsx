import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Layers,
    ShieldCheck,
    Sparkles,
    Star,
} from 'lucide-react';
import React from 'react';
import { BookMockup3D } from '@/components/public/BookMockup3D';
import { openMiniTest } from '@/components/public/MiniTestModal';
import { PlusGridPattern } from '@/components/public/PlusGridPattern';
import {
    PricingCard,
    resolvePurchaseTarget,
    stripHtmlToText,
    WHATSAPP_PHONE
    
} from '@/components/public/PricingCard';
import type {ScheduledCourseCandidate} from '@/components/public/PricingCard';
import LandingLayout from '@/layouts/LandingLayout';

export type ScheduledCourseRecord = ScheduledCourseCandidate;

export interface PublicReviewItem {
    id: number | string;
    user_name?: string | null;
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

function normalizeText(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

/**
 * Ícono de burbuja coral sólida con signo `?` en `#101E33` idéntico a Canva Page 2.
 */
function QuestionBubbleBadge() {
    return (
        <span
            aria-hidden="true"
            className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center"
        >
            <svg
                viewBox="0 0 28 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
            >
                <path
                    d="M3 3C1.89543 3 1 3.89543 1 5V16C1 17.1046 1.89543 18 3 18H5V22.5L9.5 18H19C20.1046 18 21 17.1046 21 16V5C21 3.89543 20.1046 3 19 3H3Z"
                    fill="#FF6B52"
                />
                <path
                    d="M23 7H25C26.1046 7 27 7.89543 27 9V19C27 20.1046 26.1046 21 25 21H23V24.5L19.5 21H12C10.8954 21 10 20.1046 10 19.5H20C21.6569 19.5 23 18.1569 23 16.5V7Z"
                    fill="#FF6B52"
                    fillOpacity="0.82"
                />
                <text
                    x="11"
                    y="14.5"
                    textAnchor="middle"
                    fill="#101E33"
                    fontSize="11.5"
                    fontWeight="800"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                >
                    ?
                </text>
            </svg>
        </span>
    );
}

/**
 * Íconos lineales limpios en `#101E33` (sin fondo durazno) para las 3 cápsulas de Modalidades.
 */
function ModalityPremiumIcon() {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-7 w-7 shrink-0 text-[#101E33]"
        >
            <path
                d="M16 7L24 10.5L16 14L8 10.5L16 7Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <path
                d="M11 12V15.5C11 17 13.2 18 16 18C18.8 18 21 17 21 15.5V12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M6 19.5C8.5 18.5 12.2 19 16 21C19.8 19 23.5 18.5 26 19.5V26.5C23.5 25.5 19.8 26 16 28C12.2 26 8.5 25.5 6 26.5V19.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <path
                d="M16 21V28"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ModalityAsyncIcon() {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-7 w-7 shrink-0 text-[#101E33]"
        >
            <rect
                x="5"
                y="6"
                width="14"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M5 10H19M9 4.5V7M15 4.5V7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle
                cx="22"
                cy="21"
                r="5.5"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M22 18.5V21L23.8 22.2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle
                cx="11"
                cy="22"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M6.5 27.5C7.2 25.6 8.9 24.5 11 24.5C13.1 24.5 14.8 25.6 15.5 27.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ModalityIndependentIcon() {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-7 w-7 shrink-0 text-[#101E33]"
        >
            <circle cx="7" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7" cy="23" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M9 9H14L17 13M9 16H16M9 23H14L17 19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx="20.5"
                cy="16"
                r="3"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M21.5 18.5L25.5 25.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
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
    features?: string[];
    footnote?: string;
    ribbon?: string;
    borderVariant?: 'coral' | 'navy';
    keywords: string[];
    whatsappLabel: string;
}

const NUTRICION_TOP_PACKAGES: PackageCardData[] = [
    {
        title: 'Simulador compacto',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$299 MXN',
        paymentNote: 'Un solo pago',
        description:
            '30 reactivos, 60 segundos. 2 intentos (confirmado por Sapius).',
        borderVariant: 'coral',
        keywords: ['nutricion', 'compacto'],
        whatsappLabel: 'Simulador compacto EGEL Nutrición ($299 MXN)',
    },
    {
        title: 'Guía digital',
        ribbon: 'MÁS POPULAR',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$999 MXN',
        paymentNote: 'Un solo pago',
        description:
            'Libro digital de repaso en la plataforma; no incluye videoclases ni asesorías por sí sola.',
        borderVariant: 'coral',
        keywords: ['nutricion', 'guia'],
        whatsappLabel: 'Guía digital EGEL Nutrición ($999 MXN)',
    },
    {
        title: 'Simuladores digitales',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$1,499 MXN',
        paymentNote: 'Un solo pago',
        description:
            'Batería de simuladores con preguntas, tiempo, intentos y retroalimentación según instrumento.',
        borderVariant: 'coral',
        keywords: ['nutricion', 'simulador'],
        whatsappLabel: 'Simuladores digitales EGEL Nutrición ($1,499 MXN)',
    },
    {
        title: 'Guía digital + simuladores',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$1,999 MXN',
        paymentNote: 'Un solo pago',
        description:
            '30 reactivos, 60 segundos. 2 intentos (confirmado por Sapius).',
        borderVariant: 'coral',
        keywords: ['nutricion', 'guia', 'simulador'],
        whatsappLabel: 'Guía digital + simuladores EGEL Nutrición ($1,999 MXN)',
    },
];

const NUTRICION_BOTTOM_PACKAGES: PackageCardData[] = [
    {
        title: 'Curso completo asincrónico',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$4,499 MXN',
        paymentNote: 'Opciones de pago',
        features: [
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
        borderVariant: 'navy',
        keywords: ['nutricion', 'asincronico'],
        whatsappLabel: 'Curso completo asincrónico EGEL Nutrición ($4,499 MXN)',
    },
    {
        title: 'Curso completo Premium',
        ribbon: 'PROMOCIÓN',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$5,999 MXN',
        oldPrice: '$6,750 MXN',
        paymentNote: 'Opciones de pago',
        features: [
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
        borderVariant: 'navy',
        keywords: ['nutricion', 'premium'],
        whatsappLabel: 'Curso completo Premium EGEL Nutrición ($5,999 MXN)',
    },
];

const MEDICINA_PACKAGES: PackageCardData[] = [
    {
        title: 'Simulador Individual',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$499 MXN',
        paymentNote: 'Un solo pago',
        description: '5 instrumentos diferentes.',
        borderVariant: 'coral',
        keywords: ['medicina', 'individual'],
        whatsappLabel: 'Simulador Individual EGEL Medicina ($499 MXN)',
    },
    {
        title: 'Guía digital',
        ribbon: 'MUY PRONTO',
        ctaLabel: 'Lista de espera',
        ctaMode: 'waitlist',
        price: '$999 MXN',
        paymentNote: 'Un solo pago',
        description: 'Próximamente.',
        borderVariant: 'coral',
        keywords: ['medicina', 'guia'],
        whatsappLabel: 'Guía digital EGEL Medicina ($999 MXN)',
    },
    {
        title: 'Paquete de 5',
        ctaLabel: 'Comprar',
        ctaMode: 'buy',
        price: '$2,495 MXN',
        paymentNote: 'Un solo pago',
        description: '703 reactivos en conjunto (base de conteos comunicado).',
        borderVariant: 'coral',
        keywords: ['medicina', 'paquete'],
        whatsappLabel: 'Paquete de 5 Simuladores EGEL Medicina ($2,495 MXN)',
    },
    {
        title: 'Guía digital + paquete de 5',
        ribbon: 'PROMOCIÓN 2027',
        ctaLabel: 'Preventa',
        ctaMode: 'presale',
        price: '$2,999 MXN',
        oldPrice: '$3,494 MXN',
        paymentNote: 'Un solo pago',
        description:
            '30 reactivos, 60 segundos. 2 intentos (confirmado por Sapius).',
        borderVariant: 'coral',
        keywords: ['medicina', 'preventa'],
        whatsappLabel: 'Guía digital + paquete de 5 EGEL Medicina ($2,999 MXN)',
    },
];

const SIMULATOR_QUICK_LINKS: ReadonlyArray<{ label: string; href: string }> = [
    { label: 'Globales nutrición', href: '/simuladores-nutricion' },
    { label: 'Compacto nutrición', href: '/simuladores-nutricion' },
    {
        label: 'Módulos y exámenes diarios',
        href: '/egel-plus-nutricion#paquetes',
    },
    { label: 'Medicina 5 simuladores', href: '/simuladores-medicina' },
];

const MODALIDADES_ROWS = [
    {
        line1: 'Curso completo',
        line2: 'premium',
        Icon: ModalityPremiumIcon,
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
        line1: 'Curso completo',
        line2: 'asincrónico',
        Icon: ModalityAsyncIcon,
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
        line1: 'Opciones',
        line2: 'independientes',
        Icon: ModalityIndependentIcon,
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
        requireAllKeywords?: boolean;
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
        requireAllKeywords: true,
    },
    'exani-2': {
        badge: 'Ingreso a Universidad',
        title: 'Preparación EXANI-II',
        subtitle:
            'Entrenamiento estratégico por módulos específicos y habilidades transversales para asegurar tu ingreso universitario.',
        keywords: ['exani', '2'],
        requireAllKeywords: true,
    },
    'exani-3': {
        badge: 'Ingreso a Posgrado',
        title: 'Preparación EXANI-III',
        subtitle:
            'Metodología de investigación, pensamiento analítico y simuladores reales orientados a programas de maestría y doctorado.',
        keywords: ['exani', '3'],
        requireAllKeywords: true,
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

function renderPricingCardItem(
    pkg: PackageCardData,
    scheduledCourses: ScheduledCourseRecord[],
) {
    const target = resolvePurchaseTarget(
        scheduledCourses,
        pkg.keywords,
        pkg.ctaMode,
        pkg.whatsappLabel,
    );

    return (
        <PricingCard
            key={pkg.title}
            title={pkg.title}
            price={pkg.price}
            oldPrice={pkg.oldPrice}
            paymentNote={pkg.paymentNote}
            description={pkg.description}
            features={pkg.features}
            footnote={pkg.footnote}
            ctaLabel={pkg.ctaLabel}
            ribbon={pkg.ribbon}
            borderVariant={pkg.borderVariant ?? 'coral'}
            href={target.href}
            isExternal={target.isExternal}
        />
    );
}

export default function CourseLanding({
    slug,
    reviews = [],
    scheduledCourses = [],
}: CourseLandingProps) {
    const isNutricion = slug === 'egel-plus-nutricion';
    const isMedicina = slug === 'egel-plus-medicina';

    if (isNutricion || isMedicina) {
        const areaName = isNutricion ? 'Nutrición' : 'Medicina';
        const fullTitle = `EGEL ${areaName}`;
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
                <section className="relative overflow-hidden bg-white pt-24 pb-12 sm:pt-28 lg:pt-30 lg:pb-16">
                    {isNutricion ? (
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,_#FFCBB9_0%,_#FFD9CE_28%,_transparent_55%),radial-gradient(circle_at_86%_62%,_#FFCBB9_0%,_#FFD9CE_30%,_transparent_58%)]"
                        />
                    ) : (
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,_#C5DFFF_0%,_#CFE4FF_30%,_transparent_56%),radial-gradient(circle_at_86%_62%,_#C5DFFF_0%,_#CFE4FF_30%,_transparent_58%)]"
                        />
                    )}

                    {/* Grilla 4x5 navy central superior */}
                    <div className="pointer-events-none absolute top-24 left-[40%] hidden opacity-85 lg:block">
                        <PlusGridPattern
                            rows={4}
                            cols={5}
                            color="navy"
                            gap={28}
                            size={8}
                        />
                    </div>

                    {/* Grilla sutil inferior izquierda */}
                    <div className="pointer-events-none absolute bottom-6 left-4 hidden opacity-25 sm:block">
                        <PlusGridPattern
                            rows={5}
                            cols={4}
                            color="navy"
                            gap={28}
                            size={7}
                        />
                    </div>

                    {/* Grilla inferior derecha coral */}
                    <div className="pointer-events-none absolute right-4 bottom-6 hidden opacity-85 md:block lg:right-8">
                        <PlusGridPattern
                            rows={5}
                            cols={4}
                            color="coral"
                            gap={28}
                            size={8}
                        />
                    </div>

                    <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
                        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
                            {/* Izquierda: Texto Hero */}
                            <div className="lg:col-span-5">
                                <p className="text-lg font-normal text-[#101E33] sm:text-[22px]">
                                    Curso en línea
                                </p>

                                <h1 className="mt-1 font-display text-5xl leading-[1.0] font-extrabold tracking-tight text-[#101E33] sm:text-6xl lg:text-[4.45rem]">
                                    EGEL
                                    <br />
                                    {areaName}
                                </h1>

                                <p className="mt-4 max-w-[340px] text-base leading-[1.35] font-normal text-[#101E33]/90 sm:text-[20px]">
                                    Conoce nuestros programas, cursos y
                                    simuladores
                                </p>

                                <div className="mt-8 flex w-full flex-col gap-3.5 sm:w-[290px]">
                                    <a
                                        href="#modalidades"
                                        className="inline-flex w-full items-center justify-center rounded-full bg-[#101E33] px-7 py-3.5 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47] sm:w-[290px]"
                                    >
                                        {isNutricion
                                            ? 'Ver Modalidades'
                                            : 'Ver modalidades'}
                                    </a>
                                    <a
                                        href="#paquetes"
                                        className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3.5 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] sm:w-[290px]"
                                    >
                                        Precios y paquetes
                                    </a>
                                </div>
                            </div>

                            {/* Derecha: Mockup 3D con @container y cqw */}
                            <div className="lg:col-span-7">
                                <BookMockup3D
                                    area={isNutricion ? 'nutricion' : 'medicina'}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. SECCIÓN #modalidades ("Modalidades disponibles:") */}
                <section
                    id="modalidades"
                    className="relative overflow-hidden bg-white pt-16 pb-0 lg:pt-24"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_85%,_#F7EFEA_0%,_transparent_48%)]"
                    />

                    {/* Grilla derecha de + en coral */}
                    <div className="pointer-events-none absolute right-4 bottom-12 hidden opacity-85 lg:block">
                        <PlusGridPattern
                            rows={6}
                            cols={3}
                            color="coral"
                            gap={28}
                            size={8}
                        />
                    </div>

                    <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-10">
                            {/* Columna izquierda: Título + Estudiante pegado abajo + Isotipo s. */}
                            <div className="relative flex flex-col justify-between self-stretch lg:col-span-5">
                                <div>
                                    <h2 className="font-display text-3xl leading-[1.05] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.15rem]">
                                        Modalidades
                                        <br />
                                        disponibles:
                                    </h2>
                                </div>

                                <div className="relative mt-8 flex items-end justify-center lg:mt-10 lg:justify-start">
                                    {/* Grilla 4x5 navy detrás del estudiante */}
                                    <div className="pointer-events-none absolute top-6 left-2 opacity-85">
                                        <PlusGridPattern
                                            rows={4}
                                            cols={5}
                                            color="navy"
                                            gap={28}
                                            size={8}
                                        />
                                    </div>

                                    {/* Isotipo s. junto al estudiante */}
                                    <img
                                        src="/img/brand2026/isotype-s-watermark.png"
                                        alt=""
                                        aria-hidden="true"
                                        className="pointer-events-none absolute right-2 bottom-3 h-28 w-auto object-contain select-none sm:right-6 sm:h-36 lg:-right-2 lg:h-40"
                                    />

                                    <img
                                        src={studentImage}
                                        alt={`Estudiante de ${fullTitle}`}
                                        className="relative z-10 block max-h-[390px] w-auto object-contain object-bottom sm:max-h-[455px] lg:ml-4 lg:max-h-[465px]"
                                    />
                                </div>
                            </div>

                            {/* Columna derecha: 2 tarjetas oscuras SIN borde coral + 3 filas + CTA coral */}
                            <div className="pb-14 lg:col-span-7 lg:pb-16">
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
                                        className="rounded-[20px] bg-gradient-to-br from-[#213C63] to-[#101E33] p-6 text-white shadow-[0_18px_38px_-14px_rgba(16,30,51,0.34)] sm:col-span-7"
                                    >
                                        <div className="flex items-start gap-3">
                                            <QuestionBubbleBadge />
                                            <h3 className="font-display text-lg leading-[1.2] font-extrabold sm:text-[19px]">
                                                ¿Qué es el curso
                                                <br />
                                                <span className="text-[#FF6B52]">
                                                    {fullTitle}
                                                </span>{' '}
                                                de Sapius?
                                            </h3>
                                        </div>
                                        <p className="mt-3.5 text-xs leading-[1.45] text-white/90 sm:text-[13px]">
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
                                        className="rounded-[20px] bg-gradient-to-br from-[#213C63] to-[#101E33] p-6 text-white shadow-[0_18px_38px_-14px_rgba(16,30,51,0.34)] sm:col-span-5"
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <QuestionBubbleBadge />
                                            <h3 className="font-display text-lg leading-[1.2] font-extrabold sm:text-[19px]">
                                                ¿Para qué sirve?
                                            </h3>
                                        </div>
                                        <p className="mt-3.5 text-xs leading-[1.45] text-white/90 sm:text-[13px]">
                                            {whatForCopy}
                                        </p>
                                    </motion.div>
                                </div>

                                {/* 3 filas de modalidades */}
                                <div className="mt-9 space-y-5">
                                    {MODALIDADES_ROWS.map((row) => {
                                        const IconComponent = row.Icon;

                                        return (
                                            <div
                                                key={`${row.line1}-${row.line2}`}
                                                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6"
                                            >
                                                <div className="inline-flex w-full shrink-0 items-center gap-3.5 rounded-full border border-[#FF6B52]/70 bg-white px-5 py-3 shadow-2xs sm:w-[240px]">
                                                    <IconComponent />
                                                    <span className="font-display text-[13.5px] leading-[1.15] font-extrabold text-[#101E33]">
                                                        <span className="block">
                                                            {row.line1}
                                                        </span>
                                                        <span className="block">
                                                            {row.line2}
                                                        </span>
                                                    </span>
                                                </div>
                                                <p className="text-[13px] leading-[1.45] text-[#101E33]/90 sm:text-[13.5px]">
                                                    {row.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Botón inferior derecho CORAL SÓLIDO */}
                                <div className="mt-9 flex justify-center sm:justify-end">
                                    <a
                                        href="#paquetes"
                                        className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3.5 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] sm:w-[290px]"
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
                    {/* Resplandor lateral derecho celeste/durazno suave como en Canva s3/s4 y s6 */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-0 bottom-0 h-[560px] w-[680px] bg-[radial-gradient(circle_at_75%_65%,_#CFE4FF_0%,_transparent_68%)] opacity-85"
                    />

                    {/* Grilla derecha de + en coral */}
                    <div className="pointer-events-none absolute right-4 bottom-48 hidden opacity-85 lg:block">
                        <PlusGridPattern
                            rows={6}
                            cols={4}
                            color="coral"
                            gap={28}
                            size={7}
                        />
                    </div>

                    {/* En Nutrición: grilla inferior izquierda navy como en page2_s4 */}
                    {isNutricion && (
                        <div className="pointer-events-none absolute bottom-10 left-4 hidden opacity-85 lg:block">
                            <PlusGridPattern
                                rows={4}
                                cols={5}
                                color="navy"
                                gap={28}
                                size={8}
                            />
                        </div>
                    )}

                    <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="mx-auto max-w-5xl text-center"
                        >
                            <h2 className="font-display text-3xl leading-[1.08] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.35rem]">
                                <span className="lg:whitespace-nowrap">
                                    Elige el curso o{' '}
                                    <span className="text-[#FF6B52]">
                                        complemento ideal
                                    </span>
                                </span>
                                <br />
                                para tus estudios
                            </h2>
                        </motion.div>

                        {isNutricion ? (
                            <>
                                {/* Fila superior: 4 PricingCard con borderVariant="coral" */}
                                <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {NUTRICION_TOP_PACKAGES.map((pkg) =>
                                        renderPricingCardItem(
                                            pkg,
                                            scheduledCourses,
                                        ),
                                    )}
                                </div>

                                {/* Fila inferior: 2 cursos completos con borderVariant="navy" + Bloque abierto Mini-Test */}
                                <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-6">
                                        {NUTRICION_BOTTOM_PACKAGES.map((pkg) =>
                                            renderPricingCardItem(
                                                pkg,
                                                scheduledCourses,
                                            ),
                                        )}
                                    </div>

                                    {/* Derecha abierta SIN borde de caja (fiel a page2_s3 + page2_s4) */}
                                    <div className="relative flex flex-col items-center justify-between pt-8 pb-2 text-center lg:col-span-6 lg:pt-20">
                                        <div className="flex flex-col items-center">
                                            <h3 className="font-display text-3xl leading-[1.08] font-extrabold text-[#101E33] sm:text-[2.45rem]">
                                                ¿Todavía no sabes
                                                <br />
                                                cuál elegir?
                                            </h3>
                                            <p className="mt-4 max-w-[380px] text-base leading-[1.35] text-[#101E33]/90 sm:text-[17.5px]">
                                                Realiza el mini test de 6
                                                preguntas para conocer lo que
                                                mejor se adapta a ti.
                                            </p>

                                            <div className="mt-7">
                                                <button
                                                    type="button"
                                                    onClick={openMiniTest}
                                                    className="inline-flex items-center justify-center rounded-full border border-[#FF6B52]/35 bg-[#FFF6EE] px-12 py-3.5 text-lg font-normal text-[#101E33] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                                >
                                                    Realiza el test
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-12 flex w-full flex-col items-center justify-end gap-5 sm:flex-row sm:items-end">
                                            <p className="max-w-[280px] text-center text-xs leading-[1.35] text-[#6B829E] italic sm:text-right">
                                                Precios y promociones pueden
                                                variar. Consulta condiciones
                                                vigentes al momento de
                                                contratar.
                                            </p>
                                            <img
                                                src="/img/brand2026/isotype-s-watermark.png"
                                                alt=""
                                                aria-hidden="true"
                                                className="h-20 w-auto shrink-0 object-contain select-none sm:h-24"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* MEDICINA: 4 tarjetas superiores con borderVariant="coral" */}
                                <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {MEDICINA_PACKAGES.map((pkg) =>
                                        renderPricingCardItem(
                                            pkg,
                                            scheduledCourses,
                                        ),
                                    )}
                                </div>

                                {/* MEDICINA: Fila inferior abierta SIN borde de caja (Izquierda Mini-Test -> Centro PlusGrid -> Derecha Cursos 2027) */}
                                <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                                    {/* Izquierda: ¿Todavía no sabes cuál elegir? + Realiza el test */}
                                    <div className="text-left lg:col-span-5">
                                        <h3 className="font-display text-3xl leading-[1.08] font-extrabold text-[#101E33] sm:text-[2.4rem]">
                                            ¿Todavía no sabes
                                            <br />
                                            cuál elegir?
                                        </h3>
                                        <p className="mt-4 max-w-[340px] text-base leading-[1.35] text-[#101E33]/90 sm:text-[17px]">
                                            Realiza el mini test de 6 preguntas
                                            para conocer lo que mejor se adapta
                                            a ti.
                                        </p>
                                        <div className="mt-6">
                                            <button
                                                type="button"
                                                onClick={openMiniTest}
                                                className="inline-flex items-center justify-center rounded-full border border-[#FF6B52]/70 bg-[#FFF7F2] px-12 py-3.5 text-lg font-normal text-[#101E33] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                            >
                                                Realiza el test
                                            </button>
                                        </div>
                                    </div>

                                    {/* Centro: grilla 4x5 navy + */}
                                    <div className="hidden justify-center lg:col-span-2 lg:flex">
                                        <PlusGridPattern
                                            rows={4}
                                            cols={5}
                                            color="navy"
                                            gap={26}
                                            size={8}
                                        />
                                    </div>

                                    {/* Derecha: Cursos 2027 + Comprar en preventa + nota legal + isotipo s. */}
                                    <div className="flex flex-col items-center text-center lg:col-span-5 lg:items-end lg:text-right">
                                        <h3 className="font-display text-3xl font-extrabold tracking-tight text-[#101E33] sm:text-[2.55rem]">
                                            Cursos 2027
                                        </h3>
                                        <a
                                            href={medicinaPresaleCourseUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-10 py-3.5 text-base font-extrabold text-[#101E33] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] hover:text-white"
                                        >
                                            Comprar en preventa
                                        </a>

                                        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:items-end lg:justify-end">
                                            <p className="max-w-[270px] text-center text-xs leading-[1.35] text-[#6B829E] italic sm:text-right">
                                                Precios y promociones pueden
                                                variar. Consulta condiciones
                                                vigentes al momento de
                                                contratar.
                                            </p>
                                            <img
                                                src="/img/brand2026/isotype-s-watermark.png"
                                                alt=""
                                                aria-hidden="true"
                                                className="h-20 w-auto shrink-0 object-contain select-none sm:h-24"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* 4. SECCIÓN Guías y simuladores (Fiel al cierre de Canva Page 2 s6/s7) */}
                <section
                    id="guias-simuladores"
                    className="relative overflow-hidden border-t border-[#101E33]/5 bg-white py-20 lg:py-24"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_75%,_#FFE6DC_0%,_transparent_52%)] opacity-65"
                    />

                    <div className="pointer-events-none absolute top-10 right-6 hidden opacity-85 lg:block">
                        <PlusGridPattern
                            rows={4}
                            cols={5}
                            color="navy"
                            gap={28}
                            size={8}
                        />
                    </div>

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
                        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-12">
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
                        </div>

                        <div className="mx-auto mt-14 grid max-w-[1060px] grid-cols-1 items-start gap-12 md:grid-cols-2 lg:gap-24">
                            <div>
                                <Link
                                    href={
                                        isNutricion
                                            ? '/guias-nutricion'
                                            : '/guias-medicina'
                                    }
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
                            </div>

                            <div>
                                <Link
                                    href={
                                        isNutricion
                                            ? '/simuladores-nutricion'
                                            : '/simuladores-medicina'
                                    }
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
                            </div>
                        </div>

                        {/* Reseñas de alumnos aprobadas (cuando existan en BD) */}
                        {Array.isArray(reviews) && reviews.length > 0 && (
                            <div className="mt-16 border-t border-[#101E33]/10 pt-14">
                                <div className="text-center">
                                    <span className="text-xs font-extrabold tracking-widest text-[#FF6B52] uppercase">
                                        Comunidad Sapius
                                    </span>
                                    <h2 className="mt-2 font-display text-2xl font-extrabold text-[#101E33] sm:text-3xl">
                                        Lo que opinan nuestros estudiantes
                                    </h2>
                                </div>

                                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                                    {reviews.slice(0, 6).map((rev) => {
                                        const stars = Math.max(
                                            1,
                                            Math.min(
                                                5,
                                                Number(rev.rating ?? 5),
                                            ),
                                        );
                                        const author =
                                            rev.user_name ||
                                            rev.name ||
                                            rev.author ||
                                            'Alumno Sapius';
                                        const text =
                                            rev.content ||
                                            rev.comment ||
                                            'Excelente preparación académica.';

                                        return (
                                            <div
                                                key={rev.id}
                                                className="flex flex-col justify-between rounded-[24px] border border-[#FF6B52]/45 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.12)]"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-1 text-[#FF6B52]">
                                                        {Array.from({
                                                            length: stars,
                                                        }).map((_, idx) => (
                                                            <Star
                                                                key={idx}
                                                                className="h-4 w-4 fill-current"
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="mt-3 text-xs leading-relaxed text-[#101E33]/85 sm:text-sm">
                                                        “{text}”
                                                    </p>
                                                </div>
                                                <p className="mt-4 border-t border-[#101E33]/10 pt-3 text-xs font-extrabold text-[#101E33]">
                                                    {author}
                                                </p>
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

    // 5. OTROS SLUGS PÚBLICOS LEGACY (`egel-plus`, `exani-1..3`, `cursos-enarm`, `cursos-presenciales`)
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
            `${c.identificador ?? ''} ${c.course_title ?? ''} ${c.course?.title ?? ''} ${c.course_slug ?? ''} ${c.category_name ?? ''}`,
        );

        return meta.requireAllKeywords
            ? meta.keywords.every((kw) => hay.includes(normalizeText(kw)))
            : meta.keywords.some((kw) => hay.includes(normalizeText(kw)));
    });

    const displayedCohorts = filteredCohorts;

    const whatsappAdvisoryUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
        `Hola equipo Sapius, me gustaría recibir información sobre ${meta.title}.`,
    )}`;

    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title={`${meta.title} | Sapius`} />

            {/* Hero luminoso con pt-28 sm:pt-32 para el navbar fijo transparente */}
            <section className="relative overflow-hidden bg-white pt-28 pb-16 sm:pt-32 lg:pb-24">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,_#FFD9CE_0%,_transparent_48%),radial-gradient(circle_at_88%_50%,_#CFE4FF_0%,_transparent_56%)]"
                />

                <div className="pointer-events-none absolute top-24 right-8 hidden opacity-75 lg:block">
                    <PlusGridPattern
                        rows={5}
                        cols={5}
                        color="coral"
                        gap={28}
                        size={8}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-7">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6B52]/40 bg-white/90 px-4 py-1.5 text-xs font-bold text-[#101E33]">
                                <Sparkles className="h-3.5 w-3.5 text-[#FF6B52]" />
                                {meta.badge}
                            </span>

                            <h1 className="mt-4 font-display text-4xl leading-[1.06] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.6rem]">
                                {meta.title}
                            </h1>

                            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#101E33]/85 sm:text-lg">
                                {meta.subtitle}
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3.5">
                                <a
                                    href={whatsappAdvisoryUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3.5 text-sm font-extrabold text-[#101E33] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] hover:text-white"
                                >
                                    Solicitar información
                                </a>
                                <button
                                    type="button"
                                    onClick={openMiniTest}
                                    className="inline-flex items-center justify-center rounded-full border border-[#FF6B52]/70 bg-[#FFF7F2] px-8 py-3.5 text-sm font-semibold text-[#101E33] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                >
                                    Realiza el test
                                </button>
                            </div>
                        </div>

                        {/* Tarjeta lateral de rutas destacadas EGEL */}
                        <div className="lg:col-span-5">
                            <div className="relative overflow-hidden rounded-[26px] border border-[#FF6B52]/75 bg-white p-7 shadow-[0_14px_34px_-14px_rgba(16,30,51,0.15)]">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold tracking-wider text-[#FF6B52] uppercase">
                                        Programas Destacados 2026/2027
                                    </span>
                                    <img
                                        src="/img/brand2026/isotype-s-watermark.png"
                                        alt=""
                                        aria-hidden="true"
                                        className="h-8 w-auto object-contain"
                                    />
                                </div>
                                <h2 className="mt-3 font-display text-xl font-extrabold text-[#101E33]">
                                    Explora nuestras rutas EGEL Plus
                                </h2>
                                <p className="mt-2 text-xs leading-relaxed text-[#101E33]/80">
                                    Accede directamente a nuestros programas
                                    especializados con guías digitales,
                                    simuladores y videoclases.
                                </p>

                                <div className="mt-5 flex flex-col gap-3">
                                    <Link
                                        href="/egel-plus-nutricion"
                                        className="flex items-center justify-between rounded-full bg-[#101E33] px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#192B47]"
                                    >
                                        <span>EGEL Nutrición</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/egel-plus-medicina"
                                        className="flex items-center justify-between rounded-full bg-[#FF6B52] px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#F0563C]"
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
                <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-[24px] border border-[#FF6B52]/65 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.12)]">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFD9CE]/60 text-[#101E33]">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 font-display text-lg font-extrabold text-[#101E33]">
                                Módulos Estructurados
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#101E33]/80">
                                Videoclases, lecturas clave y tareas enfocadas
                                en los temas de mayor ponderación oficial.
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-[#FF6B52]/65 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.12)]">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#CFE4FF]/70 text-[#101E33]">
                                <Layers className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 font-display text-lg font-extrabold text-[#101E33]">
                                Simuladores Tipo Examen
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#101E33]/80">
                                Entrena bajo tiempo real con reactivos de opción
                                múltiple y conteo de intentos configurados.
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-[#FF6B52]/65 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(16,30,51,0.12)]">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFD9CE]/60 text-[#101E33]">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 font-display text-lg font-extrabold text-[#101E33]">
                                Retroalimentación Detallada
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#101E33]/80">
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
                            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {displayedCohorts.map((item) => {
                                    const title =
                                        item.course_title ||
                                        item.course?.title ||
                                        meta.title;
                                    const amount = Number(
                                        item.precio ?? item.price ?? 0,
                                    );
                                    const cleanDescription = stripHtmlToText(
                                        item.course_description ||
                                            item.course?.description,
                                    );

                                    return (
                                        <PricingCard
                                            key={item.id}
                                            title={title}
                                            price={`$${amount.toLocaleString('es-MX')} MXN`}
                                            paymentNote="Un solo pago"
                                            description={
                                                cleanDescription ||
                                                'Acceso a plataforma Sapius con contenidos actualizados.'
                                            }
                                            ctaLabel="Comprar"
                                            href={`/checkout/${item.id}`}
                                        />
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
                                        className="rounded-[24px] border border-[#FF6B52]/45 bg-white p-6 shadow-xs"
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
                                        <p className="mt-3 text-xs leading-relaxed text-[#101E33]/85">
                                            “
                                            {rev.content ||
                                                rev.comment ||
                                                'Excelente preparación académica.'}
                                            ”
                                        </p>
                                        <p className="mt-3 text-xs font-bold text-[#101E33]">
                                            {rev.user_name ||
                                                rev.name ||
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

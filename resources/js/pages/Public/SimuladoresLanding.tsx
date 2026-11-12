import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Layers, Sparkles } from 'lucide-react';
import React from 'react';
import { BookMockup3D } from '@/components/public/BookMockup3D';
import { openMiniTest } from '@/components/public/MiniTestModal';
import { PlusGridPattern } from '@/components/public/PlusGridPattern';
import {
    PricingCard,
    resolvePurchaseTarget,
    type ScheduledCourseCandidate,
} from '@/components/public/PricingCard';
import LandingLayout from '@/layouts/LandingLayout';

export type ScheduledCourseRecord = ScheduledCourseCandidate;

export interface ManageableSimulatorItem {
    id: number | string;
    image?: string | null;
    titulo?: string | null;
    descripcion?: string | null;
    type?: string | null;
    category?: string | null;
    position?: number | null;
}

export interface SimuladoresLandingProps {
    area?: string;
    simuladores?: ScheduledCourseRecord[];
    scheduledCourses?: ScheduledCourseRecord[];
    manageableCards?: ManageableSimulatorItem[];
    cards?: ManageableSimulatorItem[];
    manageableSimulators?: ManageableSimulatorItem[];
}

function normalizeStr(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

interface OfficialSimulatorPackage {
    title: string;
    ribbon?: string;
    ctaLabel: 'Comprar' | 'Lista de espera' | 'Preventa';
    mode: 'buy' | 'waitlist' | 'presale';
    price: string;
    oldPrice?: string;
    paymentNote: string;
    description: string;
    borderVariant?: 'coral' | 'navy';
    keywords: string[];
    whatsappLabel: string;
}

const NUTRICION_SIMULATOR_PACKAGES: OfficialSimulatorPackage[] = [
    {
        title: 'Simulador compacto',
        ctaLabel: 'Comprar',
        mode: 'buy',
        price: '$299 MXN',
        paymentNote: 'Un solo pago',
        description:
            '30 reactivos, 60 segundos. 2 intentos (confirmado por Sapius).',
        borderVariant: 'coral',
        keywords: ['nutricion', 'compacto'],
        whatsappLabel: 'Simulador compacto EGEL Nutrición ($299 MXN)',
    },
    {
        title: 'Simuladores digitales',
        ctaLabel: 'Comprar',
        mode: 'buy',
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
        mode: 'buy',
        price: '$1,999 MXN',
        paymentNote: 'Un solo pago',
        description:
            '30 reactivos, 60 segundos. 2 intentos (confirmado por Sapius).',
        borderVariant: 'coral',
        keywords: ['nutricion', 'guia', 'simulador'],
        whatsappLabel: 'Guía digital + simuladores EGEL Nutrición ($1,999 MXN)',
    },
];

const MEDICINA_SIMULATOR_PACKAGES: OfficialSimulatorPackage[] = [
    {
        title: 'Simulador Individual',
        ctaLabel: 'Comprar',
        mode: 'buy',
        price: '$499 MXN',
        paymentNote: 'Un solo pago',
        description: '5 instrumentos diferentes.',
        borderVariant: 'coral',
        keywords: ['medicina', 'individual'],
        whatsappLabel: 'Simulador Individual EGEL Medicina ($499 MXN)',
    },
    {
        title: 'Paquete de 5',
        ctaLabel: 'Comprar',
        mode: 'buy',
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
        mode: 'presale',
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

export default function SimuladoresLanding({
    area = 'medicina',
    simuladores = [],
    scheduledCourses = [],
    manageableCards = [],
    cards = [],
    manageableSimulators = [],
}: SimuladoresLandingProps) {
    const isNutricion = normalizeStr(area) === 'nutricion';
    const areaDisplay = isNutricion ? 'Nutrición' : 'Medicina';
    const allCourses =
        scheduledCourses && scheduledCourses.length > 0
            ? scheduledCourses
            : simuladores;

    const adminCards =
        manageableCards && manageableCards.length > 0
            ? manageableCards
            : cards && cards.length > 0
              ? cards
              : manageableSimulators;

    const officialPackages = isNutricion
        ? NUTRICION_SIMULATOR_PACKAGES
        : MEDICINA_SIMULATOR_PACKAGES;

    return (
        <LandingLayout scheduledCourses={allCourses}>
            <Head title={`Simuladores EGEL ${areaDisplay} | Sapius`} />

            {/* HERO LUMINOSO DE SIMULADORES (pt-28 sm:pt-32 para navbar fijo transparente) */}
            <section className="relative overflow-hidden bg-white pt-28 pb-14 sm:pt-32 lg:pb-20">
                <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 ${
                        isNutricion
                            ? 'bg-[radial-gradient(circle_at_12%_18%,_#FFCBB9_0%,_#FFD9CE_28%,_transparent_54%),radial-gradient(circle_at_86%_60%,_#CFE4FF_0%,_transparent_56%)]'
                            : 'bg-[radial-gradient(circle_at_14%_20%,_#C5DFFF_0%,_#CFE4FF_30%,_transparent_54%),radial-gradient(circle_at_86%_60%,_#FFD9CE_0%,_transparent_54%)]'
                    }`}
                />

                <div className="pointer-events-none absolute top-24 left-[42%] hidden opacity-80 lg:block">
                    <PlusGridPattern
                        rows={4}
                        cols={5}
                        color="navy"
                        gap={28}
                        size={8}
                    />
                </div>

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
                    {/* Selector Pill entre Nutrición y Medicina */}
                    <div className="mb-8 inline-flex items-center rounded-full border border-[#FF6B52]/50 bg-white/90 p-1 shadow-2xs">
                        <Link
                            href="/simuladores-nutricion"
                            className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all ${
                                isNutricion
                                    ? 'bg-[#101E33] text-white shadow-2xs'
                                    : 'text-[#101E33]/75 hover:text-[#101E33]'
                            }`}
                        >
                            Nutrición
                        </Link>
                        <Link
                            href="/simuladores-medicina"
                            className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all ${
                                !isNutricion
                                    ? 'bg-[#FF6B52] text-white shadow-2xs'
                                    : 'text-[#101E33]/75 hover:text-[#101E33]'
                            }`}
                        >
                            Medicina
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-10">
                        {/* Columna izquierda */}
                        <div className="lg:col-span-6">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6B52]/40 bg-white/90 px-3.5 py-1 text-xs font-bold text-[#101E33]">
                                <Layers className="h-3.5 w-3.5 text-[#FF6B52]" />
                                Práctica Cronometrada Tipo CENEVAL
                            </span>

                            <h1 className="mt-4 font-display text-4xl leading-[1.04] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.8rem]">
                                Simuladores
                                <br />
                                <span className="text-[#FF6B52]">
                                    EGEL {areaDisplay}
                                </span>
                            </h1>

                            <p className="mt-4 max-w-lg text-base leading-[1.4] text-[#101E33]/90 sm:text-lg">
                                Entrena en condiciones reales de examen con
                                baterías de reactivos actualizados, temporizador
                                oficial y retroalimentación detallada por área.
                            </p>

                            <div className="mt-8 flex w-full flex-col gap-3.5 sm:w-[290px]">
                                <a
                                    href="#paquetes-simuladores"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#101E33] px-7 py-3.5 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47] sm:w-[290px]"
                                >
                                    Ver simuladores y paquetes
                                </a>
                                <Link
                                    href={
                                        isNutricion
                                            ? '/egel-plus-nutricion'
                                            : '/egel-plus-medicina'
                                    }
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3.5 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] sm:w-[290px]"
                                >
                                    Curso EGEL {areaDisplay}
                                </Link>
                            </div>
                        </div>

                        {/* Columna derecha: Tarjeta marco azul marino oficial con card-simuladores.png */}
                        <div className="lg:col-span-6">
                            <div className="rounded-[22px] bg-gradient-to-b from-[#1E395E] to-[#101E33] p-2.5 pb-5 shadow-[0_20px_42px_-14px_rgba(16,30,51,0.38)]">
                                <div className="overflow-hidden rounded-[16px] border border-[#FF6B52]/75 bg-white">
                                    <img
                                        src="/img/brand2026/card-simuladores.png"
                                        alt={`Simuladores EGEL ${areaDisplay} - Sapius`}
                                        className="aspect-[16/9] w-full object-cover"
                                    />
                                </div>
                                <p className="mt-4 text-center font-display text-xl font-extrabold text-white sm:text-2xl">
                                    Simuladores EGEL {areaDisplay}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PAQUETES OFICIALES DE SIMULADORES CON PRICINGCARD Y CINTA 3D REAL */}
            <section
                id="paquetes-simuladores"
                className="relative overflow-hidden border-t border-[#101E33]/5 bg-white py-18 lg:py-24"
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 bottom-0 h-[500px] w-[620px] bg-[radial-gradient(circle_at_75%_65%,_#CFE4FF_0%,_transparent_68%)] opacity-80"
                />

                <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="mx-auto max-w-2xl text-center"
                    >
                        <h2 className="font-display text-3xl leading-[1.08] font-extrabold tracking-tight text-[#101E33] sm:text-5xl">
                            Elige tu paquete de{' '}
                            <span className="text-[#FF6B52]">simuladores</span>{' '}
                            en {areaDisplay}
                        </h2>
                        <p className="mt-3 text-base leading-relaxed text-[#101E33]/85 sm:text-lg">
                            Practica con instrumentos individuales, formatos
                            compactos o paquetes completos con retroalimentación
                            académica.
                        </p>
                    </motion.div>

                    <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {officialPackages.map((pkg) => {
                            const action = resolvePurchaseTarget(
                                allCourses,
                                pkg.keywords,
                                pkg.mode,
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
                                    ctaLabel={pkg.ctaLabel}
                                    ribbon={pkg.ribbon}
                                    borderVariant={pkg.borderVariant ?? 'coral'}
                                    href={action.href}
                                    isExternal={action.isExternal}
                                />
                            );
                        })}
                    </div>

                    {/* Cursos activos en BD (`simuladores`) si existen */}
                    {simuladores && simuladores.length > 0 && (
                        <div className="mt-16 border-t border-[#101E33]/10 pt-14">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#FF6B52]" />
                                <h3 className="font-display text-2xl font-extrabold text-[#101E33]">
                                    Simuladores activos disponibles para acceso
                                    inmediato
                                </h3>
                            </div>
                            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {simuladores.map((item) => {
                                    const title =
                                        item.course_title ||
                                        item.course?.title ||
                                        item.identificador ||
                                        `Simulador ${areaDisplay}`;
                                    const priceNum = Number(
                                        item.precio ?? item.price ?? 0,
                                    );
                                    return (
                                        <PricingCard
                                            key={item.id}
                                            title={title}
                                            price={`$${priceNum.toLocaleString('es-MX')} MXN`}
                                            paymentNote="Un solo pago"
                                            description={
                                                item.course_description ||
                                                item.course?.description ||
                                                'Evaluación cronometrada tipo examen oficial con retroalimentación.'
                                            }
                                            footnote={
                                                item.identificador
                                                    ? `Código: ${item.identificador}`
                                                    : undefined
                                            }
                                            ctaLabel="Comprar"
                                            href={`/checkout/${item.id}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tarjetas administrables (`manageableCards`) si existen */}
                    {adminCards && adminCards.length > 0 && (
                        <div className="mt-16 border-t border-[#101E33]/10 pt-14">
                            <h3 className="font-display text-2xl font-extrabold text-[#101E33]">
                                Instrumentos incluidos en los simuladores de{' '}
                                {areaDisplay}
                            </h3>
                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {adminCards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="overflow-hidden rounded-[24px] border border-[#FF6B52]/55 bg-white p-5 shadow-xs"
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
                                                    'Simulador Sapius'
                                                }
                                                className="mb-4 aspect-[16/10] w-full rounded-2xl object-cover"
                                            />
                                        )}
                                        {card.category && (
                                            <span className="inline-block rounded-full bg-[#CFE4FF]/60 px-3 py-0.5 text-[11px] font-bold text-[#101E33]">
                                                {card.category}
                                            </span>
                                        )}
                                        <h4 className="mt-2 font-display text-base font-extrabold text-[#101E33]">
                                            {card.titulo ||
                                                `Instrumento ${areaDisplay}`}
                                        </h4>
                                        {card.descripcion && (
                                            <p className="mt-1.5 text-xs leading-relaxed text-[#101E33]/80">
                                                {card.descripcion}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mockup 3D del programa completo + Bloque abierto Mini-Test fiel a Canva */}
                    <div className="mt-18 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-6">
                            <BookMockup3D
                                area={isNutricion ? 'nutricion' : 'medicina'}
                            />
                        </div>

                        <div className="flex flex-col items-center justify-between text-center lg:col-span-6 lg:items-end lg:text-right">
                            <div className="flex flex-col items-center lg:items-end">
                                <h3 className="font-display text-3xl leading-[1.08] font-extrabold text-[#101E33] sm:text-[2.4rem]">
                                    ¿Todavía no sabes
                                    <br />
                                    cuál elegir?
                                </h3>
                                <p className="mt-3 max-w-md text-base leading-[1.35] text-[#101E33]/90 sm:text-[17px]">
                                    Realiza el mini test de 6 preguntas para
                                    identificar la modalidad de simuladores o
                                    curso completo ideal para tu fecha de
                                    examen.
                                </p>
                                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-end">
                                    <button
                                        type="button"
                                        onClick={openMiniTest}
                                        className="inline-flex items-center justify-center rounded-full border border-[#FF6B52]/70 bg-[#FFF7F2] px-10 py-3.5 text-lg font-normal text-[#101E33] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                    >
                                        Realiza el test
                                    </button>
                                    <Link
                                        href={
                                            isNutricion
                                                ? '/guias-nutricion'
                                                : '/guias-medicina'
                                        }
                                        className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3.5 text-base font-extrabold text-[#101E33] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] hover:text-white"
                                    >
                                        Ver guías digitales
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-10 flex items-end gap-4">
                                <p className="max-w-[270px] text-center text-xs leading-[1.35] text-[#6B829E] italic sm:text-right">
                                    Precios y promociones pueden variar.
                                    Consulta condiciones vigentes al momento de
                                    contratar.
                                </p>
                                <img
                                    src="/img/brand2026/isotype-s-watermark.png"
                                    alt=""
                                    aria-hidden="true"
                                    className="h-18 w-auto shrink-0 object-contain select-none sm:h-22"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

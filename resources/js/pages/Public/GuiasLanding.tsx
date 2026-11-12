import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
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

function normalizeStr(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

interface OfficialGuiaPackage {
    title: string;
    ribbon?: string;
    ctaLabel: 'Comprar' | 'Lista de espera' | 'Preventa';
    mode: 'buy' | 'waitlist' | 'presale';
    price: string;
    oldPrice?: string;
    paymentNote: string;
    description?: string;
    features?: string[];
    borderVariant?: 'coral' | 'navy';
    keywords: string[];
    whatsappLabel: string;
}

const NUTRICION_GUIA_PACKAGES: OfficialGuiaPackage[] = [
    {
        title: 'Guía digital',
        ribbon: 'MÁS POPULAR',
        ctaLabel: 'Comprar',
        mode: 'buy',
        price: '$999 MXN',
        paymentNote: 'Un solo pago',
        description:
            'Libro digital de repaso en la plataforma; no incluye videoclases ni asesorías por sí sola.',
        borderVariant: 'coral',
        keywords: ['nutricion', 'guia'],
        whatsappLabel: 'Guía digital EGEL Nutrición ($999 MXN)',
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
    {
        title: 'Curso completo Premium',
        ribbon: 'PROMOCIÓN',
        ctaLabel: 'Comprar',
        mode: 'buy',
        price: '$5,999 MXN',
        oldPrice: '$6,750 MXN',
        paymentNote: 'Opciones de pago',
        description:
            'Incluye guía digital e impresa, 10 semanas de preparación, simuladores, asesorías en vivo y kit de estudio SAPIUS.',
        borderVariant: 'navy',
        keywords: ['nutricion', 'premium'],
        whatsappLabel: 'Curso completo Premium EGEL Nutrición ($5,999 MXN)',
    },
];

const MEDICINA_GUIA_PACKAGES: OfficialGuiaPackage[] = [
    {
        title: 'Guía digital',
        ribbon: 'MUY PRONTO',
        ctaLabel: 'Lista de espera',
        mode: 'waitlist',
        price: '$999 MXN',
        paymentNote: 'Un solo pago',
        description: 'Próximamente.',
        borderVariant: 'coral',
        keywords: ['medicina', 'guia'],
        whatsappLabel: 'Guía digital EGEL Medicina ($999 MXN)',
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

    return (
        <LandingLayout scheduledCourses={allCourses}>
            <Head title={`Guías Digitales ${areaDisplay} | Sapius`} />

            {/* HERO LUMINOSO DE GUÍAS DIGITALES (pt-28 sm:pt-32 para navbar fijo transparente) */}
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
                            href="/guias-nutricion"
                            className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all ${
                                isNutricion
                                    ? 'bg-[#101E33] text-white shadow-2xs'
                                    : 'text-[#101E33]/75 hover:text-[#101E33]'
                            }`}
                        >
                            Nutrición
                        </Link>
                        <Link
                            href="/guias-medicina"
                            className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all ${
                                !isNutricion
                                    ? 'bg-[#FF6B52] text-white shadow-2xs'
                                    : 'text-[#101E33]/75 hover:text-[#101E33]'
                            }`}
                        >
                            Medicina
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
                        {/* Columna izquierda */}
                        <div className="lg:col-span-5">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6B52]/40 bg-white/90 px-3.5 py-1 text-xs font-bold text-[#101E33]">
                                <BookOpen className="h-3.5 w-3.5 text-[#FF6B52]" />
                                Material de Estudio Oficial Sapius
                            </span>

                            <h1 className="mt-4 font-display text-4xl leading-[1.04] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.8rem]">
                                Guías digitales
                                <br />
                                <span className="text-[#FF6B52]">
                                    EGEL {areaDisplay}
                                </span>
                            </h1>

                            <p className="mt-4 max-w-md text-base leading-[1.4] text-[#101E33]/90 sm:text-lg">
                                Domina el CENEVAL con compendios estructurados
                                por áreas clave, esquemas de alto rendimiento y
                                acceso directo desde la plataforma Sapius.
                            </p>

                            <div className="mt-8 flex w-full flex-col gap-3.5 sm:w-[290px]">
                                <a
                                    href="#paquetes-guias"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#101E33] px-7 py-3.5 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47] sm:w-[290px]"
                                >
                                    Ver guías y paquetes
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

                        {/* Columna derecha: Mockup 3D oficial Sapius */}
                        <div className="lg:col-span-7">
                            <BookMockup3D
                                area={isNutricion ? 'nutricion' : 'medicina'}
                                subtitle="GUÍA DIGITAL"
                                edition="EDICIÓN 2026 / 2027"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* PAQUETES OFICIALES CON PRICINGCARD Y CINTA 3D REAL */}
            <section
                id="paquetes-guias"
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
                            Elige tu{' '}
                            <span className="text-[#FF6B52]">guía ideal</span>{' '}
                            en {areaDisplay}
                        </h2>
                        <p className="mt-3 text-base leading-relaxed text-[#101E33]/85 sm:text-lg">
                            Estudia a tu ritmo con nuestra guía digital o
                            combínala con simuladores cronometrados tipo
                            CENEVAL.
                        </p>
                    </motion.div>

                    <div
                        className={`mt-14 grid grid-cols-1 gap-6 ${
                            officialPackages.length === 2
                                ? 'mx-auto max-w-2xl sm:grid-cols-2'
                                : 'mx-auto max-w-5xl sm:grid-cols-2 lg:grid-cols-3'
                        }`}
                    >
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
                                    features={pkg.features}
                                    ctaLabel={pkg.ctaLabel}
                                    ribbon={pkg.ribbon}
                                    borderVariant={pkg.borderVariant ?? 'coral'}
                                    href={action.href}
                                    isExternal={action.isExternal}
                                />
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
                            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                                        <PricingCard
                                            key={item.id}
                                            title={title}
                                            price={`$${priceNum.toLocaleString('es-MX')} MXN`}
                                            paymentNote="Un solo pago"
                                            description={
                                                item.course_description ||
                                                item.course?.description ||
                                                'Compendio digital estructurado para preparación de examen.'
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
                                Contenidos incluidos en las guías de{' '}
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
                                                    'Guía Sapius'
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
                                                `Módulo de ${areaDisplay}`}
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

                    {/* Vista previa en tablet + Bloque abierto Mini-Test fiel a Canva */}
                    <div className="mt-18 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <div className="rounded-[22px] bg-gradient-to-b from-[#1E395E] to-[#101E33] p-2.5 pb-5 shadow-[0_20px_42px_-14px_rgba(16,30,51,0.38)]">
                                <div className="overflow-hidden rounded-[16px] border border-[#FF6B52]/75 bg-white">
                                    <img
                                        src="/img/brand2026/card-guias-digitales.png"
                                        alt={`Guía Digital EGEL ${areaDisplay} - Sapius`}
                                        className="aspect-[16/9] w-full object-cover"
                                    />
                                </div>
                                <p className="mt-4 text-center font-display text-xl font-extrabold text-white">
                                    Guías digitales Sapius
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-between text-center lg:col-span-7 lg:items-end lg:text-right">
                            <div className="flex flex-col items-center lg:items-end">
                                <h3 className="font-display text-3xl leading-[1.08] font-extrabold text-[#101E33] sm:text-[2.4rem]">
                                    ¿Todavía no sabes
                                    <br />
                                    cuál elegir?
                                </h3>
                                <p className="mt-3 max-w-md text-base leading-[1.35] text-[#101E33]/90 sm:text-[17px]">
                                    Realiza el mini test de 6 preguntas para
                                    descubrir si necesitas únicamente la guía
                                    digital, simuladores o el curso completo.
                                </p>
                                <button
                                    type="button"
                                    onClick={openMiniTest}
                                    className="mt-6 inline-flex items-center justify-center rounded-full border border-[#FF6B52]/70 bg-[#FFF7F2] px-12 py-3.5 text-lg font-normal text-[#101E33] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                >
                                    Realiza el test
                                </button>
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

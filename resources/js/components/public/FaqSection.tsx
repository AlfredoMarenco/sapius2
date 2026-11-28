import { Link } from '@inertiajs/react';
import {
    BookOpenCheck,
    ChevronDown,
    ChevronRight,
    PackageCheck,
    Search,
    ShoppingBag,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import FaqAccordion from '@/components/public/FaqAccordion';
import type { FaqItem } from '@/components/public/FaqAccordion';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import { SapiusIsotype } from '@/components/public/SapiusLogo';

export interface PublicFaqItem extends FaqItem {
    category: 'antes-de-comprar' | 'cursos' | 'acceso';
}

export const PUBLIC_FAQS: PublicFaqItem[] = [
    {
        id: 'tiempo',
        category: 'antes-de-comprar',
        question: '¿Todavía estoy a tiempo?',
        answer: 'Sí. Contamos tanto con programas completos de 10 semanas como con modalidad 100% asincrónica, Guías Digitales y Simuladores independientes para adaptarnos exactamente al tiempo que falta para tu examen.',
    },
    {
        id: 'diferencia',
        category: 'antes-de-comprar',
        question: '¿Qué diferencia hay entre los productos?',
        answer: 'La Guía + Simulador te brinda lectura de repaso y práctica autónoma; el Curso Asincrónico suma 10 semanas con videoclases, tareas y exámenes diarios a tu ritmo; y el Curso Premium incluye además guía impresa, kit físico, asesorías dominicales en vivo y garantía condicionada.',
    },
    {
        id: 'acceso',
        category: 'acceso',
        question: '¿Cuándo recibo mi acceso?',
        answer: 'Al confirmar tu inscripción en nuestra plataforma recibes tus credenciales para acceder a tu panel de alumno, y en paquetes con inicio programado o preventa te notificamos puntualmente cada apertura de bloque.',
    },
    {
        id: 'semanas',
        category: 'cursos',
        question: '¿Cuántas semanas son el curso completo?',
        answer: 'El curso completo tiene una duración de 10 semanas.',
    },
];

function normalizeSearchText(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

export interface FaqSectionProps {
    headingAs?: 'h1' | 'h2';
    subtitle?: string;
    ctaHref: string;
    ctaLabel?: string;
    topPaddingClass?: string;
    activeCategory?: PublicFaqItem['category'] | null;
    onClearCategory?: () => void;
    progressiveMode?: boolean;
}

interface ProgressiveCategory {
    id: string;
    title: string;
    faqIds: string[];
}

interface ProgressiveGroup {
    id: 'antes-de-comprar' | 'conoce-tu-preparacion' | 'despues-de-comprar';
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    categories: ProgressiveCategory[];
}

const PROGRESSIVE_GROUPS: ProgressiveGroup[] = [
    {
        id: 'antes-de-comprar',
        title: 'Antes de comprar',
        subtitle: 'Productos, fechas, precios, grupos y resultados.',
        icon: ShoppingBag,
        categories: [
            {
                id: 'productos-eleccion',
                title: 'Productos y elección de curso',
                faqIds: ['diferencia'],
            },
            {
                id: 'fechas-planeacion',
                title: 'Fechas y planeación de estudio',
                faqIds: ['tiempo'],
            },
            {
                id: 'precios-promociones',
                title: 'Precios, promociones y formas de pago',
                faqIds: [],
            },
            {
                id: 'grupos-universidades',
                title: 'Grupos y universidades',
                faqIds: [],
            },
            {
                id: 'sapius-expertos',
                title: 'SAPIUS, expertos y resultados',
                faqIds: [],
            },
        ],
    },
    {
        id: 'conoce-tu-preparacion',
        title: 'Conoce tu preparación',
        subtitle: 'Metodología, simuladores, plataforma y asesorías.',
        icon: BookOpenCheck,
        categories: [
            {
                id: 'contenido-metodologia',
                title: 'Contenido y metodología de estudio',
                faqIds: ['semanas'],
            },
            {
                id: 'simuladores-evaluaciones',
                title: 'Simuladores y evaluaciones',
                faqIds: [],
            },
            {
                id: 'modalidad-plataforma',
                title: 'Modalidad y plataforma',
                faqIds: [],
            },
            {
                id: 'asesorias-acompanamiento',
                title: 'Asesorías y acompañamiento académico',
                faqIds: [],
            },
        ],
    },
    {
        id: 'despues-de-comprar',
        title: 'Después de comprar',
        subtitle: 'Accesos, facturación, envíos y garantía.',
        icon: PackageCheck,
        categories: [
            {
                id: 'accesos-pagos-facturacion',
                title: 'Accesos, pagos y facturación',
                faqIds: ['acceso'],
            },
            {
                id: 'material-envios-garantia',
                title: 'Material físico, envíos y garantía',
                faqIds: [],
            },
        ],
    },
];

/**
 * Sección compartida "Estamos aquí para resolver tus dudas." fiel a Canva Page 1 y Page 6.
 */
export function FaqSection({
    headingAs = 'h2',
    subtitle,
    ctaHref,
    ctaLabel = 'Ir a Preguntas frecuentes',
    topPaddingClass = 'py-16 lg:py-24',
    activeCategory = null,
    onClearCategory,
    progressiveMode = false,
}: FaqSectionProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [openGroupIds, setOpenGroupIds] = useState<string[]>([]);
    const [openCategoryIds, setOpenCategoryIds] = useState<string[]>([]);

    const toggleGroup = (groupId: string) => {
        setOpenGroupIds((prev) =>
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : [...prev, groupId],
        );
    };

    const toggleCategory = (catId: string) => {
        setOpenCategoryIds((prev) =>
            prev.includes(catId)
                ? prev.filter((id) => id !== catId)
                : [...prev, catId],
        );
    };

    const filteredFaqs = useMemo(() => {
        const normalizedQuery = normalizeSearchText(searchQuery);

        return PUBLIC_FAQS.filter((item) => {
            if (activeCategory && item.category !== activeCategory) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            const haystack = normalizeSearchText(
                `${item.question} ${item.answer}`,
            );

            return haystack.includes(normalizedQuery);
        });
    }, [activeCategory, searchQuery]);

    const HeadingTag = headingAs;
    const isAnchorLink = ctaHref.startsWith('#');

    return (
        <section
            className={`relative overflow-hidden bg-white ${topPaddingClass}`}
        >
            {/* Sutil resplandor cálido izquierdo */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(circle at 18% 55%, rgba(246, 240, 234, 0.95) 0%, rgba(246, 240, 234, 0.45) 35%, transparent 58%)',
                }}
            />

            {/* Grilla decorativa navy en margen derecho */}
            <div className="pointer-events-none absolute right-2 bottom-10 hidden opacity-70 lg:right-6 lg:block">
                <PlusGridPattern
                    rows={6}
                    cols={4}
                    color="navy"
                    gap={26}
                    size={7}
                />
            </div>

            <div className="relative z-10 mx-auto max-w-[1180px] px-5 sm:px-8">
                {progressiveMode ? (
                    <div>
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="relative mt-1 flex h-16 w-16 shrink-0 items-center justify-center sm:h-18 sm:w-18">
                                    <img
                                        src="/img/brand2026/badge-squircle-peach.png"
                                        alt=""
                                        aria-hidden="true"
                                        draggable={false}
                                        className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none"
                                    />
                                    <svg
                                        viewBox="0 0 36 36"
                                        className="relative z-10 h-8 w-8 stroke-[#101E33]"
                                        fill="none"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M9 19H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5" />
                                        <rect
                                            x="11"
                                            y="12"
                                            width="18"
                                            height="13"
                                            rx="2.5"
                                        />
                                        <path d="M16 25v4l4.5-4" />
                                        <path d="M18.4 16.5a1.9 1.9 0 1 1 2.7 1.7c-.7.4-1.1.8-1.1 1.5" />
                                        <circle
                                            cx="20"
                                            cy="22.2"
                                            r="0.7"
                                            className="fill-[#101E33]"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <HeadingTag className="font-display text-3xl leading-[1.08] font-extrabold tracking-tight text-[#101E33] sm:text-[2.55rem]">
                                        Estamos aquí para
                                        <br className="hidden sm:block" />{' '}
                                        resolver tus dudas.
                                    </HeadingTag>
                                    {subtitle && (
                                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#101E33]/80 sm:text-base">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {isAnchorLink ? (
                                <a
                                    href={ctaHref}
                                    className="inline-flex items-center justify-center self-start rounded-full bg-[#FF6B52] px-7 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] lg:self-end"
                                >
                                    {ctaLabel}
                                </a>
                            ) : (
                                <Link
                                    href={ctaHref}
                                    className="inline-flex items-center justify-center self-start rounded-full bg-[#FF6B52] px-7 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] lg:self-end"
                                >
                                    {ctaLabel}
                                </Link>
                            )}
                        </div>

                        <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                            {/* Mitad izquierda: 3 tarjetas principales apiladas verticalmente */}
                            <div className="space-y-4 lg:col-span-6">
                                {PROGRESSIVE_GROUPS.map((group) => {
                                    const Icon = group.icon;
                                    const isOpen = openGroupIds.includes(group.id);

                                    return (
                                        <div key={group.id}>
                                            <button
                                                type="button"
                                                onClick={() => toggleGroup(group.id)}
                                                aria-expanded={isOpen}
                                                className={`w-full rounded-[22px] border bg-white p-5 text-left shadow-[0_12px_30px_-14px_rgba(16,30,51,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B52] sm:p-6 ${
                                                    isOpen
                                                        ? 'border-[#FF6B52] ring-2 ring-[#FF6B52]/20'
                                                        : 'border-[#FF6B52]/45'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-start gap-3.5">
                                                        <span
                                                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                                                                isOpen
                                                                    ? 'border-[#FF6B52] bg-[#FF6B52]/10 text-[#FF6B52]'
                                                                    : 'border-[#101E33]/20 text-[#101E33]'
                                                            }`}
                                                        >
                                                            <Icon
                                                                className="h-5 w-5"
                                                                strokeWidth={1.7}
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                        <div>
                                                            <h3 className="font-display text-lg font-extrabold text-[#101E33]">
                                                                {group.title}
                                                            </h3>
                                                            <p className="mt-1 text-xs leading-relaxed text-[#101E33]/75 sm:text-sm">
                                                                {group.subtitle}
                                                            </p>
                                                            <span className="mt-2 inline-block text-xs font-bold text-[#FF6B52]">
                                                                {group.categories.length} categorías
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <ChevronRight
                                                        className={`h-5 w-5 shrink-0 text-[#101E33]/70 transition-transform duration-200 ${
                                                            isOpen
                                                                ? 'rotate-90 text-[#FF6B52]'
                                                                : ''
                                                        }`}
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                            </button>

                                            {/* En móvil se despliegan las categorías debajo de su tarjeta */}
                                            <div
                                                className={`grid transition-all duration-300 ease-out lg:hidden ${
                                                    isOpen
                                                        ? 'mt-3 grid-rows-[1fr] opacity-100'
                                                        : 'grid-rows-[0fr] opacity-0'
                                                }`}
                                            >
                                                <div className="overflow-hidden">
                                                    <div className="space-y-2.5 pl-2">
                                                        {group.categories.map((cat) => {
                                                            const catOpen = openCategoryIds.includes(cat.id);
                                                            const catFaqs = PUBLIC_FAQS.filter((f) =>
                                                                cat.faqIds.includes(f.id),
                                                            );
                                                            return (
                                                                <div
                                                                    key={cat.id}
                                                                    className="rounded-2xl border border-[#101E33]/12 bg-white/95"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleCategory(cat.id)}
                                                                        aria-expanded={catOpen}
                                                                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-bold text-[#101E33]"
                                                                    >
                                                                        <span>{cat.title}</span>
                                                                        <ChevronDown
                                                                            className={`h-4 w-4 shrink-0 text-[#FF6B52] transition-transform duration-200 ${
                                                                                catOpen ? 'rotate-180' : ''
                                                                            }`}
                                                                            aria-hidden="true"
                                                                        />
                                                                    </button>
                                                                    <div
                                                                        className={`grid transition-all duration-300 ease-out ${
                                                                            catOpen
                                                                                ? 'grid-rows-[1fr] opacity-100'
                                                                                : 'grid-rows-[0fr] opacity-0'
                                                                        }`}
                                                                    >
                                                                        <div className="overflow-hidden">
                                                                            <div className="border-t border-[#101E33]/10 px-4 py-3">
                                                                                {catFaqs.length > 0 ? (
                                                                                    <FaqAccordion items={catFaqs} />
                                                                                ) : (
                                                                                    <p className="text-xs text-[#101E33]/70">
                                                                                        Consulta esta categoría en la sección completa de Preguntas Frecuentes.
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mitad derecha (escritorio): Categorías y preguntas de las tarjetas abiertas */}
                            <div className="hidden lg:col-span-6 lg:block">
                                {openGroupIds.length === 0 ? (
                                    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#FF6B52]/40 bg-[#F6F0EA]/45 p-8 text-center">
                                        <SapiusIsotype
                                            variant="dark"
                                            className="h-24 opacity-80"
                                        />
                                        <p className="mt-5 font-display text-lg font-bold text-[#101E33]">
                                            Selecciona una tarjeta de la izquierda
                                        </p>
                                        <p className="mt-1.5 max-w-sm text-sm text-[#101E33]/70">
                                            Haz clic en «Antes de comprar», «Conoce tu preparación» o «Después de comprar» para explorar sus categorías y preguntas.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {PROGRESSIVE_GROUPS.filter((g) =>
                                            openGroupIds.includes(g.id),
                                        ).map((group) => (
                                            <div
                                                key={group.id}
                                                className="rounded-[24px] border border-[#FF6B52]/35 bg-white/95 p-6 shadow-[0_14px_34px_-16px_rgba(16,30,51,0.12)]"
                                            >
                                                <div className="mb-4 flex items-center justify-between border-b border-[#101E33]/10 pb-3">
                                                    <h4 className="font-display text-base font-extrabold text-[#101E33]">
                                                        {group.title}
                                                    </h4>
                                                    <span className="rounded-full bg-[#FFD9CE]/60 px-3 py-0.5 text-xs font-bold text-[#101E33]">
                                                        {group.categories.length} categorías
                                                    </span>
                                                </div>

                                                <div className="space-y-2.5">
                                                    {group.categories.map((cat) => {
                                                        const catOpen = openCategoryIds.includes(cat.id);
                                                        const catFaqs = PUBLIC_FAQS.filter((f) =>
                                                            cat.faqIds.includes(f.id),
                                                        );

                                                        return (
                                                            <div
                                                                key={cat.id}
                                                                className="rounded-2xl border border-[#101E33]/12 bg-[#FDFBF9]"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleCategory(cat.id)}
                                                                    aria-expanded={catOpen}
                                                                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-bold text-[#101E33] transition-colors hover:text-[#FF6B52]"
                                                                >
                                                                    <span>{cat.title}</span>
                                                                    <ChevronDown
                                                                        className={`h-4 w-4 shrink-0 text-[#FF6B52] transition-transform duration-200 ${
                                                                            catOpen ? 'rotate-180' : ''
                                                                        }`}
                                                                        aria-hidden="true"
                                                                    />
                                                                </button>
                                                                <div
                                                                    className={`grid transition-all duration-300 ease-out ${
                                                                        catOpen
                                                                            ? 'grid-rows-[1fr] opacity-100'
                                                                            : 'grid-rows-[0fr] opacity-0'
                                                                    }`}
                                                                >
                                                                    <div className="overflow-hidden">
                                                                        <div className="border-t border-[#101E33]/10 bg-white px-4 py-3">
                                                                            {catFaqs.length > 0 ? (
                                                                                <FaqAccordion items={catFaqs} />
                                                                            ) : (
                                                                                <p className="text-xs text-[#101E33]/70">
                                                                                    Consulta esta categoría en la sección completa de Preguntas Frecuentes.
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
                    {/* Izquierda: Cabecera con squircle 3D + doble burbuja ? + subtítulo opcional + acordeón */}
                    <div className="lg:col-span-7">
                        <div className="flex items-start gap-4">
                            <div className="relative mt-1 flex h-16 w-16 shrink-0 items-center justify-center sm:h-18 sm:w-18">
                                <img
                                    src="/img/brand2026/badge-squircle-peach.png"
                                    alt=""
                                    aria-hidden="true"
                                    draggable={false}
                                    className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none"
                                />
                                <svg
                                    viewBox="0 0 36 36"
                                    className="relative z-10 h-8 w-8 stroke-[#101E33]"
                                    fill="none"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M9 19H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5" />
                                    <rect
                                        x="11"
                                        y="12"
                                        width="18"
                                        height="13"
                                        rx="2.5"
                                    />
                                    <path d="M16 25v4l4.5-4" />
                                    <path d="M18.4 16.5a1.9 1.9 0 1 1 2.7 1.7c-.7.4-1.1.8-1.1 1.5" />
                                    <circle
                                        cx="20"
                                        cy="22.2"
                                        r="0.7"
                                        className="fill-[#101E33]"
                                    />
                                </svg>
                            </div>

                            <HeadingTag className="font-display text-3xl leading-[1.08] font-extrabold tracking-tight text-[#101E33] sm:text-[2.55rem]">
                                Estamos aquí para
                                <br className="hidden sm:block" /> resolver tus
                                dudas.
                            </HeadingTag>
                        </div>

                        {subtitle && (
                            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#101E33]/80 sm:text-base">
                                {subtitle}
                            </p>
                        )}

                        {activeCategory && onClearCategory && (
                            <div className="mt-4 flex items-center gap-3">
                                <span className="inline-flex items-center rounded-full bg-[#FFD9CE]/60 px-3.5 py-1 text-xs font-bold text-[#101E33]">
                                    Categoría: Antes de comprar
                                </span>
                                <button
                                    type="button"
                                    onClick={onClearCategory}
                                    className="text-xs font-bold text-[#FF6B52] underline underline-offset-2 hover:text-[#F0563C]"
                                >
                                    Ver todas
                                </button>
                            </div>
                        )}

                        <div className="mt-8">
                            {filteredFaqs.length > 0 ? (
                                <FaqAccordion
                                    items={filteredFaqs}
                                    defaultOpenId="semanas"
                                />
                            ) : (
                                <div className="rounded-2xl border border-[#FF6B52]/40 bg-white/90 px-5 py-4 text-sm text-[#101E33]/80">
                                    No encontramos preguntas que coincidan con “
                                    <span className="font-bold text-[#101E33]">
                                        {searchQuery}
                                    </span>
                                    ”.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Derecha: Buscador coral pill + Isotipo gigante s. + Botón coral */}
                    <div className="flex flex-col items-center justify-center lg:col-span-5">
                        <div className="flex w-full max-w-[350px] items-center gap-2.5 rounded-full border border-[#FF6B52]/75 bg-white px-4 py-2.5 shadow-2xs focus-within:border-[#FF6B52] focus-within:ring-2 focus-within:ring-[#FF6B52]/20">
                            <Search
                                className="h-4 w-4 shrink-0 text-[#FF6B52]"
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="¿Qué te gustaría saber?"
                                aria-label="¿Qué te gustaría saber?"
                                className="w-full bg-transparent text-sm text-[#101E33] placeholder:text-[#101E33]/50 focus:outline-none"
                            />
                        </div>

                        <SapiusIsotype
                            variant="dark"
                            className="mt-8 h-40 sm:h-48 lg:h-[205px]"
                        />

                        {isAnchorLink ? (
                            <a
                                href={ctaHref}
                                className="mt-7 inline-flex w-full max-w-[295px] items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3.5 text-center text-base font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                {ctaLabel}
                            </a>
                        ) : (
                            <Link
                                href={ctaHref}
                                className="mt-7 inline-flex w-full max-w-[295px] items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3.5 text-center text-base font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                {ctaLabel}
                            </Link>
                        )}
                    </div>
                </div>
                )}
            </div>
        </section>
    );
}

export default FaqSection;

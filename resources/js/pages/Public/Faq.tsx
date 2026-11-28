import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import React, { useState } from 'react';
import FaqSection from '@/components/public/FaqSection';
import type { PublicFaqItem } from '@/components/public/FaqSection';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import LandingLayout from '@/layouts/LandingLayout';

export interface FaqPageProps {
    scheduledCourses?: ScheduledCourseCandidate[];
}

const COMPACT_PRODUCTS = [
    {
        id: 'simulador-1',
        title: 'Simulador Individual',
        price: '$499 MXN',
        paymentNote: 'Un solo pago',
        description: '5 instrumentos diferentes.',
        href: '/simuladores-medicina',
    },
    {
        id: 'simulador-2',
        title: 'Simulador Individual',
        price: '$499 MXN',
        paymentNote: 'Un solo pago',
        description: '5 instrumentos diferentes.',
        href: '/simuladores-medicina',
    },
] as const;

export default function Faq({ scheduledCourses = [] }: FaqPageProps) {
    const [selectedCategory, setSelectedCategory] = useState<
        PublicFaqItem['category'] | null
    >(null);

    const handleSelectCategory = (category: PublicFaqItem['category']) => {
        setSelectedCategory((prev) => (prev === category ? null : category));

        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Preguntas frecuentes — Sapius" />

            {/* Sección 1: Buscador, Acordeón, Isotipo s. y CTA (Canva Page 6 v297) */}
            <FaqSection
                progressiveMode={true}
                headingAs="h1"
                topPaddingClass="pt-28 pb-16 sm:pt-34 lg:pb-20"
                ctaHref="#temas-informacion"
                ctaLabel="Ir a Preguntas frecuentes"
                activeCategory={selectedCategory}
                onClearCategory={() => setSelectedCategory(null)}
            />

            {/* Sección 2: Franja oscura ¿Sobre qué tema necesitas información? */}
            <section
                id="temas-informacion"
                className="bg-[#101E33] py-14 text-center text-white sm:py-16"
            >
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="mx-auto max-w-4xl px-5 sm:px-8"
                >
                    <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
                        ¿Sobre qué tema{' '}
                        <span className="text-[#FF6B52]">
                            necesitas información?
                        </span>
                    </h2>
                    <p className="mt-3 text-sm text-white/85 sm:text-base">
                        Selecciona una de las siguientes categorías para
                        comenzar.
                    </p>
                </motion.div>
            </section>

            {/* Sección 3: Categorías + Tarjetas compactas + Ilustración libro abierto */}
            <section className="bg-white py-16 lg:py-22">
                <div className="mx-auto max-w-[1140px] px-5 sm:px-8">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                        {/* Izquierda: Tarjeta Antes de comprar + 2 tarjetas compactas */}
                        <div className="space-y-5 lg:col-span-6">
                            <button
                                type="button"
                                onClick={() =>
                                    handleSelectCategory('antes-de-comprar')
                                }
                                aria-pressed={
                                    selectedCategory === 'antes-de-comprar'
                                }
                                className={`w-full rounded-[22px] border bg-white p-6 text-left shadow-[0_12px_30px_-14px_rgba(16,30,51,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B52] ${
                                    selectedCategory === 'antes-de-comprar'
                                        ? 'border-[#FF6B52] ring-2 ring-[#FF6B52]/20'
                                        : 'border-[#FF6B52]/60'
                                }`}
                            >
                                <div className="flex items-start gap-3.5">
                                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#101E33]/20 text-[#101E33]">
                                        <ShoppingBag
                                            className="h-5 w-5"
                                            strokeWidth={1.7}
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div>
                                        <h3 className="font-display text-lg font-extrabold text-[#101E33]">
                                            Antes de comprar
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-[#101E33]/75 sm:text-sm">
                                            Productos, precios, fechas y
                                            opciones de compra.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#101E33]/80">
                                    <span>5 categorías</span>
                                    <ArrowRight
                                        className="h-4 w-4 text-[#101E33]"
                                        aria-hidden="true"
                                    />
                                </div>
                            </button>

                            {COMPACT_PRODUCTS.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className="block max-w-[340px] rounded-[22px] border border-[#FF6B52]/60 bg-white p-5 shadow-[0_10px_26px_-14px_rgba(16,30,51,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B52]"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#101E33]/20 text-[#101E33]">
                                            <ShoppingBag
                                                className="h-4 w-4"
                                                strokeWidth={1.7}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <h3 className="font-display text-base leading-tight font-extrabold text-[#101E33]">
                                            {item.title}
                                        </h3>
                                    </div>

                                    <div className="mt-3 flex items-baseline gap-3">
                                        <span className="font-display text-lg font-extrabold text-[#101E33]">
                                            {item.price}
                                        </span>
                                        <span className="text-[11px] font-medium text-[#FF6B52]">
                                            {item.paymentNote}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs text-[#101E33]/75">
                                        {item.description}
                                    </p>
                                </Link>
                            ))}
                        </div>

                        {/* Derecha: Ilustración de libro abierto en línea oscura */}
                        <div className="flex justify-center lg:col-span-6">
                            <svg
                                viewBox="0 0 240 190"
                                className="h-52 w-auto stroke-[#101E33] sm:h-64"
                                fill="none"
                                strokeWidth="5.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M120 48c-22-14-54-20-88-20v116c34 0 66 6 88 22" />
                                <path d="M120 48c22-14 54-20 88-20v116c-34 0-66 6-88 22" />
                                <path d="M120 48v118" />
                                <path d="M54 58c18 1 34 5 46 11" />
                                <path d="M54 82c18 1 34 5 46 11" />
                                <path d="M54 106c18 1 34 5 46 11" />
                                <path d="M186 58c-18 1-34 5-46 11" />
                                <path d="M186 82c-18 1-34 5-46 11" />
                                <path d="M186 106c-18 1-34 5-46 11" />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

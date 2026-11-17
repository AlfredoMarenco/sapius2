import { Head } from '@inertiajs/react';
import React from 'react';
import GuiasSimuladoresSection from '@/components/public/GuiasSimuladoresSection';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import ProductBookHero from '@/components/public/ProductBookHero';
import LandingLayout from '@/layouts/LandingLayout';

export interface ProductsHubProps {
    scheduledCourses?: ScheduledCourseCandidate[];
}

export default function ProductsHub({ scheduledCourses = [] }: ProductsHubProps) {
    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Productos — Guías y Simuladores | Sapius" />

            {/* HERO: Guías y simuladores (Canva Page 8 v297) */}
            <ProductBookHero
                titleLine1="Guías y"
                titleLine2="simuladores"
                actions={
                    <>
                        <a
                            href="#guias-digitales"
                            className="inline-flex w-full items-center justify-center rounded-full bg-[#101E33] px-7 py-3.5 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47] sm:w-[290px]"
                        >
                            Guías
                        </a>
                        <a
                            href="#simuladores-digitales"
                            className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3.5 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] sm:w-[290px]"
                        >
                            Simuladores
                        </a>
                    </>
                }
            />

            {/* Catálogo Guías y simuladores */}
            <GuiasSimuladoresSection
                id="catalogo-productos"
                guiaHref="/guias-nutricion"
                simuladorHref="/simuladores-nutricion"
                guiasCardId="guias-digitales"
                simuladoresCardId="simuladores-digitales"
            />
        </LandingLayout>
    );
}

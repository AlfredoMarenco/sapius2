import { Head } from '@inertiajs/react';
import React from 'react';
import GuiasSimuladoresSection from '@/components/public/GuiasSimuladoresSection';
import { WHATSAPP_PHONE } from '@/components/public/PricingCard';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import ProductBookHero from '@/components/public/ProductBookHero';
import LandingLayout from '@/layouts/LandingLayout';

export interface ProductsHubProps {
    scheduledCourses?: ScheduledCourseCandidate[];
}

export default function ProductsHub({ scheduledCourses = [] }: ProductsHubProps) {
    const groupsWhatsappHref = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
        'Hola Sapius, me gustaría hablar con un asesor sobre grupos y paquetes para el EGEL Plus.',
    )}`;

    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Productos — Guías, Simuladores, Grupos y Paquetes | Sapius" />

            {/* HERO: Guías y simuladores (Canva Page 8 v332) */}
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
                        <a
                            href="#grupos-y-paquetes"
                            className="inline-flex w-full items-center justify-center rounded-full border border-[#101E33]/25 bg-white px-7 py-3 text-sm font-bold text-[#101E33] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B52] hover:text-[#FF6B52] sm:w-[290px]"
                        >
                            Grupos y paquetes
                        </a>
                    </>
                }
            />

            {/* Sección 2: Catálogo Guías y simuladores (Canva Page 8) */}
            <GuiasSimuladoresSection
                id="catalogo-productos"
                guiaHref="/guias-nutricion"
                simuladorHref="/simuladores-nutricion"
                guiasCardId="guias-digitales"
                simuladoresCardId="simuladores-digitales"
            />

            {/* Sección 3: Grupos y paquetes (Canva Page 9 v332) */}
            <div id="grupos-y-paquetes" className="scroll-mt-20 border-t border-[#101E33]/8">
                <ProductBookHero
                    titleLine1="Grupos y"
                    titleLine2="paquetes"
                    subtitle="Conoce nuestros programas, cursos y simuladores."
                    customVisual={
                        <div className="flex justify-center lg:justify-end">
                            <img
                                src="/img/brand2026/hero-groups-students.png"
                                alt="Grupo de alumnos Sapius"
                                className="max-h-[460px] w-auto rounded-2xl object-contain mix-blend-multiply"
                            />
                        </div>
                    }
                    actions={
                        <a
                            href={groupsWhatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3.5 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] sm:w-[290px]"
                        >
                            Hablar con un asesor
                        </a>
                    }
                />
            </div>
        </LandingLayout>
    );
}

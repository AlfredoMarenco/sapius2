import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';
import { PlusGridPattern } from '@/components/public/PlusGridPattern';

export const SIMULATOR_QUICK_LINKS: ReadonlyArray<{
    label: string;
    href: string;
}> = [
    { label: 'Globales nutrición', href: '/simuladores-nutricion' },
    { label: 'Compacto nutrición', href: '/simuladores-nutricion' },
    {
        label: 'Módulos y exámenes diarios',
        href: '/egel-plus-nutricion#paquetes',
    },
    { label: 'Medicina 5 simuladores', href: '/simuladores-medicina' },
];

export interface GuiasSimuladoresSectionProps {
    id?: string;
    guiaHref?: string;
    simuladorHref?: string;
    guiasCardId?: string;
    simuladoresCardId?: string;
    withTopBorder?: boolean;
}

/**
 * Sección "Guías y simuladores" compartida por Productos (/productos) y Cursos EGEL.
 */
export function GuiasSimuladoresSection({
    id = 'guias-simuladores',
    guiaHref = '/guias-nutricion',
    simuladorHref = '/simuladores-nutricion',
    guiasCardId,
    simuladoresCardId,
    withTopBorder = false,
}: GuiasSimuladoresSectionProps) {
    return (
        <section
            id={id}
            className={`relative overflow-hidden bg-white py-20 lg:py-24 ${
                withTopBorder ? 'border-t border-[#101E33]/5' : ''
            }`.trim()}
        >
            {/* Sutil resplandor cálido central-izquierdo */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_75%,_#FFE6DC_0%,_transparent_52%)] opacity-65"
            />

            {/* Grilla 4x5 navy en el margen superior derecho */}
            <div className="pointer-events-none absolute top-10 right-6 hidden opacity-85 lg:block">
                <PlusGridPattern
                    rows={4}
                    cols={5}
                    color="navy"
                    gap={28}
                    size={8}
                />
            </div>

            {/* Grilla 6x4 coral en el margen inferior izquierdo */}
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
                {/* Cabecera en 2 columnas horizontales */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-12"
                >
                    <div className="lg:col-span-5">
                        <h2 className="font-display text-4xl leading-[1.02] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.55rem]">
                            Guías y
                            <br />
                            <span className="text-[#FF6B52]">simuladores</span>
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
                </motion.div>

                {/* 2 Columnas Simétricas Amplias */}
                <div className="mx-auto mt-14 grid max-w-[1060px] grid-cols-1 items-start gap-12 md:grid-cols-2 lg:gap-24">
                    {/* Columna Izquierda: Guías digitales */}
                    <motion.div
                        id={guiasCardId}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <Link
                            href={guiaHref}
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
                                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#FF6B52] px-10 py-3 text-center text-[15px] font-bold text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                Nutrición digital 2027
                            </Link>
                        </div>
                    </motion.div>

                    {/* Columna Derecha: Simuladores */}
                    <motion.div
                        id={simuladoresCardId}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{
                            duration: 0.4,
                            delay: 0.08,
                            ease: 'easeOut',
                        }}
                    >
                        <Link
                            href={simuladorHref}
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
                                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#FF6B52] px-5 py-2.5 text-center text-[14px] leading-tight font-bold text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default GuiasSimuladoresSection;

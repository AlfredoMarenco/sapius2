import React from 'react';
import { BookMockup3D } from '@/components/public/BookMockup3D';
import { PlusGridPattern } from '@/components/public/PlusGridPattern';

export interface ProductBookHeroProps {
    eyebrow?: string;
    titleLine1: string;
    titleLine2: string;
    subtitle?: string;
    actions: React.ReactNode;
    bookSubtitle?: string;
    bookEdition?: string;
    customVisual?: React.ReactNode;
    flushBottom?: boolean;
}

/**
 * Hero compartido con degradado cálido y mockup 3D de Guías y simuladores 2027
 * para las páginas Productos (Canva Page 8) y Grupos y paquetes (Canva Page 9).
 */
export function ProductBookHero({
    eyebrow = 'Curso en línea',
    titleLine1,
    titleLine2,
    subtitle = 'Conoce nuestros programas, cursos y simuladores',
    actions,
    bookSubtitle = 'MATERIAL VIRTUAL\nY FÍSICO',
    bookEdition = '2027',
    customVisual,
    flushBottom = false,
}: ProductBookHeroProps) {
    return (
        <section
            className={`relative overflow-hidden bg-white ${
                flushBottom
                    ? 'pt-20 pb-0 sm:pt-24 lg:pt-24 lg:pb-0'
                    : 'pt-24 pb-12 sm:pt-28 lg:pt-30 lg:pb-16'
            }`}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,_#FBE3D8_0%,_#FFE9DF_26%,_transparent_56%),radial-gradient(circle_at_84%_58%,_#F7EFEA_0%,_transparent_56%)]"
            />

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
                <div
                    className={`grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8 ${
                        flushBottom ? 'items-end' : 'items-center'
                    }`}
                >
                    <div
                        className={`lg:col-span-5 ${
                            flushBottom
                                ? 'pt-4 pb-8 lg:self-center lg:py-14 lg:pl-8 xl:pl-12'
                                : ''
                        }`}
                    >
                        <p className="text-lg font-normal text-[#101E33] sm:text-[22px]">
                            {eyebrow}
                        </p>

                        <h1 className="mt-1 font-display text-5xl leading-[1.0] font-extrabold tracking-tight text-[#101E33] sm:text-6xl lg:text-[4.45rem]">
                            {titleLine1}
                            <br />
                            {titleLine2}
                        </h1>

                        <p className="mt-4 max-w-[340px] text-base leading-[1.35] font-normal text-[#101E33]/90 sm:text-[20px]">
                            {subtitle}
                        </p>

                        <div className="mt-8 flex w-full flex-col gap-3.5 sm:w-[290px]">
                            {actions}
                        </div>
                    </div>

                    <div
                        className={`lg:col-span-7 ${
                            flushBottom ? 'self-end' : ''
                        }`}
                    >
                        {customVisual ?? (
                            <BookMockup3D
                                area="guias_simuladores"
                                subtitle={bookSubtitle}
                                edition={bookEdition}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProductBookHero;

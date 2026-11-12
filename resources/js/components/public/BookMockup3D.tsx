import React from 'react';
import { SapiusIsotype } from './SapiusLogo';

export interface BookMockup3DProps {
    area: 'nutricion' | 'medicina' | 'general';
    subtitle?: string;
    edition?: string;
    className?: string;
}

const AREA_COPY: Record<
    BookMockup3DProps['area'],
    { line1: string; line2: string; spineLabel: string }
> = {
    nutricion: {
        line1: 'EGEL',
        line2: 'Nutrición',
        spineLabel: 'Curso virtual EGEL Nutrición - sapius',
    },
    medicina: {
        line1: 'EGEL',
        line2: 'Medicina',
        spineLabel: 'Curso virtual EGEL Medicina - sapius',
    },
    general: {
        line1: 'EGEL Plus',
        line2: 'Sapius',
        spineLabel: 'Curso virtual EGEL Plus - sapius',
    },
};

/**
 * BookMockup3D
 * Combina `/img/brand2026/book-3d-egel.png` con la sobreimpresión nítida en la portada inclinada
 * y en los 3 lomos verticales exactamente como en Canva Page 2 (EGEL Nutrición / EGEL Medicina).
 */
export function BookMockup3D({
    area,
    subtitle = 'MODALIDAD VIRTUAL',
    edition = 'CURSO 2027',
    className = '',
}: BookMockup3DProps) {
    const copy = AREA_COPY[area];

    return (
        <div
            className={`relative mx-auto w-full max-w-[520px] select-none ${className}`.trim()}
        >
            {/* Sombra suave de apoyo */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-6 bottom-2 left-10 h-8 rounded-full bg-[#101E33]/20 blur-xl"
            />

            {/* Imagen base 3D de alta resolución */}
            <img
                src="/img/brand2026/book-3d-egel.png"
                alt={`${copy.line1} ${copy.line2} - ${edition}`}
                className="relative z-10 h-auto w-full object-contain drop-shadow-[0_24px_34px_rgba(16,30,51,0.22)]"
            />

            {/* Sobreimpresión en la portada inclinada (~30deg) */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-[18%] left-[19%] z-20 flex h-[61%] w-[36%] rotate-[30.5deg] flex-col justify-between p-3 text-white sm:p-4"
            >
                {/* Arriba derecha: MODALIDAD VIRTUAL */}
                <div className="text-right text-[7px] font-medium tracking-[0.22em] text-white/60 uppercase sm:text-[8.5px]">
                    {subtitle}
                </div>

                {/* Centro izquierda: EGEL Nutrición / Medicina + CURSO 2027 */}
                <div className="my-auto pl-1 sm:pl-2">
                    <div className="font-display text-sm leading-[1.06] font-extrabold tracking-tight text-white sm:text-lg md:text-xl">
                        <span className="block">{copy.line1}</span>
                        <span className="block">{copy.line2}</span>
                    </div>
                    <div className="mt-1.5 text-[7px] font-semibold tracking-[0.25em] text-white/70 uppercase sm:text-[8.5px]">
                        {edition}
                    </div>
                </div>

                {/* Abajo derecha: isotipo s. blanco + punto coral */}
                <div className="flex justify-end pr-1 pb-0.5">
                    <SapiusIsotype variant="light" size="sm" className="h-5 sm:h-6 md:h-7" />
                </div>
            </div>

            {/* Sobreimpresión en los 3 lomos verticales a la derecha */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-[26%] right-[15.3%] z-20 flex h-[64%] w-[15.6%] justify-between"
            >
                {[0, 1, 2].map((spineIdx) => (
                    <div
                        key={spineIdx}
                        className="flex h-full w-1/3 items-start justify-center pt-3"
                    >
                        <span
                            style={{ writingMode: 'vertical-rl' }}
                            className="text-[6.5px] font-medium tracking-wider whitespace-nowrap text-white/65 sm:text-[7.5px]"
                        >
                            {copy.spineLabel}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BookMockup3D;

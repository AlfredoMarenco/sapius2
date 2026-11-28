import { motion } from 'framer-motion';
import React from 'react';

export interface BookMockup3DProps {
    area: 'nutricion' | 'medicina' | 'general' | 'guias_simuladores';
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
        spineLabel: 'Curso virtual EGEL nutrición - sapius',
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
    guias_simuladores: {
        line1: 'Guías y',
        line2: 'simuladores',
        spineLabel: 'Guías y simuladores 2027 - Sapius',
    },
};

const SPINE_POSITIONS = ['83.8%', '90.3%', '96.7%'] as const;

/**
 * BookMockup3D
 * Combina `/img/brand2026/book-3d-egel.png` (recortado al borde exacto 911x826)
 * con unidades `@container` (`cqw`), sombras elípticas realistas de piso,
 * sobreimpresión inclinada 30° en portada y texto vertical en los 3 lomos derechos.
 */
export function BookMockup3D({
    area,
    subtitle = 'MODALIDAD VIRTUAL',
    edition = 'CURSO 2027',
    className = '',
}: BookMockup3DProps) {
    const copy = AREA_COPY[area];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ y: -6, rotate: -0.8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`@container relative mx-auto w-full max-w-[560px] select-none ${className}`.trim()}
        >
            {/* Sombra elíptica realista bajo la punta inferior del libro inclinado */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-2%] left-[25%] h-6 w-[36%] rounded-full bg-[#101E33]/35 blur-md"
            />

            {/* Sombra elíptica realista bajo los 3 tomos verticales */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-2%] bottom-[0%] h-6 w-[26%] rounded-full bg-[#101E33]/35 blur-md"
            />

            {/* Imagen base 3D recortada al borde exacto de tinta (911x826) */}
            <img
                src="/img/brand2026/book-3d-egel.png"
                alt={`${copy.line1} ${copy.line2} - ${edition}`}
                className="relative z-10 block h-auto w-full object-contain"
            />

            {/* Sobreimpresión matemática en la portada inclinada (30deg) */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-[50.5%] left-[42.2%] z-20 flex h-[73%] w-[44.5%] -translate-x-1/2 -translate-y-1/2 rotate-[30deg] flex-col justify-between p-[3.2cqw]"
            >
                {/* Arriba derecha: MODALIDAD VIRTUAL */}
                <div className="text-right text-[1.85cqw] leading-tight font-medium tracking-[0.22em] whitespace-pre-line text-[#FF6B52] uppercase">
                    {subtitle}
                </div>

                {/* Centro izquierda: EGEL Nutrición / Medicina + CURSO 2027 */}
                <div className="my-auto">
                    <div className="font-display text-[4.6cqw] leading-[1.03] font-extrabold tracking-tight text-white">
                        <span className="block">{copy.line1}</span>
                        <span className="block">{copy.line2}</span>
                    </div>
                    <div className="mt-[0.8cqw] text-[1.9cqw] font-medium tracking-[0.24em] text-[#FF6B52] uppercase">
                        {edition}
                    </div>
                </div>

                {/* Abajo derecha: isotipo s. blanco + punto coral */}
                <div className="flex justify-end">
                    <img
                        src="/img/brand2026/isotype-s-light.png"
                        alt=""
                        className="h-[6.5cqw] w-auto object-contain"
                    />
                </div>
            </div>

            {/* Sobreimpresión vertical en los 3 lomos derechos */}
            {SPINE_POSITIONS.map((leftPos, spineIdx) => (
                <div
                    key={spineIdx}
                    aria-hidden="true"
                    style={{ left: leftPos, writingMode: 'vertical-rl' }}
                    className="pointer-events-none absolute top-[24%] bottom-[5%] z-20 flex -translate-x-1/2 items-center justify-start text-[1.65cqw] font-normal tracking-wide whitespace-nowrap text-white/90"
                >
                    {copy.spineLabel}
                </div>
            ))}
        </motion.div>
    );
}

export default BookMockup3D;

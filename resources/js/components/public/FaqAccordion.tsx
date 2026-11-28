import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface FaqAccordionProps {
    items: FaqItem[];
    defaultOpenId?: string;
    moreHref?: string;
    onMoreClick?: () => void;
    showMoreButton?: boolean;
    compactTypography?: boolean;
    className?: string;
}

/**
 * FaqAccordion
 * Acordeón accesible fiel a la sección "Preguntas frecuentes" de Canva Page 1 (`page1_s5_y4200.png`):
 * - Sin líneas divisorias horizontales (`space-y-3.5`)
 * - Ícono circular `h-6 w-6 rounded-full border-2 border-[#101E33]` con signo `+` centrado
 * - Pregunta en `text-base sm:text-[20px] font-normal text-[#101E33]`
 * - Respuesta desplegada en coral `#FF6B52` (`pt-2 pl-9.5 text-sm sm:text-[15.5px] leading-relaxed font-normal text-[#FF6B52]`).
 */
export function FaqAccordion({
    items,
    defaultOpenId,
    moreHref,
    onMoreClick,
    showMoreButton = false,
    compactTypography = false,
    className = '',
}: FaqAccordionProps) {
    const [openId, setOpenId] = useState<string | null>(
        defaultOpenId !== undefined
            ? defaultOpenId
            : (items[3]?.id ?? items[0]?.id ?? null),
    );

    const toggleItem = (id: string) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    return (
        <div className={`w-full ${className}`.trim()}>
            <div className="space-y-3.5">
                {items.map((item) => {
                    const isOpen = openId === item.id;
                    const panelId = `faq-panel-${item.id}`;
                    const triggerId = `faq-trigger-${item.id}`;

                    return (
                        <div key={item.id}>
                            <button
                                id={triggerId}
                                type="button"
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() => toggleItem(item.id)}
                                className="group flex w-full items-center gap-3.5 rounded-lg text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B52] focus-visible:ring-offset-2"
                            >
                                {/* Ícono circular con + */}
                                <span
                                    aria-hidden="true"
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#101E33] text-[#101E33] transition-all duration-200 group-hover:border-[#FF6B52] group-hover:text-[#FF6B52]"
                                >
                                    <svg
                                        viewBox="0 0 12 12"
                                        className={`h-3 w-3 stroke-current transition-transform duration-200 ${
                                            isOpen ? 'rotate-45 text-[#FF6B52]' : ''
                                        }`}
                                        fill="none"
                                        strokeWidth="2.1"
                                        strokeLinecap="round"
                                    >
                                        <line x1="6" y1="2" x2="6" y2="10" />
                                        <line x1="2" y1="6" x2="10" y2="6" />
                                    </svg>
                                </span>

                                <span
                                    className={`font-display leading-snug font-normal text-[#101E33] transition-colors group-hover:text-[#FF6B52] ${
                                        compactTypography
                                            ? 'text-xs sm:text-sm'
                                            : 'text-base sm:text-[20px]'
                                    }`}
                                >
                                    {item.question}
                                </span>
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        id={panelId}
                                        role="region"
                                        aria-labelledby={triggerId}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{
                                            duration: 0.24,
                                            ease: 'easeOut',
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <p className="pt-2 pl-9.5 text-sm leading-relaxed font-normal text-[#FF6B52] sm:text-[15.5px]">
                                            {item.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {showMoreButton && (
                <div className="mt-6">
                    {moreHref ? (
                        <Link
                            href={moreHref}
                            className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-8 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                        >
                            Ver más
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={onMoreClick}
                            className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-8 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                        >
                            Ver más
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default FaqAccordion;

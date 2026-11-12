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
    className?: string;
}

/**
 * FaqAccordion
 * Acordeón accesible fiel a la sección "Preguntas frecuentes" de Canva Page 1:
 * - Ícono circular con signo `?` / `+`
 * - Respuesta desplegable suave en coral/gris oscuro legible
 * - Botón opcional `Ver más` en cápsula coral.
 */
export function FaqAccordion({
    items,
    defaultOpenId,
    moreHref,
    onMoreClick,
    showMoreButton = false,
    className = '',
}: FaqAccordionProps) {
    const [openId, setOpenId] = useState<string | null>(
        defaultOpenId !== undefined ? defaultOpenId : (items[3]?.id ?? items[0]?.id ?? null),
    );

    const toggleItem = (id: string) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    return (
        <div className={`w-full ${className}`.trim()}>
            <div className="divide-y divide-[#101E33]/10">
                {items.map((item) => {
                    const isOpen = openId === item.id;
                    const panelId = `faq-panel-${item.id}`;
                    const triggerId = `faq-trigger-${item.id}`;

                    return (
                        <div key={item.id} className="py-3.5">
                            <button
                                id={triggerId}
                                type="button"
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() => toggleItem(item.id)}
                                className="group flex w-full items-center gap-3.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B52] focus-visible:ring-offset-2 rounded-lg"
                            >
                                {/* Ícono circular con + / ? */}
                                <span
                                    aria-hidden="true"
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold transition-all duration-200 ${
                                        isOpen
                                            ? 'border-[#FF6B52] bg-[#FF6B52] text-white'
                                            : 'border-[#101E33]/75 bg-transparent text-[#101E33] group-hover:border-[#FF6B52] group-hover:text-[#FF6B52]'
                                    }`}
                                >
                                    {isOpen ? '?' : '+'}
                                </span>

                                <span
                                    className={`font-display text-base font-medium transition-colors sm:text-lg ${
                                        isOpen
                                            ? 'font-semibold text-[#101E33]'
                                            : 'text-[#101E33]/85 group-hover:text-[#101E33]'
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
                                        transition={{ duration: 0.25, ease: 'easeOut' }}
                                        className="overflow-hidden"
                                    >
                                        <p className="pt-2.5 pl-9.5 text-sm leading-relaxed font-medium text-[#FF6B52] sm:text-[15px]">
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

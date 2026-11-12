import { Link } from '@inertiajs/react';
import React from 'react';

export interface ScheduledCourseCandidate {
    id: number | string;
    identificador?: string | null;
    activo?: string | boolean | number | null;
    course?: {
        title?: string | null;
        slug?: string | null;
    } | null;
}

export interface PurchaseTargetResult {
    href: string;
    isExternal: boolean;
}

const WHATSAPP_PHONE = '521234567890';

/**
 * Resuelve dinámicamente el destino de compra / preventa / lista de espera
 * respetando la arquitectura híbrida de conversión de Sapius 2.
 */
export function resolvePurchaseTarget(
    scheduledCourses: ScheduledCourseCandidate[] | undefined,
    keywords: string[],
    mode: 'buy' | 'waitlist' | 'presale',
    packageLabel: string,
): PurchaseTargetResult {
    if (mode === 'waitlist') {
        const message = `Hola equipo Sapius, me interesa anotarme en la lista de espera de: ${packageLabel}. ¿Me podrían avisar en cuanto esté disponible?`;
        return {
            href: `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`,
            isExternal: true,
        };
    }

    if (mode === 'presale') {
        const message = `Hola equipo Sapius, me interesa adquirir en preventa: ${packageLabel}. ¿Me comparten información y pasos de inscripción?`;
        return {
            href: `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`,
            isExternal: true,
        };
    }

    const list = Array.isArray(scheduledCourses) ? scheduledCourses : [];
    const normalizedKeywords = keywords
        .map((k) =>
            k
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim(),
        )
        .filter(Boolean);

    if (list.length > 0 && normalizedKeywords.length > 0) {
        const match = list.find((item) => {
            const isActive =
                item.activo === undefined ||
                item.activo === null ||
                item.activo === 'si' ||
                item.activo === true ||
                item.activo === 1;
            if (!isActive) return false;

            const haystack = `${item.identificador ?? ''} ${item.course?.title ?? ''} ${item.course?.slug ?? ''}`
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

            return normalizedKeywords.every((kw) => haystack.includes(kw));
        });

        if (match && match.id !== undefined && match.id !== null) {
            return {
                href: `/checkout/${match.id}`,
                isExternal: false,
            };
        }
    }

    return {
        href: '/register',
        isExternal: false,
    };
}

export interface PricingCardProps {
    title: string;
    price: string;
    oldPrice?: string;
    paymentNote: string;
    description?: string;
    features?: string[];
    footnote?: string;
    ctaLabel: 'Comprar' | 'Lista de espera' | 'Preventa';
    ribbon?: string;
    href: string;
    isExternal?: boolean;
    highlighted?: boolean;
    ctaPlacement?: 'bottom' | 'top';
    className?: string;
}

/**
 * PricingCard
 * Tarjeta oficial de precios Sapius 2026/2027 (Canva Page 2):
 * - Borde fino coral `border-[#FF6B52]/45`, esquinas `rounded-2xl`, sombra sutil
 * - Cinta diagonal en `#FF6B52` (`MÁS POPULAR`, `PROMOCIÓN`, `MUY PRONTO`, `PROMOCIÓN 2027`)
 * - Botón pill coral para `Comprar` y navy `#101E33` para `Lista de espera` / `Preventa`.
 */
export function PricingCard({
    title,
    price,
    oldPrice,
    paymentNote,
    description,
    features,
    footnote,
    ctaLabel,
    ribbon,
    href,
    isExternal = false,
    highlighted = false,
    ctaPlacement = 'bottom',
    className = '',
}: PricingCardProps) {
    const isNavyCta = ctaLabel === 'Lista de espera' || ctaLabel === 'Preventa';
    const buttonClasses = `inline-flex min-w-[152px] items-center justify-center rounded-full px-6 py-2.5 text-xs font-bold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${
        isNavyCta
            ? 'bg-[#101E33] hover:bg-[#192B47]'
            : 'bg-[#FF6B52] hover:bg-[#F0563C]'
    }`;

    const renderCta = () =>
        isExternal ? (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses}
            >
                {ctaLabel}
            </a>
        ) : (
            <Link href={href} className={buttonClasses}>
                {ctaLabel}
            </Link>
        );

    return (
        <div
            className={`relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border bg-white/95 p-6 shadow-[0_12px_32px_-16px_rgba(16,30,51,0.14)] transition-all duration-200 hover:shadow-[0_18px_38px_-14px_rgba(16,30,51,0.2)] ${
                highlighted
                    ? 'border-[#FF6B52]/75 ring-1 ring-[#FF6B52]/20'
                    : 'border-[#FF6B52]/45'
            } ${className}`.trim()}
        >
            {/* Cinta diagonal esquina superior derecha */}
            {ribbon && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-4 -right-10 w-36 rotate-45 bg-[#FF6B52] py-1 text-center text-[9.5px] font-extrabold tracking-wider text-white uppercase shadow-sm"
                >
                    {ribbon}
                </div>
            )}

            <div>
                {/* Título centrado */}
                <h3 className="mx-auto max-w-[200px] text-center font-display text-lg leading-snug font-extrabold text-[#101E33]">
                    {title}
                </h3>

                {/* Opción de botón superior si se requiere explícitamente */}
                {ctaPlacement === 'top' && (
                    <div className="mt-4 flex justify-center">{renderCta()}</div>
                )}

                {/* Bloque de Precio + Nota de pago */}
                <div className="mt-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-display text-2xl font-extrabold tracking-tight text-[#101E33] sm:text-[1.65rem]">
                            {price}
                        </span>
                        <span className="text-[11px] leading-tight font-medium text-[#FF6B52]">
                            {paymentNote}
                        </span>
                    </div>

                    {oldPrice && (
                        <div className="mt-0.5 text-xs font-bold text-[#FF6B52]/75 line-through">
                            {oldPrice}
                        </div>
                    )}
                </div>

                {/* Descripción corta */}
                {description && (
                    <p className="mt-4 text-xs leading-relaxed text-[#101E33]/80">
                        {description}
                    </p>
                )}

                {/* Lista de características */}
                {features && features.length > 0 && (
                    <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-[#101E33]/85">
                        {features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span
                                    aria-hidden="true"
                                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#101E33]"
                                />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Nota al pie secundaria */}
                {footnote && (
                    <p className="mt-4 text-[11px] leading-relaxed text-[#101E33]/65">
                        {footnote}
                    </p>
                )}
            </div>

            {/* Botón pill centrado inferior (estándar Canva Page 2) */}
            {ctaPlacement === 'bottom' && (
                <div className="mt-6 flex justify-center pt-2">{renderCta()}</div>
            )}
        </div>
    );
}

export default PricingCard;

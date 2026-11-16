import { Link } from '@inertiajs/react';
import React from 'react';

export interface ScheduledCourseCandidate {
    id: number | string;
    identificador?: string | null;
    activo?: string | boolean | number | null;
    precio?: number | string | null;
    price?: number | string | null;
    course_title?: string | null;
    course_description?: string | null;
    course_slug?: string | null;
    category_name?: string | null;
    course?: {
        title?: string | null;
        slug?: string | null;
        description?: string | null;
    } | null;
}

export interface PurchaseTargetResult {
    href: string;
    isExternal: boolean;
}

export const WHATSAPP_PHONE = '529992988744';

const BLOCKED_TAGS = new Set([
    'script',
    'style',
    'iframe',
    'object',
    'embed',
    'form',
    'input',
    'textarea',
    'select',
    'button',
    'svg',
    'img',
]);

function isSafeHref(rawHref: string | null): boolean {
    if (!rawHref) {
return false;
}

    const trimmed = rawHref.trim().toLowerCase();

    return (
        trimmed.startsWith('https://') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('mailto:') ||
        trimmed.startsWith('tel:') ||
        (trimmed.startsWith('/') && !trimmed.startsWith('//'))
    );
}

function domNodeToReact(node: ChildNode, key: string): React.ReactNode {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (BLOCKED_TAGS.has(tag)) {
        return null;
    }

    if (tag === 'br') {
        return <br key={key} />;
    }

    const children = Array.from(el.childNodes).map((child, idx) =>
        domNodeToReact(child, `${key}-${idx}`),
    );

    switch (tag) {
        case 'p':
            return (
                <p key={key} className="mb-1.5 last:mb-0">
                    {children}
                </p>
            );
        case 'ul':
            return (
                <ul
                    key={key}
                    className="my-1.5 list-disc space-y-1 pl-4 marker:text-[#FF6B52]"
                >
                    {children}
                </ul>
            );
        case 'ol':
            return (
                <ol
                    key={key}
                    className="my-1.5 list-decimal space-y-1 pl-4 marker:font-bold marker:text-[#FF6B52]"
                >
                    {children}
                </ol>
            );
        case 'li':
            return <li key={key}>{children}</li>;
        case 'strong':
        case 'b':
            return (
                <strong key={key} className="font-bold text-[#101E33]">
                    {children}
                </strong>
            );
        case 'em':
        case 'i':
            return <em key={key}>{children}</em>;
        case 'u':
            return <u key={key}>{children}</u>;
        case 'a': {
            const href = el.getAttribute('href');

            if (!isSafeHref(href)) {
                return <span key={key}>{children}</span>;
            }

            const external =
                href!.trim().startsWith('http://') ||
                href!.trim().startsWith('https://');

            return (
                <a
                    key={key}
                    href={href!.trim()}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="font-semibold text-[#FF6B52] underline underline-offset-2 hover:text-[#F0563C]"
                >
                    {children}
                </a>
            );
        }
        default:
            return <React.Fragment key={key}>{children}</React.Fragment>;
    }
}

export function stripHtmlToText(html?: string | null): string {
    if (!html) {
return '';
}

    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
        const doc = new DOMParser().parseFromString(html, 'text/html');

        return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
    }

    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function SafeHtmlContent({
    html,
    className = '',
}: {
    html: string;
    className?: string;
}) {
    if (!html.trim()) {
return null;
}

    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
        return <p className={className}>{stripHtmlToText(html)}</p>;
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const nodes = Array.from(doc.body.childNodes).map((child, idx) =>
        domNodeToReact(child, `node-${idx}`),
    );

    return <div className={className}>{nodes}</div>;
}

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

            if (!isActive) {
return false;
}

            const haystack = `${item.identificador ?? ''} ${item.course_title ?? ''} ${item.course?.title ?? ''} ${item.course_slug ?? ''} ${item.course?.slug ?? ''}`
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
    borderVariant?: 'coral' | 'navy';
    highlighted?: boolean;
    className?: string;
}

/**
 * PricingCard
 * Tarjeta oficial de precios Sapius 2026/2027 (Canva Page 2):
 * - Cinta 3D plegada real (`/img/brand2026/ribbon-corner-red.png`) sobresaliendo 5px sin recortarse
 * - Variante de borde `coral` (estándar) o `navy` (cursos completos de 10 semanas)
 * - Precios en `MXN`, botón SIEMPRE abajo del todo (`Comprar` coral con texto `#101E33` extrabold;
 *   `Lista de espera` y `Preventa` en navy `#101E33` con texto blanco).
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
    borderVariant = 'coral',
    className = '',
}: PricingCardProps) {
    const isNavyCta = ctaLabel === 'Lista de espera' || ctaLabel === 'Preventa';

    const buttonClasses = isNavyCta
        ? 'inline-flex min-w-[172px] items-center justify-center rounded-full bg-[#101E33] px-7 py-2.5 text-sm font-bold text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]'
        : 'inline-flex min-w-[172px] items-center justify-center rounded-full bg-[#FF6B52] px-7 py-2.5 text-sm font-extrabold text-[#101E33] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] hover:text-white';

    const borderClass =
        borderVariant === 'navy'
            ? 'border-[#101E33]/80'
            : 'border-[#FF6B52]/75';

    const isLongRibbon = Boolean(ribbon && ribbon.length > 11);

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
        <div className={`relative h-full ${className}`.trim()}>
            {/* Cinta 3D plegada real sobresaliendo 5px por fuera del borde */}
            {ribbon && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-[5px] -right-[5px] z-20 h-26 w-26 select-none"
                >
                    <img
                        src="/img/brand2026/ribbon-corner-red.png"
                        alt=""
                        className="h-full w-full -scale-x-100 object-contain drop-shadow-xs"
                    />
                    <span
                        className={`absolute top-[38.5%] left-[61.5%] -translate-x-1/2 -translate-y-1/2 rotate-45 text-center font-extrabold whitespace-nowrap text-white uppercase ${
                            isLongRibbon
                                ? 'text-[8px] tracking-wide'
                                : 'text-[9.5px] tracking-wider'
                        }`}
                    >
                        {ribbon}
                    </span>
                </div>
            )}

            {/* Tarjeta interior */}
            <div
                className={`flex h-full flex-col justify-between rounded-[26px] border bg-white p-6 shadow-[0_14px_34px_-14px_rgba(16,30,51,0.15)] transition-all duration-200 hover:shadow-[0_20px_40px_-14px_rgba(16,30,51,0.2)] sm:p-7 ${borderClass}`}
            >
                <div>
                    {/* 1. Título centrado en 2 líneas (con margen seguro cuando lleva cinta en esquina) */}
                    <h3
                        className={`mx-auto text-center font-display text-[19px] leading-[1.14] font-extrabold text-[#101E33] sm:text-[21px] ${
                            ribbon ? 'max-w-[162px]' : 'max-w-[210px]'
                        }`}
                    >
                        {title}
                    </h3>

                    {/* 2. Fila de Precio + Nota de pago + Precio tachado */}
                    <div className="mt-5">
                        <div className="flex items-baseline justify-between gap-2">
                            <span className="font-display text-2xl font-normal tracking-tight whitespace-nowrap text-[#101E33] sm:text-[1.65rem]">
                                {price}
                            </span>
                            <span
                                className={`text-right text-[11.5px] leading-tight font-normal text-[#FF6B52] ${
                                    paymentNote.length > 13
                                        ? 'max-w-[82px]'
                                        : 'whitespace-nowrap'
                                }`}
                            >
                                {paymentNote}
                            </span>
                        </div>

                        {oldPrice && (
                            <div className="mt-0.5 text-xs font-medium text-[#FF6B52] line-through">
                                {oldPrice}
                            </div>
                        )}
                    </div>

                    {/* 3. Descripción corta */}
                    {description && (
                        <p className="mt-4 text-[12.5px] leading-[1.45] text-[#101E33]/90">
                            {description}
                        </p>
                    )}

                    {/* Lista de características (bullets) */}
                    {features && features.length > 0 && (
                        <ul className="mt-4 space-y-1 text-[12.5px] leading-[1.45] text-[#101E33]/90">
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

                    {/* Footnote */}
                    {footnote && (
                        <p className="mt-4 text-[12px] leading-[1.4] text-[#101E33]/85">
                            {footnote}
                        </p>
                    )}
                </div>

                {/* 4. Botón inferior centrado (siempre abajo) */}
                <div className="mt-6 flex justify-center pt-1">
                    {renderCta()}
                </div>
            </div>
        </div>
    );
}

export default PricingCard;

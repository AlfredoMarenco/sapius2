import React from 'react';

export interface SapiusWordmarkProps {
    variant?: 'dark' | 'light';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export interface SapiusIsotypeProps {
    variant?: 'dark' | 'light' | 'watermark';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
    className?: string;
}

const WORDMARK_SIZES: Record<NonNullable<SapiusWordmarkProps['size']>, string> = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-11',
    xl: 'h-16 sm:h-20 lg:h-24',
};

const ISOTYPE_SIZES: Record<NonNullable<SapiusIsotypeProps['size']>, string> = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-14',
    xl: 'h-24',
    hero: 'h-48 sm:h-64 lg:h-72',
};

/**
 * SapiusWordmark (`sapius.`)
 * Activos oficiales recortados sin márgenes vacíos desde el diseño original de Canva (DAHX9N88U7c):
 * - `/img/brand2026/logo-sapius-dark.png` (640x163)
 * - `/img/brand2026/logo-sapius-light.png` (640x163)
 */
export function SapiusWordmark({
    variant = 'dark',
    size = 'md',
    className = '',
}: SapiusWordmarkProps) {
    const src =
        variant === 'light'
            ? '/img/brand2026/logo-sapius-light.png'
            : '/img/brand2026/logo-sapius-dark.png';

    const sizeClass = /\bh-/.test(className) ? '' : WORDMARK_SIZES[size];

    return (
        <img
            src={src}
            alt="sapius."
            width={640}
            height={163}
            draggable={false}
            className={`w-auto object-contain select-none ${sizeClass} ${className}`.trim()}
        />
    );
}

/**
 * SapiusIsotype (`s.`)
 * Isotipo oficial recortado desde el diseño original de Canva (DAHX9N88U7c):
 * - `/img/brand2026/isotype-s-watermark.png` (700x566, `s.` oscuro + punto coral)
 * - `/img/brand2026/isotype-s-light.png` (368x298, `s.` blanco + punto coral)
 */
export function SapiusIsotype({
    variant = 'dark',
    size = 'md',
    className = '',
}: SapiusIsotypeProps) {
    const isLight = variant === 'light';
    const src = isLight
        ? '/img/brand2026/isotype-s-light.png'
        : '/img/brand2026/isotype-s-watermark.png';

    const sizeClass = /\bh-/.test(className) ? '' : ISOTYPE_SIZES[size];

    return (
        <img
            src={src}
            alt="s."
            width={isLight ? 368 : 700}
            height={isLight ? 298 : 566}
            draggable={false}
            className={`w-auto object-contain select-none ${sizeClass} ${className}`.trim()}
        />
    );
}

export default SapiusWordmark;

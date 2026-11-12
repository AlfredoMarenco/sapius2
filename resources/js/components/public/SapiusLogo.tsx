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
 * Vectorial limpio fiel a la identidad 2026/2027 de Sapius (Canva DAHX9N88U7c):
 * - Letras geométricas extrabold en `#101E33` (dark) o `#FFFFFF` (light)
 * - Punto superior de la `i` y punto final `.` siempre círculos perfectos en `#FF6B52` Coral.
 */
export function SapiusWordmark({
    variant = 'dark',
    size = 'md',
    className = '',
}: SapiusWordmarkProps) {
    const baseFill = variant === 'light' ? '#FFFFFF' : '#101E33';
    const coralFill = '#FF6B52';

    return (
        <svg
            viewBox="0 0 364 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="sapius."
            className={`w-auto select-none ${WORDMARK_SIZES[size]} ${className}`.trim()}
        >
            {/* Letra s inicial */}
            <path
                d="M27.8 73.5C13.8 73.5 4.2 66.8 3.2 55.6L19.1 53.2C19.9 58.6 23.4 61.2 28.5 61.2C33.1 61.2 35.8 59.3 35.8 56.5C35.8 53.6 33.4 52.3 25.4 50.7C12.7 48.2 5.4 43.4 5.4 33.5C5.4 22.9 14.4 16.5 27.6 16.5C40.5 16.5 49.3 22.6 50.6 32.8L35.3 35.3C34.4 30.6 31.6 28.3 27.2 28.3C23.1 28.3 20.6 30.1 20.6 32.7C20.6 35.4 22.9 36.6 30.9 38.2C43.8 40.7 51.4 45.4 51.4 55.7C51.4 66.8 42.1 73.5 27.8 73.5Z"
                fill={baseFill}
            />

            {/* Letra a geométrica */}
            <path
                d="M78.8 73.5C67.4 73.5 59.6 67.3 59.6 57.2C59.6 47.2 67.3 41.6 81.8 40.5L94.2 39.5V37.6C94.2 32.2 90.8 29.1 85.1 29.1C79.8 29.1 76.5 31.6 75.6 35.9L60.8 33.9C62.5 23.2 71.5 16.5 85.6 16.5C100.8 16.5 110.4 24.1 110.4 38.2V72H95.1V64.9C91.7 70.4 85.9 73.5 78.8 73.5ZM83.5 61.6C89.9 61.6 94.2 57.5 94.2 51.6V49.3L83.9 50.2C78.1 50.7 75.3 52.9 75.3 56.4C75.3 59.8 78.4 61.6 83.5 61.6Z"
                fill={baseFill}
            />

            {/* Letra p con descendente limpio */}
            <path
                d="M122.4 92V18H137.8V25.6C141.4 20.0 147.6 16.5 155.3 16.5C169.4 16.5 179.4 27.6 179.4 45.0C179.4 62.4 169.4 73.5 155.3 73.5C148.0 73.5 142.1 70.4 138.6 65.4V92H122.4ZM150.7 59.8C158.4 59.8 163.1 54.0 163.1 45.0C163.1 36.0 158.4 30.2 150.7 30.2C143.0 30.2 138.2 36.0 138.2 45.0C138.2 54.0 143.0 59.8 150.7 59.8Z"
                fill={baseFill}
            />

            {/* Tallo de la i sin punto */}
            <rect x="190.2" y="24" width="16.8" height="48" rx="1.5" fill={baseFill} />

            {/* Punto Coral de la i */}
            <circle cx="198.6" cy="11.5" r="9.5" fill={coralFill} />

            {/* Letra u */}
            <path
                d="M238.5 73.5C225.7 73.5 218.4 65.2 218.4 51.1V18H234.8V48.3C234.8 55.8 238.4 59.8 244.6 59.8C250.9 59.8 255.0 55.5 255.0 48.0V18H271.4V72H255.7V64.1C252.1 70.1 246.1 73.5 238.5 73.5Z"
                fill={baseFill}
            />

            {/* Letra s final con sutil recorte curvo junto al punto coral */}
            <path
                d="M305.8 73.5C291.8 73.5 282.2 66.8 281.2 55.6L297.1 53.2C297.9 58.6 301.4 61.2 306.5 61.2C311.1 61.2 313.8 59.3 313.8 56.5C313.8 53.6 311.4 52.3 303.4 50.7C290.7 48.2 283.4 43.4 283.4 33.5C283.4 22.9 292.4 16.5 305.6 16.5C318.5 16.5 327.3 22.6 328.6 32.8L313.3 35.3C312.4 30.6 309.6 28.3 305.2 28.3C301.1 28.3 298.6 30.1 298.6 32.7C298.6 35.4 300.9 36.6 308.9 38.2C321.1 40.6 328.6 45.0 329.3 54.4C325.4 57.1 323.1 61.6 323.1 66.8C323.1 68.1 323.3 69.3 323.6 70.4C318.8 72.5 312.8 73.5 305.8 73.5Z"
                fill={baseFill}
            />

            {/* Punto final Coral */}
            <circle cx="342.5" cy="63.5" r="10.5" fill={coralFill} />
        </svg>
    );
}

/**
 * SapiusIsotype (`s.`)
 * Isotipo oficial de Sapius (letra `s` audaz con corte cóncavo inferior derecho + punto `.` en `#FF6B52` Coral).
 */
export function SapiusIsotype({
    variant = 'dark',
    size = 'md',
    className = '',
}: SapiusIsotypeProps) {
    const baseFill =
        variant === 'light'
            ? '#FFFFFF'
            : variant === 'watermark'
              ? '#101E33'
              : '#101E33';

    return (
        <svg
            viewBox="0 0 116 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="s."
            className={`w-auto select-none ${ISOTYPE_SIZES[size]} ${className}`.trim()}
        >
            {/* Letra s audaz con muesca curva que abraza el círculo coral */}
            <path
                d="M42.2 84.5C20.5 84.5 6.1 74.4 4.5 57.4L28.6 53.7C29.8 61.9 35.2 65.9 43.1 65.9C50.1 65.9 54.2 63.0 54.2 58.7C54.2 54.3 50.6 52.3 38.4 49.9C19.1 46.1 8.0 38.8 8.0 23.7C8.0 7.6 21.7 -2.0 41.8 -2.0C61.4 -2.0 74.8 7.2 76.8 22.7L53.5 26.5C52.1 19.4 47.9 15.9 41.2 15.9C35.0 15.9 31.2 18.6 31.2 22.6C31.2 26.7 34.7 28.5 46.8 30.9C65.4 34.6 76.8 41.2 77.9 55.6C71.2 59.8 67.1 66.9 67.1 74.8C67.1 76.9 67.4 78.9 68.0 80.7C60.7 83.3 51.9 84.5 42.2 84.5Z"
                transform="translate(0, 8)"
                fill={baseFill}
                fillOpacity={variant === 'watermark' ? 0.92 : 1}
            />
            <circle cx="93.5" cy="74.5" r="15.5" fill="#FF6B52" />
        </svg>
    );
}

export default SapiusWordmark;

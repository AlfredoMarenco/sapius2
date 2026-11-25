import type { SVGAttributes } from 'react';

/**
 * AppLogoIcon: Isotipo oficial Sapius 2026 ("s.")
 * Reemplaza el cubo original de Laravel por la identidad oficial de Sapius.
 */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {/* Letra s en minúscula corporativa */}
            <path
                d="M52 28C41.5 28 34 33.5 34 41.5C34 56.5 62 52.5 62 64C62 68.5 57.5 71.5 50 71.5C41 71.5 33 66.5 30 60L21 66C26 76 37 80 50 80C64.5 80 73 73 73 63C73 47 45 51.5 45 40C45 36.5 49 34.5 53.5 34.5C60.5 34.5 66.5 38 69.5 44L78 39C73 31.5 64 28 52 28Z"
                fill="currentColor"
            />
            {/* Punto coral oficial (#FF6B52) */}
            <circle cx="82" cy="73" r="7" fill="#FF6B52" />
        </svg>
    );
}

import React from 'react';

export interface PlusGridPatternProps {
    rows?: number;
    cols?: number;
    color?: 'navy' | 'coral' | 'white';
    gap?: number;
    size?: number;
    className?: string;
}

const COLOR_MAP: Record<NonNullable<PlusGridPatternProps['color']>, string> = {
    navy: '#101E33',
    coral: '#FF6B52',
    white: '#FFFFFF',
};

/**
 * PlusGridPattern
 * Grilla geométrica decorativa de signos `+` fiel al sistema visual Sapius 2026/2027.
 */
export function PlusGridPattern({
    rows = 5,
    cols = 5,
    color = 'navy',
    gap = 26,
    size = 8,
    className = '',
}: PlusGridPatternProps) {
    const stroke = COLOR_MAP[color];
    const width = (cols - 1) * gap + size + 4;
    const height = (rows - 1) * gap + size + 4;
    const half = size / 2;

    const items: Array<{ cx: number; cy: number; key: string }> = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            items.push({
                cx: 2 + half + c * gap,
                cy: 2 + half + r * gap,
                key: `${r}-${c}`,
            });
        }
    }

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={`pointer-events-none select-none ${className}`.trim()}
        >
            {items.map(({ cx, cy, key }) => (
                <g key={key} stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
                    <line x1={cx - half} y1={cy} x2={cx + half} y2={cy} />
                    <line x1={cx} y1={cy - half} x2={cx} y2={cy + half} />
                </g>
            ))}
        </svg>
    );
}

export default PlusGridPattern;

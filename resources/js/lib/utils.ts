import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function stripHtml(html: string | null | undefined): string {
    if (!html) {
return '';
}

    const spaced = html
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/(?:p|div|li|h[1-6]|tr|td|th|blockquote)>/gi, ' ');

    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
        const doc = new DOMParser().parseFromString(spaced, 'text/html');

        return (doc.body.textContent ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    }

    return spaced
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#0?39;/gi, "'")
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function isEmptyRichHtml(html: string | null | undefined): boolean {
    if (!html) {
return true;
}

    if (/<(?:img|table|hr)\b|\[math\]|\$\$|\\\(/i.test(html)) {
        return false;
    }

    return stripHtml(html).length === 0;
}

export function normalizeOptionalRichHtml(html: string | null | undefined): string {
    return isEmptyRichHtml(html) ? '' : (html ?? '').trim();
}

/**
 * Convierte URLs estándar de YouTube, Shorts, YouTu.be o Vimeo a URLs embebibles aptas para iframe.
 */
export function getEmbedVideoUrl(url: string | null | undefined): string {
    if (!url) {
return '';
}

    const trimmed = url.trim();

    // YouTube: youtu.be/<id>
    const shortYt = trimmed.match(/^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/);

    if (shortYt) {
        return `https://www.youtube.com/embed/${shortYt[1]}`;
    }

    // YouTube: youtube.com/watch?v=<id>
    const standardYt = trimmed.match(/^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]+)/);

    if (standardYt) {
        return `https://www.youtube.com/embed/${standardYt[1]}`;
    }

    // YouTube Shorts: youtube.com/shorts/<id>
    const shortsYt = trimmed.match(/^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);

    if (shortsYt) {
        return `https://www.youtube.com/embed/${shortsYt[1]}`;
    }

    // Vimeo: vimeo.com/<id>
    const vimeoMatch = trimmed.match(/^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/);

    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return trimmed;
}

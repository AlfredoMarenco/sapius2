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
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Convierte URLs estándar de YouTube, Shorts, YouTu.be o Vimeo a URLs embebibles aptas para iframe.
 */
export function getEmbedVideoUrl(url: string | null | undefined): string {
    if (!url) return '';
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

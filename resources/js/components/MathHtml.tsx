import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathHtmlProps {
    html?: string | null;
    className?: string;
}

const UNSAFE_TAGS = new Set([
    'script',
    'iframe',
    'object',
    'embed',
    'applet',
    'link',
    'meta',
    'style',
    'form',
    'input',
    'button',
    'textarea',
    'select',
    'base',
]);

function decodeBasicEntities(input: string): string {
    return input
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/?p[^>]*>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .trim();
}

function isSafeUrl(url: string): boolean {
    const trimmed = url.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
    try {
        const parsed = new URL(trimmed, 'https://sapius.local');
        return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

function sanitizeHtml(rawHtml: string): string {
    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(rawHtml, 'text/html');

            const sanitizeNode = (node: Element) => {
                const children = Array.from(node.children);
                for (const child of children) {
                    const tagName = child.tagName.toLowerCase();
                    if (UNSAFE_TAGS.has(tagName)) {
                        child.remove();
                        continue;
                    }

                    const attrs = Array.from(child.attributes);
                    for (const attr of attrs) {
                        const attrName = attr.name.toLowerCase();
                        if (attrName.startsWith('on') || attrName === 'srcdoc') {
                            child.removeAttribute(attr.name);
                            continue;
                        }
                        if ((attrName === 'href' || attrName === 'src') && !isSafeUrl(attr.value)) {
                            child.removeAttribute(attr.name);
                        }
                    }

                    if (tagName === 'a') {
                        child.setAttribute('rel', 'noopener noreferrer');
                    }

                    sanitizeNode(child);
                }
            };

            sanitizeNode(doc.body);
            return doc.body.innerHTML;
        } catch {
            // Fallback to regex sanitization
        }
    }

    return rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<(object|embed|style|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
        .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
        .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
        .replace(/(href|src)\s*=\s*(['"])\s*(javascript|vbscript|data):[^'"]*\2/gi, '$1="#"');
}

function renderMathInHtml(rawHtml: string): string {
    if (!rawHtml) return '';

    const tokens: { placeholder: string; expr: string; displayMode: boolean }[] = [];
    let counter = 0;

    const pushToken = (expr: string, displayMode: boolean): string => {
        const placeholder = `%%KATEX_TOKEN_${counter++}%%`;
        tokens.push({
            placeholder,
            expr: decodeBasicEntities(expr),
            displayMode,
        });
        return placeholder;
    };

    // Extraer expresiones antes de sanitizar para preservar MathML generado por KaTeX
    let tokenized = rawHtml
        .replace(/\[math\]([\s\S]*?)\[\/math\]/gi, (_, expr) => pushToken(expr, false))
        .replace(/\$\$([\s\S]*?)\$\$/g, (_, expr) => pushToken(expr, true))
        .replace(/\\\[([\s\S]*?)\\\]/g, (_, expr) => pushToken(expr, true))
        .replace(/\\\(([\s\S]*?)\\\)/g, (_, expr) => pushToken(expr, false));

    let safeHtml = sanitizeHtml(tokenized);

    for (const token of tokens) {
        let rendered = '';
        try {
            rendered = katex.renderToString(token.expr, {
                displayMode: token.displayMode,
                throwOnError: false,
                strict: false,
            });
        } catch {
            rendered = `<code>${token.expr}</code>`;
        }
        safeHtml = safeHtml.replace(token.placeholder, rendered);
    }

    return safeHtml;
}

export default function MathHtml({ html, className = '' }: MathHtmlProps) {
    const renderedHtml = useMemo(() => renderMathInHtml(html || ''), [html]);

    if (!html) return null;

    return <div className={className} dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
}

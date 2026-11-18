<?php

namespace App\Traits;

trait SanitizesRichHtml
{
    /**
     * Sanitize rich HTML input by removing unsafe tags, inline event handlers,
     * and dangerous URI schemes while preserving safe inline base64 images.
     */
    protected function sanitizeRichHtml(?string $html, bool $nullIfEmpty = false): ?string
    {
        if ($html === null) {
            return null;
        }

        $clean = $html;

        // Remove unsafe paired container elements and their inner contents
        $clean = (string) preg_replace(
            '/<\s*(script|iframe|object|embed|applet|form|style)\b[^>]*>.*?<\s*\/\s*\1\s*>/is',
            '',
            $clean
        );

        // Remove any remaining unsafe standalone or unclosed tags
        $clean = (string) preg_replace(
            '/<\s*\/?\s*(script|iframe|object|embed|applet|form|meta|link|base|style)\b[^>]*>/is',
            '',
            $clean
        );

        // Remove inline event handlers (onClick, onError, etc.) and iframe srcdoc
        $clean = (string) preg_replace(
            '/\s+(?:on[a-z]+|srcdoc)\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)/is',
            '',
            $clean
        );

        // Strip javascript:, vbscript:, and data: URIs on href/xlink:href
        $clean = (string) preg_replace(
            '/(href|xlink:href)\s*=\s*(["\'])\s*(?:javascript|vbscript|data)\s*:[^"\']*\2/is',
            '$1="#"',
            $clean
        );
        $clean = (string) preg_replace(
            '/(href|xlink:href)\s*=\s*(?:javascript|vbscript|data)\s*:[^\s>]+/is',
            '$1="#"',
            $clean
        );

        // Strip javascript:, vbscript:, and non-raster-image data: URIs on src
        $clean = (string) preg_replace(
            '/src\s*=\s*(["\'])\s*(?:javascript|vbscript|data(?!:image\/(?:png|jpeg|jpg|gif|webp);base64,))\s*:[^"\']*\1/is',
            'src="#"',
            $clean
        );
        $clean = (string) preg_replace(
            '/src\s*=\s*(?:javascript|vbscript|data(?!:image\/(?:png|jpeg|jpg|gif|webp);base64,))\s*:[^\s>]+/is',
            'src="#"',
            $clean
        );

        $clean = trim($clean);

        if ($nullIfEmpty) {
            $hasMeaningfulMediaOrMath = (bool) preg_match('/<(?:img|table|hr)\b|\[math\]|\$\$|\\\\\(/i', $clean);
            if (! $hasMeaningfulMediaOrMath) {
                $plain = html_entity_decode(strip_tags($clean), ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $plain = str_replace(["\u{00A0}", "\r", "\n"], ' ', $plain);
                if (trim($plain) === '') {
                    return null;
                }
            }
        }

        return $clean;
    }
}

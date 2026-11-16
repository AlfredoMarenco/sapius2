<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictMobileAccess
{
    /**
     * Block mobile/tablet devices (preserving Windows/Linux desktop & Electron).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $rawUserAgent = (string) $request->header('User-Agent', '');
        $userAgent = strtolower($rawUserAgent);

        // Permitir siempre la aplicación de escritorio Electron
        if (str_contains($userAgent, 'electron') || $request->headers->has('X-Sapius-MAC')) {
            return $next($request);
        }

        $isDesktopOs = str_contains($userAgent, 'windows nt')
            || (str_contains($userAgent, 'linux') && ! str_contains($userAgent, 'android'));

        // Bloquear si el frontend detectó dispositivo táctil móvil/tablet (incl. modo escritorio iPadOS)
        if ($request->hasCookie('is_touch_device') && ! $isDesktopOs) {
            return redirect()->route('no-access');
        }

        $mobileKeywords = ['ipad', 'android', 'iphone', 'ipod', 'mobile', 'blackberry', 'webos', 'windows phone', 'opera mini'];
        foreach ($mobileKeywords as $keyword) {
            if (str_contains($userAgent, $keyword)) {
                return redirect()->route('no-access');
            }
        }

        return $next($request);
    }
}

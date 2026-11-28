<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|plus-jakarta-sans:400,500,600,700,800|dm-sans:400,500,700" rel="stylesheet" />

        @php
            $gaId = config('elearning.google_analytics_id');
        @endphp
        @if (! app()->environment('testing') && filled($gaId))
            <!-- Google tag (gtag.js) -->
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ $gaId }}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag() { dataLayer.push(arguments); }
                gtag('js', new Date());
                gtag('config', '{{ $gaId }}');
                document.addEventListener('inertia:navigate', function(event) {
                    if (typeof gtag === 'function') {
                        gtag('config', '{{ $gaId }}', {
                            page_path: window.location.pathname + window.location.search,
                            page_location: window.location.href
                        });
                    }
                });
            </script>
        @endif

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
        @if (\App\Http\Controllers\Admin\QaFeedbackBotController::isEnabled())
            @php
                $qaContext = \App\Http\Controllers\Admin\QaFeedbackBotController::resolveReviewerFromRequest(request());
            @endphp
            @if ($qaContext !== null)
                <script>
                    window.__SAPIUS_QA_ADMIN__ = true;
                    window.__SAPIUS_QA_CONTEXT__ = @json($qaContext);
                </script>
            @endif
            <script src="/js/qa-bot.js?v={{ @filemtime(public_path('js/qa-bot.js')) ?: 1 }}" defer></script>
        @endif
    </body>
</html>

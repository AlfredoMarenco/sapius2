<?php

use App\Http\Middleware\ApiTokenAuth;
use App\Http\Middleware\AuthenticateWebOrElectron;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\CheckUserSession;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RestrictMobileAccess;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')
                ->group(base_path('routes/user.php'));
            Route::middleware('web')
                ->group(base_path('routes/admin.php'));
            Route::middleware('web')
                ->group(base_path('routes/instructor.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state', 'is_touch_device', 'qa_admin_active']);

        $middleware->throttleApi('60,1');

        $middleware->web(append: [
            CheckUserSession::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'api_token_auth' => ApiTokenAuth::class,
            'auth.media' => AuthenticateWebOrElectron::class,
            'role' => CheckRole::class,
            'restrict.mobile' => RestrictMobileAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            $isAdmin = false;

            try {
                $isAdmin = $request->user()?->role === 'admin';
            } catch (Throwable) {
                $isAdmin = false;
            }

            if (! $isAdmin) {
                $isAdmin = $request->cookie('qa_admin_active') === '1';
            }

            if (! $isAdmin || $request->expectsJson()) {
                return $response;
            }

            $content = $response->getContent();
            if (! is_string($content)) {
                return $response;
            }

            $bodyClosePos = strripos($content, '</body>');
            if ($bodyClosePos === false) {
                return $response;
            }

            $payload = [
                'status' => $response->getStatusCode(),
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => basename($e->getFile()).':'.$e->getLine(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'timestamp' => now()->toIso8601String(),
            ];

            $jsonFlags = JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
            $csrfToken = null;
            try {
                if ($request->hasSession()) {
                    $csrfToken = $request->session()->token();
                }
            } catch (Throwable) {
                $csrfToken = null;
            }

            $injection = "\n<script>window.__SAPIUS_QA_ADMIN__ = true; window.__SAPIUS_QA_EXCEPTION__ = ".json_encode($payload, $jsonFlags).';';
            if (is_string($csrfToken) && $csrfToken !== '') {
                $injection .= ' window.__SAPIUS_QA_CSRF__ = '.json_encode($csrfToken, $jsonFlags).';';
            }
            $injection .= '</script>';

            if (! str_contains($content, '/js/qa-bot.js')) {
                $version = @filemtime(public_path('js/qa-bot.js')) ?: 1;
                $injection .= "\n<script src=\"/js/qa-bot.js?v={$version}\" defer></script>";
            }

            $updatedContent = substr($content, 0, $bodyClosePos).$injection."\n".substr($content, $bodyClosePos);
            $response->setContent($updatedContent);
            $response->headers->remove('Content-Length');

            return $response;
        });
    })->create();

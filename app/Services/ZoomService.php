<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ZoomService
{
    public function isApiConfigured(): bool
    {
        return ! empty(config('services.zoom.account_id'))
            && ! empty(config('services.zoom.client_id'))
            && ! empty(config('services.zoom.client_secret'));
    }

    public function getSdkKey(): string
    {
        return (string) (config('services.zoom.sdk_key') ?: config('services.zoom.client_id') ?: '');
    }

    public function getSdkSecret(): string
    {
        return (string) (config('services.zoom.sdk_secret') ?: config('services.zoom.client_secret') ?: '');
    }

    public function isSdkConfigured(): bool
    {
        return $this->getSdkKey() !== '' && $this->getSdkSecret() !== '';
    }

    /**
     * Generate a HS256 JWT signature for Zoom Meeting SDK Web.
     */
    public function generateSdkSignature(string $meetingNumber, int $role = 0, int $expirationSeconds = 7200): string
    {
        $sdkKey = $this->getSdkKey();
        $sdkSecret = $this->getSdkSecret();

        if ($sdkKey === '' || $sdkSecret === '') {
            throw new RuntimeException('Zoom Meeting SDK credentials are not configured.');
        }

        $cleanMeetingNumber = preg_replace('/\D+/', '', $meetingNumber) ?? '';
        if ($cleanMeetingNumber === '') {
            throw new RuntimeException('Invalid Zoom meeting number.');
        }

        $iat = time() - 30;
        $exp = $iat + max(1800, min($expirationSeconds, 86400));

        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $payload = [
            'sdkKey' => $sdkKey,
            'appKey' => $sdkKey,
            'mn' => $cleanMeetingNumber,
            'role' => $role === 1 ? 1 : 0,
            'iat' => $iat,
            'exp' => $exp,
            'tokenExp' => $exp,
        ];

        $headerEncoded = $this->base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES));
        $payloadEncoded = $this->base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));
        $signature = hash_hmac('sha256', "{$headerEncoded}.{$payloadEncoded}", $sdkSecret, true);

        return "{$headerEncoded}.{$payloadEncoded}.".$this->base64UrlEncode($signature);
    }

    /**
     * Parse either a Zoom invite URL or a raw meeting number + optional passcode.
     *
     * @return array{meeting_number: string, passcode: ?string, join_url: ?string}
     */
    public function parseZoomInput(string $rawInput, ?string $rawPasscode = null): array
    {
        $trimmed = trim($rawInput);
        $extractedUrl = null;
        $extractedPwd = null;
        $meetingNumber = '';

        if (preg_match('/^https?:\/\//i', $trimmed)) {
            $extractedUrl = $trimmed;
            $parts = parse_url($trimmed);
            $path = $parts['path'] ?? '';

            if (preg_match('/\/(?:j|s|wc\/join)\/(\d{9,12})/i', $path, $matches)) {
                $meetingNumber = $matches[1];
            }

            if (! empty($parts['query'])) {
                parse_str($parts['query'], $query);
                if (! empty($query['pwd']) && is_string($query['pwd'])) {
                    $extractedPwd = trim($query['pwd']);
                }
                if ($meetingNumber === '' && ! empty($query['confno'])) {
                    $meetingNumber = preg_replace('/\D+/', '', (string) $query['confno']) ?? '';
                }
            }
        } else {
            $meetingNumber = preg_replace('/\D+/', '', $trimmed) ?? '';
        }

        $passcode = $rawPasscode !== null && trim($rawPasscode) !== ''
            ? trim($rawPasscode)
            : $extractedPwd;

        return [
            'meeting_number' => $meetingNumber,
            'passcode' => $passcode,
            'join_url' => $extractedUrl,
        ];
    }

    public function getAccessToken(): string
    {
        if (! $this->isApiConfigured()) {
            throw new RuntimeException('Zoom Server-to-Server OAuth credentials are not configured.');
        }

        return Cache::remember('zoom_s2s_access_token', 2900, function () {
            $accountId = (string) config('services.zoom.account_id');
            $clientId = (string) config('services.zoom.client_id');
            $clientSecret = (string) config('services.zoom.client_secret');

            $response = Http::asForm()
                ->withBasicAuth($clientId, $clientSecret)
                ->timeout(15)
                ->post('https://zoom.us/oauth/token', [
                    'grant_type' => 'account_credentials',
                    'account_id' => $accountId,
                ]);

            if (! $response->successful()) {
                throw new RuntimeException('No se pudo autenticar con Zoom API: '.$response->body());
            }

            $token = $response->json('access_token');
            if (! is_string($token) || $token === '') {
                throw new RuntimeException('Zoom API no devolvió un access_token válido.');
            }

            return $token;
        });
    }

    /**
     * Create a scheduled Zoom meeting via REST API.
     *
     * @return array{meeting_number: string, passcode: string, join_url: ?string, start_url: ?string}
     */
    public function createMeeting(array $payload): array
    {
        $token = $this->getAccessToken();
        $host = (string) (config('services.zoom.default_host_email') ?: 'me');

        $response = Http::withToken($token)
            ->timeout(15)
            ->post("https://api.zoom.us/v2/users/{$host}/meetings", [
                'topic' => $payload['title'],
                'type' => 2,
                'start_time' => Carbon::parse($payload['scheduled_at'])->toIso8601String(),
                'duration' => (int) ($payload['duration_minutes'] ?? 60),
                'timezone' => config('app.timezone', 'America/Mexico_City'),
                'agenda' => (string) ($payload['description'] ?? ''),
                'settings' => [
                    'host_video' => true,
                    'participant_video' => false,
                    'join_before_host' => false,
                    'mute_upon_entry' => true,
                    'waiting_room' => false,
                    'approval_type' => 2,
                ],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Error al crear la reunión en Zoom: '.$response->body());
        }

        $data = $response->json();

        return [
            'meeting_number' => (string) ($data['id'] ?? ''),
            'passcode' => (string) ($data['password'] ?? ''),
            'join_url' => $data['join_url'] ?? null,
            'start_url' => $data['start_url'] ?? null,
        ];
    }

    public function updateMeeting(string $meetingNumber, array $payload): void
    {
        if (! $this->isApiConfigured() || $meetingNumber === '') {
            return;
        }

        try {
            $token = $this->getAccessToken();
            Http::withToken($token)
                ->timeout(15)
                ->patch("https://api.zoom.us/v2/meetings/{$meetingNumber}", [
                    'topic' => $payload['title'],
                    'start_time' => Carbon::parse($payload['scheduled_at'])->toIso8601String(),
                    'duration' => (int) ($payload['duration_minutes'] ?? 60),
                    'timezone' => config('app.timezone', 'America/Mexico_City'),
                    'agenda' => (string) ($payload['description'] ?? ''),
                ]);
        } catch (\Throwable $e) {
            Log::warning('Zoom updateMeeting failed', ['meeting' => $meetingNumber, 'error' => $e->getMessage()]);
        }
    }

    public function deleteMeeting(string $meetingNumber): void
    {
        if (! $this->isApiConfigured() || $meetingNumber === '') {
            return;
        }

        try {
            $token = $this->getAccessToken();
            Http::withToken($token)
                ->timeout(15)
                ->delete("https://api.zoom.us/v2/meetings/{$meetingNumber}");
        } catch (\Throwable $e) {
            Log::warning('Zoom deleteMeeting failed', ['meeting' => $meetingNumber, 'error' => $e->getMessage()]);
        }
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}

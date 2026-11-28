<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class V2PilotUserService
{
    protected static string $filePath = 'config/v2_pilot_users.json';

    /**
     * @return array<int, int>
     */
    public static function getPilotUserIds(): array
    {
        try {
            if (Storage::disk('local')->exists(self::$filePath)) {
                $decoded = json_decode((string) Storage::disk('local')->get(self::$filePath), true);
                if (is_array($decoded) && is_array($decoded['user_ids'] ?? null)) {
                    return array_values(array_unique(array_map('intval', $decoded['user_ids'])));
                }
            }
        } catch (\Throwable) {
            //
        }

        return [];
    }

    public static function isPilotUser(int $userId): bool
    {
        return in_array($userId, self::getPilotUserIds(), true);
    }

    public static function togglePilotUser(int $userId): bool
    {
        $ids = self::getPilotUserIds();
        if (in_array($userId, $ids, true)) {
            $ids = array_values(array_filter($ids, fn (int $id) => $id !== $userId));
            $enabled = false;
        } else {
            $ids[] = $userId;
            $ids = array_values(array_unique($ids));
            $enabled = true;
        }

        Storage::disk('local')->put(
            self::$filePath,
            json_encode(['user_ids' => $ids], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );

        return $enabled;
    }

    public static function createSsoToken(int $userId, string $targetUrl = '/alumno'): string
    {
        $payload = [
            'uid' => $userId,
            'target' => $targetUrl,
            'exp' => time() + 60,
        ];

        $json = json_encode($payload, JSON_UNESCAPED_SLASHES) ?: '{}';
        $payloadB64 = rtrim(strtr(base64_encode($json), '+/', '-_'), '=');
        $sig = hash_hmac('sha256', $payloadB64, (string) config('app.key'));

        return "{$payloadB64}.{$sig}";
    }

    /**
     * @return array{uid: int, target: string}|null
     */
    public static function verifySsoToken(?string $token): ?array
    {
        if (! is_string($token) || ! str_contains($token, '.')) {
            return null;
        }

        $appKey = (string) config('app.key');
        if ($appKey === '') {
            return null;
        }

        [$payloadB64, $sig] = explode('.', $token, 2);
        if ($payloadB64 === '' || $sig === '') {
            return null;
        }

        $expectedSig = hash_hmac('sha256', $payloadB64, $appKey);
        $valid = hash_equals($expectedSig, $sig);
        if (! $valid && str_starts_with($appKey, 'base64:')) {
            $decodedKey = base64_decode(substr($appKey, 7), true);
            if (is_string($decodedKey) && $decodedKey !== '') {
                $valid = hash_equals(hash_hmac('sha256', $payloadB64, $decodedKey), $sig);
            }
        }
        if (! $valid) {
            return null;
        }

        $padded = strtr($payloadB64, '-_', '+/');
        $remainder = strlen($padded) % 4;
        if ($remainder > 0) {
            $padded .= str_repeat('=', 4 - $remainder);
        }

        $decodedJson = base64_decode($padded, true);
        if ($decodedJson === false) {
            return null;
        }

        $data = json_decode($decodedJson, true);
        if (! is_array($data) || empty($data['uid']) || (int) ($data['exp'] ?? 0) < time()) {
            return null;
        }

        $rawTarget = (string) ($data['target'] ?? '/alumno');
        if ($rawTarget === '' || ! str_starts_with($rawTarget, '/') || str_starts_with($rawTarget, '//') || str_starts_with($rawTarget, '/\\')) {
            $rawTarget = '/alumno';
        }

        return [
            'uid' => (int) $data['uid'],
            'target' => $rawTarget,
        ];
    }
}

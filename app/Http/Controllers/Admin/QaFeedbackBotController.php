<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class QaFeedbackBotController extends Controller
{
    public const VALID_ADMIN_STATUSES = ['pending', 'resolved', 'verified'];

    public const VALID_AGENT_STATUSES = ['pending', 'in_progress', 'resolved', 'needs_review', 'verified', 'rejected'];

    public const VALID_DEFECT_TYPES = ['server_error', 'broken_action', 'legacy_parity', 'visual_copy'];

    public static function baseDirectory(): string
    {
        return storage_path('app/qa-bot');
    }

    public static function reportsFilePath(): string
    {
        return self::baseDirectory().DIRECTORY_SEPARATOR.'reports.json';
    }

    public static function screenshotsDirectory(): string
    {
        return self::baseDirectory().DIRECTORY_SEPARATOR.'screenshots';
    }

    public static function ensureStorageDirectories(): void
    {
        foreach ([self::baseDirectory(), self::screenshotsDirectory()] as $directory) {
            if (! is_dir($directory)) {
                @mkdir($directory, 0777, true);
            }
            @chmod($directory, 0777);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function readReports(): array
    {
        self::ensureStorageDirectories();
        $path = self::reportsFilePath();

        if (! is_file($path) || ! is_readable($path)) {
            return [];
        }

        $contents = @file_get_contents($path);
        if (! is_string($contents) || trim($contents) === '') {
            return [];
        }

        $decoded = json_decode($contents, true);

        return is_array($decoded) ? array_values($decoded) : [];
    }

    /**
     * @param  array<int, array<string, mixed>>  $reports
     */
    public static function writeReports(array $reports): void
    {
        self::ensureStorageDirectories();
        $path = self::reportsFilePath();
        $encoded = json_encode(
            array_values($reports),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );

        if ($encoded === false) {
            throw new \RuntimeException('No se pudo serializar el archivo de reportes QA.');
        }

        @file_put_contents($path, $encoded, LOCK_EX);
        @chmod($path, 0666);
    }

    /**
     * Execute an atomic read-modify-write operation on reports.json.
     *
     * @template T
     *
     * @param  callable(array<int, array<string, mixed>>): array{0: array<int, array<string, mixed>>, 1: T}  $callback
     * @return T
     */
    public static function mutateReports(callable $callback): mixed
    {
        self::ensureStorageDirectories();
        $path = self::reportsFilePath();
        $handle = @fopen($path, 'c+b');

        if ($handle === false) {
            throw new \RuntimeException('No se pudo abrir el archivo de reportes QA.');
        }

        try {
            if (! flock($handle, LOCK_EX)) {
                throw new \RuntimeException('No se pudo bloquear el archivo de reportes QA.');
            }

            $contents = stream_get_contents($handle);
            $decoded = is_string($contents) && trim($contents) !== '' ? json_decode($contents, true) : [];
            $reports = is_array($decoded) ? array_values($decoded) : [];

            [$updatedReports, $result] = $callback($reports);

            $encoded = json_encode(
                array_values($updatedReports),
                JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
            );

            if ($encoded === false) {
                throw new \RuntimeException('No se pudo serializar el archivo de reportes QA.');
            }

            rewind($handle);
            ftruncate($handle, 0);
            fwrite($handle, $encoded);
            fflush($handle);
            flock($handle, LOCK_UN);
        } finally {
            fclose($handle);
        }

        @chmod($path, 0666);

        return $result;
    }

    /**
     * @param  array<int, array<string, mixed>>  $reports
     * @return array<int, array<string, mixed>>
     */
    public static function sortReportsNewestFirst(array $reports): array
    {
        usort($reports, function (array $a, array $b): int {
            $timeA = strtotime((string) ($a['created_at'] ?? '')) ?: 0;
            $timeB = strtotime((string) ($b['created_at'] ?? '')) ?: 0;

            if ($timeA !== $timeB) {
                return $timeB <=> $timeA;
            }

            return strcmp((string) ($b['id'] ?? ''), (string) ($a['id'] ?? ''));
        });

        return $reports;
    }

    public function index(Request $request): JsonResponse
    {
        $reports = self::sortReportsNewestFirst(self::readReports());

        $counts = [
            'pending' => 0,
            'in_progress' => 0,
            'resolved' => 0,
            'needs_review' => 0,
            'verified' => 0,
            'rejected' => 0,
            'total' => count($reports),
        ];

        foreach ($reports as $report) {
            $status = (string) ($report['status'] ?? 'pending');
            if (array_key_exists($status, $counts)) {
                $counts[$status]++;
            }
        }

        return response()->json([
            'reports' => array_slice($reports, 0, 50),
            'counts' => $counts,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
            'defect_type' => ['nullable', 'string', 'in:'.implode(',', self::VALID_DEFECT_TYPES)],
            'url' => ['nullable', 'string', 'max:2000'],
            'component' => ['nullable', 'string', 'max:255'],
            'viewport' => ['nullable', 'string', 'max:100'],
            'user_agent' => ['nullable', 'string', 'max:500'],
            'console_errors' => ['nullable', 'array', 'max:20'],
            'console_errors.*' => ['nullable'],
            'server_exception' => ['nullable', 'array'],
            'screenshot' => ['nullable', 'string', 'max:8000000'],
        ]);

        $decodedScreenshot = null;
        if (! empty($validated['screenshot'])) {
            $decodedScreenshot = $this->parseBase64Screenshot((string) $validated['screenshot']);
        }

        $user = $request->user();
        $authorName = trim((string) ($user?->nombre_completo ?: $user?->name ?: 'Administrador'));
        $userAgent = $validated['user_agent'] ?? $request->userAgent();
        $now = now()->toIso8601String();
        $logExcerpt = $this->tailLaravelLog(35);

        $createdReport = self::mutateReports(function (array $reports) use (
            $validated,
            $decodedScreenshot,
            $user,
            $authorName,
            $userAgent,
            $now,
            $logExcerpt
        ): array {
            $id = $this->nextReportId($reports);
            $screenshotUrl = null;
            $screenshotFile = null;

            if ($decodedScreenshot !== null) {
                $filename = $id.'.'.$decodedScreenshot['extension'];
                $fullPath = self::screenshotsDirectory().DIRECTORY_SEPARATOR.$filename;
                @file_put_contents($fullPath, $decodedScreenshot['binary'], LOCK_EX);
                @chmod($fullPath, 0666);
                $screenshotUrl = '/admin/qa-bot/screenshots/'.$filename;
                $screenshotFile = $filename;
            }

            $defectType = $validated['defect_type']
                ?? (! empty($validated['server_exception']) ? 'server_error' : 'broken_action');

            $report = [
                'id' => $id,
                'status' => 'pending',
                'defect_type' => $defectType,
                'message' => trim((string) $validated['message']),
                'url' => $validated['url'] ?? null,
                'component' => $validated['component'] ?? null,
                'viewport' => $validated['viewport'] ?? null,
                'user_agent' => $userAgent,
                'console_errors' => array_values($validated['console_errors'] ?? []),
                'server_exception' => $validated['server_exception'] ?? null,
                'laravel_log_excerpt' => $logExcerpt,
                'screenshot_url' => $screenshotUrl,
                'screenshot_file' => $screenshotFile,
                'author' => [
                    'id' => $user?->id,
                    'name' => $authorName,
                    'email' => $user?->email,
                ],
                'agent_reply' => null,
                'follow_up_message' => null,
                'follow_ups' => [],
                'created_at' => $now,
                'updated_at' => $now,
                'resolved_at' => null,
            ];

            $reports[] = $report;

            return [$reports, $report];
        });

        return response()->json([
            'report' => $createdReport,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:'.implode(',', self::VALID_ADMIN_STATUSES)],
            'follow_up_message' => ['nullable', 'string', 'max:5000'],
        ]);

        if (empty($validated['status']) && empty(trim((string) ($validated['follow_up_message'] ?? '')))) {
            throw ValidationException::withMessages([
                'status' => 'Debes indicar un nuevo estado o un mensaje de seguimiento.',
            ]);
        }

        $user = $request->user();
        $authorName = trim((string) ($user?->nombre_completo ?: $user?->name ?: 'Administrador'));
        $now = now()->toIso8601String();

        $updatedReport = self::mutateReports(function (array $reports) use (
            $id,
            $validated,
            $authorName,
            $now
        ): array {
            $foundIndex = null;
            foreach ($reports as $index => $report) {
                if (($report['id'] ?? null) === $id) {
                    $foundIndex = $index;
                    break;
                }
            }

            if ($foundIndex === null) {
                abort(404, 'Reporte QA no encontrado.');
            }

            $report = $reports[$foundIndex];

            $followUp = isset($validated['follow_up_message'])
                ? trim((string) $validated['follow_up_message'])
                : '';

            if ($followUp !== '') {
                $report['follow_up_message'] = $followUp;
                $followUps = is_array($report['follow_ups'] ?? null) ? $report['follow_ups'] : [];
                $followUps[] = [
                    'message' => $followUp,
                    'author' => $authorName,
                    'created_at' => $now,
                ];
                $report['follow_ups'] = $followUps;

                if (empty($validated['status'])) {
                    $report['status'] = 'pending';
                    $report['resolved_at'] = null;
                }
            }

            if (! empty($validated['status'])) {
                $report['status'] = $validated['status'];
                if ($validated['status'] === 'resolved' || $validated['status'] === 'verified') {
                    $report['resolved_at'] = $report['resolved_at'] ?? $now;
                } elseif ($validated['status'] === 'pending') {
                    $report['resolved_at'] = null;
                }
            }

            $report['updated_at'] = $now;
            $reports[$foundIndex] = $report;

            return [$reports, $report];
        });

        return response()->json([
            'report' => $updatedReport,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $deletedScreenshot = self::mutateReports(function (array $reports) use ($id): array {
            $foundIndex = null;
            foreach ($reports as $index => $report) {
                if (($report['id'] ?? null) === $id) {
                    $foundIndex = $index;
                    break;
                }
            }

            if ($foundIndex === null) {
                abort(404, 'Reporte QA no encontrado.');
            }

            $screenshotFile = $reports[$foundIndex]['screenshot_file'] ?? null;
            if (! $screenshotFile && ! empty($reports[$foundIndex]['screenshot_url'])) {
                $screenshotFile = basename((string) $reports[$foundIndex]['screenshot_url']);
            }

            array_splice($reports, $foundIndex, 1);

            return [array_values($reports), $screenshotFile];
        });

        if (is_string($deletedScreenshot) && $deletedScreenshot !== '') {
            $path = self::screenshotsDirectory().DIRECTORY_SEPARATOR.basename($deletedScreenshot);
            if (is_file($path)) {
                @unlink($path);
            }
        }

        return response()->json([
            'deleted' => true,
            'id' => $id,
        ]);
    }

    public function screenshot(string $filename): BinaryFileResponse
    {
        $safeName = basename($filename);
        if (! preg_match('/^[A-Za-z0-9_.-]+\.(png|jpe?g|webp)$/i', $safeName)) {
            abort(404);
        }

        $path = self::screenshotsDirectory().DIRECTORY_SEPARATOR.$safeName;
        if (! is_file($path)) {
            abort(404);
        }

        $ext = strtolower(pathinfo($safeName, PATHINFO_EXTENSION));
        $mimeType = match ($ext) {
            'jpg', 'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            default => 'image/png',
        };

        return response()->file($path, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $reports
     */
    private function nextReportId(array $reports): string
    {
        $max = 0;
        foreach ($reports as $report) {
            if (preg_match('/^QA-(\d+)$/', (string) ($report['id'] ?? ''), $matches)) {
                $max = max($max, (int) $matches[1]);
            }
        }

        return sprintf('QA-%03d', $max + 1);
    }

    /**
     * @return array{extension: string, binary: string}
     */
    private function parseBase64Screenshot(string $dataUrl): array
    {
        if (! preg_match('/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/is', trim($dataUrl), $matches)) {
            throw ValidationException::withMessages([
                'screenshot' => 'La captura debe ser una imagen PNG, JPG o WEBP válida.',
            ]);
        }

        $binary = base64_decode($matches[2], true);
        if ($binary === false || $binary === '') {
            throw ValidationException::withMessages([
                'screenshot' => 'No se pudo decodificar la imagen adjunta.',
            ]);
        }

        if (strlen($binary) > 5 * 1024 * 1024) {
            throw ValidationException::withMessages([
                'screenshot' => 'La captura no debe superar los 5 MB.',
            ]);
        }

        $rawExt = strtolower($matches[1]);
        $extension = $rawExt === 'jpeg' ? 'jpg' : $rawExt;

        return [
            'extension' => $extension,
            'binary' => $binary,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function tailLaravelLog(int $linesCount): array
    {
        $logPath = storage_path('logs/laravel.log');
        if (! is_file($logPath) || ! is_readable($logPath)) {
            return [];
        }

        $handle = @fopen($logPath, 'rb');
        if ($handle === false) {
            return [];
        }

        try {
            $fileSize = filesize($logPath);
            if ($fileSize === false || $fileSize === 0) {
                return [];
            }

            $maxBytes = min($fileSize, 65536);
            fseek($handle, -$maxBytes, SEEK_END);
            $chunk = fread($handle, $maxBytes);
            if (! is_string($chunk) || $chunk === '') {
                return [];
            }

            $lines = preg_split("/\r\n|\n|\r/", trim($chunk)) ?: [];

            return array_slice($lines, -$linesCount);
        } finally {
            fclose($handle);
        }
    }
}

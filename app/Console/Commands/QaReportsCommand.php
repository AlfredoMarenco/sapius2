<?php

namespace App\Console\Commands;

use App\Http\Controllers\Admin\QaFeedbackBotController;
use Illuminate\Console\Command;

class QaReportsCommand extends Command
{
    protected $signature = 'qa:reports
                            {action=list : Acción a ejecutar (list|show|update)}
                            {id? : ID del reporte (ej. QA-001)}
                            {--status= : Filtro de estado en list o nuevo estado en update}
                            {--reply= : Respuesta de Antigravity para el revisor}';

    protected $description = 'Gestiona los reportes QA enviados desde el bot flotante en storage/app/qa-bot/reports.json';

    public function handle(): int
    {
        $action = strtolower((string) $this->argument('action'));

        return match ($action) {
            'list' => $this->handleList(),
            'show' => $this->handleShow(),
            'update' => $this->handleUpdate(),
            default => $this->failWithMessage("Acción no válida '{$action}'. Usa: list, show o update."),
        };
    }

    private function handleList(): int
    {
        $reports = QaFeedbackBotController::sortReportsNewestFirst(
            QaFeedbackBotController::readReports()
        );

        $statusFilter = $this->option('status');
        if (is_string($statusFilter) && $statusFilter !== '') {
            $reports = array_values(array_filter(
                $reports,
                fn (array $report): bool => ($report['status'] ?? null) === $statusFilter
            ));
        }

        $this->outputJson($reports);

        return self::SUCCESS;
    }

    private function handleShow(): int
    {
        $id = $this->argument('id');
        if (! is_string($id) || trim($id) === '') {
            return $this->failWithMessage('Debes especificar el ID del reporte. Ejemplo: php artisan qa:reports show QA-001');
        }

        $reports = QaFeedbackBotController::readReports();
        foreach ($reports as $report) {
            if (($report['id'] ?? null) === $id) {
                if (! empty($report['screenshot_file'])) {
                    $screenshotPath = QaFeedbackBotController::screenshotsDirectory()
                        .DIRECTORY_SEPARATOR
                        .basename((string) $report['screenshot_file']);
                    $report['screenshot_local_path'] = is_file($screenshotPath) ? $screenshotPath : null;
                }

                $this->outputJson($report);

                return self::SUCCESS;
            }
        }

        return $this->failWithMessage("No se encontró el reporte '{$id}'.");
    }

    private function handleUpdate(): int
    {
        $id = $this->argument('id');
        if (! is_string($id) || trim($id) === '') {
            return $this->failWithMessage('Debes especificar el ID del reporte. Ejemplo: php artisan qa:reports update QA-001 --status=resolved');
        }

        $newStatus = $this->option('status');
        $reply = $this->option('reply');

        if (($newStatus === null || $newStatus === '') && $reply === null) {
            return $this->failWithMessage('Debes proporcionar al menos --status o --reply para actualizar el reporte.');
        }

        if (is_string($newStatus) && $newStatus !== '' && ! in_array($newStatus, QaFeedbackBotController::VALID_AGENT_STATUSES, true)) {
            $allowed = implode(', ', QaFeedbackBotController::VALID_AGENT_STATUSES);

            return $this->failWithMessage("Estado inválido '{$newStatus}'. Permitidos: {$allowed}");
        }

        $now = now()->toIso8601String();
        $updated = QaFeedbackBotController::mutateReports(function (array $reports) use ($id, $newStatus, $reply, $now): array {
            $foundIndex = null;
            foreach ($reports as $index => $report) {
                if (($report['id'] ?? null) === $id) {
                    $foundIndex = $index;
                    break;
                }
            }

            if ($foundIndex === null) {
                return [$reports, null];
            }

            $report = $reports[$foundIndex];

            if (is_string($newStatus) && $newStatus !== '') {
                $report['status'] = $newStatus;
                if ($newStatus === 'resolved' || $newStatus === 'verified') {
                    $report['resolved_at'] = $now;
                } elseif (in_array($newStatus, ['pending', 'in_progress', 'needs_review'], true)) {
                    $report['resolved_at'] = null;
                }
            }

            if ($reply !== null) {
                $report['agent_reply'] = (string) $reply;
            }

            $report['updated_at'] = $now;
            $reports[$foundIndex] = $report;

            return [$reports, $report];
        });

        if ($updated === null) {
            return $this->failWithMessage("No se encontró el reporte '{$id}'.");
        }

        $this->outputJson($updated);

        return self::SUCCESS;
    }

    private function outputJson(mixed $data): void
    {
        $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $this->line($encoded !== false ? $encoded : '[]');
    }

    private function failWithMessage(string $message): int
    {
        $this->error($message);

        return self::FAILURE;
    }
}

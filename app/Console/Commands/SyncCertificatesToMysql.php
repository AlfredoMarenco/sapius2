<?php

namespace App\Console\Commands;

use App\Models\Certificate;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SyncCertificatesToMysql extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'certificates:sync-to-mysql {--dry-run : Simula la migración sin insertar registros}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migra certificados desde el respaldo SQLite (storage/app/certificates.sqlite) hacia la tabla certificates de la base de datos principal.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $targetConnection = config('database.default');

        if (! Schema::connection($targetConnection)->hasTable('certificates')) {
            $this->error("La tabla 'certificates' no existe en la conexión principal [{$targetConnection}].");

            return self::FAILURE;
        }

        $sqlitePath = Certificate::sqlitePath();
        if (! file_exists($sqlitePath) && empty(config('database.connections.certificates_sqlite'))) {
            $this->info('No se encontró el archivo storage/app/certificates.sqlite. Nada que sincronizar.');

            return self::SUCCESS;
        }

        Certificate::configureSqliteConnection();

        if (! Schema::connection('certificates_sqlite')->hasTable('certificates')) {
            $this->info('La base SQLite de respaldo no contiene la tabla certificates. Nada que sincronizar.');

            return self::SUCCESS;
        }

        $rows = DB::connection('certificates_sqlite')
            ->table('certificates')
            ->orderBy('id')
            ->get();

        if ($rows->isEmpty()) {
            $this->info('No existen registros en certificates.sqlite para migrar.');

            return self::SUCCESS;
        }

        $dryRun = (bool) $this->option('dry-run');
        $migrated = 0;
        $skipped = 0;
        $orphaned = 0;

        $migrateFn = function () use ($rows, $targetConnection, $dryRun, &$migrated, &$skipped, &$orphaned) {
            foreach ($rows as $row) {
                $exists = DB::connection($targetConnection)
                    ->table('certificates')
                    ->where(function ($q) use ($row) {
                        $q->where('codigo_validacion', $row->codigo_validacion)
                            ->orWhere(function ($q2) use ($row) {
                                $q2->where('user_id', $row->user_id)
                                    ->where('curso_programado_id', $row->curso_programado_id);
                            });
                    })
                    ->exists();

                if ($exists) {
                    $skipped++;

                    continue;
                }

                $userExists = DB::connection($targetConnection)->table('users')->where('id', $row->user_id)->exists();
                $cohortExists = DB::connection($targetConnection)->table('cursos_programados')->where('id', $row->curso_programado_id)->exists();

                if (! $userExists || ! $cohortExists) {
                    $orphaned++;
                    $this->warn("Certificado #{$row->id} ({$row->codigo_validacion}) omitido: usuario ({$row->user_id}) o cohorte ({$row->curso_programado_id}) inexistente.");

                    continue;
                }

                if (! $dryRun) {
                    DB::connection($targetConnection)->table('certificates')->insert([
                        'user_id' => $row->user_id,
                        'curso_programado_id' => $row->curso_programado_id,
                        'codigo_validacion' => $row->codigo_validacion,
                        'fecha_emision' => $row->fecha_emision,
                        'created_at' => $row->created_at ?? now(),
                        'updated_at' => $row->updated_at ?? now(),
                    ]);
                }

                $migrated++;
            }
        };

        if ($dryRun) {
            $migrateFn();
        } else {
            DB::connection($targetConnection)->transaction($migrateFn);
        }

        $prefix = $dryRun ? '[DRY-RUN] ' : '';
        $this->info("{$prefix}Sincronización finalizada. Migrados: {$migrated}, Ya existentes: {$skipped}, Huérfanos omitidos: {$orphaned}.");

        return self::SUCCESS;
    }
}

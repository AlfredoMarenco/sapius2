<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'curso_programado_id',
        'codigo_validacion',
        'fecha_emision',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'date',
        ];
    }

    public static function sqlitePath(): string
    {
        return storage_path('app/certificates.sqlite');
    }

    public static function defaultHasTable(): bool
    {
        try {
            $defaultConnection = config('database.default');

            return Schema::connection($defaultConnection)->hasTable('certificates');
        } catch (\Throwable $e) {
            return false;
        }
    }

    public static function configureSqliteConnection(): void
    {
        $path = static::sqlitePath();

        if (empty(config('database.connections.certificates_sqlite'))) {
            $dir = dirname($path);
            if (! is_dir($dir)) {
                mkdir($dir, 0775, true);
            }
            if (! file_exists($path)) {
                touch($path);
            }

            config([
                'database.connections.certificates_sqlite' => [
                    'driver' => 'sqlite',
                    'database' => $path,
                    'prefix' => '',
                    'foreign_key_constraints' => false,
                ],
            ]);
        }
    }

    public static function ensureStorageReady(): void
    {
        if (static::defaultHasTable()) {
            return;
        }

        static::configureSqliteConnection();

        $dbPath = config('database.connections.certificates_sqlite.database');
        if ($dbPath && $dbPath !== ':memory:') {
            $dir = dirname($dbPath);
            if (! is_dir($dir)) {
                mkdir($dir, 0775, true);
            }
            if (! file_exists($dbPath)) {
                touch($dbPath);
            }
        }

        if (! Schema::connection('certificates_sqlite')->hasTable('certificates')) {
            Schema::connection('certificates_sqlite')->create('certificates', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->index();
                $table->unsignedBigInteger('curso_programado_id')->index();
                $table->string('codigo_validacion')->unique();
                $table->date('fecha_emision');
                $table->timestamps();

                $table->unique(['user_id', 'curso_programado_id']);
            });
        }
    }

    public function getConnectionName(): ?string
    {
        if ($this->connection !== null) {
            return $this->connection;
        }

        if (static::defaultHasTable()) {
            return parent::getConnectionName();
        }

        static::ensureStorageReady();

        return 'certificates_sqlite';
    }

    protected function newRelatedInstance($class)
    {
        return tap(new $class, function ($instance) {
            if (! $instance->getConnectionName()) {
                $targetConnection = static::defaultHasTable()
                    ? $this->getConnectionName()
                    : config('database.default');

                $instance->setConnection($targetConnection);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scheduledCourse()
    {
        return $this->belongsTo(ScheduledCourse::class, 'curso_programado_id');
    }
}

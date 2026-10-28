<?php

namespace App\Console\Commands;

use App\Mail\AutoAceptacionEmail;
use App\Models\Registro\Inscripcion;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AutoAprobarInscripciones extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inscripciones:auto-aprobar';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Aprueba automáticamente las inscripciones que no han sido aceptadas por un admin en 2 horas';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Iniciando proceso de auto-aprobación de inscripciones...');

        $dosHorasAtras = now()->subHours(2);
        $inicioDeAnio = now()->startOfYear();

        $inscripciones = Inscripcion::where('aceptado', 'no')
            ->where('created_at', '>=', $inicioDeAnio)
            ->where('created_at', '<=', $dosHorasAtras)
            ->whereColumn('created_at', 'updated_at') // Solo inscripciones no modificadas por un admin
            ->whereHas('User', function ($query) {
                $query->where('activo', 'si');
            })
            ->whereHas('CursoProgramado', function ($query) {
                $query->where('fecha_fin', '>=', now());
            })
            ->with(['User', 'CursoProgramado.category', 'CursoProgramado.Curso'])
            ->get();

        $count = $inscripciones->count();
        $this->info("Se encontraron {$count} inscripciones pendientes que cumplen los criterios.");

        foreach ($inscripciones as $inscripcion) {
            $user = $inscripcion->User;

            if (! $user) {
                $this->warn("Inscripción ID: {$inscripcion->id} - Usuario no encontrado o inactivo. Omitiendo.");

                continue;
            }

            $this->info("Procesando inscripción ID: {$inscripcion->id} - Usuario: {$user->email}");

            // Aprobar la inscripción
            $inscripcion->aceptado = 'si';
            $inscripcion->save();

            // Enviar correo de notificación
            try {
                Mail::to($user->email)
                    ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                    ->send(new AutoAceptacionEmail($inscripcion));

                $this->info("Correo enviado a {$user->email}");
            } catch (\Exception $e) {
                $this->error("Error al enviar correo a {$user->email}: ".$e->getMessage());
                Log::error("Error auto-aprobando inscripción {$inscripcion->id}: ".$e->getMessage());
            }
        }

        $this->info('Proceso finalizado correctamente.');

        return Command::SUCCESS;
    }
}

<?php

namespace App\Console\Commands;

use App\Mail\RecordatorioDatosEmail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class VerificarUsuarios extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'usuarios:verificar';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica usuarios sin documentos y envía recordatorios';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Iniciando verificación de usuarios sin documentación...');

        // Usuarios registrados a partir del año actual que no han subido documento o pase de ingreso
        $usuarios = User::whereYear('created_at', '>=', date('Y'))
            ->where(function ($q) {
                $q->whereNull('documento_identificacion')
                    ->orWhere('documento_identificacion', '')
                    ->orWhereNull('pase_ingreso')
                    ->orWhere('pase_ingreso', '');
            })
            ->where('is_blocked', false)
            ->get();

        $count = $usuarios->count();
        $this->info("Se encontraron {$count} usuarios con documentos pendientes.");

        foreach ($usuarios as $user) {
            try {
                Mail::to($user->email)->queue(new RecordatorioDatosEmail($user));
                $this->info("Recordatorio encolado para: {$user->email}");
            } catch (\Exception $e) {
                $this->error("Error al encolar recordatorio para {$user->email}: ".$e->getMessage());
                Log::error("Error en recordatorio de documentos para {$user->id}: ".$e->getMessage());
            }
        }

        $this->info('Proceso de verificación finalizado.');

        return Command::SUCCESS;
    }
}

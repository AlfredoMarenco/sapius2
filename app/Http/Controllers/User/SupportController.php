<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Mail\SoporteTecnicoEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SupportController extends Controller
{
    public function index()
    {
        return Inertia::render('User/Support/Index', [
            'user' => [
                'name' => Auth::user()->name,
                'email' => Auth::user()->email,
            ],
        ]);
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'asunto' => 'required|string|max:255',
            'comentario' => 'required|string|min:10',
        ]);

        $user = Auth::user();
        $datos = [
            'asunto' => $validated['asunto'],
            'mensaje' => "Alumno: {$user->nombre_completo} ({$user->email})\n\n".$validated['comentario'],
            'comentario' => $validated['comentario'],
            'user_id' => $user->id,
            'user_email' => $user->email,
        ];

        try {
            $supportEmail = config('mail.to_support', 'atencion@sapius.com.mx') ?: 'atencion@sapius.com.mx';
            Mail::to($supportEmail)->send(new SoporteTecnicoEmail($datos));
        } catch (\Throwable $e) {
            Log::error('Error enviando SoporteTecnicoEmail: '.$e->getMessage(), [
                'user_id' => $user->id,
                'asunto' => $validated['asunto'],
            ]);
        }

        return redirect()->back()->with('success', '¡Gracias! Tu mensaje ha sido enviado a nuestro equipo de soporte.');
    }
}

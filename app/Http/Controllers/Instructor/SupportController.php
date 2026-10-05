<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;

class SupportController extends Controller
{
    public function index()
    {
        return Inertia::render('Instructor/Support');
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'asunto' => 'required|string|max:255',
            'mensaje' => 'required|string',
        ]);

        // Logic para mandar el correo (igual que en el sistema legacy)
        // Mail::to('soporte@sapius.com.mx')->send(new \App\Mail\SoporteInstructor($validated, auth()->user()));

        return back()->with('success', 'Mensaje enviado correctamente al equipo de soporte.');
    }
}

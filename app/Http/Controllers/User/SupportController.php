<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $request->validate([
            'asunto' => 'required|string|max:255',
            'comentario' => 'required|string|min:10',
        ]);

        // Support email logging or mailing
        \Log::info("Soporte Técnico Solicitado por " . Auth::user()->email . ": " . $request->asunto, [
            'comentario' => $request->comentario,
            'user_id' => Auth::id(),
        ]);

        return redirect()->back()->with('success', '¡Gracias! Tu mensaje ha sido enviado a nuestro equipo de soporte.');
    }
}

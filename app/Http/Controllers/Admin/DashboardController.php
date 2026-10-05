<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScheduledCourse;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $now = date('Y-m-d H:i:s');

        // Cohortes activas cuya fecha de fin no ha vencido
        $cohorts = ScheduledCourse::with(['course'])
            ->withCount(['enrollments'])
            ->where('fecha_fin', '>=', $now)
            ->orderBy('fecha_inicio', 'desc')
            ->get()
            ->map(function ($sc) {
                return [
                    'id' => $sc->id,
                    'internal_id' => $sc->identificador,
                    'price' => $sc->precio,
                    'start_date' => $sc->fecha_inicio ? \Carbon\Carbon::parse($sc->fecha_inicio)->format('d/m/Y') : null,
                    'end_date' => $sc->fecha_fin ? \Carbon\Carbon::parse($sc->fecha_fin)->format('d/m/Y') : null,
                    'sale_start_date' => $sc->fecha_inicio_venta ? \Carbon\Carbon::parse($sc->fecha_inicio_venta)->format('d/m/Y') : null,
                    'sale_end_date' => $sc->fecha_fin_venta ? \Carbon\Carbon::parse($sc->fecha_fin_venta)->format('d/m/Y') : null,
                    'enrollments_count' => $sc->enrollments_count,
                    'course' => $sc->course ? [
                        'id' => $sc->course->id,
                        'title' => $sc->course->title,
                        'slug' => $sc->course->slug,
                        'image' => $sc->course->image,
                        'description' => $sc->course->description,
                        'active' => $sc->course->activo,
                    ] : null,
                ];
            });

        // Métricas globales reales
        $stats = [
            'active_cohorts' => ScheduledCourse::where('fecha_fin', '>=', $now)->count(),
            'total_students' => User::whereHas('roles', function ($q) {
                $q->where('slug', 'alumno');
            })->count(),
            'active_courses' => Course::where('activo', 'si')->count(),
            'pending_validations' => User::where('validado', 'no')->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'cohorts' => $cohorts,
            'stats' => $stats,
        ]);
    }
}

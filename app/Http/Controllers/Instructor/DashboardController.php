<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\ScheduledCourse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $isAdmin = ($user && method_exists($user, 'hasRole') && $user->hasRole('admin'))
            || ($user && isset($user->role) && $user->role === 'admin');

        $cohortsQuery = ScheduledCourse::with(['course.category'])
            ->where('activo', 'si')
            ->withCount(['enrollments as accepted_students_count' => function ($q) {
                $q->where('aceptado', 'si');
            }]);

        if (! $isAdmin) {
            $cohortsQuery->where('user_id', Auth::id());
        }

        $cohorts = $cohortsQuery->orderBy('fecha_inicio', 'desc')
            ->get()
            ->map(function (ScheduledCourse $cohort) {
                return [
                    'id' => $cohort->id,
                    'course_id' => $cohort->curso_id,
                    'course_title' => $cohort->course?->title ?? 'Curso',
                    'category' => $cohort->category?->name ?? 'General',
                    'identifier' => $cohort->identificador ?? $cohort->internal_id ?? ('Grupo '.$cohort->id),
                    'start_date' => $cohort->fecha_inicio ? $cohort->fecha_inicio->format('d/m/Y') : null,
                    'end_date' => $cohort->fecha_fin ? $cohort->fecha_fin->format('d/m/Y') : null,
                    'students_count' => (int) ($cohort->accepted_students_count ?? 0),
                ];
            })
            ->values();

        return Inertia::render('Instructor/Dashboard', [
            'cohorts' => $cohorts,
            'stats' => [
                'cohorts_count' => $cohorts->count(),
                'courses_count' => $cohorts->pluck('course_id')->unique()->count(),
                'students_count' => $cohorts->sum('students_count'),
            ],
        ]);
    }
}

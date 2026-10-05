<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LandingSlide;
use App\Models\LandingPride;
use App\Models\LandingTeacher;
use App\Models\LandingReview;
use App\Models\ScheduledCourse;
use App\Models\Category;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome', [
            'slides' => LandingSlide::where('active', true)->orderBy('position')->get(),
            'prides' => LandingPride::orderBy('position')->get(),
            'teachers' => LandingTeacher::orderBy('position')->get(),
            'reviews' => LandingReview::where('visible', true)->orderBy('created_at', 'desc')->take(6)->get(),
        ]);
    }

    public function coursePage($slug)
    {
        $reviews = LandingReview::where('visible', true)->where('rating', '>=', 4)->orderBy('created_at', 'desc')->take(6)->get();

        return Inertia::render('Public/CourseLanding', [
            'slug' => $slug,
            'reviews' => $reviews,
        ]);
    }

    public function guias($area = 'medicina')
    {
        $guias = ScheduledCourse::with(['course.category'])
            ->where('activo', 'si')
            ->where('identificador', 'like', '%' . $area . '%')
            ->get();

        return Inertia::render('Public/GuiasLanding', [
            'area' => $area,
            'guias' => $guias,
        ]);
    }

    public function simuladores($area = 'medicina')
    {
        $simuladores = ScheduledCourse::with(['course.category'])
            ->where('activo', 'si')
            ->where('identificador', 'like', '%' . $area . '%')
            ->get();

        return Inertia::render('Public/SimuladoresLanding', [
            'area' => $area,
            'simuladores' => $simuladores,
        ]);
    }

    public function legal($type)
    {
        return Inertia::render('Public/Legal', [
            'type' => $type,
        ]);
    }
}

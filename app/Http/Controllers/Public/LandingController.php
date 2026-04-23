<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\LandingSlide;
use App\Models\LandingPride;
use App\Models\LandingTeacher;
use App\Models\LandingReview;
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
}

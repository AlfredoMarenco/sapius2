<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // En un futuro cercano, se puede filtrar data específica del instructor
        return Inertia::render('Instructor/Dashboard');
    }
}

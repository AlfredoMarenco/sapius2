<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\LandingSlide;
use App\Models\LandingPride;
use App\Models\LandingTeacher;
use App\Models\LandingReview;

class LandingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Slides
        LandingSlide::create(['title' => 'EXANI-I', 'img' => 'img/v1/morritos.png', 'position' => 1]);
        LandingSlide::create(['title' => 'EGEL PLUS', 'img' => 'img/v1/plataforma.png', 'position' => 2]);

        // Prides (Orgullos)
        LandingPride::create([
            'name' => 'Orgullo Sapius 1',
            'text' => 'Aprobó el EGEL con excelencia.',
            'text2' => 'Medicina General',
            'img' => 'img/v1/penelope-quintanar-Gracia.png',
            'position' => 1
        ]);

        // Teachers (Docentes)
        LandingTeacher::create([
            'name' => 'LN. Fernando Iván Pat Poot',
            'description' => 'Docente Sapius',
            'img' => 'img/m-1.png',
            'position' => 1
        ]);
        LandingTeacher::create([
            'name' => 'Lic. Martín Moises González',
            'description' => 'Docente Titular EGEL',
            'img' => 'img/m-3.png',
            'position' => 2
        ]);
        
        // Reviews
        LandingReview::create([
            'user_name' => 'Estudiante 1',
            'content' => 'Excelente curso, muy completo y dinámico.',
            'rating' => 5,
            'visible' => true
        ]);
    }
}

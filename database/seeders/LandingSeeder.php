<?php

namespace Database\Seeders;

use App\Models\Pride;
use App\Models\Review;
use App\Models\Slide;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class LandingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Slides
        Slide::create(['img' => 'img/v1/morritos.png', 'section' => 'slider-index', 'position' => 1]);
        Slide::create(['img' => 'img/v1/plataforma.png', 'section' => 'slider-index', 'position' => 2]);

        // Prides (Orgullos)
        Pride::create([
            'name' => 'Orgullo Sapius 1',
            'text' => 'Medicina General',
            'text2' => 'Aprobó el EGEL con excelencia.',
            'img' => 'img/v1/penelope-quintanar-Gracia.png',
            'position' => 1,
        ]);

        // Teachers (Docentes)
        Teacher::create([
            'name' => 'LN. Fernando Iván Pat Poot',
            'description' => 'Docente Sapius',
            'img' => 'img/m-1.png',
            'position' => 1,
        ]);
        Teacher::create([
            'name' => 'Lic. Martín Moises González',
            'description' => 'Docente Titular EGEL',
            'img' => 'img/m-3.png',
            'position' => 2,
        ]);

        // Reviews
        Review::create([
            'name' => 'Estudiante 1',
            'comment' => 'Excelente curso, muy completo y dinámico.',
            'rating' => 5,
            'visible' => true,
        ]);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\Media;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Answer;
use App\Models\HomeworkAssignment;
use Illuminate\Support\Str;

class MasterCourseSeeder extends Seeder
{
    public function run()
    {
        // 1. Create Master Course (Medicina Category 1, Admin ID 1)
        $course = Course::create([
            'user_id' => 1,
            'category_id' => 1,
            'title' => 'Curso Maestro: Dominio Total de Medicina Pre-Universitaria',
            'slug' => 'curso-maestro-medicina-pre-universitaria-' . time(),
            'description' => 'Este es un curso integral diseñado para demostrar la potencia de Sapius 2.0. Aprenderás desde las bases de la anatomía hasta procesos bioquímicos complejos con videolecciones de alta calidad y evaluaciones rigurosas.',
            'image' => 'https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=2070',
            'is_active' => true,
        ]);

        // 2. Module 1: Anatomía & Fisiología
        $module1 = Module::create([
            'course_id' => $course->id,
            'title' => 'Módulo 1: Anatomía & Fisiología Vital',
            'slug' => 'modulo-1-anatomia-fisiologia-' . time(),
            'image' => 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=500',
            'position' => 1,
        ]);

        // --- Lesson 1.1: Sistema Óseo
        $lesson1 = Lesson::create([
            'module_id' => $module1->id,
            'title' => 'El Esqueleto Humano y sus Funciones',
            'slug' => 'sistema-oseo-humano-' . time(),
            'position' => 1,
            'content' => '<h2>Introducción al Sitema Óseo</h2><p>El sistema óseo humano es una estructura compleja compuesta por 206 huesos que brindan soporte, protección y movimiento al cuerpo.</p><p>En esta lección cubriremos los huesos principales, el tejido óseo y su importancia en la hematopoyesis.</p>',
        ]);

        // Media for Lesson 1
        Media::create([
            'lesson_id' => $lesson1->id,
            'title' => 'Video: Introducción al Sistema Óseo',
            'file_type' => 'video',
            'file_path' => 'https://www.youtube.com/watch?v=kYv_8T_G9p4',
        ]);
        Media::create([
            'lesson_id' => $lesson1->id,
            'title' => 'Infografía del Esqueleto Axial',
            'file_type' => 'image',
            'file_path' => 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=500',
        ]);

        // Quiz for Lesson 1
        $quiz1 = Quiz::create([
            'lesson_id' => $lesson1->id,
            'title' => 'Evaluación de Sistema Óseo',
            'type' => 'PRÁCTICA',
            'time_limit' => 15,
            'attempts_allowed' => 3,
            'passing_score' => 80,
        ]);

        $q1 = Question::create([
            'quiz_id' => $quiz1->id,
            'text' => '¿Cuál es el hueso más largo del cuerpo humano?',
            'points' => 20,
        ]);
        Answer::create(['question_id' => $q1->id, 'text' => 'Húmero', 'is_correct' => false]);
        Answer::create(['question_id' => $q1->id, 'text' => 'Fémur', 'is_correct' => true]);
        Answer::create(['question_id' => $q1->id, 'text' => 'Tibia', 'is_correct' => false]);
        Answer::create(['question_id' => $q1->id, 'text' => 'Esternón', 'is_correct' => false]);

        $q2 = Question::create([
            'quiz_id' => $quiz1->id,
            'text' => '¿Qué nombre recibe el proceso de creación de células sanguíneas en la médula ósea?',
            'points' => 30,
        ]);
        Answer::create(['question_id' => $q2->id, 'text' => 'Osmosis', 'is_correct' => false]);
        Answer::create(['question_id' => $q2->id, 'text' => 'Hematopoyesis', 'is_correct' => true]);
        Answer::create(['question_id' => $q2->id, 'text' => 'Diapedesis', 'is_correct' => false]);
        Answer::create(['question_id' => $q2->id, 'text' => 'Apoptosis', 'is_correct' => false]);

        // --- Lesson 1.2: El Corazón y la Circulación
        $lesson2 = Lesson::create([
            'module_id' => $module1->id,
            'title' => 'Fisiología Cardiovascular Básica',
            'slug' => 'fisiologia-cardiovascular-' . time(),
            'position' => 2,
            'content' => '<h2>El Corazón: El Motor del Cuerpo</h2><p>El corazón es un órgano muscular hueco que bombea sangre a través de la red de vasos sanguíneos del sistema circulatorio.</p>',
        ]);

        Media::create([
            'lesson_id' => $lesson2->id,
            'title' => 'PDF: Guía Detallada del Ciclo Cardíaco',
            'file_type' => 'document',
            'file_path' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            'is_downloadable' => true,
        ]);

        HomeworkAssignment::create([
            'lesson_id' => $lesson2->id,
            'title' => 'Diagrama del Sistema Circulatorio',
            'description' => 'Dibuja el sistema circulatorio indicando la circulación menor y mayor. Sube una foto de tu dibujo.',
            'points' => 100,
        ]);

        // 3. Module 2: Bioquímica
        $module2 = Module::create([
            'course_id' => $course->id,
            'title' => 'Módulo 2: Bioquímica Clínica Aplicada',
            'slug' => 'modulo-2-bioquímica-' . time(),
            'image' => 'https://images.unsplash.com/photo-1532187875605-181502c9e883?auto=format&fit=crop&q=80&w=500',
            'position' => 2,
        ]);

        $lesson3 = Lesson::create([
            'module_id' => $module2->id,
            'title' => 'Metabolismo de Carbohidratos: Glucólisis',
            'slug' => 'glucólisis-clínica-' . time(),
            'position' => 1,
            'content' => '<h2>Glucólisis: Energía para la Vida</h2><p>La glucólisis es la vía metabólica encargada de oxidar la glucosa con la finalidad de obtener energía para la célula.</p>',
        ]);

        Media::create([
            'lesson_id' => $lesson3->id,
            'title' => 'Video: Glucólisis paso a paso',
            'file_type' => 'video',
            'file_path' => 'https://www.youtube.com/watch?v=A1nJRoPGnMc',
        ]);

        $quiz2 = Quiz::create([
            'lesson_id' => $lesson3->id,
            'title' => 'Quiz: Fundamentos de Glucólisis',
            'type' => 'EXAMEN',
            'time_limit' => 10,
            'attempts_allowed' => 1,
            'passing_score' => 70,
        ]);

        $q3 = Question::create([
            'quiz_id' => $quiz2->id,
            'text' => '¿Dónde ocurre la glucólisis en la célula eucariota?',
            'points' => 50,
        ]);
        Answer::create(['question_id' => $q3->id, 'text' => 'Mitocondria', 'is_correct' => false]);
        Answer::create(['question_id' => $q3->id, 'text' => 'Citosol', 'is_correct' => true]);
        Answer::create(['question_id' => $q3->id, 'text' => 'Núcleo', 'is_correct' => false]);
        Answer::create(['question_id' => $q3->id, 'text' => 'Aparato de Golgi', 'is_correct' => false]);
    }
}

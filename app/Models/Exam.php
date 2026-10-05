<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;

#[Fillable(['enrollment_id', 'quiz_id', 'score', 'started_at', 'finished_at', 'status', 'answers_snapshot'])]
class Exam extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'examenes';

    protected $legacyMapping = [
        'enrollment_id' => 'inscripcion_id',
        'quiz_id' => 'prueba_id',
        'score' => 'score_total',
        'answers_snapshot' => 'respuestas_json',
        'status' => 'finalizado',
        'started_at' => 'created_at',
        'finished_at' => 'updated_at',
        'feedback_enabled' => 'retro_visualizado',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'answers_snapshot' => 'json',
        'eventos' => 'json',
    ];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class, 'inscripcion_id');
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class, 'prueba_id');
    }

    // Alias para compatibilidad con código legacy
    public function Prueba()
    {
        return $this->belongsTo(Quiz::class, 'prueba_id');
    }

    public function Inscripcion()
    {
        return $this->belongsTo(Enrollment::class, 'inscripcion_id');
    }
}

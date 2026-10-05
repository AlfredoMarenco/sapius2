<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;

#[Fillable(['user_id', 'scheduled_course_id', 'curso_programado_id', 'status', 'aceptado', 'tipo_pago', 'enrolled_at', 'referencia', 'clave'])]
class Enrollment extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'inscripciones';

    protected $legacyMapping = [
        'scheduled_course_id' => 'curso_programado_id',
        'status' => 'aceptado',
        // 'enrolled_at' maps to 'created_at', we don't strictly need a separate mapping if we just use created_at, but let's map it:
        'enrolled_at' => 'created_at',
    ];


    protected $casts = [
        'enrolled_at' => 'datetime',
    ];


    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function scheduledCourse()
    {
        return $this->belongsTo(ScheduledCourse::class, 'curso_programado_id');
    }

    public function exams()
    {
        return $this->hasMany(Exam::class, 'inscripcion_id');
    }
}

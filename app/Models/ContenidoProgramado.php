<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContenidoProgramado extends Model
{
    protected $table = 'contenidos_programados';

    protected $guarded = ['id'];

    protected $casts = [
        'contenido' => 'array',
    ];

    public function scheduledCourse()
    {
        return $this->belongsTo(ScheduledCourse::class, 'curso_programado_id');
    }
}

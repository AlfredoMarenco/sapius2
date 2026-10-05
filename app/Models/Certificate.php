<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'curso_programado_id',
        'codigo_validacion',
        'fecha_emision',
    ];

    protected $casts = [
        'fecha_emision' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scheduledCourse()
    {
        return $this->belongsTo(ScheduledCourse::class, 'curso_programado_id');
    }
}

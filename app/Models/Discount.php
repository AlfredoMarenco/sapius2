<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    use HasFactory;

    protected $table = 'descuentos';

    protected $fillable = [
        'clave',
        'descuento',
        'limite',
        'curso_programado_id',
        'activo',
    ];

    public function scheduledCourse()
    {
        return $this->belongsTo(ScheduledCourse::class, 'curso_programado_id');
    }
}

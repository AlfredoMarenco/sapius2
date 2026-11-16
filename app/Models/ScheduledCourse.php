<?php

namespace App\Models;

use App\Concerns\MapsLegacyAttributes;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['course_id', 'category_id', 'instructor_id', 'start_date', 'end_date', 'fecha_inicio_venta', 'fecha_fin_venta', 'price', 'internal_id', 'is_active'])]
class ScheduledCourse extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'cursos_programados';

    protected $legacyMapping = [
        'course_id' => 'curso_id',
        'instructor_id' => 'user_id',
        'start_date' => 'fecha_inicio',
        'end_date' => 'fecha_fin',
        'price' => 'precio',
        'internal_id' => 'identificador',
        'is_active' => 'activo',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'fecha_inicio' => 'datetime',
            'fecha_fin' => 'datetime',
            'fecha_inicio_venta' => 'datetime',
            'fecha_fin_venta' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'curso_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'curso_programado_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'inscripciones', 'curso_programado_id', 'user_id')
            ->withPivot('id', 'aceptado', 'created_at');
    }
}

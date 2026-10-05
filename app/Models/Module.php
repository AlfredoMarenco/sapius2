<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;
use Illuminate\Database\Eloquent\Builder;

#[Fillable(['course_id', 'title', 'slug', 'image', 'description', 'position', 'is_active', 'is_scheduled', 'available_at', 'expires_at'])]
class Module extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'lecciones'; // In the legacy DB, modules are stored as parent lecciones (leccion_id = 0)

    protected $legacyMapping = [
        'course_id' => 'curso_id',
        'title' => 'titulo',
        'image' => 'imagen',
        'description' => 'resumen',
        'position' => 'posicion',
        'is_active' => 'activo',
    ];

    protected static function booted()
    {
        static::addGlobalScope('module', function (Builder $builder) {
            $builder->where(function ($q) {
                $q->where('leccion_id', 0)
                  ->orWhereNull('leccion_id');
            });
        });
    }

    protected function casts(): array
    {
        return [
            'available_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_scheduled' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'curso_id');
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class, 'leccion_id')->orderBy('posicion');
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class, 'leccion_id');
    }
}

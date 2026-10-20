<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;
use Illuminate\Database\Eloquent\Builder;

#[Fillable(['course_id', 'title', 'slug', 'image', 'description', 'position', 'is_active'])]
class Module extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'lecciones'; // In the legacy DB, modules are stored as parent lecciones (leccion_id = 0)

    protected $appends = ['is_scheduled', 'available_at', 'expires_at'];

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

        static::creating(function ($module) {
            if (is_null($module->leccion_id)) {
                $module->leccion_id = 0;
            }
            if (empty($module->activo)) {
                $module->activo = 'si';
            }
        });
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function getIsScheduledAttribute(): bool
    {
        return false;
    }

    public function getAvailableAtAttribute(): ?string
    {
        return null;
    }

    public function getExpiresAtAttribute(): ?string
    {
        return null;
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

    public function media()
    {
        return $this->hasMany(Media::class, 'leccion_id');
    }
}

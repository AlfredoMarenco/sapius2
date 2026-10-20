<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;
use Illuminate\Database\Eloquent\Builder;

#[Fillable(['course_id', 'module_id', 'title', 'slug', 'image', 'content', 'summary', 'position', 'is_active'])]
class Lesson extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'lecciones'; // In legacy DB, lessons are stored here with leccion_id > 0

    protected $appends = ['is_scheduled', 'available_at', 'expires_at'];

    protected $legacyMapping = [
        'course_id' => 'curso_id',
        'module_id' => 'leccion_id',
        'title' => 'titulo',
        'image' => 'imagen',
        'content' => 'contenido',
        'summary' => 'resumen',
        'position' => 'posicion',
        'is_active' => 'activo',
    ];

    protected static function booted()
    {
        static::addGlobalScope('lesson', function (Builder $builder) {
            $builder->where('leccion_id', '>', 0);
        });

        static::creating(function ($lesson) {
            if (empty($lesson->curso_id) && !empty($lesson->leccion_id)) {
                $module = Module::withoutGlobalScopes()->find($lesson->leccion_id);
                if ($module) {
                    $lesson->curso_id = $module->curso_id;
                }
            }
            if (empty($lesson->activo)) {
                $lesson->activo = 'si';
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

    public function module()
    {
        return $this->belongsTo(Module::class, 'leccion_id');
    }

    public function media()
    {
        return $this->hasMany(Media::class, 'leccion_id');
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class, 'leccion_id');
    }

    public function homeworkAssignments()
    {
        return $this->hasMany(Homework::class, 'leccion_id');
    }

    public function interactivePdfs()
    {
        return $this->hasMany(InteractivePdf::class, 'leccion_id');
    }
}

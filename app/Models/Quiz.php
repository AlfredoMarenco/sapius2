<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;

#[Fillable(['course_id', 'lesson_id', 'title', 'description', 'type', 'time_limit', 'attempts_allowed', 'is_active'])]
class Quiz extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'pruebas';

    protected $appends = ['is_scheduled', 'available_at', 'expires_at', 'passing_score'];

    protected $legacyMapping = [
        'course_id' => 'curso_id',
        'lesson_id' => 'leccion_id',
        'title' => 'titulo',
        'description' => 'descripcion',
        'type' => 'tipo',
        'time_limit' => 'tiempo',
        'attempts_allowed' => 'oportunidades',
        'is_active' => 'activo',
    ];

    protected static function booted()
    {
        static::creating(function ($quiz) {
            if (empty($quiz->curso_id) && !empty($quiz->leccion_id)) {
                $lesson = Lesson::withoutGlobalScopes()->find($quiz->leccion_id);
                if ($lesson) {
                    $quiz->curso_id = $lesson->curso_id;
                }
            }
            if (empty($quiz->activo)) {
                $quiz->activo = 'si';
            }
            if (empty($quiz->tipo)) {
                $quiz->tipo = 'EXANI';
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

    public function getPassingScoreAttribute(): int
    {
        return 70;
    }
    
    public function course()
    {
        return $this->belongsTo(Course::class, 'curso_id');
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'leccion_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'prueba_id');
    }
}

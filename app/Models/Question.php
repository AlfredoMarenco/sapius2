<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;

#[Fillable(['quiz_id', 'text', 'image', 'points', 'explanation', 'is_active'])]
class Question extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'preguntas';

    protected $legacyMapping = [
        'quiz_id' => 'prueba_id',
        'text' => 'pregunta',
        'image' => 'imagen',
        'points' => 'score',
        'explanation' => 'opciones',
        'is_active' => 'activo',
    ];

    protected static function booted()
    {
        static::creating(function ($question) {
            if (empty($question->activo)) {
                $question->activo = 'si';
            }
            if (empty($question->slug)) {
                $question->slug = \Illuminate\Support\Str::slug(\Illuminate\Support\Str::limit($question->pregunta ?? 'pregunta', 50)) . '-' . rand(1000, 9999);
            }
        });
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class, 'prueba_id');
    }

    public function answers()
    {
        return $this->hasMany(Answer::class, 'pregunta_id');
    }
}

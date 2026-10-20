<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;

#[Fillable(['question_id', 'text', 'is_correct', 'position', 'image', 'is_active'])]
class Answer extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'respuestas';

    protected $legacyMapping = [
        'question_id' => 'pregunta_id',
        'text' => 'respuesta',
        'is_correct' => 'correcto',
        'position' => 'posicion',
        'image' => 'imagen',
        'is_active' => 'activo',
    ];

    protected static function booted()
    {
        static::creating(function ($answer) {
            if (empty($answer->activo)) {
                $answer->activo = 'si';
            }
            if (is_null($answer->correcto)) {
                $answer->correcto = 0;
            }
            if (empty($answer->posicion)) {
                $answer->posicion = 1;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'is_correct' => 'boolean',
        ];
    }

    public function question()
    {
        return $this->belongsTo(Question::class, 'pregunta_id');
    }
}

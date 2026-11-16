<?php

namespace App\Models;

use App\Concerns\MapsLegacyAttributes;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['question_id', 'text', 'is_correct', 'position', 'image', 'is_active'])]
#[Hidden(['correcto', 'is_correct'])]
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
            'is_active' => 'boolean',
        ];
    }

    public function question()
    {
        return $this->belongsTo(Question::class, 'pregunta_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;

#[Fillable(['question_id', 'text', 'is_correct'])]
class Answer extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'respuestas';

    protected $legacyMapping = [
        'question_id' => 'pregunta_id',
        'text' => 'respuesta',
        'is_correct' => 'correcto',
    ];

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

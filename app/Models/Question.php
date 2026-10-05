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
        'is_active' => 'activo',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class, 'prueba_id');
    }

    public function answers()
    {
        return $this->hasMany(Answer::class, 'pregunta_id');
    }
}

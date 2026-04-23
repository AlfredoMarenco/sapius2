<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['lesson_id', 'title', 'description', 'type', 'time_limit', 'attempts_allowed', 'passing_score', 'is_active', 'is_scheduled', 'available_at', 'expires_at'])]
class Quiz extends Model
{
    protected function casts(): array
    {
        return [
            'available_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_scheduled' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
    
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}

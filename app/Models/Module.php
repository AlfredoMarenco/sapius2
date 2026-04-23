<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['course_id', 'title', 'slug', 'image', 'description', 'position', 'is_active', 'is_scheduled', 'available_at', 'expires_at'])]
class Module extends Model
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

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('position');
    }
}

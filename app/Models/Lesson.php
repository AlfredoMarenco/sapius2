<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['module_id', 'title', 'slug', 'image', 'content', 'summary', 'position', 'is_active', 'is_scheduled', 'available_at', 'expires_at'])]
class Lesson extends Model
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

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function media()
    {
        return $this->hasMany(Media::class)->orderBy('position');
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function homeworkAssignments()
    {
        return $this->hasMany(HomeworkAssignment::class);
    }
}

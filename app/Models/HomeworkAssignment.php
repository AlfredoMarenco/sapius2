<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeworkAssignment extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'points',
        'is_active',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function submissions()
    {
        return $this->hasMany(HomeworkSubmission::class);
    }
}

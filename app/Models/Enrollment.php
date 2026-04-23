<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'scheduled_course_id', 'status', 'enrolled_at'])]
class Enrollment extends Model
{
    protected $casts = [
        'enrolled_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scheduledCourse()
    {
        return $this->belongsTo(ScheduledCourse::class);
    }

    public function exams()
    {
        return $this->hasMany(Exam::class);
    }
}

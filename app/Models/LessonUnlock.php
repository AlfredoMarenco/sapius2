<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LessonUnlock extends Model
{
    protected $table = 'lesson_unlocks';

    protected $fillable = [
        'user_id',
        'curso_programado_id',
        'leccion_id',
        'until_date',
    ];

    protected $casts = [
        'until_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scheduledCourse()
    {
        return $this->belongsTo(ScheduledCourse::class, 'curso_programado_id');
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'leccion_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['enrollment_id', 'quiz_id', 'score', 'started_at', 'finished_at', 'status', 'answers_snapshot'])]
class Exam extends Model
{
    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'answers_snapshot' => 'json',
    ];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}

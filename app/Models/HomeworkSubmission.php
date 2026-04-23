<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeworkSubmission extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'homework_assignment_id',
        'user_id',
        'file_path',
        'grade',
        'feedback',
        'status',
    ];

    public function assignment()
    {
        return $this->belongsTo(HomeworkAssignment::class, 'homework_assignment_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

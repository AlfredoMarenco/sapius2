<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Homework extends Model
{
    protected $table = 'homework';

    protected $fillable = [
        'leccion_id',
        'is_late',
        'user_id',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'leccion_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

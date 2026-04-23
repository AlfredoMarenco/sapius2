<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingReview extends Model
{
    protected $fillable = ['user_name', 'content', 'rating', 'course_id'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}

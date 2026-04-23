<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'category_id', 'title', 'slug', 'description', 'image', 'is_active'])]
class Course extends Model
{
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class)->orderBy('position');
    }

    public function scheduledCourses()
    {
        return $this->hasMany(ScheduledCourse::class);
    }
}

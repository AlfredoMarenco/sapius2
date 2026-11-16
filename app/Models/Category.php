<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'slug'])]
class Category extends Model
{
    public function scheduledCourses()
    {
        return $this->hasMany(ScheduledCourse::class, 'category_id');
    }
}

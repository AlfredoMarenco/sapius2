<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['lesson_id', 'title', 'file_path', 'file_type', 'is_downloadable', 'position', 'is_active'])]
class Media extends Model
{
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}

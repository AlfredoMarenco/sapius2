<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgrammingCalendar extends Model
{
    protected $table = 'programming_calendars';

    protected $fillable = [
        'curso_id',
        'image_path',
        'start_date',
        'end_date',
        'group_name',
        'position',
    ];
    
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'curso_id');
    }
}

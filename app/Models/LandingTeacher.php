<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingTeacher extends Model
{
    protected $fillable = ['name', 'description', 'img', 'position', 'active'];
}

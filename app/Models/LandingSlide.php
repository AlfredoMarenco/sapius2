<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingSlide extends Model
{
    protected $fillable = ['title', 'img', 'section', 'position', 'active'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPride extends Model
{
    protected $fillable = ['name', 'text', 'text2', 'img', 'position', 'active'];
}

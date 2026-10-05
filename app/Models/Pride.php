<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pride extends Model
{
    protected $table = 'prides';

    protected $fillable = [
        'img',
        'name',
        'text',
        'text2',
        'position',
    ];
}

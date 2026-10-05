<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FileGuia extends Model
{
    protected $fillable = ['url', 'curso_programado_id'];
}

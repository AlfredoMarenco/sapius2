<?php

namespace App\Models\Cursos;

use Illuminate\Database\Eloquent\Model;

class Respuesta extends Model
{
    protected $hidden = ['correcto'];

    public function Pregunta()
    {
        return $this->belongsTo('App\Models\Cursos\Pregunta');
    }
}

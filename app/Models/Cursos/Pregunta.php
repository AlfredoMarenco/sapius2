<?php

namespace App\Models\Cursos;

use Illuminate\Database\Eloquent\Model;

class Pregunta extends Model
{
    protected $fillable = [
        'prueba_id',
        'slug',
        'pregunta',
        'imagen',
        'score',
        'opciones',
        'activo',
    ];

    public function Respuestas()
    {
        return $this->hasMany('App\Models\Cursos\Respuesta');
    }

    public function GrupoPreguntas()
    {
        return $this->hasMany('App\Models\Cursos\Pregunta', 'slug', 'slug')
            ->where('activo', '=', 'si');
    }
}

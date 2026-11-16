<?php

namespace App\Models\Registro;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Inscripcion extends Model
{
    protected $table = 'inscripciones';

    public function Inscritos()
    {
        return $this->hasMany(User::class, 'id', 'user_id');
    }

    public function CursoProgramado()
    {
        return $this->belongsTo('App\Models\Registro\CursoProgramado', 'curso_programado_id', 'id');
    }

    // Relacion con user
    public function User()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}

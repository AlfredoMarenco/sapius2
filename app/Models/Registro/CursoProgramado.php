<?php

namespace App\Models\Registro;

use App\Models\FileGuia;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class CursoProgramado extends Model
{
    protected $table = 'cursos_programados';

    public function instructor()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function Curso()
    {
        return $this->belongsTo('App\Models\Cursos\Curso');
    }

    public function getPrecioEnMonedaAttribute()
    {
        // return money_format('%i', (float)$this->attributes['precio']);
        return number_format($this->attributes['precio'], 2);
    }

    public function Inscritos()
    {
        return $this->belongsToMany(User::class, 'inscripciones', 'curso_programado_id', 'user_id')
            ->withPivot(['created_at', 'aceptado', 'id']);
    }

    public function category()
    {
        return $this->belongsTo('App\Models\Cursos\Category', 'category_id', 'id');
    }

    // Relacion con file_guia 1 a 1
    public function file_guia()
    {
        return $this->hasOne(FileGuia::class, 'curso_programado_id', 'id');
    }

    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope('Activos', function (Builder $builder) {
            $builder->where('activo', 'si');
        });
    }
}

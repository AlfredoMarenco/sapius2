<?php

namespace App\Models;

use App\Concerns\MapsLegacyAttributes;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'title', 'slug', 'description', 'image', 'is_active'])]
class Course extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'cursos';

    protected $legacyMapping = [
        'title' => 'titulo',
        'description' => 'descripcion',
        'image' => 'imagen',
        'is_active' => 'activo',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->hasOneThrough(
            Category::class,
            ScheduledCourse::class,
            'curso_id',
            'id',
            'id',
            'category_id'
        );
    }

    public function modules()
    {
        return $this->hasMany(Module::class, 'curso_id')->orderBy('posicion');
    }

    public function scheduledCourses()
    {
        return $this->hasMany(ScheduledCourse::class, 'curso_id');
    }
}

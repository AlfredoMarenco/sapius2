<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;

#[Fillable(['user_id', 'category_id', 'title', 'slug', 'description', 'image', 'is_active'])]
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
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

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;
use Illuminate\Database\Eloquent\Builder;

#[Fillable(['module_id', 'title', 'slug', 'image', 'content', 'summary', 'position', 'is_active', 'is_scheduled', 'available_at', 'expires_at'])]
class Lesson extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'lecciones'; // In legacy DB, lessons are stored here with leccion_id > 0

    protected $legacyMapping = [
        'module_id' => 'leccion_id',
        'title' => 'titulo',
        'image' => 'imagen',
        'content' => 'contenido',
        'summary' => 'resumen',
        'position' => 'posicion',
        'is_active' => 'activo',
    ];

    protected static function booted()
    {
        static::addGlobalScope('lesson', function (Builder $builder) {
            $builder->where('leccion_id', '>', 0);
        });
    }

    protected function casts(): array
    {
        return [
            'available_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_scheduled' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function module()
    {
        return $this->belongsTo(Module::class, 'leccion_id');
    }

    public function media()
    {
        return $this->hasMany(Media::class, 'leccion_id');
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class, 'leccion_id');
    }

    public function homeworkAssignments()
    {
        return $this->hasMany(Homework::class, 'leccion_id');
    }

    public function interactivePdfs()
    {
        return $this->hasMany(InteractivePdf::class, 'leccion_id');
    }
}

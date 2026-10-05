<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;

#[Fillable(['lesson_id', 'title', 'file_path', 'file_type', 'is_downloadable', 'position', 'is_active'])]
class Media extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'media';

    protected $legacyMapping = [
        'lesson_id' => 'leccion_id',
        'file_path' => 'ruta',
        'file_type' => 'tipo',
        'is_downloadable' => 'downloadable',
        'is_active' => 'activo',
    ];

    protected function casts(): array
    {
        return [
            'is_downloadable' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'leccion_id');
    }
}

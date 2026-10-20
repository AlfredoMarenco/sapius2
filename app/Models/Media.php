<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

use App\Concerns\MapsLegacyAttributes;

#[Fillable(['lesson_id', 'leccion_id', 'file_path', 'ruta', 'file_type', 'tipo', 'is_downloadable', 'downloadable', 'position', 'is_active', 'activo', 'programable'])]
class Media extends Model
{
    use MapsLegacyAttributes;

    protected $table = 'media';

    protected $appends = ['title'];

    protected $legacyMapping = [
        'lesson_id' => 'leccion_id',
        'file_path' => 'ruta',
        'file_type' => 'tipo',
        'is_downloadable' => 'downloadable',
        'is_active' => 'activo',
    ];

    protected static function booted()
    {
        static::creating(function ($media) {
            if (empty($media->programable)) {
                $media->programable = 'no';
            }
            if (empty($media->activo)) {
                $media->activo = 'si';
            }
            if (is_null($media->downloadable)) {
                $media->downloadable = 0;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'is_downloadable' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function getTitleAttribute(): string
    {
        if (!empty($this->attributes['ruta'])) {
            $path = parse_url($this->attributes['ruta'], PHP_URL_PATH) ?? $this->attributes['ruta'];
            $name = basename($path);
            if (str_contains($this->attributes['ruta'], 'watch?v=')) {
                return 'Video de YouTube';
            }
            return $name ?: 'Recurso';
        }
        return 'Recurso';
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'leccion_id');
    }
}

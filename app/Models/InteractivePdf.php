<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InteractivePdf extends Model
{
    protected $table = 'material_pdfs';

    protected $fillable = [
        'leccion_id',
        'titulo',
        'file_path',
        'fields_config',
    ];

    protected $casts = [
        'fields_config' => 'array',
    ];

    protected $appends = [
        'allow_download',
    ];

    public function getAllowDownloadAttribute(): bool
    {
        return !empty($this->fields_config['allow_download']);
    }

    public function setAllowDownloadAttribute($value): void
    {
        $config = $this->fields_config ?? [];
        $config['allow_download'] = (bool) $value;
        $this->fields_config = $config;
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'leccion_id');
    }

    public function answers()
    {
        return $this->hasMany(InteractivePdfAnswer::class, 'material_pdf_id');
    }
}

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
        'allow_download'
    ];

    protected $casts = [
        'fields_config' => 'array',
        'allow_download' => 'boolean'
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'leccion_id');
    }

    public function answers()
    {
        return $this->hasMany(InteractivePdfAnswer::class, 'material_pdf_id');
    }
}

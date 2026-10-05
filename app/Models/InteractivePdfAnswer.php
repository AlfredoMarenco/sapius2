<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InteractivePdfAnswer extends Model
{
    protected $table = 'alumno_pdf_respuestas';

    protected $fillable = [
        'user_id',
        'material_pdf_id',
        'respuestas'
    ];

    protected $casts = [
        'respuestas' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function interactivePdf()
    {
        return $this->belongsTo(InteractivePdf::class, 'material_pdf_id');
    }
}

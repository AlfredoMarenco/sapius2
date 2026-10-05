<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManageableGuiaNutrition extends Model
{
    protected $fillable = ['image', 'titulo', 'descripcion', 'type', 'category', 'position'];
}
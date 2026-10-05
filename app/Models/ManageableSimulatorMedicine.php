<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManageableSimulatorMedicine extends Model
{
    protected $fillable = ['image', 'titulo', 'descripcion', 'type', 'category', 'position'];
}
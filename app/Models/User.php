<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Concerns\HasTeams;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use App\Concerns\HasShinobiRoles;

use App\Concerns\MapsLegacyAttributes;

#[Fillable([
    'first_name',
    'last_name',
    'username',
    'email',
    'password',
    'phone',
    'photo',
    'id_folio',
    'university',
    'document_id',
    'entry_pass',
    'specialty',
    'strikes',
    'is_blocked',
    'is_active',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasShinobiRoles, MapsLegacyAttributes;

    protected $legacyMapping = [
        'first_name' => 'nombre',
        'last_name' => 'apellido',
        'phone' => 'telefono',
        'photo' => 'foto',
        'id_folio' => 'folio',
        'university' => 'universidad_procedencia',
        'document_id' => 'documento_identificacion',
        'entry_pass' => 'pase_ingreso',
        'specialty' => 'especialidad',
        'is_active' => 'activo',
        // username, email, password, strikes, is_blocked are same
    ];
    protected $appends = ['name', 'role'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_blocked' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getNameAttribute()
    {
        return $this->first_name;
    }

    public function getRoleAttribute()
    {
        $role = $this->roles->first();
        if (!$role) {
            return 'alumno';
        }
        return strtolower($role->slug ?? $role->name);
    }

    /**
     * Courses authored by this user (if instructor/admin)
     */
    public function authoredCourses()
    {
        return $this->hasMany(Course::class);
    }

    /**
     * Enrollments for this user (student)
     */
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function homeworkSubmissions()
    {
        return $this->hasMany(HomeworkSubmission::class);
    }
}

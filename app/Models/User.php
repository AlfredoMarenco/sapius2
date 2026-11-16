<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Concerns\HasShinobiRoles;
use App\Concerns\MapsLegacyAttributes;
use App\Models\Cursos\Leccion;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Schema;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable([
    'name',
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
    'fecha_sustentacion',
    'validado',
])]
#[Hidden([
    'password',
    'two_factor_secret',
    'two_factor_recovery_codes',
    'remember_token',
    'api_token',
    'mac_address',
    'pending_mac_address',
    'session_id',
    'documento_identificacion',
    'document_id',
    'pase_ingreso',
    'entry_pass',
])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasShinobiRoles, MapsLegacyAttributes, Notifiable, TwoFactorAuthenticatable;

    protected $legacyMapping = [
        'name' => 'nombre',
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

    protected $appends = ['name', 'role', 'nombre_completo'];

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            $table = $user->getTable();
            if (empty($user->activo) && Schema::hasColumn($table, 'activo')) {
                $user->activo = 'si';
            }
            if (is_null($user->strikes) && Schema::hasColumn($table, 'strikes')) {
                $user->strikes = 0;
            }
            if (is_null($user->is_blocked) && Schema::hasColumn($table, 'is_blocked')) {
                $user->is_blocked = false;
            }
        });
    }

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
            'strikes' => 'integer',
            'is_blocked' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getNombreCompletoAttribute(): string
    {
        $first = $this->attributes['nombre'] ?? $this->first_name ?? '';
        $last = $this->attributes['apellido'] ?? $this->last_name ?? '';

        return trim("{$first} {$last}");
    }

    public function getNameAttribute()
    {
        return $this->first_name;
    }

    public function getRoleAttribute(): string
    {
        $roles = $this->relationLoaded('roles') ? $this->getRelation('roles') : $this->roles()->get();
        $role = $roles->first();
        if (! $role) {
            return 'alumno';
        }

        return strtolower($role->slug ?? $role->name);
    }

    public function getRolAttribute()
    {
        return $this->relationLoaded('roles') ? $this->getRelation('roles') : $this->roles()->get();
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
        return $this->hasMany(Homework::class, 'user_id');
    }

    public function completedLessons()
    {
        return $this->belongsToMany(Leccion::class, 'leccion_user', 'user_id', 'leccion_id')
            ->withPivot('curso_programado_id', 'completed_at');
    }
}

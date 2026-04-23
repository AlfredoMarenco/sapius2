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
use Spatie\Permission\Traits\HasRoles;

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
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

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
        return $this->roles->first()?->name ?? 'student';
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

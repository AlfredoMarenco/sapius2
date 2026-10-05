<?php

namespace App\Concerns;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasShinobiRoles
{
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class)->withTimestamps();
    }

    public function hasRole($roleSlug)
    {
        if (is_string($roleSlug)) {
            return $this->roles->contains('slug', $roleSlug);
        }
        
        if (is_array($roleSlug)) {
            return $this->roles->pluck('slug')->intersect($roleSlug)->isNotEmpty();
        }

        return false;
    }

    public function hasPermissionTo($permissionSlug)
    {
        return $this->hasPermissionThroughRole($permissionSlug) || $this->hasDirectPermission($permissionSlug);
    }

    protected function hasPermissionThroughRole($permissionSlug)
    {
        foreach ($this->roles as $role) {
            if ($role->special === 'all-access') {
                return true;
            }
            if ($role->special === 'no-access') {
                return false;
            }

            if ($role->permissions->contains('slug', $permissionSlug)) {
                return true;
            }
        }
        return false;
    }

    protected function hasDirectPermission($permissionSlug)
    {
        return $this->permissions->contains('slug', $permissionSlug);
    }
}

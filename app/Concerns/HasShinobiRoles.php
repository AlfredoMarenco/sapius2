<?php

namespace App\Concerns;

use App\Models\Permission;
use App\Models\Role;
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
        if ($this->roles->contains('special', 'no-access')) {
            return false;
        }

        return $this->hasPermissionThroughRole($permissionSlug) || $this->hasDirectPermission($permissionSlug);
    }

    protected function hasPermissionThroughRole($permissionSlug)
    {
        if ($this->roles->contains('special', 'no-access')) {
            return false;
        }

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

    public function assignRole(string|int|Role $role): void
    {
        $roleId = $this->resolveRoleId($role);
        if ($roleId === null) {
            return;
        }

        $now = now();
        $this->roles()->syncWithoutDetaching([
            $roleId => [
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
        $this->unsetRelation('roles');
    }

    public function syncRoles(array $roleIds): void
    {
        $now = now();
        $normalized = [];

        foreach ($roleIds as $role) {
            $roleId = $this->resolveRoleId($role);
            if ($roleId !== null) {
                $normalized[$roleId] = [
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        $this->roles()->sync($normalized);
        $this->unsetRelation('roles');
    }

    protected function resolveRoleId(string|int|Role $role): ?int
    {
        if ($role instanceof Role) {
            return (int) $role->id;
        }

        if (is_int($role) || ctype_digit((string) $role)) {
            return (int) $role;
        }

        $foundId = Role::where('slug', $role)
            ->orWhere('name', $role)
            ->value('id');

        return $foundId ? (int) $foundId : null;
    }
}

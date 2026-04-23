<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Course;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Crear Roles
        $roleAdmin = Role::firstOrCreate(['name' => 'admin']);
        $roleInstructor = Role::firstOrCreate(['name' => 'instructor']);
        $roleStudent = Role::firstOrCreate(['name' => 'student']);

        // 1. Crear Usuario Admin
        $admin = User::firstOrCreate(['email' => 'admin@sapius.com'], [
            'first_name' => 'Admin',
            'last_name' => 'Sapius',
            'username' => 'admin_sapius',
            'email' => 'admin@sapius.com',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        $admin->assignRole($roleAdmin);

        // 2. Crear Usuario Estudiante
        $student = User::firstOrCreate(['email' => 'estudiante@sapius.com'], [
            'first_name' => 'Juan',
            'last_name' => 'Perez',
            'username' => 'juanperez',
            'email' => 'estudiante@sapius.com',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        $student->assignRole($roleStudent);

        // 3. Crear Categorías
        $catMedicina = Category::firstOrCreate(['slug' => 'medicina'], [
            'name' => 'Medicina',
            'slug' => 'medicina',
            'description' => 'Cursos relacionados con medicina y salud.',
        ]);

        $catDerecho = Category::firstOrCreate(['slug' => 'derecho'], [
            'name' => 'Derecho',
            'slug' => 'derecho',
            'description' => 'Cursos legales y de derecho.',
        ]);

        // 4. Crear Cursos de ejemplo
        Course::firstOrCreate(['slug' => 'medicina-interna-v2'], [
            'user_id' => $admin->id,
            'category_id' => $catMedicina->id,
            'title' => 'Medicina Interna V2',
            'slug' => 'medicina-interna-v2',
            'description' => 'Este es el curso de medicina interna actualizado para Sapius2.',
            'is_active' => true,
        ]);

        Course::firstOrCreate(['slug' => 'derecho-civil-v2'], [
            'user_id' => $admin->id,
            'category_id' => $catDerecho->id,
            'title' => 'Derecho Civil V2',
            'slug' => 'derecho-civil-v2',
            'description' => 'Fundamentos de Derecho Civil actualizados.',
            'is_active' => true,
        ]);
    }
}

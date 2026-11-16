<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Course;
use App\Models\Role;
use App\Models\ScheduledCourse;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Crear Roles (Shinobi legacy schema con slug)
        $roleAdmin = Role::firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Administrador', 'special' => 'all-access']
        );
        $roleInstructor = Role::firstOrCreate(
            ['slug' => 'instructor'],
            ['name' => 'Instructor']
        );
        $roleStudent = Role::firstOrCreate(
            ['slug' => 'alumno'],
            ['name' => 'Alumno']
        );

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

        // 2. Crear Usuario Instructor
        $instructor = User::firstOrCreate(['email' => 'instructor@sapius.com'], [
            'first_name' => 'Instructor',
            'last_name' => 'Sapius',
            'username' => 'instructor_sapius',
            'email' => 'instructor@sapius.com',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        $instructor->assignRole($roleInstructor);

        // 3. Crear Usuario Estudiante
        $student = User::firstOrCreate(['email' => 'estudiante@sapius.com'], [
            'first_name' => 'Juan',
            'last_name' => 'Perez',
            'username' => 'juanperez',
            'email' => 'estudiante@sapius.com',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        $student->assignRole($roleStudent);

        // 4. Crear Categorías (sin columna description en legacy)
        $catMedicina = Category::firstOrCreate(['slug' => 'medicina'], [
            'name' => 'Medicina',
            'slug' => 'medicina',
        ]);

        $catDerecho = Category::firstOrCreate(['slug' => 'derecho'], [
            'name' => 'Derecho',
            'slug' => 'derecho',
        ]);

        // 5. Crear Cursos de ejemplo y programar cohortes con su categoría
        $courseMed = Course::firstOrCreate(['slug' => 'medicina-interna-v2'], [
            'user_id' => $admin->id,
            'title' => 'Medicina Interna V2',
            'slug' => 'medicina-interna-v2',
            'description' => 'Este es el curso de medicina interna actualizado para Sapius2.',
            'is_active' => true,
        ]);

        ScheduledCourse::firstOrCreate(['identificador' => 'MED-V2-01'], [
            'curso_id' => $courseMed->id,
            'category_id' => $catMedicina->id,
            'user_id' => $instructor->id,
            'fecha_inicio' => now(),
            'fecha_fin' => now()->addMonths(6),
            'precio' => 2500.00,
            'activo' => 'si',
        ]);

        $courseDer = Course::firstOrCreate(['slug' => 'derecho-civil-v2'], [
            'user_id' => $admin->id,
            'title' => 'Derecho Civil V2',
            'slug' => 'derecho-civil-v2',
            'description' => 'Fundamentos de Derecho Civil actualizados.',
            'is_active' => true,
        ]);

        ScheduledCourse::firstOrCreate(['identificador' => 'DER-V2-01'], [
            'curso_id' => $courseDer->id,
            'category_id' => $catDerecho->id,
            'user_id' => $instructor->id,
            'fecha_inicio' => now(),
            'fecha_fin' => now()->addMonths(6),
            'precio' => 2500.00,
            'activo' => 'si',
        ]);
    }
}

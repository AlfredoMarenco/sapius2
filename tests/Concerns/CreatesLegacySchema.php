<?php

namespace Tests\Concerns;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

trait CreatesLegacySchema
{
    protected function setUpLegacySchema(): void
    {
        if (! Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('nombre')->nullable();
                $table->string('apellido')->nullable();
                $table->string('username')->unique()->nullable();
                $table->string('email')->unique();
                $table->string('password');
                $table->string('foto')->nullable();
                $table->string('telefono')->nullable();
                $table->string('folio')->nullable();
                $table->string('universidad_procedencia')->nullable();
                $table->string('documento_identificacion')->nullable();
                $table->string('pase_ingreso')->nullable();
                $table->string('especialidad')->nullable();
                $table->date('fecha_sustentacion')->nullable();
                $table->string('validado')->default('no');
                $table->integer('strikes')->default(0);
                $table->boolean('is_blocked')->default(false);
                $table->string('activo')->default('si');
                $table->string('api_token')->nullable();
                $table->string('mac_address')->nullable();
                $table->string('pending_mac_address')->nullable();
                $table->string('session_id')->nullable();
                $table->rememberToken();
                $table->timestamp('email_verified_at')->nullable();
                $table->text('two_factor_secret')->nullable();
                $table->text('two_factor_recovery_codes')->nullable();
                $table->timestamp('two_factor_confirmed_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('password_resets')) {
            Schema::create('password_resets', function (Blueprint $table) {
                $table->string('email')->index();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        if (! Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('special')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('role_user')) {
            Schema::create('role_user', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('role_id');
                $table->unsignedBigInteger('user_id');
                $table->timestamps();
            });
        }
    }

    protected function setUpAcademicSchema(): void
    {
        $this->setUpLegacySchema();

        if (! Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->nullable();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('cursos')) {
            Schema::create('cursos', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('titulo');
                $table->string('slug')->nullable();
                $table->text('descripcion')->nullable();
                $table->string('imagen')->nullable();
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('cursos_programados')) {
            Schema::create('cursos_programados', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->unsignedBigInteger('category_id')->nullable();
                $table->string('identificador')->nullable();
                $table->decimal('precio', 10, 2)->default(0.00);
                $table->dateTime('fecha_inicio')->nullable();
                $table->dateTime('fecha_fin')->nullable();
                $table->dateTime('fecha_inicio_venta')->nullable();
                $table->dateTime('fecha_fin_venta')->nullable();
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('inscripciones')) {
            Schema::create('inscripciones', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('curso_programado_id');
                $table->string('aceptado')->default('no');
                $table->string('tipo_pago')->nullable();
                $table->string('referencia')->nullable();
                $table->string('clave')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('lecciones')) {
            Schema::create('lecciones', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id')->nullable();
                $table->unsignedBigInteger('leccion_id')->default(0);
                $table->string('titulo');
                $table->string('slug')->nullable();
                $table->string('imagen')->nullable();
                $table->text('contenido')->nullable();
                $table->text('resumen')->nullable();
                $table->integer('posicion')->default(1);
                $table->integer('orden')->default(1);
                $table->string('programable')->default('no');
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('leccion_user')) {
            Schema::create('leccion_user', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('leccion_id');
                $table->unsignedBigInteger('curso_programado_id')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('contenidos_programados')) {
            Schema::create('contenidos_programados', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_programado_id');
                $table->longText('contenido')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('lesson_unlocks')) {
            Schema::create('lesson_unlocks', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('curso_programado_id');
                $table->unsignedBigInteger('leccion_id');
                $table->dateTime('until_date')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('media')) {
            Schema::create('media', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('leccion_id');
                $table->string('ruta');
                $table->string('tipo')->default('pdf');
                $table->integer('downloadable')->default(0);
                $table->string('programable')->default('no');
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('homework')) {
            Schema::create('homework', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('leccion_id');
                $table->unsignedBigInteger('user_id');
                $table->boolean('is_late')->default(false);
                $table->string('file_path')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('pruebas')) {
            Schema::create('pruebas', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id')->nullable();
                $table->unsignedBigInteger('leccion_id')->nullable();
                $table->string('titulo');
                $table->text('descripcion')->nullable();
                $table->string('tipo')->default('EXANI');
                $table->string('tiempo')->nullable();
                $table->integer('oportunidades')->default(3);
                $table->integer('posicion')->default(1);
                $table->string('programable')->default('no');
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('preguntas')) {
            Schema::create('preguntas', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('prueba_id');
                $table->text('pregunta');
                $table->string('imagen')->nullable();
                $table->integer('score')->default(1);
                $table->text('opciones')->nullable();
                $table->string('slug')->nullable();
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('respuestas')) {
            Schema::create('respuestas', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('pregunta_id');
                $table->text('respuesta');
                $table->integer('correcto')->default(0);
                $table->integer('posicion')->default(1);
                $table->string('imagen')->nullable();
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('examenes')) {
            Schema::create('examenes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('inscripcion_id');
                $table->unsignedBigInteger('prueba_id');
                $table->integer('total_preguntas')->default(0);
                $table->integer('total_correctas')->default(0);
                $table->integer('aciertos')->default(0);
                $table->decimal('score_total', 8, 2)->default(0);
                $table->string('finalizado')->default('no');
                $table->string('retro_visualizado')->default('no');
                $table->boolean('is_late')->default(false);
                $table->longText('respuestas_json')->nullable();
                $table->longText('eventos')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('user_strike_histories')) {
            Schema::create('user_strike_histories', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('action');
                $table->text('details')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('descuentos')) {
            Schema::create('descuentos', function (Blueprint $table) {
                $table->id();
                $table->string('clave');
                $table->integer('descuento')->default(0);
                $table->integer('limite')->default(1);
                $table->unsignedBigInteger('curso_programado_id')->nullable();
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('material_pdfs')) {
            Schema::create('material_pdfs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('leccion_id');
                $table->string('titulo');
                $table->string('file_path');
                $table->longText('fields_config')->nullable();
                $table->boolean('allow_download')->default(false);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('alumno_pdf_respuestas')) {
            Schema::create('alumno_pdf_respuestas', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('material_pdf_id');
                $table->longText('respuestas')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->integer('rating')->default(0);
                $table->text('comment')->nullable();
                $table->boolean('visible')->default(false);
                $table->unsignedBigInteger('user_id')->nullable();
                $table->unsignedBigInteger('curso_programado_id')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('type');
                $table->morphs('notifiable');
                $table->text('data');
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('file_guias')) {
            Schema::create('file_guias', function (Blueprint $table) {
                $table->id();
                $table->string('url');
                $table->unsignedBigInteger('curso_programado_id');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('programming_calendars')) {
            Schema::create('programming_calendars', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id');
                $table->string('image_path')->nullable();
                $table->date('start_date')->nullable();
                $table->date('end_date')->nullable();
                $table->string('group_name')->nullable();
                $table->integer('position')->default(1);
                $table->timestamps();
            });
        }
    }

    protected function seedLegacyRoles(): void
    {
        Role::firstOrCreate(['slug' => 'admin'], [
            'name' => 'Administrador',
            'special' => 'all-access',
        ]);

        Role::firstOrCreate(['slug' => 'instructor'], [
            'name' => 'Instructor',
        ]);

        Role::firstOrCreate(['slug' => 'alumno'], [
            'name' => 'Alumno',
        ]);
    }

    protected function assignLegacyRole(User $user, string $slug): User
    {
        $this->seedLegacyRoles();
        $role = Role::where('slug', $slug)->firstOrFail();

        $now = now();
        DB::table('role_user')->updateOrInsert(
            ['role_id' => $role->id, 'user_id' => $user->id],
            ['created_at' => $now, 'updated_at' => $now]
        );

        return $user->load('roles');
    }
}

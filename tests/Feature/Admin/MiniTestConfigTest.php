<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use App\Services\MiniTestConfigService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MiniTestConfigTest extends TestCase
{
    protected Role $adminRole;

    protected Role $studentRole;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        $this->createMinimalSchema();
        $this->seedRoles();
    }

    protected function createMinimalSchema(): void
    {
        if (! Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('nombre')->nullable();
                $table->string('apellido')->nullable();
                $table->string('email')->unique();
                $table->string('username')->nullable();
                $table->string('password');
                $table->string('foto')->nullable();
                $table->string('telefono')->nullable();
                $table->string('folio')->nullable();
                $table->string('universidad_procedencia')->nullable();
                $table->string('documento_identificacion')->nullable();
                $table->string('pase_ingreso')->nullable();
                $table->string('especialidad')->nullable();
                $table->string('validado')->default('si');
                $table->integer('strikes')->default(0);
                $table->boolean('is_blocked')->default(false);
                $table->string('activo')->default('si');
                $table->rememberToken();
                $table->timestamp('email_verified_at')->nullable();
                $table->timestamp('two_factor_confirmed_at')->nullable();
                $table->timestamps();
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
                $table->string('identificador')->nullable();
                $table->decimal('precio', 10, 2)->default(0);
                $table->date('fecha_inicio')->nullable();
                $table->date('fecha_fin')->nullable();
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }
    }

    protected function seedRoles(): void
    {
        $this->adminRole = Role::create([
            'name' => 'Administrador',
            'slug' => 'admin',
            'special' => 'all-access',
        ]);

        $this->studentRole = Role::create([
            'name' => 'Alumno',
            'slug' => 'alumno',
        ]);
    }

    protected function createUserWithRole(Role $role): User
    {
        $user = User::create([
            'first_name' => 'Admin',
            'last_name' => 'Test',
            'email' => uniqid('user_').'@sapius.test',
            'username' => uniqid('usr_'),
            'password' => Hash::make('password'),
            'strikes' => 0,
            'is_blocked' => false,
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        DB::table('role_user')->insert([
            'role_id' => $role->id,
            'user_id' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $user->fresh();
    }

    public function test_default_mini_test_config_is_shared_on_public_landing(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->has('miniTestConfig.questions', 6)
                ->has('miniTestConfig.recommendations', 11)
                ->where('miniTestConfig.header.title', 'Encuentra tu opción ideal')
            );
    }

    public function test_guests_and_students_cannot_manage_mini_test_config(): void
    {
        $this->get('/admin/mini-test')->assertRedirect('/login');
        $this->post('/admin/mini-test', [])->assertRedirect('/login');

        $student = $this->createUserWithRole($this->studentRole);

        $this->actingAs($student)->get('/admin/mini-test')->assertRedirect('/dashboard');
        $this->actingAs($student)->post('/admin/mini-test', [])->assertRedirect('/dashboard');
        $this->actingAs($student)->post('/admin/mini-test/reset', [])->assertRedirect('/dashboard');
    }

    public function test_admin_can_view_update_and_reset_mini_test_config(): void
    {
        $admin = $this->createUserWithRole($this->adminRole);

        $this->actingAs($admin)
            ->get('/admin/mini-test')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Landing/MiniTest')
                ->has('config.questions', 6)
                ->has('config.recommendations', 11)
            );

        $customPayload = [
            'header' => [
                'badge' => 'Test Personalizado 2027',
                'title' => 'Descubre tu ruta ideal',
                'resultSubtitle' => 'Recomendación ajustada para ti',
            ],
            'questions' => [
                [
                    'id' => 'exam',
                    'title' => '¿Qué carrera presentas?',
                    'active' => true,
                    'options' => [
                        [
                            'id' => 'nutri',
                            'label' => 'Nutrición',
                            'helper' => 'EGEL Plus Nutrición',
                            'areaFilter' => 'nutricion',
                            'weights' => [],
                        ],
                        [
                            'id' => 'medi',
                            'label' => 'Medicina',
                            'helper' => 'EGEL Plus Medicina',
                            'areaFilter' => 'medicina',
                            'weights' => [],
                        ],
                    ],
                ],
                [
                    'id' => 'intensidad',
                    'title' => '¿Qué nivel de acompañamiento quieres?',
                    'active' => true,
                    'options' => [
                        [
                            'id' => 'completo',
                            'label' => 'Curso completo con asesorías',
                            'helper' => 'Acompañamiento total',
                            'areaFilter' => null,
                            'weights' => [
                                'custom_nutri_vip' => 5,
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'pregunta_oculta',
                    'title' => 'Pregunta desactivada temporalmente',
                    'active' => false,
                    'options' => [
                        [
                            'id' => 'opt_x',
                            'label' => 'Opción X',
                            'helper' => '',
                            'areaFilter' => null,
                            'weights' => [],
                        ],
                    ],
                ],
            ],
            'recommendations' => [
                [
                    'id' => 'custom_nutri_vip',
                    'area' => 'nutricion',
                    'priority' => 1,
                    'active' => true,
                    'badge' => 'EGEL Nutrición VIP',
                    'title' => 'Programa Especial Nutrición VIP',
                    'price' => '$6,200 MXN',
                    'oldPrice' => '$6,900 MXN',
                    'paymentNote' => 'Meses sin intereses',
                    'summary' => 'Preparación VIP adaptada.',
                    'includes' => ['Asesorías personalizadas', 'Simuladores ilimitados'],
                    'coursePageHref' => '/egel-plus-nutricion',
                    'keywords' => ['vip', 'nutricion'],
                    'purchaseMode' => 'buy',
                    'scheduledCourseId' => null,
                    'whatsappMessage' => 'Hola Sapius, quiero informes de Nutrición VIP.',
                ],
            ],
        ];

        $this->actingAs($admin)
            ->post('/admin/mini-test', $customPayload)
            ->assertRedirect()
            ->assertSessionHas('success');

        Storage::disk('local')->assertExists(MiniTestConfigService::CONFIG_PATH);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('miniTestConfig.header.title', 'Descubre tu ruta ideal')
                ->has('miniTestConfig.questions', 3)
                ->where('miniTestConfig.questions.2.active', false)
                ->where('miniTestConfig.recommendations.0.id', 'custom_nutri_vip')
            );

        $this->actingAs($admin)
            ->post('/admin/mini-test/reset')
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('miniTestConfig.header.title', 'Encuentra tu opción ideal')
                ->has('miniTestConfig.questions', 6)
                ->has('miniTestConfig.recommendations', 11)
            );
    }

    public function test_admin_cannot_save_config_without_any_active_question(): void
    {
        $admin = $this->createUserWithRole($this->adminRole);
        $defaults = MiniTestConfigService::getDefaultConfig();

        $defaults['questions'] = array_map(function (array $q): array {
            $q['active'] = false;

            return $q;
        }, $defaults['questions']);

        $this->actingAs($admin)
            ->post('/admin/mini-test', $defaults)
            ->assertSessionHasErrors('questions');
    }
}

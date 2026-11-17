<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicRedesignRoutesTest extends TestCase
{
    public function test_home_and_new_public_navigation_routes_render_successfully(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Welcome'));

        $this->get('/cursos')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/CoursesHub'));

        $this->get('/productos')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/ProductsHub'));

        $this->get('/preguntas-frecuentes')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/Faq'));

        $this->get('/grupos-y-paquetes')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/GroupsPackages'));

        $this->get('/nosotros')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/About'));

        $this->get('/orgullo-sapius')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/Pride'));

        $this->get('/contacto')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/Contact'));
    }

    public function test_egel_and_legacy_course_landing_routes_render_successfully(): void
    {
        $slugs = [
            'egel-plus-nutricion',
            'egel-plus-medicina',
            'egel-plus',
            'exani-1',
            'exani-2',
            'exani-3',
            'cursos-enarm',
            'cursos-presenciales',
        ];

        foreach ($slugs as $slug) {
            $this->get('/'.$slug)
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Public/CourseLanding')
                    ->where('slug', $slug)
                );
        }
    }

    public function test_guias_simuladores_and_legal_routes_render_successfully(): void
    {
        $this->get('/guias-nutricion')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/GuiasLanding')
                ->where('area', 'nutricion')
            );

        $this->get('/guias-medicina')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/GuiasLanding')
                ->where('area', 'medicina')
            );

        $this->get('/simuladores-nutricion')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/SimuladoresLanding')
                ->where('area', 'nutricion')
            );

        $this->get('/simuladores-medicina')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/SimuladoresLanding')
                ->where('area', 'medicina')
            );

        $this->get('/privacidad')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Legal')
                ->where('type', 'privacidad')
            );
    }
}

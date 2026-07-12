<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_request_form_stores_record(): void
    {
        $this->post('/demo-request', [
            'name'    => 'Koffi Mensah',
            'email'   => 'koffi@btpci.com',
            'company' => 'BTP Côte d\'Ivoire',
            'phone'   => '+225 07 00 00 00',
            'sector'  => 'BTP / Construction',
        ])->assertRedirect();

        $this->assertDatabaseHas('demo_requests', [
            'email' => 'koffi@btpci.com',
            'company' => 'BTP Côte d\'Ivoire',
            'status' => 'new',
        ]);
    }

    public function test_demo_request_requires_email(): void
    {
        $this->post('/demo-request', [
            'name' => 'Test',
            'company' => 'Test Corp',
        ])->assertSessionHasErrors('email');
    }
}

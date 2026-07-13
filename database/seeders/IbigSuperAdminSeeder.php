<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class IbigSuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();

        $user = User::updateOrCreate(
            ['email' => 'sa@ibigsoft.com'],
            [
                'company_id'        => $company?->id ?? 1,
                'name'              => 'IBIG SuperAdmin',
                'password'          => Hash::make('Ibig@2026!'),
                'email_verified_at' => now(),
                'locale'            => 'fr',
                'job_title'         => 'SuperAdmin IBIG Soft',
                'is_active'         => true,
            ]
        );

        $user->syncRoles(['ibig_superadmin']);
    }
}

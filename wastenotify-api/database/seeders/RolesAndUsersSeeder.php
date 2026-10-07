<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Ward;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesAndUsersSeeder extends Seeder
{
    public function run(): void
    {
        /*
         * 'contractor' is a scrap collector who buys recyclables from
         * residents. It is not a municipal role — it grants no access to the
         * corporation's queues, and on its own grants nothing at all until an
         * administrator approves the account's contractor profile.
         */
        foreach (['admin', 'staff', 'citizen', 'contractor'] as $role) {
            Role::findOrCreate($role, 'web');
        }

        /*
         * Wards are looked up from the imported official boundary data, never
         * hard-coded. Run `php artisan wards:import` first; without it these
         * users get a null ward and the UI says "No ward set" rather than
         * showing an invented one.
         *
         * Gandhipuram falls in ward 69 (Central Zone) by the CCMC 2024
         * boundaries — resolved from coordinates, not from memory.
         */
        $gandhipuram = Ward::containing(11.0168, 76.9558);

        $admin = User::updateOrCreate(
            ['email' => 'admin@wastenotify.com'],
            [
                'name' => 'CCMC Sanitation Admin',
                'phone' => '+919000000001',
                'password' => 'password',
                'ward_id' => $gandhipuram?->id,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );
        $admin->syncRoles(['admin']);

        $citizen = User::updateOrCreate(
            ['email' => 'demo@wastenotify.com'],
            [
                'name' => 'Ravi Kumar',
                'phone' => '+919876543210',
                'password' => 'password',
                'ward_id' => $gandhipuram?->id,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );
        $citizen->syncRoles(['citizen']);
    }
}

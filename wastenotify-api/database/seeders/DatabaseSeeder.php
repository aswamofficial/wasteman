<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Note: deliberately no WithoutModelEvents — Report::creating generates the
     * human-facing reference, and muting model events would leave it null.
     */
    public function run(): void
    {
        $this->call([
            SettingsSeeder::class,
            RolesAndUsersSeeder::class,
            ReportSeeder::class,
        ]);
    }
}

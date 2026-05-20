<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Ensure roles exist (migration seeds them, but guard against re-runs)
        $adminRoleId = \DB::table('roles')->where('name', 'admin')->value('id');

        if (!$adminRoleId) {
            $adminRoleId = \DB::table('roles')->insertGetId([
                'name'        => 'admin',
                'description' => 'Full system access',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // Create the default admin user (idempotent)
        \DB::table('users')->upsert(
            [
                'name'              => 'John Doe',
                'email'             => 'john.doe@swiftride.com',
                'password'          => Hash::make('Admin2026!'),
                'role_id'           => $adminRoleId,
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            ['email'],                               // conflict key
            ['name', 'password', 'role_id', 'updated_at'] // columns to update on conflict
        );
    }
}

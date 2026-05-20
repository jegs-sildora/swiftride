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
        $roles = [
            'admin' => 'Full system access',
            'dispatcher' => 'Manages booking schedules, customers, and dispatches',
            'mechanic' => 'Performs vehicle inspections and logs maintenance',
            'accountant' => 'Audits invoices, records payments, and issues VAT refunds',
        ];

        $roleIds = [];

        foreach ($roles as $name => $desc) {
            $id = \DB::table('roles')->where('name', $name)->value('id');
            if (!$id) {
                $id = \DB::table('roles')->insertGetId([
                    'name'        => $name,
                    'description' => $desc,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            } else {
                \DB::table('roles')->where('id', $id)->update([
                    'description' => $desc,
                    'updated_at'  => now(),
                ]);
            }
            $roleIds[$name] = $id;
        }

        $users = [
            [
                'name'              => 'John Doe',
                'email'             => 'john.doe@swiftride.com',
                'password'          => Hash::make('Admin2026!'),
                'role_id'           => $roleIds['admin'],
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Alice Dispatcher',
                'email'             => 'alice.dispatcher@swiftride.com',
                'password'          => Hash::make('Dispatcher2026!'),
                'role_id'           => $roleIds['dispatcher'],
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Bob Mechanic',
                'email'             => 'bob.mechanic@swiftride.com',
                'password'          => Hash::make('Mechanic2026!'),
                'role_id'           => $roleIds['mechanic'],
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Charlie Accountant',
                'email'             => 'charlie.accountant@swiftride.com',
                'password'          => Hash::make('Accountant2026!'),
                'role_id'           => $roleIds['accountant'],
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
        ];

        foreach ($users as $user) {
            \DB::table('users')->upsert(
                $user,
                ['email'],
                ['name', 'password', 'role_id', 'updated_at']
            );
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with PH realistic fleet data.
     */
    public function run(): void
    {
        $vehicles = [
            [
                'id' => 1,
                'make' => 'Toyota',
                'model' => 'Vios',
                'year' => 2022,
                'plate_number' => 'NGA-5821',
                'color' => 'Silver',
                'type' => 'car',
                'status' => 'available',
                'daily_rate' => 1500.00,
                'description' => 'Fuel-efficient subcompact sedan, perfect for city driving.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'make' => 'Mitsubishi',
                'model' => 'Innova',
                'year' => 2021,
                'plate_number' => 'NDO-8472',
                'color' => 'White',
                'type' => 'van',
                'status' => 'available',
                'daily_rate' => 2500.00,
                'description' => 'Spacious and comfortable 7-seater MPV, great for family trips.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'make' => 'Toyota',
                'model' => 'Fortuner',
                'year' => 2023,
                'plate_number' => 'NQC-3910',
                'color' => 'Gray',
                'type' => 'car',
                'status' => 'rented',
                'daily_rate' => 3500.00,
                'description' => 'Premium mid-size SUV, robust performance and elegant ride.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'make' => 'Nissan',
                'model' => 'NV350 Urvan',
                'year' => 2020,
                'plate_number' => 'CAT-9218',
                'color' => 'White',
                'type' => 'van',
                'status' => 'available',
                'daily_rate' => 3000.00,
                'description' => '15-seater utility passenger van, ideal for large group outings.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'make' => 'Isuzu',
                'model' => 'Elf',
                'year' => 2019,
                'plate_number' => 'RUI-4819',
                'color' => 'Blue',
                'type' => 'truck',
                'status' => 'maintenance',
                'daily_rate' => 4000.00,
                'description' => 'Light-duty commercial truck, excellent cargo capacity.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($vehicles as $v) {
            DB::table('vehicles')->updateOrInsert(['id' => $v['id']], $v);
        }

        // Maintenance log for Isuzu Elf (status: maintenance)
        DB::table('maintenance_logs')->updateOrInsert(
            ['id' => 1],
            [
                'vehicle_id' => 5,
                'description' => 'Routine 10,000 km PMS and engine tune-up.',
                'performed_by' => 'Rapide Auto Service Pasay',
                'status' => 'in_progress',
                'scheduled_at' => '2026-05-19 09:00:00',
                'completed_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}

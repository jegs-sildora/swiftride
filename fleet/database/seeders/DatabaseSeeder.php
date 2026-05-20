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
                'current_odometer' => 12500,
                'fuel_tank_capacity_liters' => 42.00,
                'insurance_policy_number' => 'INS-VIOS-9821',
                'insurance_expiry_date' => '2027-05-01',
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
                'current_odometer' => 32400,
                'fuel_tank_capacity_liters' => 55.00,
                'insurance_policy_number' => 'INS-INNO-8472',
                'insurance_expiry_date' => '2027-02-15',
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
                'current_odometer' => 45200,
                'fuel_tank_capacity_liters' => 80.00,
                'insurance_policy_number' => 'INS-FORT-3910',
                'insurance_expiry_date' => '2027-08-30',
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
                'current_odometer' => 68100,
                'fuel_tank_capacity_liters' => 65.00,
                'insurance_policy_number' => 'INS-NV35-9218',
                'insurance_expiry_date' => '2026-12-10',
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
                'current_odometer' => 112000,
                'fuel_tank_capacity_liters' => 100.00,
                'insurance_policy_number' => 'INS-ISUZ-4819',
                'insurance_expiry_date' => '2026-10-25',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($vehicles as $v) {
            DB::table('vehicles')->updateOrInsert(['id' => $v['id']], $v);
        }

        // Seeding Inspections
        $inspections = [
            [
                'id' => 1,
                'vehicle_id' => 1,
                'booking_id' => 1,
                'inspection_type' => 'checkout',
                'odometer_reading' => 12000,
                'fuel_level_percent' => 100.00,
                'body_damage_notes' => 'Minor scratch on rear bumper.',
                'interior_clean_status' => 'CLEAN',
                'safety_check_passed' => true,
                'inspector_id' => 2,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'id' => 2,
                'vehicle_id' => 1,
                'booking_id' => 1,
                'inspection_type' => 'checkin',
                'odometer_reading' => 12500,
                'fuel_level_percent' => 90.00,
                'body_damage_notes' => 'Rear bumper scratch remains same.',
                'interior_clean_status' => 'CLEAN',
                'safety_check_passed' => true,
                'inspector_id' => 2,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
        ];

        foreach ($inspections as $ins) {
            DB::table('vehicle_inspections')->updateOrInsert(['id' => $ins['id']], $ins);
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

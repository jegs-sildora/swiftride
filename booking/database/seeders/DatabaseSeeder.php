<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with PH realistic booking data.
     */
    public function run(): void
    {
        $bookings = [
            [
                'id' => 1,
                'customer_id' => 1,
                'vehicle_id' => 1,
                'start_date' => '2026-05-10',
                'end_date' => '2026-05-13',
                'status' => 'completed',
                'daily_rate' => 1500.00,
                'total_cost' => 5550.00, // Includes WiFi & child seat addons
                'notes' => 'Customer requested clean interior.',
                'confirmed_by' => 1,
                'confirmed_at' => '2026-05-10 09:00:00',
                'pickup_location' => 'MANILA HEAD OFFICE',
                'return_location' => 'MANILA HEAD OFFICE',
                'security_deposit_amount' => 5000.00,
                'security_deposit_status' => 'refunded',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'customer_id' => 2,
                'vehicle_id' => 2,
                'start_date' => '2026-05-18',
                'end_date' => '2026-05-22',
                'status' => 'active',
                'daily_rate' => 2500.00,
                'total_cost' => 14000.00, // Includes driver addon (1000/day * 4 days)
                'notes' => 'Out of town trip to Tagaytay.',
                'confirmed_by' => 1,
                'confirmed_at' => '2026-05-18 08:30:00',
                'pickup_location' => 'QUEZON CITY HUB',
                'return_location' => 'QUEZON CITY HUB',
                'security_deposit_amount' => 5000.00,
                'security_deposit_status' => 'held',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'customer_id' => 3,
                'vehicle_id' => 3,
                'start_date' => '2026-05-25',
                'end_date' => '2026-05-28',
                'status' => 'confirmed',
                'daily_rate' => 3500.00,
                'total_cost' => 10800.00, // Includes GPS addon (100/day * 3 days)
                'notes' => 'Executive service rental.',
                'confirmed_by' => 1,
                'confirmed_at' => '2026-05-19 14:20:00',
                'pickup_location' => 'MANILA HEAD OFFICE',
                'return_location' => 'NAIA TERMINAL 3',
                'security_deposit_amount' => 5000.00,
                'security_deposit_status' => 'held',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'customer_id' => 4,
                'vehicle_id' => 4,
                'start_date' => '2026-06-01',
                'end_date' => '2026-06-05',
                'status' => 'pending',
                'daily_rate' => 3000.00,
                'total_cost' => 12000.00,
                'notes' => 'Baguio tour with family.',
                'confirmed_by' => null,
                'confirmed_at' => null,
                'pickup_location' => 'QUEZON CITY HUB',
                'return_location' => 'QUEZON CITY HUB',
                'security_deposit_amount' => 5000.00,
                'security_deposit_status' => 'held',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'customer_id' => 5,
                'vehicle_id' => 5,
                'start_date' => '2026-05-01',
                'end_date' => '2026-05-03',
                'status' => 'cancelled',
                'daily_rate' => 4000.00,
                'total_cost' => 8000.00,
                'notes' => 'Trip cancelled due to change in weather.',
                'confirmed_by' => null,
                'confirmed_at' => null,
                'pickup_location' => 'MANILA HEAD OFFICE',
                'return_location' => 'MANILA HEAD OFFICE',
                'security_deposit_amount' => 5000.00,
                'security_deposit_status' => 'refunded',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($bookings as $b) {
            DB::table('bookings')->updateOrInsert(['id' => $b['id']], $b);
        }

        // Seeding Addons
        $addons = [
            [
                'id' => 1,
                'booking_id' => 1,
                'addon_type' => 'CHILD_SEAT',
                'daily_rate' => 200.00,
                'total_cost' => 600.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'booking_id' => 1,
                'addon_type' => 'WIFI_ROUTER',
                'daily_rate' => 150.00,
                'total_cost' => 450.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'booking_id' => 2,
                'addon_type' => 'PERSONAL_DRIVER',
                'daily_rate' => 1000.00,
                'total_cost' => 4000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'booking_id' => 3,
                'addon_type' => 'GPS_PREMIUM',
                'daily_rate' => 100.00,
                'total_cost' => 300.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($addons as $ad) {
            DB::table('booking_addons')->updateOrInsert(['id' => $ad['id']], $ad);
        }

        $schedules = [
            [
                'id' => 1,
                'booking_id' => 1,
                'event_type' => 'pickup_scheduled',
                'event_time' => '2026-05-10 09:00:00',
                'notes' => 'Pickup scheduled at Manila Branch.',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'booking_id' => 1,
                'event_type' => 'pickup_completed',
                'event_time' => '2026-05-10 09:15:00',
                'notes' => 'Car released in good condition.',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'booking_id' => 1,
                'event_type' => 'return_scheduled',
                'event_time' => '2026-05-13 17:00:00',
                'notes' => 'Return scheduled.',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'booking_id' => 1,
                'event_type' => 'return_completed',
                'event_time' => '2026-05-13 16:30:00',
                'notes' => 'Returned on time, no damages.',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'booking_id' => 2,
                'event_type' => 'pickup_scheduled',
                'event_time' => '2026-05-18 08:30:00',
                'notes' => 'Pickup scheduled at Quezon City Hub.',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'booking_id' => 2,
                'event_type' => 'pickup_completed',
                'event_time' => '2026-05-18 08:45:00',
                'notes' => 'Released with full tank of fuel.',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 7,
                'booking_id' => 2,
                'event_type' => 'return_scheduled',
                'event_time' => '2026-05-22 18:00:00',
                'notes' => 'Return scheduled.',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 8,
                'booking_id' => 3,
                'event_type' => 'pickup_scheduled',
                'event_time' => '2026-05-25 10:00:00',
                'notes' => 'Chauffeur booking pickup scheduled.',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 9,
                'booking_id' => 5,
                'event_type' => 'cancellation',
                'event_time' => '2026-05-01 11:00:00',
                'notes' => 'Cancelled by system/user.',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($schedules as $s) {
            DB::table('schedules')->updateOrInsert(['id' => $s['id']], $s);
        }
    }
}

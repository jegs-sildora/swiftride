<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with PH realistic customer data.
     */
    public function run(): void
    {
        $customers = [
            [
                'id' => 1,
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'email' => 'juan.delacruz@gmail.com',
                'phone' => '+639171234567',
                'billing_address' => '123 Rizal Ave',
                'city' => 'Manila',
                'state' => 'Metro Manila',
                'postal_code' => '1000',
                'country' => 'Philippines',
                'status' => 'active',
                'loyalty_tier' => 'GOLD',
                'loyalty_points' => 1250,
                'government_id_verified' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'email' => 'maria.santos@yahoo.com',
                'phone' => '+639187654321',
                'billing_address' => '456 Quezon Blvd',
                'city' => 'Quezon City',
                'state' => 'Metro Manila',
                'postal_code' => '1100',
                'country' => 'Philippines',
                'status' => 'active',
                'loyalty_tier' => 'SILVER',
                'loyalty_points' => 450,
                'government_id_verified' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'first_name' => 'Jose',
                'last_name' => 'Rizal',
                'email' => 'jose.rizal@outlook.com',
                'phone' => '+639209876543',
                'billing_address' => '789 Lacson St',
                'city' => 'Sampaloc',
                'state' => 'Metro Manila',
                'postal_code' => '1008',
                'country' => 'Philippines',
                'status' => 'active',
                'loyalty_tier' => 'BRONZE',
                'loyalty_points' => 50,
                'government_id_verified' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'first_name' => 'Ana',
                'last_name' => 'Gonzales',
                'email' => 'ana.gonzales@gmail.com',
                'phone' => '+639991234567',
                'billing_address' => '101 Session Rd',
                'city' => 'Baguio',
                'state' => 'Benguet',
                'postal_code' => '2600',
                'country' => 'Philippines',
                'status' => 'active',
                'loyalty_tier' => 'SILVER',
                'loyalty_points' => 320,
                'government_id_verified' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'first_name' => 'Pedro',
                'last_name' => 'Penduko',
                'email' => 'pedro.penduko@gmail.com',
                'phone' => '+639150001111',
                'billing_address' => '202 Osmeña Blvd',
                'city' => 'Cebu City',
                'state' => 'Cebu',
                'postal_code' => '6000',
                'country' => 'Philippines',
                'status' => 'active',
                'loyalty_tier' => 'BRONZE',
                'loyalty_points' => 0,
                'government_id_verified' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($customers as $c) {
            DB::table('customers')->updateOrInsert(['id' => $c['id']], $c);
        }

        // Seeding Documents
        $documents = [
            [
                'id' => 1,
                'customer_id' => 1,
                'document_type' => 'PASSPORT_SCAN',
                'file_path' => 'customer_documents/passport_juan.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'customer_id' => 2,
                'document_type' => 'GOVERNMENT_ID',
                'file_path' => 'customer_documents/national_id_maria.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($documents as $doc) {
            DB::table('customer_documents')->updateOrInsert(['id' => $doc['id']], $doc);
        }

        $licenses = [
            [
                'id' => 1,
                'customer_id' => 1,
                'license_number' => 'N01-12-345678',
                'expiry_date' => '2028-10-10',
                'issuing_authority' => 'LTO East Avenue',
                'license_class' => 'B',
                'verified' => true,
                'verified_at' => '2026-05-10 10:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'customer_id' => 2,
                'license_number' => 'N02-98-765432',
                'expiry_date' => '2027-04-15',
                'issuing_authority' => 'LTO Quezon City',
                'license_class' => 'B,B1',
                'verified' => true,
                'verified_at' => '2026-05-12 11:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'customer_id' => 3,
                'license_number' => 'N03-45-678901',
                'expiry_date' => '2029-06-19',
                'issuing_authority' => 'LTO Calamba',
                'license_class' => 'B',
                'verified' => true,
                'verified_at' => '2026-05-15 09:15:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'customer_id' => 4,
                'license_number' => 'N04-11-222333',
                'expiry_date' => '2028-12-25',
                'issuing_authority' => 'LTO Baguio',
                'license_class' => 'A,B',
                'verified' => true,
                'verified_at' => '2026-05-18 14:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'customer_id' => 5,
                'license_number' => 'N05-88-999000',
                'expiry_date' => '2024-01-01',
                'issuing_authority' => 'LTO Cebu',
                'license_class' => 'B',
                'verified' => false,
                'verified_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($licenses as $l) {
            DB::table('driver_licenses')->updateOrInsert(['id' => $l['id']], $l);
        }
    }
}

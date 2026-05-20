<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with PH realistic billing and payment data.
     */
    public function run(): void
    {
        $invoices = [
            [
                'id' => 1,
                'booking_id' => 1,
                'customer_id' => 1,
                'amount' => 5550.00,
                'amount_paid' => 5550.00,
                'status' => 'paid',
                'due_date' => '2026-05-13',
                'paid_at' => '2026-05-13 16:30:00',
                'notes' => 'Paid in full upon return.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'booking_id' => 2,
                'customer_id' => 2,
                'amount' => 14000.00,
                'amount_paid' => 5000.00,
                'status' => 'partial',
                'due_date' => '2026-05-22',
                'paid_at' => null,
                'notes' => 'Downpayment settled via GCash. Balance due upon return.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'booking_id' => 3,
                'customer_id' => 3,
                'amount' => 10800.00,
                'amount_paid' => 0.00,
                'status' => 'unpaid',
                'due_date' => '2026-05-28',
                'paid_at' => null,
                'notes' => 'Awaiting corporate PO billing.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'booking_id' => 4,
                'customer_id' => 4,
                'amount' => 12000.00,
                'amount_paid' => 12000.00,
                'status' => 'paid',
                'due_date' => '2026-06-05',
                'paid_at' => '2026-05-19 14:00:00',
                'notes' => 'Advance full payment settled via Maya.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'booking_id' => 5,
                'customer_id' => 5,
                'amount' => 8000.00,
                'amount_paid' => 0.00,
                'status' => 'refunded',
                'due_date' => '2026-05-03',
                'paid_at' => null,
                'notes' => 'Cancelled booking fully refunded.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($invoices as $i) {
            DB::table('invoices')->updateOrInsert(['id' => $i['id']], $i);
        }

        // Seeding Line Items (with 12% standard PH VAT extracted)
        $lineItems = [
            [
                'id' => 1,
                'invoice_id' => 1,
                'description' => 'Base Vehicle Rental (₱1,500.00/day for 3 days)',
                'unit_price' => 1500.00,
                'quantity' => 3,
                'vat_amount' => 482.14, // 4500 - (4500 / 1.12)
                'subtotal' => 4500.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'invoice_id' => 1,
                'description' => 'Add-on: CHILD SEAT (₱200.00/day)',
                'unit_price' => 200.00,
                'quantity' => 3,
                'vat_amount' => 64.29,
                'subtotal' => 600.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'invoice_id' => 1,
                'description' => 'Add-on: WIFI ROUTER (₱150.00/day)',
                'unit_price' => 150.00,
                'quantity' => 3,
                'vat_amount' => 48.21,
                'subtotal' => 450.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'invoice_id' => 2,
                'description' => 'Base Vehicle Rental (₱2,500.00/day for 4 days)',
                'unit_price' => 2500.00,
                'quantity' => 4,
                'vat_amount' => 1071.43,
                'subtotal' => 10000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'invoice_id' => 2,
                'description' => 'Add-on: PERSONAL DRIVER (₱1,000.00/day)',
                'unit_price' => 1000.00,
                'quantity' => 4,
                'vat_amount' => 428.57,
                'subtotal' => 4000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($lineItems as $li) {
            DB::table('invoice_line_items')->updateOrInsert(['id' => $li['id']], $li);
        }

        // Seeding Refunds
        DB::table('refunds')->updateOrInsert(
            ['id' => 1],
            [
                'invoice_id' => 5,
                'payment_id' => null,
                'refund_amount' => 8000.00,
                'refund_method' => 'GCASH',
                'reference_code' => 'REF-RFND-9922',
                'processed_at' => now()->subDays(1),
                'notes' => 'Refunded customer via GCash due to booking cancellation.',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $payments = [
            [
                'id' => 1,
                'invoice_id' => 1,
                'amount' => 5550.00,
                'method' => 'cash',
                'reference' => 'REF-CSH-1001',
                'paid_at' => '2026-05-13 16:30:00',
                'notes' => 'Handed over cash to counter clerk.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'invoice_id' => 2,
                'amount' => 5000.00,
                'method' => 'gcash',
                'reference' => 'REF-GCSH-99221',
                'paid_at' => '2026-05-18 08:45:00',
                'notes' => 'GCash Mobile Payment.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'invoice_id' => 4,
                'amount' => 12000.00,
                'method' => 'maya',
                'reference' => 'REF-MAYA-4402',
                'paid_at' => '2026-05-19 14:00:00',
                'notes' => 'Maya Pay Online.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($payments as $p) {
            DB::table('payments')->updateOrInsert(['id' => $p['id']], $p);
        }
    }
}

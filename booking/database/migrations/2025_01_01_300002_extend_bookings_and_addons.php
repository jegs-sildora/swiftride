<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('pickup_location')->default('MANILA HEAD OFFICE');
            $table->string('return_location')->default('MANILA HEAD OFFICE');
            $table->decimal('security_deposit_amount', 10, 2)->default(5000.00);
            $table->enum('security_deposit_status', ['held', 'refunded', 'forfeited'])->default('held');
        });

        Schema::create('booking_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('addon_type'); // CHILD_SEAT, WIFI_ROUTER, GPS_PREMIUM, PERSONAL_DRIVER, etc.
            $table->decimal('daily_rate', 10, 2);
            $table->decimal('total_cost', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_addons');

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['pickup_location', 'return_location', 'security_deposit_amount', 'security_deposit_status']);
        });
    }
};

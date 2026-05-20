<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->unsignedInteger('current_odometer')->default(0);
            $table->decimal('fuel_tank_capacity_liters', 5, 2)->default(50.00);
            $table->string('insurance_policy_number')->nullable()->unique();
            $table->date('insurance_expiry_date')->nullable();
        });

        Schema::create('vehicle_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->enum('inspection_type', ['checkout', 'checkin']);
            $table->unsignedInteger('odometer_reading');
            $table->decimal('fuel_level_percent', 5, 2);
            $table->text('body_damage_notes')->nullable();
            $table->string('interior_clean_status')->default('CLEAN');
            $table->boolean('safety_check_passed')->default(true);
            $table->unsignedBigInteger('inspector_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_inspections');

        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn(['current_odometer', 'fuel_tank_capacity_liters', 'insurance_policy_number', 'insurance_expiry_date']);
        });
    }
};

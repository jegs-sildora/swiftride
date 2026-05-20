<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');      // from CRM service
            $table->unsignedBigInteger('vehicle_id');       // from Fleet service
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', [
                'pending',
                'confirmed',
                'active',
                'completed',
                'cancelled',
            ])->default('pending');
            $table->decimal('daily_rate', 10, 2);
            $table->decimal('total_cost', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('confirmed_by')->nullable();  // auth user id
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};

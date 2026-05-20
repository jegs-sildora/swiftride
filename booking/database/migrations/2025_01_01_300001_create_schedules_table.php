<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->enum('event_type', [
                'pickup_scheduled',
                'pickup_completed',
                'return_scheduled',
                'return_completed',
                'cancellation',
                'note',
            ]);
            $table->timestamp('event_time');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();  // auth user id
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};

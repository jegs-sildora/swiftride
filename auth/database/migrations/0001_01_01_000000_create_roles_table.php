<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Seed default roles
        \DB::table('roles')->insert([
            ['name' => 'admin',      'description' => 'Full system access',              'created_at' => now(), 'updated_at' => now()],
            ['name' => 'dispatcher', 'description' => 'Manages fleet and bookings',      'created_at' => now(), 'updated_at' => now()],
            ['name' => 'staff',      'description' => 'Standard read/write operations',  'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};

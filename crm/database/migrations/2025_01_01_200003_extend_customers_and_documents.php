<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('loyalty_tier')->default('BRONZE'); // BRONZE, SILVER, GOLD
            $table->unsignedInteger('loyalty_points')->default(0);
            $table->boolean('government_id_verified')->default(false);
        });

        Schema::create('customer_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('document_type'); // LICENSE_PHOTO, PASSPORT_SCAN, UTILITY_BILL, etc.
            $table->string('file_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_documents');

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['loyalty_tier', 'loyalty_points', 'government_id_verified']);
        });
    }
};

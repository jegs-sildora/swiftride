<?php
header('Content-Type: text/plain');

echo "=== SWIFTRIDE DB DIAGNOSTIC (WITH ARTISAN RUNNER) ===\n";

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "DB_CONNECTION: " . config('database.default') . "\n";
echo "DB_DATABASE: " . config('database.connections.pgsql.database') . "\n";
echo "DB_SCHEMA: " . config('database.connections.pgsql.search_path') . "\n";

try {
    echo "\n1. Checking database connection...\n";
    DB::connection()->getPdo();
    echo "Database connection successful!\n";
    
    // Check if schema exists, create if not
    $schema = config('database.connections.pgsql.search_path');
    if ($schema && $schema !== 'public') {
        DB::statement('CREATE SCHEMA IF NOT EXISTS "' . $schema . '"');
        echo "Schema '$schema' checked/created successfully.\n";
    }
    
    echo "\n2. Running migrations...\n";
    $output = '';
    $exitCode = Artisan::call('migrate', ['--force' => true]);
    $output .= Artisan::output();
    echo "Migrate exit code: $exitCode\n";
    echo "Migrate output:\n$output\n";
    
    echo "\n3. Running seeders...\n";
    $outputSeed = '';
    $exitCodeSeed = Artisan::call('db:seed', ['--force' => true]);
    $outputSeed .= Artisan::output();
    echo "Seed exit code: $exitCodeSeed\n";
    echo "Seed output:\n$outputSeed\n";
    
} catch (Exception $e) {
    echo "ERROR OCCURRED:\n" . $e->getMessage() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}

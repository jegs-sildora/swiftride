#!/bin/sh
set -e

# Cache config/routes for performance (uses injected env vars)
php artisan config:cache
php artisan route:cache

# Ensure the database schema exists before running migrations
php -r "
require 'vendor/autoload.php';
\$app = require_once 'bootstrap/app.php';
\$kernel = \$app->make(Illuminate\Contracts\Console\Kernel::class);
\$kernel->bootstrap();
try {
    \$schema = env('DB_SCHEMA', 'public');
    if (\$schema && \$schema !== 'public') {
        Illuminate\Support\Facades\DB::statement('CREATE SCHEMA IF NOT EXISTS \"' . \$schema . '\"');
        echo \"Schema '\$schema' checked/created successfully.\n\";
    }
} catch (\Exception \$e) {
    echo \"Warning: Could not create schema '\$schema': \" . \$e->getMessage() . \"\n\";
}
"

# Run pending database migrations on startup
php artisan migrate --force

# Seed default data (idempotent — uses upsert, safe to run on every boot)
# php artisan db:seed --force

# Start the built-in PHP server (suitable for Render Web Service)
php artisan serve --host=0.0.0.0 --port=8000

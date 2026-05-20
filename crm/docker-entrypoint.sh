#!/bin/sh
set -e

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

php artisan migrate --force

php artisan serve --host=0.0.0.0 --port=8002

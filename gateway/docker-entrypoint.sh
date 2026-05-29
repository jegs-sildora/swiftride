#!/bin/sh
set -e

# Cache config/routes for performance (uses injected env vars)
php artisan config:cache
php artisan route:cache

# Start the built-in PHP server (suitable for Render Web Service)
php artisan serve --host=0.0.0.0 --port=8000

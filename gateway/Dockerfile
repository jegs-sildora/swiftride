FROM php:8.4-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    postgresql-dev \
    oniguruma-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl

# Install required PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    mbstring \
    zip \
    opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies (leverages Docker layer cache)
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction

# Copy application source
COPY . .

# Optimise autoload
RUN composer dump-autoload --optimize --classmap-authoritative

# Ensure storage directories exist and are writable
RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

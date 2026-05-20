FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    oniguruma-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl

RUN docker-php-ext-install pdo pdo_pgsql mbstring zip opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .

RUN composer dump-autoload --optimize --classmap-authoritative

RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8004

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

# ============================================================
# 1) Build Stage – Install PHP dependencies using Composer
# ============================================================
FROM php:8.2-fpm AS build

# Install system dependencies
RUN apt-get update && apt-get install -y \
    unzip \
    git \
    curl \
    libzip-dev \
    libonig-dev \
    sqlite3 \
    libsqlite3-dev \
    && docker-php-ext-install zip pdo pdo_mysql pdo_sqlite

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy project files
COPY . .

# Install composer dependencies
RUN composer install --no-dev --optimize-autoloader


# ============================================================
# 2) Production Stage – PHP-FPM + Nginx running Laravel
# ============================================================
FROM php:8.2-fpm

# Install nginx & system libs
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    sqlite3 \
    libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite

WORKDIR /app

# Copy built app
COPY --from=build /app /app

# Copy nginx configuration
COPY .docker/nginx.conf /etc/nginx/nginx.conf

# Copy supervisord configuration (to run PHP + Nginx together)
COPY .docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# ------------------------------------------------------------
# Laravel permissions
# ------------------------------------------------------------
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Expose PORT 8080 (Koyeb listens here)
EXPOSE 8080

# Start supervisord (runs PHP-FPM + Nginx in 1 container)
CMD ["/usr/bin/supervisord"]

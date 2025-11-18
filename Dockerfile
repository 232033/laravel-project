FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    sqlite3 \
    libsqlite3-dev \
    zip unzip git curl

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_sqlite

# Install Composer
RUN curl -sS https://getcomposer.org/installer -o composer-setup.php \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && rm composer-setup.php

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader

# Prepare Laravel
RUN cp .env.example .env || true
RUN php artisan key:generate
RUN php artisan config:cache

# Copy Nginx config
COPY nginx.conf /etc/nginx/sites-enabled/default

# Entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

CMD ["/entrypoint.sh"]

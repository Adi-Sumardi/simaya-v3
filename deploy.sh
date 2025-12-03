#!/bin/bash

# ===========================================
# SIMAYA Deployment Script for cPanel
# ===========================================
# Usage: ./deploy.sh
# ===========================================

set -e

echo "=========================================="
echo "  SIMAYA - Deployment Script"
echo "=========================================="

# Navigate to app directory
cd /home/yapiwebi/app-simaya-v3

echo ""
echo "[1/6] Pulling latest code from GitHub..."
git pull origin master

echo ""
echo "[2/6] Installing composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

echo ""
echo "[3/6] Running database migrations..."
php artisan migrate --force

echo ""
echo "[4/6] Clearing all caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

echo ""
echo "[5/6] Rebuilding caches for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ""
echo "[6/6] Setting proper permissions..."
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage/logs

echo ""
echo "=========================================="
echo "  Deployment completed successfully!"
echo "=========================================="
echo ""
echo "Visit: https://simaya.yapi.web.id"
echo ""

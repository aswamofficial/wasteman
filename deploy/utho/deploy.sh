#!/usr/bin/env bash
#
# Wasteman — update an already-provisioned deployment on the Utho box.
#
#   bash /var/www/wasteman/deploy/utho/deploy.sh
#
# Run AFTER the code has been synced to /var/www/wasteman. First-time setup is
# in DEPLOY.md; this script assumes the database, .env, nginx block and FPM pool
# already exist.
#
# Touches nothing outside /var/www/wasteman except reloading Wasteman's own FPM
# pool. Clean Washroom is not restarted, reloaded or read.

set -euo pipefail

ROOT=/var/www/wasteman
API="$ROOT/wastenotify-api"
APP="$ROOT/wastenotify-app"
SITE_URL="${SITE_URL:-https://wasteman.in}"

say() { printf '\n\033[1;34m==> %s\033[0m\n' "$1"; }

[ -f "$API/.env" ] || { echo "No .env at $API/.env — see DEPLOY.md first."; exit 1; }

say "Backend dependencies"
cd "$API"
composer install --no-dev --optimize-autoloader --no-interaction

say "Database migrations"
# --force because production refuses interactive confirmation.
php artisan migrate --force

say "Front-end build"
cd "$APP"
npm ci
# The API lives on the same origin, so these are paths on wasteman.in itself.
VITE_API_URL="$SITE_URL/api" \
VITE_STORAGE_URL="$SITE_URL/storage" \
VITE_APP_URL="$SITE_URL" \
  npm run build

say "Caches"
cd "$API"
# Rebuild, don't just clear: on this box an uncached config has been seen to
# lose a race reading .env under concurrency and fall through to the framework
# default connection. Caching it is what makes the app deterministic.
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link 2>/dev/null || true

say "Permissions"
chown -R www-data:www-data "$API/storage" "$API/bootstrap/cache"
chmod -R 775 "$API/storage" "$API/bootstrap/cache"

say "Reloading Wasteman's PHP-FPM pool"
# `reload` finishes in-flight requests first. This is the whole FPM service, so
# Clean Washroom's pool reloads too — it re-reads its own unchanged config and
# keeps serving. Nothing of Clean Washroom's is modified.
systemctl reload php8.3-fpm

say "Done — $SITE_URL"
echo "Queue workers (if running): systemctl restart wasteman-queue"

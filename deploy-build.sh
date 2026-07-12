#!/bin/bash
# Script de build lancé en arrière-plan par deploy-receiver.php
# Tourne sur le VPS Ubuntu 24.04 en tant que www-data

DIR="$(cd "$(dirname "$0")" && pwd)"
LOG="$DIR/storage/logs/deploy.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"; }

log "=== Build démarré (PID=$$) ==="

# Charger nvm si disponible
export HOME=${HOME:-/root}
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# PATH étendu pour trouver node/npm/composer
export PATH="/usr/local/bin:/usr/bin:/bin:$NVM_DIR/versions/node/$(ls $NVM_DIR/versions/node/ 2>/dev/null | sort -V | tail -1)/bin"

log "node: $(which node 2>/dev/null || echo ABSENT) $(node -v 2>/dev/null || echo '')"
log "npm:  $(which npm  2>/dev/null || echo ABSENT) $(npm  -v 2>/dev/null || echo '')"

cd "$DIR"

# Composer
log "--- composer install ---"
composer install --no-dev --optimize-autoloader --no-interaction >> "$LOG" 2>&1
log "composer : $?"

# npm
log "--- npm ci ---"
npm ci >> "$LOG" 2>&1
log "npm ci : $?"

log "--- npm run build ---"
npm run build >> "$LOG" 2>&1
log "npm build : $?"

# Artisan
log "--- artisan ---"
php artisan migrate --force  >> "$LOG" 2>&1
php artisan config:cache     >> "$LOG" 2>&1
php artisan route:cache      >> "$LOG" 2>&1
php artisan view:cache       >> "$LOG" 2>&1

# Permissions
chown -R www-data:www-data "$DIR/storage" "$DIR/bootstrap/cache" 2>/dev/null

log "=== Build terminé ==="

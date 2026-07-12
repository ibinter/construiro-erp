<?php
// Webhook de déploiement — appelé par GitHub Actions
if (($_POST['secret'] ?? '') !== 'construiro_deploy_2026') {
    http_response_code(403);
    die('Accès refusé');
}

$dir  = dirname(__DIR__);
$log  = "$dir/storage/logs/deploy.log";
$script = "$dir/storage/deploy-build.sh";

function logMsg(string $msg): void {
    global $log;
    file_put_contents($log, date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
}

logMsg('=== Déploiement démarré ===');

// 1. Git pull (rapide, OK en synchrone)
$out = shell_exec("cd $dir && git pull origin master 2>&1");
logMsg('git pull : ' . trim($out));

// 2. Écrire un script bash qui sera exécuté en arrière-plan
//    Le script bash a accès au PATH complet du système
file_put_contents($script, <<<BASH
#!/bin/bash
set -e
export HOME=/root
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && source "\$NVM_DIR/nvm.sh"
# Fallback : chercher node dans les emplacements courants Ubuntu
export PATH="\$PATH:/usr/local/bin:/usr/bin:/bin:\$NVM_DIR/versions/node/\$(ls \$NVM_DIR/versions/node/ 2>/dev/null | sort -V | tail -1)/bin"

LOG="$log"
DIR="$dir"

log() { echo "[\$(date '+%Y-%m-%d %H:%M:%S')] \$1" >> "\$LOG"; }

log "--- Script build démarré (PID=\$\$) ---"
log "node: \$(which node 2>/dev/null || echo INTROUVABLE) | \$(node -v 2>/dev/null || echo N/A)"
log "npm:  \$(which npm  2>/dev/null || echo INTROUVABLE) | \$(npm -v  2>/dev/null || echo N/A)"

cd "\$DIR"

log "--- composer install ---"
/usr/bin/composer install --no-dev --optimize-autoloader --no-interaction >> "\$LOG" 2>&1
log "composer : OK"

log "--- npm ci ---"
npm ci --prefer-offline >> "\$LOG" 2>&1 && log "npm ci : OK" || log "npm ci : ECHEC"

log "--- npm run build ---"
npm run build >> "\$LOG" 2>&1 && log "npm build : OK" || log "npm build : ECHEC"

log "--- artisan ---"
php artisan migrate --force >> "\$LOG" 2>&1
php artisan config:cache    >> "\$LOG" 2>&1
php artisan route:cache     >> "\$LOG" 2>&1
php artisan view:cache      >> "\$LOG" 2>&1

chown -R www-data:www-data "\$DIR/storage" "\$DIR/bootstrap/cache" 2>/dev/null
log "--- Déploiement terminé ---"
BASH
);
chmod(0755, $script);

// 3. Lancer le script en arrière-plan (nohup) — PHP répond immédiatement
//    stderr redirigé dans le log aussi
shell_exec("nohup bash $script >> $log 2>&1 &");

logMsg('Script build lancé en arrière-plan — vérifiez deploy.log dans quelques minutes');
logMsg('=== Réponse envoyée à GitHub Actions ===');

// Répondre immédiatement avant que PHP timeout
echo 'DEPLOY_OK';

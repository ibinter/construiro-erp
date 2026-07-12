<?php
// Webhook de déploiement — appelé par GitHub Actions
if (($_POST['secret'] ?? '') !== 'construiro_deploy_2026') {
    http_response_code(403);
    die('Accès refusé');
}

$dir = dirname(__DIR__);
$log = "$dir/storage/logs/deploy.log";

function logMsg(string $msg): void {
    global $log;
    file_put_contents($log, date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
}

logMsg('=== Déploiement démarré ===');

// 1. Git pull
$out = shell_exec("cd $dir && git pull origin master 2>&1");
logMsg('git pull : ' . trim($out));

// 2. Composer install (sans dev)
$out = shell_exec("cd $dir && composer install --no-dev --optimize-autoloader --no-interaction 2>&1 | tail -3");
logMsg('composer : ' . trim($out));

// 3. Artisan en tant que www-data
foreach (['migrate --force', 'config:cache', 'route:cache', 'view:cache'] as $cmd) {
    $out = shell_exec("cd $dir && sudo -u www-data php artisan $cmd 2>&1 | tail -2");
    logMsg("$cmd : " . trim($out));
}

// 4. Permissions
shell_exec("chown -R www-data:www-data $dir/storage $dir/bootstrap/cache 2>&1");
logMsg('Permissions OK');
logMsg('=== Déploiement terminé ===');

echo 'DEPLOY_OK';

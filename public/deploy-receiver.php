<?php
// Webhook de déploiement — appelé par GitHub Actions
if (($_POST['secret'] ?? '') !== 'construiro_deploy_2026') {
    http_response_code(403);
    die('Accès refusé');
}

$dir = dirname(__DIR__);
$log = "$dir/storage/logs/deploy.log";

// PATH étendu pour que npm/node soient trouvés par shell_exec (PHP tourne sans PATH complet)
$env = 'export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/nvm/versions/node/$(ls /usr/local/nvm/versions/node/ 2>/dev/null | tail -1)/bin:/root/.nvm/versions/node/$(ls /root/.nvm/versions/node/ 2>/dev/null | tail -1)/bin:/home/$(ls /home/ 2>/dev/null | head -1)/.nvm/versions/node/$(ls /home/$(ls /home/ 2>/dev/null | head -1)/.nvm/versions/node/ 2>/dev/null | tail -1)/bin 2>/dev/null; which node; node -v; which npm; npm -v';

function logMsg(string $msg): void {
    global $log;
    file_put_contents($log, date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
}

function runCmd(string $cmd): string {
    global $dir;
    $path = 'PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/nvm/versions/node/v22.0.0/bin:/usr/local/nvm/versions/node/v20.0.0/bin';
    $fullCmd = "export $path; cd $dir && $cmd 2>&1";
    $out = shell_exec($fullCmd);
    return trim((string) $out);
}

logMsg('=== Déploiement démarré ===');

// Détection node/npm
$nodePath = trim((string) shell_exec('find /usr/local/nvm /root/.nvm /home -name "node" -type f 2>/dev/null | head -1'));
$npmPath  = trim((string) shell_exec('find /usr/local/nvm /root/.nvm /home -name "npm"  -type f 2>/dev/null | head -1'));
$nodeBin  = $nodePath ? dirname($nodePath) : '/usr/bin';
logMsg("node trouvé : $nodePath | npm : $npmPath | bin dir : $nodeBin");

function runWithNode(string $cmd): string {
    global $dir, $nodeBin;
    $fullCmd = "export PATH=$nodeBin:/usr/local/bin:/usr/bin:/bin; cd $dir && $cmd 2>&1";
    return trim((string) shell_exec($fullCmd));
}

// 1. Git pull
$out = shell_exec("cd $dir && git pull origin master 2>&1");
logMsg('git pull : ' . trim($out));

// 2. Composer install (sans dev)
$out = shell_exec("cd $dir && /usr/bin/composer install --no-dev --optimize-autoloader --no-interaction 2>&1 | tail -3");
logMsg('composer : ' . trim($out));

// 3. Build assets front-end (Vite/React)
$out = runWithNode('node -v && npm -v');
logMsg('node/npm version : ' . $out);
$out = runWithNode('npm ci --prefer-offline');
logMsg('npm ci : ' . substr($out, -500));
$out = runWithNode('npm run build');
logMsg('npm build : ' . substr($out, -800));

// 4. Artisan en tant que www-data
foreach (['migrate --force', 'config:cache', 'route:cache', 'view:cache'] as $cmd) {
    $out = shell_exec("cd $dir && sudo -u www-data php artisan $cmd 2>&1 | tail -2");
    logMsg("$cmd : " . trim($out));
}

// 4. Permissions
shell_exec("chown -R www-data:www-data $dir/storage $dir/bootstrap/cache 2>&1");
logMsg('Permissions OK');
logMsg('=== Déploiement terminé ===');

echo 'DEPLOY_OK';

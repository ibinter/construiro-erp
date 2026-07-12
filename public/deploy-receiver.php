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

// 1. Git pull (synchrone, rapide)
$out = shell_exec("cd $dir && git pull origin master 2>&1");
logMsg('git pull : ' . trim($out));

// 2. S'assurer que le script de build est exécutable
shell_exec("chmod +x $dir/deploy-build.sh 2>&1");

// 3. Lancer le build en arrière-plan via nohup
//    PHP répond immédiatement à GitHub Actions sans attendre le build (>3 min)
$buildLog = "$dir/storage/logs/deploy.log";
$cmd = "nohup bash $dir/deploy-build.sh >> $buildLog 2>&1 &";
shell_exec($cmd);

logMsg('Build lancé en arrière-plan (deploy-build.sh)');
logMsg('=== Réponse immédiate GitHub Actions ===');

echo 'DEPLOY_OK';

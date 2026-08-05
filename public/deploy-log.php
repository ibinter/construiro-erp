<?php
// Lecture des logs de déploiement — accès protégé par le secret DEPLOY_SECRET (.env)
$__envSecret = '';
$__envFile   = dirname(__DIR__) . '/.env';
if (is_readable($__envFile)) {
    foreach (file($__envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $__l) {
        if (str_starts_with(trim($__l), 'DEPLOY_SECRET=')) {
            $__envSecret = trim(substr(trim($__l), strlen('DEPLOY_SECRET=')), " \t\"'");
            break;
        }
    }
}
if ($__envSecret === '' || !hash_equals($__envSecret, $_GET['secret'] ?? '')) {
    http_response_code(403);
    die('Accès refusé');
}

$log = dirname(__DIR__) . '/storage/logs/deploy.log';

if (!file_exists($log)) {
    echo "Aucun log trouvé.\n";
    exit;
}

// Retourner les 100 dernières lignes
$lines = file($log);
$last  = array_slice($lines, -100);
echo implode('', $last);

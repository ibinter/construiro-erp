<?php
// Lecture des logs de déploiement — accès protégé par secret
if (($_GET['secret'] ?? '') !== 'construiro_deploy_2026') {
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

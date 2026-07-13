<?php
if (($_GET['secret'] ?? '') !== 'construiro_deploy_2026') {
    http_response_code(403);
    die('Accès refusé');
}
header('Content-Type: text/plain; charset=utf-8');
$log = dirname(__DIR__) . '/storage/logs/laravel.log';
if (!is_file($log)) {
    echo "Fichier log introuvable : $log\n";
    exit;
}
// Lire les 200 dernières lignes
$lines = file($log, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$last  = array_slice($lines, -200);
echo implode("\n", $last);

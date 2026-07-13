<?php
if (($_GET['secret'] ?? '') !== 'construiro_deploy_2026') {
    http_response_code(403);
    die('Accès refusé');
}
header('Content-Type: text/plain; charset=utf-8');

if (isset($_GET['file'])) {
    if ($_GET['file'] === 'notification') {
        echo file_get_contents(dirname(__DIR__) . '/app/Models/Notification.php');
    } elseif ($_GET['file'] === 'git') {
        echo shell_exec('cd ' . dirname(__DIR__) . ' && git log --oneline -5 2>&1');
    }
    exit;
}

$log = dirname(__DIR__) . '/storage/logs/laravel.log';
if (!is_file($log)) { echo "Log introuvable\n"; exit; }
$lines = file($log, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
echo implode("\n", array_slice($lines, -200));

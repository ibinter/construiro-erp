<?php
// Invalider opcache pour que cette version soit toujours fraîche
if (function_exists('opcache_invalidate')) {
    opcache_invalidate(__FILE__, true);
}
if (($_GET['secret'] ?? '') !== 'construiro_deploy_2026') {
    http_response_code(403);
    die('Accès refusé');
}
header('Content-Type: text/plain; charset=utf-8');

if (isset($_GET['file'])) {
    $dir = dirname(__DIR__);
    if ($_GET['file'] === 'notification') {
        echo file_get_contents($dir . '/app/Models/Notification.php');
    } elseif ($_GET['file'] === 'git') {
        echo shell_exec("cd $dir && git log --oneline -5 2>&1");
    } elseif ($_GET['file'] === 'migrate-status') {
        echo shell_exec("cd $dir && php artisan migrate:status 2>&1");
    } elseif ($_GET['file'] === 'migrate-run') {
        echo shell_exec("cd $dir && php artisan migrate --force 2>&1");
    }
    exit;
}

$log = dirname(__DIR__) . '/storage/logs/laravel.log';
if (!is_file($log)) { echo "Log introuvable\n"; exit; }
$lines = file($log, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
echo implode("\n", array_slice($lines, -200));

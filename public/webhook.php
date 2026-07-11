<?php
/**
 * Webhook de déploiement automatique GitHub → LWS
 * URL : https://construiro.com/webhook.php
 * Configurer dans GitHub : Settings → Webhooks → Add webhook
 */

$secret = 'construiro_deploy_2026'; // même valeur dans GitHub
$root   = dirname(__DIR__);
$php    = PHP_BINARY ?: 'php';
$log    = $root . '/storage/logs/deploy.log';

// Vérifier la signature GitHub
$payload   = file_get_contents('php://input');
$signature = 'sha256=' . hash_hmac('sha256', $payload, $secret);

if (!hash_equals($signature, $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '')) {
    http_response_code(403);
    die('Signature invalide');
}

$data   = json_decode($payload, true);
$branch = $data['ref'] ?? '';

// Déployer uniquement sur push vers master
if ($branch !== 'refs/heads/master') {
    die("Branch ignorée : $branch");
}

$timestamp = date('Y-m-d H:i:s');
$output    = [];

$commands = [
    "git -C $root pull origin master",
    "$php $root/artisan migrate --force",
    "$php $root/artisan config:cache",
    "$php $root/artisan route:cache",
    "$php $root/artisan view:cache",
    "chmod -R 775 $root/storage $root/bootstrap/cache",
];

foreach ($commands as $cmd) {
    exec($cmd . " 2>&1", $lines, $code);
    $output[] = "[$code] $cmd\n" . implode("\n", $lines);
    $lines = [];
}

$log_entry = "[$timestamp]\n" . implode("\n---\n", $output) . "\n===\n";
file_put_contents($log, $log_entry, FILE_APPEND);

http_response_code(200);
echo "Déployé : $timestamp";

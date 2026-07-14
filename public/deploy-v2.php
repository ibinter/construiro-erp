<?php
/**
 * Webhook de déploiement CONSTRUIRO
 *
 * Mode 1 — POST secret seulement   : git pull + artisan (sans rebuild)
 * Mode 2 — POST secret + assets.zip : extrait le zip dans public/build/
 *                                      (le build Vite est fait dans GitHub Actions)
 */

// Invalider l'OPcache pour ce fichier + tous les fichiers PHP de l'app
if (function_exists('opcache_invalidate')) {
    opcache_invalidate(__FILE__, true);
    // Invalider tous les fichiers PHP du projet (nécessaire si validate_timestamps=0)
    $appDir = dirname(__DIR__) . '/app';
    $iter = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($appDir));
    foreach ($iter as $f) {
        if ($f->isFile() && $f->getExtension() === 'php') {
            opcache_invalidate($f->getPathname(), true);
        }
    }
    // Invalider aussi les routes et bootstrap
    foreach (glob(dirname(__DIR__) . '/bootstrap/cache/*.php') as $f) {
        opcache_invalidate($f, true);
    }
}

$secret = $_POST['secret'] ?? $_GET['secret'] ?? '';
if ($secret !== 'construiro_deploy_2026') {
    http_response_code(403);
    die('Accès refusé');
}

// Mode diagnostic (GET uniquement)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['diag'])) {
    header('Content-Type: text/plain; charset=utf-8');
    $dir = dirname(__DIR__);
    $diag = $_GET['diag'];
    if ($diag === 'migrate') {
        echo shell_exec("cd $dir && php artisan migrate --force 2>&1");
    } elseif ($diag === 'status') {
        echo shell_exec("cd $dir && php artisan migrate:status 2>&1");
    } elseif ($diag === 'git') {
        echo shell_exec("cd $dir && git log --oneline -5 2>&1");
    } elseif ($diag === 'notification') {
        echo file_get_contents($dir . '/app/Models/Notification.php');
    } elseif ($diag === 'opcache-test') {
        $f = $dir . '/app/Models/Notification.php';
        $result = function_exists('opcache_invalidate') ? opcache_invalidate($f, true) : 'not available';
        echo "opcache_invalidate result: " . var_export($result, true) . "\n";
        echo "File mtime: " . date('Y-m-d H:i:s', filemtime($f)) . "\n";
        echo "File head:\n" . implode("\n", array_slice(file($f), 0, 8));
    } elseif ($diag === 'laravel-log') {
        $logFile = $dir . '/storage/logs/laravel.log';
        if (file_exists($logFile)) {
            $lines = file($logFile);
            $last = array_slice($lines, -100);
            echo implode('', $last);
        } else {
            echo "Log file not found: $logFile";
        }
    } elseif ($diag === 'artisan-about') {
        echo shell_exec("cd $dir && php artisan about 2>&1");
    } elseif ($diag === 'php-error') {
        echo shell_exec("cd $dir && php -r \"require 'vendor/autoload.php';\" 2>&1");
    } elseif ($diag === 'reset-opcache') {
        if (function_exists('opcache_reset')) {
            $result = opcache_reset();
            echo "opcache_reset(): " . ($result ? "OK — OPcache vidé" : "FAILED") . "\n";
        } else {
            echo "OPcache non disponible\n";
        }
        echo shell_exec("cd $dir && php artisan config:clear 2>&1");
        echo shell_exec("cd $dir && php artisan config:cache 2>&1");
        echo shell_exec("cd $dir && php artisan route:cache 2>&1");
        echo shell_exec("cd $dir && php artisan view:cache 2>&1");
        echo "DONE\n";
    }
    exit;
}

$dir = dirname(__DIR__);
$log = "$dir/storage/logs/deploy.log";

function logMsg(string $msg): void {
    global $log;
    file_put_contents($log, date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
}

logMsg('=== Déploiement démarré (v2) ===');

// ── 1. Écrire les variables d'environnement si fournies ───────────
$envVars = [];
if (!empty($_POST['groq_key'])) {
    $envVars['GROQ_API_KEY'] = trim($_POST['groq_key']);
}
if (!empty($_POST['app_env'])) {
    $envVars['APP_ENV'] = trim($_POST['app_env']);
}

if (!empty($envVars)) {
    updateEnvFile("$dir/.env", $envVars);
    logMsg('Variables .env mises à jour : ' . implode(', ', array_keys($envVars)));
}

// ── 2. Git pull ────────────────────────────────────────────────────
$out = shell_exec("cd $dir && git pull origin master 2>&1");
logMsg('git pull : ' . trim($out));

// ── 3. Installer/mettre à jour les dépendances Composer ───────────
$out = shell_exec("cd $dir && composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev 2>&1 | tail -3");
logMsg('composer install : ' . trim($out));

// ── 3b. Vider l'OPcache après composer install (nouveaux packages) ──
if (function_exists('opcache_reset')) {
    opcache_reset();
    logMsg('OPcache reset après composer install');
}

// ── 4. Extraire les assets si un zip est fourni ────────────────────
if (!empty($_FILES['assets']['tmp_name'])) {
    $zip = new ZipArchive();
    if ($zip->open($_FILES['assets']['tmp_name']) === true) {
        $buildDir = "$dir/public/build";
        shell_exec("rm -rf $buildDir");
        mkdir($buildDir, 0755, true);
        $zip->extractTo("$dir/public");
        $zip->close();
        logMsg('Assets extraits dans public/build/ ✓');
        chown_r($buildDir, 'www-data');
    } else {
        logMsg('ERREUR : impossible d\'ouvrir le zip assets');
    }
} else {
    logMsg('Aucun zip assets fourni — build non mis à jour');
}

// ── 6. Artisan : clear puis rebuild des caches ────────────────────
$artisanCmds = [
    'config:clear',
    'cache:clear',
    'route:clear',
    'view:clear',
    'event:clear',
    'migrate --force',
    'db:seed --class=RolePermissionSeeder --force',
    'db:seed --class=SubscriptionPlanSeeder --force',
    'db:seed --class=LandingSeeder --force',
    'db:seed --class=LegalPageSeeder --force',
    'db:seed --class=IbigSuperAdminSeeder --force',
    'db:seed --class=LandingFaqSeeder --force',
    'package:discover --ansi',
    'config:cache',
    'route:cache',
    'view:cache',
    'event:cache',
    'storage:link',
];

foreach ($artisanCmds as $cmd) {
    $out = shell_exec("cd $dir && php artisan $cmd 2>&1 | tail -2");
    logMsg("artisan $cmd : " . trim($out));
}

// ── 6. Permissions ────────────────────────────────────────────────
shell_exec("chown -R www-data:www-data $dir/storage $dir/bootstrap/cache 2>&1");
logMsg('Permissions OK');
logMsg('=== Déploiement terminé (v2) ===');

echo 'DEPLOY_OK';

// ─── Helpers ──────────────────────────────────────────────────────

function updateEnvFile(string $path, array $vars): void {
    if (!file_exists($path)) {
        return;
    }
    $content = file_get_contents($path);
    foreach ($vars as $key => $value) {
        $escaped = addcslashes($value, '"\\');
        $line    = "$key=\"$escaped\"";
        // Replace existing key or append
        if (preg_match('/^' . preg_quote($key, '/') . '=/m', $content)) {
            $content = preg_replace('/^' . preg_quote($key, '/') . '=.*/m', $line, $content);
        } else {
            $content .= "\n$line";
        }
    }
    file_put_contents($path, $content);
}

function chown_r(string $path, string $user): void {
    shell_exec("chown -R $user:$user " . escapeshellarg($path) . " 2>&1");
}

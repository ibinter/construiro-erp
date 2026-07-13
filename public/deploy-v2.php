<?php
/**
 * Webhook de déploiement CONSTRUIRO
 *
 * Mode 1 — POST secret seulement   : git pull + artisan (sans rebuild)
 * Mode 2 — POST secret + assets.zip : extrait le zip dans public/build/
 *                                      (le build Vite est fait dans GitHub Actions)
 */

// Invalider l'OPcache pour ce fichier (recharge la version disque au prochain appel)
if (function_exists('opcache_invalidate')) {
    opcache_invalidate(__FILE__, true);
}

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

// ── 5. Artisan : migrations + cache ───────────────────────────────
$artisanCmds = [
    'migrate --force',
    'db:seed --class=LandingSeeder --force',
    'db:seed --class=LegalPageSeeder --force',
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

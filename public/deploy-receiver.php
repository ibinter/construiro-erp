<?php
// Récepteur de déploiement automatique — appelé par GitHub Actions
if (($_POST['secret'] ?? '') !== 'construiro_deploy_2026') {
    http_response_code(403);
    die('Accès refusé');
}

$dir = '/htdocs/construiro.com';
$log = "$dir/storage/logs/deploy.log";

function logMsg(string $msg): void {
    global $log;
    file_put_contents($log, date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
}

logMsg('=== Déploiement démarré ===');

// 1. Sauvegarder le zip reçu
if (empty($_FILES['zip']['tmp_name'])) {
    logMsg('ERREUR : aucun fichier reçu');
    die('Aucun fichier');
}

$zipPath = "$dir/deploy_tmp.zip";
move_uploaded_file($_FILES['zip']['tmp_name'], $zipPath);
logMsg('Zip reçu : ' . round(filesize($zipPath) / 1024 / 1024, 1) . ' Mo');

// 2. Extraire (en écrasant les fichiers existants)
$zip = new ZipArchive();
if ($zip->open($zipPath) !== true) {
    logMsg('ERREUR : impossible d\'ouvrir le zip');
    die('Zip corrompu');
}
$zip->extractTo($dir);
$zip->close();
unlink($zipPath);
logMsg('Extraction terminée');

// Forcer index.php et .htaccess corrects à la racine
file_put_contents("$dir/index.php", "<?php\nrequire __DIR__.'/public/index.php';\n");
file_put_contents("$dir/.htaccess", "<IfModule mod_rewrite.c>\n    RewriteEngine On\n    RewriteCond %{REQUEST_URI} !^/public/\n    RewriteRule ^(.*)$ public/\$1 [L]\n</IfModule>\n");
logMsg('index.php + .htaccess forcés');

// 3. Migrations via Laravel kernel
chdir($dir);
try {
    require_once "$dir/vendor/autoload.php";
    $app    = require_once "$dir/bootstrap/app.php";
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);

    foreach ([
        ['migrate',      ['--force' => true]],
        ['config:cache', []],
        ['route:cache',  []],
        ['view:cache',   []],
    ] as [$cmd, $args]) {
        try {
            ob_start();
            $kernel->call($cmd, $args);
            ob_end_clean();
            logMsg("$cmd : OK");
        } catch (\Throwable $e) {
            ob_end_clean();
            logMsg("$cmd ERREUR : " . $e->getMessage());
        }
    }
} catch (\Throwable $e) {
    logMsg('Bootstrap erreur : ' . $e->getMessage());
}

// 4. Permissions
shell_exec("chmod -R 775 $dir/storage $dir/bootstrap/cache 2>&1");
logMsg('Permissions OK');
logMsg('=== Déploiement terminé ===');

echo 'OK';

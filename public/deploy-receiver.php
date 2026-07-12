<?php
// Récepteur de déploiement automatique — appelé par GitHub Actions
if (($_POST['secret'] ?? '') !== 'construiro_deploy_2026') {
    http_response_code(403);
    die('Accès refusé');
}

$dir = dirname(__DIR__); // = dossier parent de public/
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

// 3. Composer install (sans dev)
$composerOut = shell_exec("cd $dir && composer install --no-dev --optimize-autoloader --no-interaction 2>&1");
logMsg('composer install : ' . (str_contains($composerOut ?? '', 'Generating') ? 'OK' : substr($composerOut ?? '', -100)));

// 4. Permissions avant artisan (php-fpm = www-data doit pouvoir écrire)
shell_exec("chown -R www-data:www-data $dir/storage $dir/bootstrap/cache 2>&1");
shell_exec("chmod -R 775 $dir/storage $dir/bootstrap/cache 2>&1");

// 5. Artisan via sudo -u www-data pour que les fichiers de cache appartiennent à www-data
foreach ([
    "migrate --force",
    "config:cache",
    "route:cache",
    "view:cache",
] as $cmd) {
    $out = shell_exec("cd $dir && sudo -u www-data php artisan $cmd 2>&1");
    logMsg("$cmd : " . (str_contains($out ?? '', 'successfully') || str_contains($out ?? '', 'DONE') ? 'OK' : substr($out ?? '', -100)));
}

logMsg('Permissions OK');
logMsg('=== Déploiement terminé ===');

echo 'DEPLOY_OK:' . $dir . ':index=' . (file_exists("$dir/index.php") ? filesize("$dir/index.php") . 'bytes' : 'ABSENT');

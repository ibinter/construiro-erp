<?php
if (($_GET['go'] ?? '') !== 'construiro2026') die('Accès refusé');

$dir       = '/htdocs/construiro.com';
$vendorUrl = 'http://intermark-business.com/construiro_vendor.zip';

set_time_limit(600);
ini_set('memory_limit', '512M');

function section(string $t): void {
    echo "<h3 style='color:#f97316;font-family:sans-serif;margin-top:28px'>$t</h3>";
    ob_flush(); flush();
}
function ok(string $msg): void  { echo "<div style='color:#16a34a;font-family:monospace'>✅ $msg</div>"; ob_flush(); flush(); }
function err(string $msg): void { echo "<div style='color:#dc2626;font-family:monospace'>❌ $msg</div>"; ob_flush(); flush(); }
function info(string $msg): void { echo "<div style='color:#94a3b8;font-family:monospace'>ℹ️ $msg</div>"; ob_flush(); flush(); }

echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Setup 5</title></head>";
echo "<body style='background:#1e293b;color:#f1f5f9;padding:24px;max-width:960px;margin:0 auto'>";
echo "<h1 style='color:#f97316;font-family:sans-serif'>📦 CONSTRUIRO — Installation vendor/</h1>";

// ─── 1. TÉLÉCHARGER vendor.zip DEPUIS INTERMARK ───────────────────────────
section('1. Téléchargement vendor.zip depuis intermark-business.com');

if (is_dir("$dir/vendor")) {
    ok('vendor/ déjà présent — skip téléchargement');
} else {
    $vendorZip = "$dir/vendor_dl.zip";
    info("Téléchargement depuis $vendorUrl ...");
    info("(Patience, 33 Mo à télécharger entre les serveurs)");

    $ctx  = stream_context_create(['http' => ['timeout' => 300]]);
    $data = file_get_contents($vendorUrl, false, $ctx);

    if ($data && strlen($data) > 1000000) {
        file_put_contents($vendorZip, $data);
        ok('vendor.zip téléchargé : ' . round(strlen($data)/1024/1024, 1) . ' Mo');

        // Extraire
        info('Extraction...');
        $zip = new ZipArchive();
        if ($zip->open($vendorZip) === true) {
            $zip->extractTo($dir);
            $zip->close();
            unlink($vendorZip);
            if (is_dir("$dir/vendor")) {
                ok('vendor/ extrait avec succès !');
            } else {
                err('Extraction terminée mais vendor/ introuvable');
            }
        } else {
            err('Impossible d\'ouvrir le zip');
        }
    } else {
        err('Téléchargement échoué — taille reçue : ' . strlen($data ?? '') . ' octets');
        err('Vérifie que http://intermark-business.com/construiro_vendor.zip est accessible');
    }
}

// ─── 2. MIGRATIONS + CACHE VIA LARAVEL KERNEL ─────────────────────────────
section('2. Migrations base de données');
if (is_dir("$dir/vendor")) {
    chdir($dir);
    try {
        require_once "$dir/vendor/autoload.php";
        $app    = require_once "$dir/bootstrap/app.php";
        $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);

        $commands = [
            ['migrate',       ['--force' => true]],
            ['db:seed',       ['--class' => 'RolePermissionSeeder', '--force' => true]],
            ['config:cache',  []],
            ['route:cache',   []],
            ['view:cache',    []],
        ];

        foreach ($commands as [$cmd, $args]) {
            try {
                ob_start();
                $kernel->call($cmd, $args);
                $out = trim(ob_get_clean());
                ok("$cmd" . ($out ? ' → ' . substr(strip_tags($out), 0, 80) : ''));
            } catch (\Throwable $e) {
                ob_end_clean();
                err("$cmd : " . $e->getMessage());
            }
        }
    } catch (\Throwable $e) {
        err('Bootstrap Laravel : ' . $e->getMessage());
    }
} else {
    err('vendor/ absent — migrations impossibles');
}

// ─── 3. PERMISSIONS ───────────────────────────────────────────────────────
section('3. Permissions storage');
shell_exec("chmod -R 775 $dir/storage $dir/bootstrap/cache 2>&1");
ok('chmod 775 storage/ bootstrap/cache/');

// ─── 4. RÉSUMÉ ────────────────────────────────────────────────────────────
section('4. Résumé final');
foreach (['app', 'vendor', 'public', 'resources', '.env', 'public/build'] as $f) {
    if (file_exists("$dir/$f") || is_dir("$dir/$f")) ok($f);
    else err("$f ABSENT");
}

echo "<div style='background:#16a34a;color:#fff;padding:20px;border-radius:8px;margin-top:32px;font-family:sans-serif;font-size:15px'>";
echo "<strong>✅ Installation terminée !</strong><br><br>";
echo "Étapes suivantes :<br>";
echo "1. 🗑️ Supprimer tous les fichiers setup*.php, diag.php et composer.phar<br>";
echo "2. 🗑️ Supprimer construiro_vendor.zip sur intermark-business.com<br>";
echo "3. 🌐 <strong>Multi Domaines</strong> → construiro.com → répertoire : <code>/construiro.com/public</code><br>";
echo "4. 🔒 <strong>SSL</strong> → activer Let's Encrypt sur construiro.com";
echo "</div></body></html>";

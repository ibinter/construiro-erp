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
    } elseif ($diag === 'laravel-error') {
        // Affiche le DEBUT de la derniere entree ERROR (le vrai message d'exception)
        $logFile = $dir . '/storage/logs/laravel.log';
        if (file_exists($logFile)) {
            $lines = file($logFile);
            $lastErrorLine = -1;
            foreach ($lines as $i => $line) {
                if (strpos($line, '.ERROR:') !== false) {
                    $lastErrorLine = $i;
                }
            }
            if ($lastErrorLine === -1) {
                echo "Aucune entree ERROR trouvee dans le log.\n";
            } else {
                $excerpt = array_slice($lines, $lastErrorLine, 60);
                echo implode('', $excerpt);
            }
        } else {
            echo "Log file not found: $logFile";
        }
    } elseif ($diag === 'seed-permissions') {
        // Lance UNIQUEMENT RolePermissionSeeder (namespace complet pour éviter fallback sur DatabaseSeeder)
        echo shell_exec("cd $dir && php artisan db:seed --class='Database\\\\Seeders\\\\RolePermissionSeeder' --force 2>&1");
    } elseif ($diag === 'seed-payment') {
        // Initialise les 11 méthodes de paiement (idempotent via updateOrCreate)
        echo shell_exec("cd $dir && php artisan db:seed --class='Database\\\\Seeders\\\\PaymentMethodSeeder' --force 2>&1");
    } elseif ($diag === 'seed-faq') {
        // Initialise les 190 entrées FAQ (idempotent via updateOrCreate)
        echo shell_exec("cd $dir && php artisan db:seed --class='Database\\\\Seeders\\\\LandingFaqSeeder' --force 2>&1");
    } elseif ($diag === 'make-superadmin') {
        // Assigne super_admin à un utilisateur via son email : ?diag=make-superadmin&email=xxx
        $email = $_GET['email'] ?? '';
        if (!$email) { echo "Parametre email manquant.\n"; exit; }
        $cmd = "cd $dir && php artisan tinker --no-interaction --execute=\""
             . "\\$u = App\\\\Models\\\\User::where('email','$email')->first();"
             . "if(!\\$u){echo 'Utilisateur introuvable.';exit;}"
             . "\\$u->syncRoles(['super_admin']);"
             . "echo 'super_admin assigne a '.\$u->email;\"  2>&1";
        echo shell_exec($cmd);
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
        echo shell_exec("cd $dir && php artisan optimize:clear 2>&1");
        echo shell_exec("cd $dir && php artisan optimize 2>&1");
        echo "DONE\n";
    } elseif ($diag === 'perf') {
        // Diagnostic performance : OPcache, caches Laravel, mémoire PHP
        echo "=== PHP ===\n";
        echo "memory_limit    : " . ini_get('memory_limit') . "\n";
        echo "max_exec_time   : " . ini_get('max_execution_time') . "s\n";
        echo "PHP version     : " . PHP_VERSION . "\n\n";

        echo "=== OPcache ===\n";
        if (function_exists('opcache_get_status')) {
            $op = opcache_get_status(false);
            if ($op) {
                echo "enabled         : " . ($op['opcache_enabled'] ? "OUI" : "NON") . "\n";
                echo "cache_full      : " . ($op['cache_full'] ? "OUI (PROBLÈME)" : "non") . "\n";
                echo "scripts cached  : " . ($op['opcache_statistics']['num_cached_scripts'] ?? '?') . "\n";
                echo "hit rate        : " . round(($op['opcache_statistics']['opcache_hit_rate'] ?? 0), 1) . "%\n";
                echo "memory used     : " . round(($op['memory_usage']['used_memory'] ?? 0) / 1024 / 1024, 1) . " MB\n";
                echo "memory free     : " . round(($op['memory_usage']['free_memory'] ?? 0) / 1024 / 1024, 1) . " MB\n";
            } else {
                echo "OPcache désactivé ou non disponible\n";
            }
        } else {
            echo "opcache_get_status() non disponible\n";
        }

        echo "\n=== Caches Laravel (bootstrap/cache) ===\n";
        $cacheDir = $dir . '/bootstrap/cache';
        $cacheFiles = ['config.php', 'routes-v7.php', 'events.php', 'services.php'];
        foreach ($cacheFiles as $cf) {
            $path = $cacheDir . '/' . $cf;
            if (file_exists($path)) {
                echo "$cf : OK (" . round(filesize($path) / 1024, 1) . " KB, " . date('d/m H:i', filemtime($path)) . ")\n";
            } else {
                echo "$cf : ABSENT — caches non générés !\n";
            }
        }

        echo "\n=== Assets Vite (public/build) ===\n";
        $buildDir = $dir . '/public/build';
        if (is_dir($buildDir)) {
            $jsFiles = glob($buildDir . '/assets/*.js');
            $cssFiles = glob($buildDir . '/assets/*.css');
            echo "JS chunks   : " . count($jsFiles) . " fichiers\n";
            echo "CSS chunks  : " . count($cssFiles) . " fichiers\n";
            $totalSize = 0;
            foreach (array_merge($jsFiles, $cssFiles) as $f) { $totalSize += filesize($f); }
            echo "Taille totale : " . round($totalSize / 1024 / 1024, 2) . " MB\n";
            foreach ($jsFiles as $f) {
                echo "  " . basename($f) . " : " . round(filesize($f) / 1024, 0) . " KB\n";
            }
        } else {
            echo "public/build/ introuvable\n";
        }

        echo "\n=== Artisan optimize (forcer) ===\n";
        echo shell_exec("cd $dir && php artisan optimize 2>&1");
        echo "DONE\n";
    } elseif ($diag === 'optimize') {
        echo shell_exec("cd $dir && php artisan optimize:clear 2>&1");
        echo shell_exec("cd $dir && php artisan optimize 2>&1");
        echo "DONE\n";
    } elseif ($diag === 'fix-mail') {
        // Configure SMTP dans le .env — params GET: host, port, user, pass, from, from_name, encryption, mailer
        $envPath = $dir . '/.env';
        $env = file_get_contents($envPath);
        $env = ltrim($env, "\xEF\xBB\xBF"); // Supprimer BOM
        $vars = [
            'MAIL_MAILER'       => $_GET['mailer'] ?? 'smtp',
            'MAIL_HOST'         => $_GET['host'] ?? 'mail.ibigsoft.com',
            'MAIL_PORT'         => $_GET['port'] ?? '465',
            'MAIL_USERNAME'     => $_GET['user'] ?? '',
            'MAIL_PASSWORD'     => $_GET['pass'] ?? '',
            'MAIL_ENCRYPTION'   => $_GET['encryption'] ?? 'ssl',
            'MAIL_FROM_ADDRESS' => $_GET['from'] ?? 'construiro@ibigsoft.com',
            'MAIL_FROM_NAME'    => $_GET['from_name'] ?? 'CONSTRUIRO ERP',
        ];
        foreach ($vars as $key => $val) {
            $val  = str_replace("\xEF\xBB\xBF", '', trim($val)); // Supprimer BOM dans la valeur
            $line = "$key=" . (strpos($val, ' ') !== false ? '"'.$val.'"' : $val);
            if (preg_match('/^' . preg_quote($key, '/') . '=/m', $env)) {
                $env = preg_replace('/^' . preg_quote($key, '/') . '=.*/m', $line, $env);
            } else {
                $env .= "\n$line";
            }
            echo "✓ $line\n";
        }
        file_put_contents($envPath, $env);
        echo shell_exec("cd $dir && php artisan config:clear 2>&1");
        echo "\nMAIL configuré. DONE\n";
    } elseif ($diag === 'check-mail') {
        // Affiche la config MAIL courante (sans le mot de passe)
        $envPath = $dir . '/.env';
        $env = file_get_contents($envPath);
        $keys = ['MAIL_MAILER','MAIL_HOST','MAIL_PORT','MAIL_USERNAME','MAIL_ENCRYPTION','MAIL_FROM_ADDRESS','MAIL_FROM_NAME','QUEUE_CONNECTION'];
        foreach ($keys as $k) {
            if (preg_match('/^' . preg_quote($k, '/') . '=(.*)$/m', $env, $m)) {
                echo "$k=" . trim($m[1]) . "\n";
            } else {
                echo "$k=(non défini)\n";
            }
        }
        echo "\n=== Jobs en attente ===\n";
        echo shell_exec("cd $dir && php artisan queue:monitor database 2>&1 | head -10") ?: "";
        // Compte les jobs dans la table
        echo shell_exec("cd $dir && php artisan tinker --no-interaction --execute=\"echo 'Jobs en attente: '.DB::table('jobs')->count();echo ' | Échoués: '.DB::table('failed_jobs')->count();\" 2>&1");
    } elseif ($diag === 'run-jobs') {
        // Traite les jobs en attente (une seule passe, timeout 60s)
        echo "=== Traitement des jobs en queue ===\n";
        $output = shell_exec("cd $dir && timeout 60 php artisan queue:work --once --timeout=30 --tries=3 2>&1");
        echo $output ?: "(aucun output)\n";
        echo "\nJobs restants:\n";
        echo shell_exec("cd $dir && php artisan tinker --no-interaction --execute=\"echo DB::table('jobs')->count().' jobs en attente';\" 2>&1");
        echo "\nDONE\n";
    } elseif ($diag === 'restart-worker') {
        // Tue le worker en cours et en lance un nouveau
        $pidFile = $dir . '/storage/queue-worker.pid';
        if (file_exists($pidFile)) {
            $pid = trim(file_get_contents($pidFile));
            shell_exec("kill $pid 2>/dev/null");
            unlink($pidFile);
            echo "Worker $pid arrêté.\n";
            sleep(1);
        }
        $cmd = "cd $dir && php artisan queue:work --sleep=3 --tries=3 --timeout=60 --daemon > $dir/storage/logs/queue-worker.log 2>&1 & echo $!";
        $pid = trim(shell_exec($cmd));
        file_put_contents($pidFile, $pid);
        echo "Nouveau worker démarré (PID $pid)\n";
        echo "DONE\n";
    } elseif ($diag === 'start-worker') {
        // Lance un worker en arrière-plan (persistant jusqu'au prochain déploiement)
        $pidFile = $dir . '/storage/queue-worker.pid';
        // Vérifier si un worker tourne déjà
        if (file_exists($pidFile)) {
            $pid = trim(file_get_contents($pidFile));
            $running = shell_exec("ps -p $pid -o pid= 2>/dev/null");
            if ($running) {
                echo "Worker déjà actif (PID $pid)\n";
                exit;
            }
        }
        $cmd = "cd $dir && php artisan queue:work --sleep=3 --tries=3 --timeout=60 --daemon > $dir/storage/logs/queue-worker.log 2>&1 & echo $!";
        $pid = trim(shell_exec($cmd));
        file_put_contents($pidFile, $pid);
        echo "Worker démarré (PID $pid)\n";
        echo "Logs: $dir/storage/logs/queue-worker.log\n";
        echo "DONE\n";
    } elseif ($diag === 'send-test') {
        // Envoie un email de test — Usage: ?diag=send-test&to=email@example.com
        $to = addslashes($_GET['to'] ?? 'patriceky@gmail.com');
        $toDisplay = $_GET['to'] ?? 'patriceky@gmail.com';
        $tmpFile = sys_get_temp_dir() . '/construiro_mail_test_' . time() . '.php';
        $phpCode  = "<?php\n";
        $phpCode .= "define('LARAVEL_START', microtime(true));\n";
        $phpCode .= "require '" . addslashes($dir) . "/vendor/autoload.php';\n";
        $phpCode .= "\$app = require_once '" . addslashes($dir) . "/bootstrap/app.php';\n";
        $phpCode .= "\$kernel = \$app->make(Illuminate\\Contracts\\Console\\Kernel::class);\n";
        $phpCode .= "\$kernel->bootstrap();\n";
        $phpCode .= "try {\n";
        $phpCode .= "    Illuminate\\Support\\Facades\\Mail::raw('Test SMTP CONSTRUIRO ERP - ' . date('Y-m-d H:i:s'), function(\$msg) {\n";
        $phpCode .= "        \$msg->to('" . $to . "')->subject('[TEST] SMTP CONSTRUIRO ERP');\n";
        $phpCode .= "    });\n";
        $phpCode .= "    echo 'EMAIL_SENT_OK';\n";
        $phpCode .= "} catch (Exception \$e) {\n";
        $phpCode .= "    echo 'EMAIL_ERROR: ' . \$e->getMessage();\n";
        $phpCode .= "}\n";
        file_put_contents($tmpFile, $phpCode);
        echo "=== Test envoi email vers: $toDisplay ===\n";
        $output = shell_exec("php $tmpFile 2>&1");
        echo ($output ?: '(aucune sortie)') . "\n";
        @unlink($tmpFile);
        // Config SMTP actuelle (sans password)
        echo "\n=== Config SMTP actuelle ===\n";
        $envPath = $dir . '/.env';
        $env = file_get_contents($envPath);
        foreach (['MAIL_MAILER','MAIL_HOST','MAIL_PORT','MAIL_USERNAME','MAIL_ENCRYPTION','MAIL_FROM_ADDRESS'] as $k) {
            if (preg_match('/^' . preg_quote($k, '/') . '=(.*)$/m', $env, $mx)) {
                echo "$k=" . trim($mx[1]) . "\n";
            }
        }
    } elseif ($diag === 'worker-logs') {
        $log = $dir . '/storage/logs/queue-worker.log';
        if (file_exists($log)) {
            $lines = file($log);
            echo implode('', array_slice($lines, -50));
        } else {
            echo "Aucun log de worker.\n";
        }
    } elseif ($diag === 'fix-drivers') {
        // SESSION_DRIVER=file + CACHE_STORE=file → supprime les requêtes SQL de session/cache sur chaque requête
        $envPath = $dir . '/.env';
        $env = file_get_contents($envPath);
        $replacements = [
            'SESSION_DRIVER' => 'file',
            'CACHE_STORE'    => 'file',
            'CACHE_DRIVER'   => 'file',
        ];
        foreach ($replacements as $key => $val) {
            $line = "$key=$val";
            if (preg_match('/^' . preg_quote($key, '/') . '=/m', $env)) {
                $env = preg_replace('/^' . preg_quote($key, '/') . '=.*/m', $line, $env);
                echo "Modifié : $line\n";
            } else {
                $env .= "\n$line";
                echo "Ajouté  : $line\n";
            }
        }
        file_put_contents($envPath, $env);
        // Vider les anciennes sessions DB et reconstruire les caches
        echo shell_exec("cd $dir && php artisan optimize:clear 2>&1");
        echo shell_exec("cd $dir && php artisan optimize 2>&1");
        echo "\nRésultat .env :\n";
        echo shell_exec("grep -E 'SESSION_DRIVER|CACHE_STORE|CACHE_DRIVER' $envPath 2>&1");
        echo "\nDONE\n";
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
// Variables MAIL (SMTP)
$mailParams = ['mail_mailer'=>'MAIL_MAILER','mail_host'=>'MAIL_HOST','mail_port'=>'MAIL_PORT',
               'mail_user'=>'MAIL_USERNAME','mail_pass'=>'MAIL_PASSWORD','mail_encryption'=>'MAIL_ENCRYPTION',
               'mail_from_address'=>'MAIL_FROM_ADDRESS','mail_from_name'=>'MAIL_FROM_NAME'];
foreach ($mailParams as $post => $env) {
    if (!empty($_POST[$post])) { $envVars[$env] = trim($_POST[$post]); }
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

// ── 6. Artisan : migrations + seeders essentiels + rebuild caches ──
// NOTE : les seeders de données (Landing, FAQ, Legal) ne tournent PAS
// à chaque deploy — ils sont idempotents mais lents et bloquent le process.
// Lancer manuellement via ?diag=seed-permissions si besoin.
$artisanCmds = [
    'optimize:clear',
    'migrate --force',
    'db:seed --class=\'Database\\Seeders\\RolePermissionSeeder\' --force',
    'package:discover --ansi',
    'optimize',
    'storage:link',
];

foreach ($artisanCmds as $cmd) {
    $out = shell_exec("cd $dir && php artisan $cmd 2>&1 | tail -3");
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
    // Supprimer BOM UTF-8 en début de fichier
    $content = ltrim($content, "\xEF\xBB\xBF");
    foreach ($vars as $key => $value) {
        // Supprimer BOM éventuel dans la valeur
        $value   = str_replace("\xEF\xBB\xBF", '', trim($value));
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

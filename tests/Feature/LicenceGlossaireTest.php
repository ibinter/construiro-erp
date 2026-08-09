<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Garde-fou « un seul langage » (cahier IBIG §12.8, §3.2 recette).
 * Empêche la réapparition d'une durée d'essai périmée ou d'un terme banni
 * dans les contenus destinés à l'utilisateur.
 */
class LicenceGlossaireTest extends TestCase
{
    private function scanFiles(): array
    {
        $roots = [base_path('resources/js'), base_path('resources/views'), base_path('database/seeders'), base_path('lang')];
        $files = [];
        foreach ($roots as $root) {
            if (!is_dir($root)) {
                continue;
            }
            $it = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS));
            foreach ($it as $f) {
                if ($f->isFile() && preg_match('/\.(jsx?|php|json|blade\.php)$/', $f->getFilename())) {
                    $files[] = $f->getPathname();
                }
            }
        }

        return $files;
    }

    public function test_aucune_duree_d_essai_perimee_en_dur(): void
    {
        // 14 = ancienne durée d'essai CONSTRUIRO. (15 est utilisé légitimement ailleurs :
        // délai de paiement fournisseur, délai de clôture de réclamation.)
        $offenders = [];
        foreach ($this->scanFiles() as $file) {
            $content = file_get_contents($file);
            if (preg_match('/14[ -](jours?|days?|day)/i', $content)) {
                $offenders[] = str_replace(base_path() . DIRECTORY_SEPARATOR, '', $file);
            }
        }

        $this->assertSame([], $offenders,
            "Durée d'essai périmée (14) trouvée en dur — la seule durée est 30 jours (licence.config.json) :\n" . implode("\n", $offenders));
    }

    public function test_aucun_terme_banni_dans_les_contenus(): void
    {
        // Termes bannis user-facing (cahier §12.3). "trial/free" internes (code) tolérés.
        $bannis = [
            'version d\'évaluation',
            'période test',
            'mode gratuit',
            'compte suspendu',
            'compte bloqué',
            'accès révoqué',
            'automatiquement suspendu',
            'automatically suspended',
            'licence à vie',
            'licence perpétuelle',
        ];

        // La fonctionnalité admin de suspension de compte (fraude/abus) est un concept
        // DISTINCT du cycle de vie de licence et emploie légitimement « suspendu ».
        $exclus = ['account_suspended', 'EmailTemplates'];

        $offenders = [];
        foreach ($this->scanFiles() as $file) {
            foreach ($exclus as $skip) {
                if (str_contains($file, $skip)) {
                    continue 2;
                }
            }
            $content = mb_strtolower(file_get_contents($file));
            foreach ($bannis as $terme) {
                if (str_contains($content, mb_strtolower($terme))) {
                    $offenders[] = str_replace(base_path() . DIRECTORY_SEPARATOR, '', $file) . " → « {$terme} »";
                }
            }
        }

        $this->assertSame([], $offenders,
            "Terme banni trouvé dans un contenu utilisateur :\n" . implode("\n", $offenders));
    }
}

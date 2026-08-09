<?php

namespace App\Services;

/**
 * Source unique de vérité des règles de licence (cahier IBIG v1.1, section 12.1).
 *
 * Lit licence.config.json à la racine du dépôt. AUCUNE durée, plafond ni prix
 * ne doit être écrit en dur ailleurs dans le code : tout passe par ce service.
 */
class LicenseConfig
{
    private static ?array $cache = null;

    public static function all(): array
    {
        if (self::$cache === null) {
            $path = base_path('licence.config.json');
            $json = is_readable($path) ? file_get_contents($path) : '{}';
            self::$cache = json_decode($json, true) ?: [];
        }

        return self::$cache;
    }

    /** Accès par chemin pointé : get('durees.essai_jours', 30). */
    public static function get(string $path, mixed $default = null): mixed
    {
        $value = self::all();
        foreach (explode('.', $path) as $segment) {
            if (!is_array($value) || !array_key_exists($segment, $value)) {
                return $default;
            }
            $value = $value[$segment];
        }

        return $value;
    }

    // ── Durées ───────────────────────────────────────────────────────────────

    public static function essaiJours(): int
    {
        return (int) self::get('durees.essai_jours', 30);
    }

    public static function graceJours(): int
    {
        return (int) self::get('durees.grace_jours', 7);
    }

    public static function retentionJours(): int
    {
        return (int) self::get('durees.retention_jours', 90);
    }

    public static function prolongationJours(): int
    {
        return (int) self::get('durees.prolongation_jours', 15);
    }

    // ── États ────────────────────────────────────────────────────────────────

    /** @return string[] */
    public static function etats(): array
    {
        return self::get('etats', ['demo', 'free', 'trial', 'active', 'grace', 'expired']);
    }

    public static function libelleEtat(string $etat): string
    {
        return self::get("libelles_etats.$etat", $etat);
    }

    // ── Palier gratuit « Découverte » ─────────────────────────────────────────

    public static function quotaChantiersGratuit(): int
    {
        return (int) self::get('gratuit.quotas.chantiers', 1);
    }

    public static function quotaGratuit(string $compteur): ?int
    {
        $v = self::get("gratuit.quotas.$compteur");

        return $v === null ? null : (int) $v;
    }

    /** @return string[] */
    public static function exclusionsGratuit(): array
    {
        return self::get('gratuit.exclusions', []);
    }

    public static function gratuitExclut(string $fonction): bool
    {
        return in_array($fonction, self::exclusionsGratuit(), true);
    }

    // ── Formules payantes (grille inchangée, règle D1) ────────────────────────

    public static function formules(): array
    {
        $f = self::get('formules', []);
        unset($f['_source']);

        return $f;
    }

    public static function formule(string $slug): ?array
    {
        return self::formules()[$slug] ?? null;
    }

    /**
     * Plafond de chantiers pour une formule donnée.
     * Retourne null si illimité (convention ≥ 9999).
     */
    public static function chantiersPourFormule(?string $slug): ?int
    {
        if ($slug === null) {
            return self::quotaChantiersGratuit();
        }
        $cap = self::formule($slug)['max_chantiers'] ?? null;
        $illimite = (int) self::get('illimite.convention_valeur', 9999);
        if ($cap === null || (int) $cap >= $illimite) {
            return null;
        }

        return (int) $cap;
    }

    // ── Filigrane ──────────────────────────────────────────────────────────────

    public static function filigraneTexte(): string
    {
        return self::get('filigrane.texte', 'Généré avec CONSTRUIRO — ibigsoft.com');
    }

    /** Le filigrane s'applique-t-il dans cet état ? */
    public static function filigranePourEtat(string $etat): bool
    {
        return in_array($etat, self::get('filigrane.applique_etat', ['demo', 'free']), true);
    }

    // ── Demo publique ──────────────────────────────────────────────────────────

    public static function demoActive(): bool
    {
        return (bool) self::get('demo.actif', false);
    }

    /** Réinitialise le cache (tests). */
    public static function flush(): void
    {
        self::$cache = null;
    }
}

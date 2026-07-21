<?php

namespace App\Services;

use SimpleSoftwareIO\QrCode\Generator as QrGenerator;

/**
 * Service de génération de QR codes pour les documents PDF.
 * Utilise simplesoftwareio/simple-qrcode (déjà installé dans le projet).
 */
class QrCodeService
{
    /**
     * Génère un QR code SVG inline pour l'URL donnée.
     * Le SVG est retourné comme chaîne et peut être injecté directement dans Blade.
     */
    public static function makeSvg(string $url, int $size = 120): string
    {
        return (string) (new QrGenerator())->format('svg')->size($size)->generate($url);
    }

    /**
     * Construit l'URL de vérification publique pour un document.
     *
     * @param  string  $type    Type court : 'po' pour bon de commande, 'payslip' pour bulletin.
     * @param  string  $number  Identifiant public du document (code, id…).
     */
    public static function verificationUrl(string $type, string $number): string
    {
        return url("/verify/{$type}/{$number}");
    }
}

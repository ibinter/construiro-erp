<?php

namespace App\Services;

class TotpService
{
    /**
     * Génère un secret Base32 de 32 caractères (160 bits — RFC 4226 recommande ≥ 128 bits).
     */
    public function generateSecret(): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';
        for ($i = 0; $i < 32; $i++) {
            $secret .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $secret;
    }

    /**
     * Calcule le code TOTP pour l'intervalle courant ± offset (RFC 6238).
     */
    public function getCode(string $secret, int $offset = 0): string
    {
        $time = (int) floor((time() + $offset * 30) / 30);
        $secretBytes = $this->base32Decode($secret);

        // Counter = 8 octets big-endian
        $timePacked = pack('N*', 0) . pack('N*', $time);
        $hash = hash_hmac('sha1', $timePacked, $secretBytes, true);

        // Dynamic truncation (RFC 4226 §5.4)
        $offset = ord($hash[19]) & 0x0F;
        $code = (
            ((ord($hash[$offset + 0]) & 0x7F) << 24) |
            ((ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((ord($hash[$offset + 2]) & 0xFF) << 8) |
            ((ord($hash[$offset + 3]) & 0xFF))
        ) % 1_000_000;

        return str_pad((string) $code, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Vérifie le code fourni par l'utilisateur (tolérance ±1 intervalle de 30 s).
     */
    public function verify(string $secret, string $userCode): bool
    {
        $userCode = trim($userCode);
        for ($i = -1; $i <= 1; $i++) {
            if (hash_equals($this->getCode($secret, $i), $userCode)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Retourne l'URL otpauth:// encodée pour générer un QR code via qrserver.com.
     */
    public function getQrCodeUrl(string $secret, string $email, string $issuer = 'CONSTRUIRO ERP'): string
    {
        $label = rawurlencode("{$issuer}:{$email}");
        $otpauth = "otpauth://totp/{$label}?secret={$secret}&issuer=" . rawurlencode($issuer);

        return 'https://api.qrserver.com/v1/create-qr-code/?data='
            . rawurlencode($otpauth)
            . '&size=200x200&margin=8';
    }

    /**
     * Décode une chaîne Base32 en bytes binaires.
     */
    private function base32Decode(string $base32): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $base32 = strtoupper(rtrim($base32, '='));
        $bits = '';
        foreach (str_split($base32) as $c) {
            $pos = strpos($chars, $c);
            if ($pos === false) {
                continue;
            }
            $bits .= str_pad(decbin($pos), 5, '0', STR_PAD_LEFT);
        }
        $bytes = str_split($bits, 8);
        $result = '';
        foreach ($bytes as $b) {
            if (strlen($b) === 8) {
                $result .= chr(bindec($b));
            }
        }
        return $result;
    }
}

<?php
declare(strict_types=1);

namespace Zee;

/** Verifies a Cloudflare Turnstile token on the server. */
final class Turnstile
{
    public static function verify(string $secret, string $token, string $ip): bool
    {
        if ($token === '') {
            return false;
        }
        $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => $ip]),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
        ]);
        $raw = curl_exec($ch);
        curl_close($ch);
        $data = is_string($raw) ? json_decode($raw, true) : null;
        return is_array($data) && ($data['success'] ?? false) === true;
    }
}

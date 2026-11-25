<?php
declare(strict_types=1);

namespace Zee;

final class Http
{
    public static function wantsJson(): bool
    {
        $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
        return stripos($accept, 'application/json') !== false;
    }

    public static function json(int $status, array $body): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    public static function redirect(string $location): void
    {
        header('Cache-Control: no-store');
        header('Location: ' . $location, true, 303);
    }

    public static function clientIp(): string
    {
        // Hostinger (LiteSpeed) passes the visitor IP in REMOTE_ADDR.
        // Forwarded headers are not trusted, because visitors can fake them.
        return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
    }

    /** True if the request came from one of our own pages (or sent no Origin at all). */
    public static function sameOrigin(string $siteUrl, bool $allowLocal): bool
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin === '' || $origin === 'null') {
            return $origin === '';
        }
        $host = strtolower((string)parse_url($origin, PHP_URL_HOST));
        $siteHost = strtolower((string)parse_url($siteUrl, PHP_URL_HOST));
        $allowed = [$siteHost, 'www.' . preg_replace('/^www\./', '', $siteHost), preg_replace('/^www\./', '', $siteHost)];
        if ($allowLocal) {
            array_push($allowed, 'localhost', '127.0.0.1');
        }
        $own = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
        $own = preg_replace('/:\d+$/', '', $own);
        if ($own !== '') {
            $allowed[] = $own;
        }
        return in_array($host, $allowed, true);
    }
}

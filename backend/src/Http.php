<?php

declare(strict_types=1);

final class Http
{
    /**
     * Emits a JSON response and terminates the request.
     */
    public static function json(int $status, array $payload, array $headers = []): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: no-store');

        foreach ($headers as $name => $value) {
            header($name . ': ' . $value);
        }

        echo json_encode(
            $payload,
            JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
        );

        exit;
    }

    /**
     * Returns the matched origin when it is allowed, otherwise null.
     */
    public static function matchOrigin(array $allowedOrigins, ?string $origin): ?string
    {
        if ($origin === null || $origin === '') {
            return null;
        }

        foreach ($allowedOrigins as $allowed) {
            if (hash_equals($allowed, $origin)) {
                return $origin;
            }
        }

        return null;
    }

    /**
     * Applies the CORS response headers for an allowed origin.
     */
    public static function allowOrigin(string $origin): void
    {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }

    public static function preflightHeaders(): void
    {
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-Api-Key');
        header('Access-Control-Max-Age: 600');
    }

    /**
     * Only trusts REMOTE_ADDR. Proxy headers are intentionally ignored because
     * they can be spoofed unless the app is behind a trusted proxy.
     */
    public static function ip(): string
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';

        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    }

    public static function userAgent(): string
    {
        return mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255);
    }
}

<?php

declare(strict_types=1);

$config = require dirname(__DIR__) . '/src/bootstrap.php';

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$origin = Http::matchOrigin(
    $config['app']['allowed_origins'],
    $_SERVER['HTTP_ORIGIN'] ?? null
);

if ($origin === null) {
    Http::json(403, [
        'success' => false,
        'message' => 'Origin not allowed.',
    ]);
}

Http::allowOrigin($origin);
Http::preflightHeaders();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = rtrim($path, '/') ?: '/';
$ip = Http::ip();

// ---------------------------------------------------------------------------
// POST /book - stores a booking from the payment dialog.
// ---------------------------------------------------------------------------
if ($path === '/book') {
    if ($method !== 'POST') {
        Http::json(405, [
            'success' => false,
            'message' => 'Method not allowed.',
        ], ['Allow' => 'POST, OPTIONS']);
    }

    // A custom header required by the client, combined with the origin
    // allowlist, makes casual curl/script requests fail unless they
    // deliberately mimic the browser handshake. It is not authentication.
    $requestHeader = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
    if (!hash_equals($config['app']['request_header'], $requestHeader)) {
        Http::json(403, [
            'success' => false,
            'message' => 'Missing or invalid request header.',
        ]);
    }

    if ($config['app']['api_key'] !== '') {
        $providedKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
        if (!hash_equals($config['app']['api_key'], $providedKey)) {
            Http::json(401, [
                'success' => false,
                'message' => 'Invalid API key.',
            ]);
        }
    }

    $contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    if ($contentType !== 'application/json') {
        Http::json(415, [
            'success' => false,
            'message' => 'Content-Type must be application/json.',
        ]);
    }

    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > $config['app']['max_body_bytes']) {
        Http::json(413, [
            'success' => false,
            'message' => 'Request body is too large.',
        ]);
    }

    $limiter = new RateLimiter(
        dirname(__DIR__) . '/storage/rate_limits',
        $config['app']['rate_limit']['max'],
        $config['app']['rate_limit']['window']
    );
    $rate = $limiter->hit(hash('sha256', 'book|' . $ip));

    if (!$rate['allowed']) {
        Http::json(429, [
            'success' => false,
            'message' => 'Too many requests. Please try again shortly.',
        ], ['Retry-After' => (string) $rate['retry_after']]);
    }

    $rawBody = file_get_contents('php://input');

    if ($rawBody === false || $rawBody === '') {
        Http::json(400, [
            'success' => false,
            'message' => 'Request body is required.',
        ]);
    }

    try {
        $payload = json_decode($rawBody, true, 32, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        Http::json(400, [
            'success' => false,
            'message' => 'Request body must be valid JSON.',
        ]);
    }

    if (!is_array($payload)) {
        Http::json(400, [
            'success' => false,
            'message' => 'Request body must be a JSON object.',
        ]);
    }

    try {
        $pdo = Database::connect($config['db']);
        $service = new BookingService($config, $pdo);
        $booking = $service->create($payload, $ip, Http::userAgent());

        // The booking is already stored; email problems must never roll back or
        // fail the payment response.
        $emailSent = false;

        try {
            $mailer = new Mailer($config['mail'], $config['app']['frontend_url']);
            $emailSent = $mailer->sendBookingConfirmation($booking);
        } catch (Throwable $exception) {
            error_log('[mail] ' . $exception);
        }

        Http::json(201, [
            'success' => true,
            'message' => 'Booking stored successfully.',
            'data' => $booking,
            'email_sent' => $emailSent,
        ]);
    } catch (ValidationException $exception) {
        Http::json(422, [
            'success' => false,
            'message' => 'The given data was invalid.',
            'errors' => $exception->errors,
        ]);
    } catch (Throwable $exception) {
        error_log('[book] ' . $exception);
        Http::json(500, [
            'success' => false,
            'message' => 'Unable to process the booking right now.',
        ]);
    }
}

// ---------------------------------------------------------------------------
// GET /bookings/{hash_id} - public invoice lookup by MD5 hash.
// ---------------------------------------------------------------------------
if (preg_match('#^/bookings/([a-f0-9]{32})$#i', $path, $matches) === 1) {
    if ($method !== 'GET') {
        Http::json(405, [
            'success' => false,
            'message' => 'Method not allowed.',
        ], ['Allow' => 'GET, OPTIONS']);
    }

    $limiter = new RateLimiter(
        dirname(__DIR__) . '/storage/rate_limits',
        $config['app']['invoice_rate_limit']['max'],
        $config['app']['invoice_rate_limit']['window']
    );
    $rate = $limiter->hit(hash('sha256', 'invoice|' . $ip));

    if (!$rate['allowed']) {
        Http::json(429, [
            'success' => false,
            'message' => 'Too many requests. Please try again shortly.',
        ], ['Retry-After' => (string) $rate['retry_after']]);
    }

    try {
        $pdo = Database::connect($config['db']);
        $service = new BookingService($config, $pdo);
        $booking = $service->findByHash(strtolower($matches[1]));

        if ($booking === null) {
            Http::json(404, [
                'success' => false,
                'message' => 'Invoice not found.',
            ]);
        }

        Http::json(200, [
            'success' => true,
            'data' => $booking,
        ]);
    } catch (Throwable $exception) {
        error_log('[invoice] ' . $exception);
        Http::json(500, [
            'success' => false,
            'message' => 'Unable to load the invoice right now.',
        ]);
    }
}

Http::json(404, [
    'success' => false,
    'message' => 'Not found.',
]);

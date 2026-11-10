<?php

declare(strict_types=1);

/**
 * Application configuration.
 *
 * Values can be overridden with environment variables so local credentials do
 * not have to live in source control in a real deployment.
 */
return [
    'db' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => (int) (getenv('DB_PORT') ?: 3306),
        'name' => getenv('DB_NAME') ?: 'aurehotel',
        'user' => getenv('DB_USER') ?: 'root',
        'pass' => getenv('DB_PASS') !== false ? (string) getenv('DB_PASS') : '1232',
        'charset' => 'utf8mb4',
    ],

    'app' => [
        'timezone' => getenv('APP_TIMEZONE') ?: 'Asia/Jakarta',

        // Public frontend base URL, used for invoice links inside emails.
        'frontend_url' => rtrim(getenv('FRONTEND_URL') ?: 'http://localhost:5173', '/'),

        // Browser origins allowed to call the API. Comma-separated in env.
        'allowed_origins' => array_values(array_filter(array_map(
            'trim',
            explode(',', getenv('ALLOWED_ORIGINS') ?: implode(',', [
                'http://localhost:5173',
                'http://100.120.7.14:5173',
                'http://127.0.0.1:5173',
                'http://localhost:5174',
                'http://127.0.0.1:5174',
                'http://localhost:4173',
                'http://127.0.0.1:4173',
            ]))
        ))),

        // Custom header required on writes. This forces a CORS preflight from
        // browsers and filters out naive curl/script requests.
        'request_header' => 'AureHotelBooking',

        // Optional shared key. Leave empty to disable. When set, clients must
        // send it in the X-Api-Key header (BOOKING_API_KEY env on the server,
        // VITE_BOOKING_API_KEY on the frontend).
        'api_key' => getenv('BOOKING_API_KEY') ?: '',

        'max_body_bytes' => 20 * 1024,
        'rate_limit' => [
            'max' => (int) (getenv('RATE_LIMIT_MAX') ?: 10),
            'window' => (int) (getenv('RATE_LIMIT_WINDOW') ?: 60),
        ],
        'invoice_rate_limit' => [
            'max' => (int) (getenv('INVOICE_RATE_LIMIT_MAX') ?: 60),
            'window' => (int) (getenv('INVOICE_RATE_LIMIT_WINDOW') ?: 60),
        ],
    ],

    // SMTP settings for the booking confirmation email. Leave SMTP_HOST empty
    // to disable email delivery.
    'mail' => [
        'enabled' => filter_var(
            getenv('MAIL_ENABLED') !== false ? getenv('MAIL_ENABLED') : 'true',
            FILTER_VALIDATE_BOOLEAN
        ),
        'host' => getenv('SMTP_HOST') ?: '',
        'port' => (int) (getenv('SMTP_PORT') ?: 587),
        'username' => getenv('SMTP_USERNAME') ?: '',
        'password' => getenv('SMTP_PASSWORD') ?: '',
        // tls = STARTTLS, ssl = implicit TLS, none = plain connection.
        'encryption' => strtolower(getenv('SMTP_ENCRYPTION') ?: 'tls'),
        'verify_peer' => filter_var(
            getenv('SMTP_VERIFY_PEER') !== false ? getenv('SMTP_VERIFY_PEER') : 'true',
            FILTER_VALIDATE_BOOLEAN
        ),
        'timeout' => (int) (getenv('SMTP_TIMEOUT') ?: 10),
        'from_address' => getenv('MAIL_FROM_ADDRESS') ?: 'no-reply@aurehotel.id',
        'from_name' => getenv('MAIL_FROM_NAME') ?: 'AureHotel',
    ],

    // Server-side room catalogue. Prices are the source of truth so the client
    // cannot tamper with the total.
    'rooms' => [
        'standard' => ['name' => 'Standard Room', 'price' => 1200000],
        'deluxe' => ['name' => 'Deluxe Room', 'price' => 1800000],
        'family' => ['name' => 'Family Room', 'price' => 2750000],
    ],

    'pricing' => [
        'breakfast_per_night' => 80000,
        'discount_rate' => 0.10,
        'discount_min_nights' => 4,
        'max_nights' => 30,
    ],
];

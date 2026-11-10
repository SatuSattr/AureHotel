# AureHotel backend

Native PHP API for storing hotel bookings in MySQL. There are two endpoints:

- `POST /book` - creates a booking from the payment dialog.
- `GET /bookings/{hash_id}` - returns the booking for the public invoice page.

## Requirements

- PHP 8.2+ with `pdo_mysql`
- MySQL 8+

## Configuration

Defaults live in `config.php`:

- Host: `127.0.0.1:3306`
- Database: `aurehotel`
- User: `root`
- Password: `1232`

Every value can be overridden with environment variables (`DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USER`, `DB_PASS`, `ALLOWED_ORIGINS`, `BOOKING_API_KEY`,
`RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW`, `APP_TIMEZONE`, `FRONTEND_URL`).

`src/bootstrap.php` loads `backend/.env` automatically when it exists. Real
environment variables take precedence, and `.env` is gitignored. Copy
`.env.example` to `.env` to get started.

## Database setup

```bash
cd backend
php bin/push.php    # create the database/table if missing (idempotent)
php bin/fresh.php   # drop every table in the database, then apply the schema
```

`fresh` deletes all tables and bookings. Use it only during development.

## Run the API

```bash
cd backend
php -S localhost:8000 -t public public/index.php
```

The endpoint is then available at `http://localhost:8000/book`. Invoices are
fetched from `http://localhost:8000/bookings/{hash_id}` and rendered by the
frontend at `/invoice/{hash_id}`.

Each booking row stores an `hash_id` column containing the MD5 fingerprint of
the record. The invoice page uses it as an unguessable public link and encodes
it in the receipt QR code. Identity numbers are masked in the invoice response.

## Frontend connection

The frontend reads `VITE_API_BASE_URL` (default `http://localhost:8000`) and the
optional `VITE_BOOKING_API_KEY` from `frontend/.env.local`. Example:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

If `BOOKING_API_KEY` is set on the server, `VITE_BOOKING_API_KEY` must contain
the same value.

## Email / SMTP

After a booking is stored, the API sends a thank-you email with a link to
`{FRONTEND_URL}/invoice/{hash_id}`. Email delivery is optional: if `SMTP_HOST`
is empty the booking still succeeds and `email_sent` is `false`.

Copy `.env.example` to `.env` and configure:

```dotenv
FRONTEND_URL=http://localhost:5173

MAIL_ENABLED=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=user@example.com
SMTP_PASSWORD=secret
SMTP_ENCRYPTION=tls    # tls (STARTTLS), ssl (implicit TLS), or none
SMTP_TIMEOUT=10
SMTP_VERIFY_PEER=true
MAIL_FROM_ADDRESS=no-reply@aurehotel.id
MAIL_FROM_NAME=AureHotel
```

The client supports AUTH LOGIN and multipart text/HTML messages. Mail errors are
logged with the `[mail]` prefix and never fail the booking response.

## Security measures

- `POST` only, JSON content type, 20 KB body limit.
- Origin/Referer allowlist (`ALLOWED_ORIGINS`).
- Required `X-Requested-With: AureHotelBooking` header, which forces a CORS
  preflight for browser clients.
- Optional shared `X-Api-Key` header (set `BOOKING_API_KEY`).
- Per-IP sliding-window rate limit (10 requests per 60 seconds by default).
- Prepared statements, strict input validation, and server-side price/total
  recalculation so clients cannot tamper with amounts.
- Nationality is validated against the ISO 3166-1 country list; local guests
  must use a 16-digit Indonesian ID while international guests may send a
  4-25 character passport or ID number.
- Errors are logged server-side; database details are never returned to clients.

These are baseline protections. A public deployment should also sit behind a
reverse proxy/WAF with TLS, and identity numbers should be encrypted at rest.

<?php

declare(strict_types=1);

/**
 * Small SMTP client for transactional mail. It supports:
 * - implicit TLS (`SMTP_ENCRYPTION=ssl`), STARTTLS (`tls`), or plain (`none`)
 * - optional AUTH LOGIN credentials
 * - multipart text/plain + text/html bodies
 *
 * A dedicated mail library is not required, which keeps the backend dependency
 * free. Failures are thrown and logged by the caller.
 */
final class Mailer
{
    public function __construct(
        private readonly array $config,
        private readonly string $frontendUrl
    ) {
    }

    public function isEnabled(): bool
    {
        return (bool) $this->config['enabled'] && $this->config['host'] !== '';
    }

    /**
     * Sends the thank-you email with the invoice link. Returns false when mail
     * is disabled or not configured, and throws when SMTP communication fails.
     */
    public function sendBookingConfirmation(array $booking): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        $to = (string) $booking['email'];
        $name = (string) $booking['guest_name'];
        $reference = (string) $booking['reference'];

        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Invalid recipient email address.');
        }

        $invoiceUrl = $this->frontendUrl . '/invoice/' . $booking['hash_id'];
        $isLocal = ($booking['guest_origin'] ?? 'local') === 'local';

        if ($isLocal) {
            $subject = 'Terima kasih - Booking ' . $reference . ' di AureHotel';
            $text = $this->localText($name, $booking, $invoiceUrl);
            $html = $this->localHtml($name, $booking, $invoiceUrl);
        } else {
            $subject = 'Thank you - AureHotel booking ' . $reference;
            $text = $this->internationalText($name, $booking, $invoiceUrl);
            $html = $this->internationalHtml($name, $booking, $invoiceUrl);
        }

        $this->send($to, $subject, $text, $html);

        return true;
    }

    private function localText(string $name, array $booking, string $invoiceUrl): string
    {
        return implode("\n", [
            'Halo ' . $name . ',',
            '',
            'Terima kasih telah memesan di AureHotel. Pembayaran Anda telah kami terima.',
            '',
            'No. Invoice : ' . $booking['reference'],
            'Kamar       : ' . $booking['room_name'],
            'Tanggal     : ' . $booking['booking_date'],
            'Durasi      : ' . $booking['nights'] . ' malam',
            'Total       : Rp ' . number_format((float) $booking['total'], 0, ',', '.'),
            '',
            'Lihat invoice Anda di:',
            $invoiceUrl,
            '',
            'Sampai jumpa di Jakarta!',
            'AureHotel',
        ]);
    }

    private function internationalText(string $name, array $booking, string $invoiceUrl): string
    {
        return implode("\n", [
            'Hello ' . $name . ',',
            '',
            'Thank you for booking with AureHotel. We have received your payment.',
            '',
            'Invoice No. : ' . $booking['reference'],
            'Room        : ' . $booking['room_name'],
            'Date        : ' . $booking['booking_date'],
            'Stay        : ' . $booking['nights'] . ' night(s)',
            'Total       : Rp ' . number_format((float) $booking['total'], 0, ',', '.'),
            '',
            'View your invoice here:',
            $invoiceUrl,
            '',
            'We look forward to welcoming you in Jakarta!',
            'AureHotel',
        ]);
    }

    private function localHtml(string $name, array $booking, string $invoiceUrl): string
    {
        $safeName = htmlspecialchars($name, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $safeUrl = htmlspecialchars($invoiceUrl, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return $this->htmlLayout(
            'Terima kasih, ' . $safeName . '!',
            'Pembayaran Anda telah kami terima. Berikut detail pemesanan Anda.',
            [
                'No. Invoice' => (string) $booking['reference'],
                'Kamar' => (string) $booking['room_name'],
                'Tanggal' => (string) $booking['booking_date'],
                'Durasi' => $booking['nights'] . ' malam',
                'Total' => 'Rp ' . number_format((float) $booking['total'], 0, ',', '.'),
            ],
            'Lihat Invoice',
            $safeUrl
        );
    }

    private function internationalHtml(string $name, array $booking, string $invoiceUrl): string
    {
        $safeName = htmlspecialchars($name, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $safeUrl = htmlspecialchars($invoiceUrl, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return $this->htmlLayout(
            'Thank you, ' . $safeName . '!',
            'We have received your payment. Here are your booking details.',
            [
                'Invoice No.' => (string) $booking['reference'],
                'Room' => (string) $booking['room_name'],
                'Date' => (string) $booking['booking_date'],
                'Stay' => $booking['nights'] . ' night(s)',
                'Total' => 'Rp ' . number_format((float) $booking['total'], 0, ',', '.'),
            ],
            'View Invoice',
            $safeUrl
        );
    }

    /**
     * @param array<string, string> $details
     */
    private function htmlLayout(
        string $heading,
        string $intro,
        array $details,
        string $buttonText,
        string $invoiceUrl
    ): string {
        $rows = '';

        foreach ($details as $label => $value) {
            $rows .= '<tr>'
                . '<td style="padding:6px 0;color:#8a7b70;font-size:13px;">'
                . htmlspecialchars($label, ENT_QUOTES | ENT_HTML5, 'UTF-8')
                . '</td>'
                . '<td style="padding:6px 0;color:#3a2a20;font-size:13px;font-weight:600;text-align:right;">'
                . htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8')
                . '</td>'
                . '</tr>';
        }

        return '<!doctype html><html><body style="margin:0;padding:24px;background:#f4ece3;font-family:Arial,Helvetica,sans-serif;color:#3a2a20;">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;">'
            . '<tr><td style="padding:32px 32px 8px;text-align:center;">'
            . '<p style="margin:0;font-size:10px;letter-spacing:4px;color:#8a7b70;font-weight:700;">AUREHOTEL</p>'
            . '<h1 style="margin:12px 0 0;font-size:22px;line-height:1.3;">' . $heading . '</h1>'
            . '<p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:#6f6259;">' . $intro . '</p>'
            . '</td></tr>'
            . '<tr><td style="padding:16px 32px;">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px dashed #e3d8cc;border-bottom:1px dashed #e3d8cc;">'
            . $rows
            . '</table>'
            . '</td></tr>'
            . '<tr><td style="padding:8px 32px 32px;text-align:center;">'
            . '<a href="' . $invoiceUrl . '" style="display:inline-block;padding:13px 26px;border-radius:999px;background:#4a3a33;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;">' . $buttonText . '</a>'
            . '<p style="margin:18px 0 0;font-size:11px;line-height:1.6;color:#8a7b70;">AureHotel · Jl. Cikini Raya No. 48, Menteng, Jakarta Pusat</p>'
            . '</td></tr>'
            . '</table></body></html>';
    }

    private function send(string $to, string $subject, string $text, string $html): void
    {
        $fromAddress = (string) $this->config['from_address'];
        $fromName = (string) $this->config['from_name'];
        $boundary = 'ah-' . bin2hex(random_bytes(12));

        $headers = [
            'Date: ' . date(DATE_RFC2822),
            'From: ' . $this->encodeHeader($fromName) . ' <' . $fromAddress . '>',
            'To: <' . $to . '>',
            'Subject: ' . $this->encodeHeader($subject),
            'Message-ID: <' . bin2hex(random_bytes(12)) . '@aurehotel.local>',
            'MIME-Version: 1.0',
            'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
        ];

        $body = '--' . $boundary . "\r\n"
            . "Content-Type: text/plain; charset=UTF-8\r\n"
            . "Content-Transfer-Encoding: 8bit\r\n\r\n"
            . $this->normalize($text) . "\r\n"
            . '--' . $boundary . "\r\n"
            . "Content-Type: text/html; charset=UTF-8\r\n"
            . "Content-Transfer-Encoding: 8bit\r\n\r\n"
            . $this->normalize($html) . "\r\n"
            . '--' . $boundary . "--\r\n";

        $message = implode("\r\n", $headers) . "\r\n\r\n" . $body;

        $this->smtpSend($fromAddress, $to, $message);
    }

    private function smtpSend(string $from, string $to, string $message): void
    {
        $host = (string) $this->config['host'];
        $port = (int) $this->config['port'];
        $encryption = strtolower((string) $this->config['encryption']);
        $encryption = match ($encryption) {
            'tls', 'starttls' => 'tls',
            'ssl', 'smtps' => 'ssl',
            default => 'none',
        };
        $timeout = max(1, (int) $this->config['timeout']);

        $remote = ($encryption === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => (bool) $this->config['verify_peer'],
                'verify_peer_name' => (bool) $this->config['verify_peer'],
            ],
        ]);

        $socket = @stream_socket_client(
            $remote,
            $errorCode,
            $errorMessage,
            $timeout,
            STREAM_CLIENT_CONNECT,
            $context
        );

        if ($socket === false) {
            throw new RuntimeException(sprintf(
                'SMTP connection to %s:%d failed (%d): %s',
                $host,
                $port,
                $errorCode,
                $errorMessage
            ));
        }

        stream_set_timeout($socket, $timeout);

        try {
            $this->expect($socket, [220]);

            $hostname = gethostname() ?: 'localhost';
            $this->command($socket, 'EHLO ' . $hostname, [250]);

            if ($encryption === 'tls') {
                $this->command($socket, 'STARTTLS', [220]);

                if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    throw new RuntimeException('Unable to start SMTP TLS encryption.');
                }

                $this->command($socket, 'EHLO ' . $hostname, [250]);
            }

            $username = (string) $this->config['username'];

            if ($username !== '') {
                $this->command($socket, 'AUTH LOGIN', [334]);
                $this->command($socket, base64_encode($username), [334]);
                $this->command($socket, base64_encode((string) $this->config['password']), [235]);
            }

            $this->command($socket, 'MAIL FROM:<' . $from . '>', [250]);
            $this->command($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
            $this->command($socket, 'DATA', [354]);

            // SMTP requires CRLF line endings. Normalize first so multiline
            // text bodies are accepted by strict servers.
            $payload = str_replace(["\r\n", "\r"], "\n", $message);
            $payload = str_replace("\n", "\r\n", $payload);
            $payload = preg_replace('/^\./m', '..', $payload) ?? $payload;

            fwrite($socket, $payload . "\r\n.\r\n");
            $this->expect($socket, [250]);

            $this->command($socket, 'QUIT', [221, 250]);
        } finally {
            fclose($socket);
        }
    }

    /**
     * @param list<int> $expectedCodes
     */
    private function command($socket, string $command, array $expectedCodes): void
    {
        fwrite($socket, $command . "\r\n");
        $this->expect($socket, $expectedCodes);
    }

    /**
     * @param list<int> $expectedCodes
     */
    private function expect($socket, array $expectedCodes): string
    {
        $lines = [];

        while (($line = fgets($socket, 515)) !== false) {
            $line = rtrim($line, "\r\n");
            $lines[] = $line;

            if (preg_match('/^\d{3} /', $line) === 1) {
                break;
            }
        }

        if ($lines === []) {
            throw new RuntimeException('SMTP server closed the connection unexpectedly.');
        }

        $code = (int) substr((string) end($lines), 0, 3);

        if (!in_array($code, $expectedCodes, true)) {
            throw new RuntimeException('SMTP error: ' . implode(' | ', $lines));
        }

        return implode("\n", $lines);
    }

    private function encodeHeader(string $value): string
    {
        if (preg_match('/[^\x20-\x7e]/', $value) !== 1) {
            return $value;
        }

        return mb_encode_mimeheader($value, 'UTF-8', 'B', "\r\n");
    }

    private function normalize(string $value): string
    {
        return str_replace(["\r\n", "\r"], "\n", $value);
    }
}

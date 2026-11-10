<?php

declare(strict_types=1);

final class ValidationException extends RuntimeException
{
    /**
     * @param array<string, string> $errors
     */
    public function __construct(public readonly array $errors)
    {
        parent::__construct('The given data was invalid.');
    }
}

final class BookingService
{
    public function __construct(
        private readonly array $config,
        private readonly PDO $pdo
    ) {
    }

    /**
     * Validates the payload, recalculates every amount server-side, and stores
     * the booking. Client-supplied totals are never trusted.
     *
     * @return array<string, mixed>
     */
    public function create(array $input, string $ip, string $userAgent): array
    {
        $errors = [];
        $rooms = $this->config['rooms'];
        $pricing = $this->config['pricing'];

        $name = is_string($input['name'] ?? null) ? trim($input['name']) : '';
        if ($name === '') {
            $errors['name'] = 'Guest name is required.';
        } elseif (mb_strlen($name) < 3 || mb_strlen($name) > 120) {
            $errors['name'] = 'Guest name must be between 3 and 120 characters.';
        } elseif (preg_match('/\p{Nd}/u', $name) === 1) {
            $errors['name'] = 'Guest name cannot contain numbers.';
        } elseif (!preg_match("/^[\p{L}\p{M}.'\-\s]+$/u", $name)) {
            $errors['name'] = 'Guest name contains invalid characters.';
        }

        $gender = is_string($input['gender'] ?? null) ? $input['gender'] : '';
        if (!in_array($gender, ['male', 'female'], true)) {
            $errors['gender'] = 'Gender must be male or female.';
        }

        $email = is_string($input['email'] ?? null) ? trim($input['email']) : '';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
            $errors['email'] = 'A valid email address is required.';
        }

        $phone = is_string($input['phone'] ?? null) ? trim($input['phone']) : '';
        $phoneDigits = preg_replace('/\D/', '', $phone) ?? '';
        if (
            !preg_match('/^\+?[\d\s()-]{7,20}$/', $phone) ||
            strlen($phoneDigits) < 7 ||
            strlen($phoneDigits) > 15
        ) {
            $errors['phone'] = 'A valid phone number is required.';
        }

        $identity = is_string($input['identity'] ?? null) ? trim($input['identity']) : '';

        $guestOrigin = is_string($input['guestOrigin'] ?? null)
            ? strtolower(trim($input['guestOrigin']))
            : 'local';
        if (!in_array($guestOrigin, ['local', 'international'], true)) {
            $errors['guestOrigin'] = 'Guest origin must be local or international.';
        }

        $nationality = is_string($input['nationality'] ?? null)
            ? strtoupper(trim($input['nationality']))
            : '';

        if ($guestOrigin === 'international') {
            if (!Countries::isValid($nationality)) {
                $errors['nationality'] = 'A valid nationality is required for international guests.';
            }
        } else {
            $nationality = 'ID';
        }

        if ($guestOrigin === 'international') {
            if (!preg_match('/^[A-Za-z0-9]{4,25}$/', $identity)) {
                $errors['identity'] = 'Passport or ID number must be 4-25 letters or digits.';
            }
        } elseif (!preg_match('/^\d{16}$/', $identity)) {
            $errors['identity'] = 'Identity number must be exactly 16 digits.';
        }

        $roomId = is_string($input['roomId'] ?? null) ? $input['roomId'] : '';
        if (!isset($rooms[$roomId])) {
            $errors['roomId'] = 'Unknown room type.';
        }

        $bookingDate = is_string($input['bookingDate'] ?? null) ? $input['bookingDate'] : '';
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $bookingDate);
        $dateErrors = DateTimeImmutable::getLastErrors();
        $today = new DateTimeImmutable('today');
        $latest = $today->modify('+2 years');

        if (
            !$date instanceof DateTimeImmutable ||
            ($dateErrors !== false && ($dateErrors['warning_count'] > 0 || $dateErrors['error_count'] > 0)) ||
            $date->format('Y-m-d') !== $bookingDate
        ) {
            $errors['bookingDate'] = 'Booking date must use the Y-m-d format.';
        } elseif ($date < $today) {
            $errors['bookingDate'] = 'Booking date cannot be in the past.';
        } elseif ($date > $latest) {
            $errors['bookingDate'] = 'Booking date is too far in the future.';
        }

        $nightsRaw = $input['nights'] ?? null;
        $nights = filter_var($nightsRaw, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => $pricing['max_nights']],
        ]);
        if ($nights === false) {
            $errors['nights'] = 'Length of stay must be between 1 and ' . $pricing['max_nights'] . ' nights.';
        }

        $breakfast = filter_var($input['breakfast'] ?? false, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($breakfast === null) {
            $errors['breakfast'] = 'Breakfast must be a boolean.';
        }

        if ($errors !== []) {
            throw new ValidationException($errors);
        }

        $room = $rooms[$roomId];
        $roomSubtotal = (int) $room['price'] * $nights;
        $discount = $nights >= $pricing['discount_min_nights']
            ? (int) round($roomSubtotal * (float) $pricing['discount_rate'])
            : 0;
        $breakfastTotal = $breakfast ? (int) $pricing['breakfast_per_night'] * $nights : 0;
        $total = $roomSubtotal - $discount + $breakfastTotal;

        $statement = $this->pdo->prepare(
            'INSERT INTO bookings (
                reference, hash_id, guest_name, gender, guest_origin, nationality,
                email, phone, identity_number,
                room_id, room_name, booking_date, nights, breakfast,
                room_price, room_subtotal, discount, breakfast_total, total,
                currency, status, ip_address, user_agent
            ) VALUES (
                :reference, :hash_id, :guest_name, :gender, :guest_origin, :nationality,
                :email, :phone, :identity_number,
                :room_id, :room_name, :booking_date, :nights, :breakfast,
                :room_price, :room_subtotal, :discount, :breakfast_total, :total,
                :currency, :status, :ip_address, :user_agent
            )'
        );

        for ($attempt = 1; $attempt <= 3; $attempt++) {
            $reference = 'AH-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));

            // MD5 fingerprint of the stored record. The random reference keeps
            // every hash unique while still deriving from the record contents.
            $hashId = md5(implode('|', [
                $reference,
                $name,
                $gender,
                $guestOrigin,
                $nationality,
                $email,
                $phone,
                $identity,
                $roomId,
                $room['name'],
                $bookingDate,
                (string) $nights,
                $breakfast ? '1' : '0',
                (string) $roomSubtotal,
                (string) $discount,
                (string) $breakfastTotal,
                (string) $total,
                'IDR',
                'paid',
            ]));

            try {
                $statement->execute([
                    ':reference' => $reference,
                    ':hash_id' => $hashId,
                    ':guest_name' => $name,
                    ':gender' => $gender,
                    ':guest_origin' => $guestOrigin,
                    ':nationality' => $nationality,
                    ':email' => $email,
                    ':phone' => $phone,
                    ':identity_number' => $identity,
                    ':room_id' => $roomId,
                    ':room_name' => $room['name'],
                    ':booking_date' => $bookingDate,
                    ':nights' => $nights,
                    ':breakfast' => $breakfast ? 1 : 0,
                    ':room_price' => (int) $room['price'],
                    ':room_subtotal' => $roomSubtotal,
                    ':discount' => $discount,
                    ':breakfast_total' => $breakfastTotal,
                    ':total' => $total,
                    ':currency' => 'IDR',
                    ':status' => 'paid',
                    ':ip_address' => $ip,
                    ':user_agent' => $userAgent,
                ]);

                return [
                    'reference' => $reference,
                    'hash_id' => $hashId,
                    'guest_name' => $name,
                    'email' => $email,
                    'phone' => $phone,
                    'guest_origin' => $guestOrigin,
                    'nationality' => $nationality,
                    'room_id' => $roomId,
                    'room_name' => $room['name'],
                    'booking_date' => $bookingDate,
                    'nights' => $nights,
                    'breakfast' => $breakfast,
                    'room_price' => (int) $room['price'],
                    'room_subtotal' => $roomSubtotal,
                    'discount' => $discount,
                    'breakfast_total' => $breakfastTotal,
                    'total' => $total,
                    'currency' => 'IDR',
                    'status' => 'paid',
                ];
            } catch (PDOException $exception) {
                // 23000 = integrity constraint violation; retry a reference clash.
                if ($exception->getCode() !== '23000' || $attempt === 3) {
                    throw $exception;
                }
            }
        }

        throw new RuntimeException('Unable to create a unique booking reference.');
    }

    /**
     * Returns the booking belonging to a hash for the public invoice page.
     * The identity number is masked because the invoice URL can be shared.
     *
     * @return array<string, mixed>|null
     */
    public function findByHash(string $hashId): ?array
    {
        $statement = $this->pdo->prepare(
            'SELECT reference, hash_id, guest_name, gender, guest_origin,
                    nationality, email, phone, identity_number, room_id,
                    room_name, booking_date, nights, breakfast, room_price,
                    room_subtotal, discount, breakfast_total, total, currency,
                    status, created_at
             FROM bookings
             WHERE hash_id = :hash_id
             LIMIT 1'
        );

        $statement->execute([':hash_id' => $hashId]);
        $booking = $statement->fetch(PDO::FETCH_ASSOC);

        if ($booking === false) {
            return null;
        }

        $booking['identity_number'] = self::maskIdentity((string) $booking['identity_number']);
        $booking['nights'] = (int) $booking['nights'];
        $booking['breakfast'] = (bool) $booking['breakfast'];
        $booking['room_price'] = (int) $booking['room_price'];
        $booking['room_subtotal'] = (int) $booking['room_subtotal'];
        $booking['discount'] = (int) $booking['discount'];
        $booking['breakfast_total'] = (int) $booking['breakfast_total'];
        $booking['total'] = (int) $booking['total'];

        return $booking;
    }

    private static function maskIdentity(string $value): string
    {
        $length = mb_strlen($value);

        if ($length <= 4) {
            return str_repeat('*', $length);
        }

        return str_repeat('*', $length - 4) . mb_substr($value, -4);
    }
}

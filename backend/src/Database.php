<?php

declare(strict_types=1);

final class Database
{
    public static function dsn(array $db, bool $withDatabase = true): string
    {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;charset=%s',
            $db['host'],
            $db['port'],
            $db['charset']
        );

        if ($withDatabase) {
            $dsn .= ';dbname=' . $db['name'];
        }

        return $dsn;
    }

    public static function connect(array $db, bool $withDatabase = true): PDO
    {
        return new PDO(
            self::dsn($db, $withDatabase),
            $db['user'],
            $db['pass'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    }
}

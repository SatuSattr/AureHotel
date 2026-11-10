<?php

declare(strict_types=1);

final class Schema
{
    public static function ensureDatabase(array $db): void
    {
        self::assertSafeDatabaseName($db['name']);

        $pdo = Database::connect($db, false);
        $pdo->exec(sprintf(
            'CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
            $db['name']
        ));
    }

    /**
     * Applies the schema idempotently and returns the number of statements run.
     */
    public static function migrate(array $db): int
    {
        self::ensureDatabase($db);

        $schemaPath = dirname(__DIR__) . '/database/schema.sql';
        $sql = file_get_contents($schemaPath);

        if ($sql === false) {
            throw new RuntimeException('Unable to read database/schema.sql');
        }

        $pdo = Database::connect($db);
        $statements = self::splitStatements($sql);

        foreach ($statements as $statement) {
            $pdo->exec($statement);
        }

        return count($statements);
    }

    public static function fresh(array $db): int
    {
        self::assertSafeDatabaseName($db['name']);
        self::ensureDatabase($db);

        $pdo = Database::connect($db);
        $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');

        try {
            $tables = $pdo->query('SHOW FULL TABLES')->fetchAll(PDO::FETCH_NUM);

            foreach ($tables as $table) {
                $name = (string) ($table[0] ?? '');
                if ($name === '') {
                    continue;
                }

                $kind = strtoupper((string) ($table[1] ?? 'BASE TABLE')) === 'VIEW'
                    ? 'VIEW'
                    : 'TABLE';

                $pdo->exec(sprintf(
                    'DROP %s IF EXISTS `%s`',
                    $kind,
                    str_replace('`', '``', $name)
                ));
            }
        } finally {
            $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
        }

        return self::migrate($db);
    }

    private static function assertSafeDatabaseName(string $name): void
    {
        if (!preg_match('/^[A-Za-z0-9_]{1,64}$/', $name)) {
            throw new InvalidArgumentException('Invalid database name.');
        }
    }

    /**
     * @return list<string>
     */
    private static function splitStatements(string $sql): array
    {
        $parts = preg_split('/;\s*(?:\r?\n|$)/', $sql) ?: [];

        return array_values(array_filter(
            array_map('trim', $parts),
            static fn (string $statement): bool => $statement !== ''
        ));
    }
}

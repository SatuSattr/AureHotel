<?php

declare(strict_types=1);

$config = require dirname(__DIR__) . '/src/bootstrap.php';

try {
    $count = Schema::fresh($config['db']);
    fwrite(STDOUT, sprintf(
        "Database `%s` was dropped and recreated. Applied %d schema statement(s).\n",
        $config['db']['name'],
        $count
    ));
} catch (Throwable $exception) {
    fwrite(STDERR, 'Fresh failed: ' . $exception->getMessage() . "\n");
    exit(1);
}

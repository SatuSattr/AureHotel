<?php

declare(strict_types=1);

$config = require dirname(__DIR__) . '/src/bootstrap.php';

try {
    $count = Schema::migrate($config['db']);
    fwrite(STDOUT, sprintf(
        "Database `%s` is ready. Applied %d schema statement(s).\n",
        $config['db']['name'],
        $count
    ));
} catch (Throwable $exception) {
    fwrite(STDERR, 'Push failed: ' . $exception->getMessage() . "\n");
    exit(1);
}

<?php

declare(strict_types=1);

require_once __DIR__ . '/Env.php';

Env::load(dirname(__DIR__) . '/.env');

$config = require dirname(__DIR__) . '/config.php';

date_default_timezone_set($config['app']['timezone']);

require_once __DIR__ . '/Http.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Schema.php';
require_once __DIR__ . '/RateLimiter.php';
require_once __DIR__ . '/Countries.php';
require_once __DIR__ . '/BookingService.php';
require_once __DIR__ . '/Mailer.php';

return $config;

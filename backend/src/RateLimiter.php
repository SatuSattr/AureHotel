<?php

declare(strict_types=1);

/**
 * Small file-based sliding-window limiter used before the database is touched.
 * Files live outside the web root, so they are not publicly accessible.
 */
final class RateLimiter
{
    public function __construct(
        private readonly string $directory,
        private readonly int $maxAttempts,
        private readonly int $windowSeconds
    ) {
    }

    /**
     * @return array{allowed: bool, retry_after: int}
     */
    public function hit(string $key): array
    {
        if (!is_dir($this->directory) && !@mkdir($this->directory, 0775, true) && !is_dir($this->directory)) {
            // Fail open so a storage permission problem cannot take the API down.
            return ['allowed' => true, 'retry_after' => 0];
        }

        $file = $this->directory . '/' . hash('sha256', $key) . '.json';
        $handle = @fopen($file, 'c+');

        if ($handle === false) {
            return ['allowed' => true, 'retry_after' => 0];
        }

        if (!flock($handle, LOCK_EX)) {
            fclose($handle);
            return ['allowed' => true, 'retry_after' => 0];
        }

        $contents = stream_get_contents($handle);
        $previous = json_decode($contents ?: '[]', true);
        $now = time();
        $floor = $now - $this->windowSeconds;

        $timestamps = [];
        foreach (is_array($previous) ? $previous : [] as $timestamp) {
            if (is_int($timestamp) && $timestamp > $floor) {
                $timestamps[] = $timestamp;
            }
        }

        $allowed = count($timestamps) < $this->maxAttempts;
        $retryAfter = 0;

        if ($allowed) {
            $timestamps[] = $now;
        } else {
            $retryAfter = max(1, ($timestamps[0] + $this->windowSeconds) - $now);
        }

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($timestamps));
        fflush($handle);
        flock($handle, LOCK_UN);
        fclose($handle);

        return ['allowed' => $allowed, 'retry_after' => $retryAfter];
    }
}

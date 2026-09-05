<?php
final class FE_Token
{
    const VERSION = 'v1';

    public static function issue($formId, $secret, $now = null)
    {
        $ts = $now === null ? time() : (int) $now;
        return self::VERSION . '.' . $ts . '.' . self::sign($formId, $ts, $secret);
    }

    public static function verify($token, $formId, $secret, $ttl, $now = null)
    {
        $now = $now === null ? time() : (int) $now;
        if (!is_string($token) || $token === '') {
            throw new FE_Exception('bad_nonce', 'Missing token.');
        }
        $parts = explode('.', $token);
        if (count($parts) !== 3 || $parts[0] !== self::VERSION) {
            throw new FE_Exception('bad_nonce', 'Malformed token.');
        }
        $ts = (int) $parts[1];
        if ((string) $ts !== $parts[1]) {
            throw new FE_Exception('bad_nonce', 'Malformed token timestamp.');
        }
        if (!hash_equals(self::sign($formId, $ts, $secret), $parts[2])) {
            throw new FE_Exception('bad_nonce', 'Token signature does not match.');
        }
        if ($ts > $now + 60) {
            throw new FE_Exception('bad_nonce', 'Token is from the future.');
        }
        if ($now - $ts > $ttl) {
            throw new FE_Exception('bad_nonce', 'Token expired.');
        }
        return $ts;
    }

    private static function sign($formId, $ts, $secret)
    {
        $payload = self::VERSION . '|' . $formId . '|' . $ts;
        return substr(hash_hmac('sha256', $payload, $secret), 0, 32);
    }
}

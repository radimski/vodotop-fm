<?php
final class FE_Turnstile
{
    public static function verify(array $post, FE_Config $config, $ip)
    {
        $secret = trim((string) $config->get('turnstileSecretKey', ''));
        if ($secret === '') {
            if (!$config->get('debug')) {
                throw new FE_Exception('server', 'Turnstile is not configured for this environment.');
            }
            return;
        }
        $token = isset($post['cf-turnstile-response']) ? trim((string) $post['cf-turnstile-response']) : '';
        if ($token === '') {
            throw new FE_Exception('captcha', 'Security check missing.');
        }
        $payload = http_build_query(array(
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $ip,
        ));
        $response = self::post('https://challenges.cloudflare.com/turnstile/v0/siteverify', $payload);
        if ($response === false) {
            throw new FE_Exception('server', 'Turnstile verification request failed.');
        }
        $data = json_decode($response, true);
        if (!is_array($data) || empty($data['success'])) {
            throw new FE_Exception('captcha', 'Security check failed.');
        }
    }

    private static function post($url, $body)
    {
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, array(
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $body,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => array('Content-Type: application/x-www-form-urlencoded'),
                CURLOPT_TIMEOUT => 10,
            ));
            $response = curl_exec($ch);
            curl_close($ch);
            return $response;
        }
        $ctx = stream_context_create(array(
            'http' => array(
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => $body,
                'timeout' => 10,
            ),
        ));
        return @file_get_contents($url, false, $ctx);
    }
}

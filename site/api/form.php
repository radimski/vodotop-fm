<?php
ini_set('display_errors', '0');
error_reporting(E_ALL);

require __DIR__ . '/lib/Exception.php';
require __DIR__ . '/lib/Config.php';
require __DIR__ . '/lib/Token.php';
require __DIR__ . '/lib/Validator.php';
require __DIR__ . '/lib/Spam.php';
require __DIR__ . '/lib/Turnstile.php';
require __DIR__ . '/lib/Storage.php';
require __DIR__ . '/lib/Smtp.php';
require __DIR__ . '/lib/Mailer.php';
require __DIR__ . '/lib/Engine.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');
header('Content-Security-Policy: default-src \'none\'; frame-ancestors \'none\'; base-uri \'none\'; form-action \'none\'; sandbox');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('Cross-Origin-Resource-Policy: same-origin');

$debug = false;

try {
    $config = FE_Config::load(__DIR__);
    $debug = (bool) $config->get('debug');
    $engine = new FE_Engine($config);
    $result = $engine->handle($_SERVER, $_GET, $_POST);
    http_response_code(200);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
} catch (FE_Exception $e) {
    http_response_code($e->status());
    $payload = array('ok' => false, 'error' => $e->errorCode());
    if ($e->fields()) {
        $payload['fields'] = $e->fields();
    }
    if ($debug) {
        $payload['message'] = $e->getMessage();
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(array(
        'ok' => false,
        'error' => 'server',
        'message' => $debug ? $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine() : null,
    ), JSON_UNESCAPED_UNICODE);
}

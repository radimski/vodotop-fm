<?php
/* End-to-end PHP form-engine probe used by build/test-form.js.
 *
 * It creates an isolated configuration under the system temp directory, then
 * exercises the real Engine, Storage and SMTP classes. Nothing in site/ is
 * configured or written by this test.
 */

$root = dirname(__DIR__);
$api = $root . '/site/api';

require $api . '/lib/Exception.php';
require $api . '/lib/Config.php';
require $api . '/lib/Token.php';
require $api . '/lib/Validator.php';
require $api . '/lib/Spam.php';
require $api . '/lib/Turnstile.php';
require $api . '/lib/Storage.php';
require $api . '/lib/Smtp.php';
require $api . '/lib/Mailer.php';
require $api . '/lib/Engine.php';

function check($condition, $message)
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function expectFormError($code, callable $fn)
{
    try {
        $fn();
    } catch (FE_Exception $e) {
        check($e->errorCode() === $code, 'Expected ' . $code . ', got ' . $e->errorCode());
        return;
    }
    throw new RuntimeException('Expected form error ' . $code . ', but the call succeeded.');
}

function removeFixture($path)
{
    $real = realpath($path);
    $temp = realpath(sys_get_temp_dir());
    if (!$real || !$temp || strpos(strtolower($real), strtolower($temp . DIRECTORY_SEPARATOR . 'rafting-oravec-form-test-')) !== 0) {
        throw new RuntimeException('Refusing to remove unexpected test path: ' . $path);
    }
    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($real, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($items as $item) {
        $item->isDir() ? rmdir($item->getPathname()) : unlink($item->getPathname());
    }
    rmdir($real);
}

$port = isset($argv[1]) ? (int) $argv[1] : 0;
$turnstilePort = isset($argv[2]) ? (int) $argv[2] : 0;
check($port > 0, 'SMTP test port is required.');
check($turnstilePort > 0, 'Turnstile test port is required.');

$fixture = sys_get_temp_dir() . '/rafting-oravec-form-test-' . bin2hex(random_bytes(6));
mkdir($fixture, 0700, true);

try {
    $forms = json_decode(file_get_contents($api . '/forms.json'), true, 512, JSON_THROW_ON_ERROR);
    check(!empty($forms['forms']['rezervacia']['autoreply']['enabled']), 'Customer auto-reply is not enabled.');
    check(isset($forms['forms']['rezervacia']['autoreply']['texts']['sk']), 'Missing Slovak auto-reply.');
    check(isset($forms['forms']['rezervacia']['autoreply']['texts']['pl']), 'Missing Polish auto-reply.');
    check(isset($forms['forms']['rezervacia']['autoreply']['texts']['en']), 'Missing English auto-reply.');
    // Speed is tested directly below; successful mail delivery need not sleep.
    $forms['forms']['rezervacia']['minSeconds'] = 0;
    file_put_contents($fixture . '/forms.json', json_encode($forms, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    $config = array(
        'secret' => bin2hex(random_bytes(32)),
        'allowedOrigins' => array('www.raftingoravec-pieniny.sk'),
        'dataDir' => $fixture . '/data',
        'retentionDays' => 1,
        'nonceTtl' => 7200,
        'store' => true,
        'debug' => true,
        'turnstile' => array(
            'enabled' => true,
            'siteKey' => '1x00000000000000000000AA',
            'secret' => 'test-turnstile-secret',
            'expectedHostnames' => array('www.raftingoravec-pieniny.sk'),
            'expectedAction' => 'booking',
            'verifyUrl' => 'http://127.0.0.1:' . $turnstilePort . '/siteverify',
            'timeout' => 5,
        ),
        'mail' => array(
            'enabled' => true,
            'transport' => 'smtp',
            'from' => 'info@raftingoravec-pieniny.sk',
            'fromName' => 'Rafting Oravec — web',
            'smtp' => array(
                'host' => '127.0.0.1',
                'port' => $port,
                'security' => 'none',
                'user' => '',
                'pass' => '',
                'timeout' => 5,
            ),
        ),
    );
    file_put_contents($fixture . '/config.php', '<?php return ' . var_export($config, true) . ';');

    $engine = new FE_Engine(FE_Config::load($fixture));
    $allowed = array(
        'REQUEST_METHOD' => 'GET',
        'HTTP_ORIGIN' => 'https://www.raftingoravec-pieniny.sk',
        'REMOTE_ADDR' => '127.0.0.10',
        'HTTP_USER_AGENT' => 'form-engine-test',
    );

    expectFormError('bad_request', function () use ($engine, $allowed) {
        $server = $allowed;
        $server['HTTP_ORIGIN'] = 'https://attacker.example';
        $engine->handle($server, array('form' => 'rezervacia'), array());
    });

    $valid = array(
        '_form' => 'rezervacia',
        '_page' => 'https://www.raftingoravec-pieniny.sk/',
        '_lang' => 'en',
        'meno' => 'Test Customer',
        'email' => 'customer@example.test',
        'telefon' => '+421 900 123 456',
        'datum' => date('Y-m-d', strtotime('+14 days')),
        'cas' => '10:00',
        'pocet_osob' => '2',
        'sluzba' => 'Rafting s inštruktorom',
        'trasa' => 'Červený Kláštor – Lesnica (9 km)',
        'poznamka' => 'Form engine test',
        'suhlas' => 'on',
        'lang' => 'en',
        '_website' => '',
        '_company_url' => '',
        'cf-turnstile-response' => 'good-token',
    );

    expectFormError('bad_nonce', function () use ($engine, $allowed, $valid) {
        $server = $allowed;
        $server['REQUEST_METHOD'] = 'POST';
        $engine->handle($server, array(), $valid);
    });

    $token = $engine->handle($allowed, array('form' => 'rezervacia'), array());
    $sameSecondToken = $engine->handle($allowed, array('form' => 'rezervacia'), array());
    check($token['nonce'] !== $sameSecondToken['nonce'], 'Tokens issued in the same second must be unique.');
    check(isset($token['turnstile']['siteKey']), 'Nonce response did not enable the Turnstile widget.');
    check(!isset($token['turnstile']['secret']), 'Nonce response exposed the Turnstile secret.');
    $valid['_nonce'] = $token['nonce'];
    $postServer = $allowed;
    $postServer['REQUEST_METHOD'] = 'POST';
    $result = $engine->handle($postServer, array(), $valid);
    check($result['ok'] === true, 'Valid submission failed.');
    check($result['mail'] === 'smtp', 'Office notification did not use SMTP.');
    check($result['confirmation'] === 'smtp', 'Customer confirmation did not use SMTP.');

    $badChallengeToken = $engine->handle($allowed, array('form' => 'rezervacia'), array());
    $badChallenge = $valid;
    $badChallenge['_nonce'] = $badChallengeToken['nonce'];
    $badChallenge['cf-turnstile-response'] = 'bad-token';
    expectFormError('turnstile', function () use ($engine, $postServer, $badChallenge) {
        $engine->handle($postServer, array(), $badChallenge);
    });

    expectFormError('bad_nonce', function () use ($engine, $postServer, $valid) {
        $engine->handle($postServer, array(), $valid);
    });

    $trapToken = $engine->handle($allowed, array('form' => 'rezervacia'), array());
    $trapped = $valid;
    $trapped['_nonce'] = $trapToken['nonce'];
    $trapped['_website'] = 'https://spam.example';
    $trapResult = $engine->handle($postServer, array(), $trapped);
    check($trapResult['ok'] === true, 'Honeypot should return an indistinguishable success.');
    check(!isset($trapResult['mail']) && !isset($trapResult['confirmation']), 'Honeypot submission attempted to send mail.');

    $tooFast = FE_Spam::evaluate(array(), array(), array('fields' => array(), 'minSeconds' => 3), 0);
    check($tooFast['score'] >= FE_Spam::THRESHOLD, 'Impossibly fast submission was not quarantined.');

    echo "PHP form security and delivery flow passed.\n";
} finally {
    removeFixture($fixture);
}

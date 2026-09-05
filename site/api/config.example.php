<?php
/**
 * Copy to build/config.php (export injects it). Never commit the filled file.
 * SMTP host must come from THIS domain's panel — do not copy another project's host.
 */
return array(
    'secret' => 'CHANGE-ME-to-64-random-hex-chars',
    'allowedOrigins' => array(
        'www.vodotop-fm.cz',
        'vodotop-fm.cz',
        'localhost',
    ),
    'turnstileSecretKey' => '',
    'dataDir' => __DIR__ . '/data',
    'retentionDays' => 365,
    'nonceTtl' => 7200,
    'store' => true,
    'mail' => array(
        'enabled' => true,
        'transport' => 'auto',
        'from' => 'klus@vodotop-fm.cz',
        'fromName' => 'VODOTOP FM web',
        'smtp' => array(
            'host' => 'PASTE-ME',
            'port' => 587,
            'security' => 'tls',
            'user' => 'klus@vodotop-fm.cz',
            'pass' => 'CHANGE-ME',
            'timeout' => 15,
        ),
    ),
    'exportToken' => '',
    'debug' => false,
);

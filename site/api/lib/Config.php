<?php
final class FE_Config
{
    private $cfg;
    private $forms;

    private function __construct(array $cfg, array $forms)
    {
        $this->cfg = $cfg;
        $this->forms = $forms;
    }

    public static function load($dir)
    {
        $defaults = array(
            'secret' => '',
            'allowedOrigins' => array(),
            'dataDir' => $dir . '/data',
            'retentionDays' => 365,
            'nonceTtl' => 7200,
            'store' => true,
            'exportToken' => '',
            'debug' => false,
            'mail' => array(
                'enabled' => true,
                'transport' => 'auto',
                'from' => '',
                'fromName' => '',
                'smtp' => array(
                    'host' => '',
                    'port' => 587,
                    'security' => 'tls',
                    'user' => '',
                    'pass' => '',
                    'timeout' => 15,
                ),
            ),
        );

        $file = $dir . '/config.php';
        if (!is_file($file)) {
            throw new FE_Exception('server', 'config.php is missing — copy config.example.php and fill it in.');
        }

        $user = require $file;
        if (!is_array($user)) {
            throw new FE_Exception('server', 'config.php must return an array.');
        }

        $cfg = array_merge($defaults, $user);
        $cfg['mail'] = array_merge($defaults['mail'], isset($user['mail']) ? $user['mail'] : array());
        $cfg['mail']['smtp'] = array_merge(
            $defaults['mail']['smtp'],
            isset($user['mail']['smtp']) ? $user['mail']['smtp'] : array()
        );

        if ($cfg['secret'] === '' || strpos($cfg['secret'], 'CHANGE-ME') !== false) {
            throw new FE_Exception('server', "config.php still has the placeholder 'secret'.");
        }

        $formsFile = $dir . '/forms.json';
        if (!is_file($formsFile)) {
            throw new FE_Exception('server', 'forms.json is missing.');
        }

        $json = json_decode(file_get_contents($formsFile), true);
        if (!is_array($json) || !isset($json['forms']) || !is_array($json['forms'])) {
            throw new FE_Exception('server', 'forms.json is not valid JSON, or has no "forms" key.');
        }

        return new self($cfg, $json['forms']);
    }

    public function get($key, $fallback = null)
    {
        return array_key_exists($key, $this->cfg) ? $this->cfg[$key] : $fallback;
    }

    public function path($dotted, $fallback = null)
    {
        $node = $this->cfg;
        foreach (explode('.', $dotted) as $part) {
            if (!is_array($node) || !array_key_exists($part, $node)) {
                return $fallback;
            }
            $node = $node[$part];
        }
        return $node;
    }

    public function hasForm($id)
    {
        return is_string($id) && $id !== '' && isset($this->forms[$id]);
    }

    public function form($id)
    {
        $f = $this->forms[$id];
        $f += array(
            'label' => $id,
            'to' => array(),
            'cc' => array(),
            'subject' => 'Formulář: ' . $id,
            'replyTo' => '',
            'minSeconds' => 3,
            'maxPerHour' => 5,
            'maxPerDay' => 20,
            'fields' => array(),
        );
        if (!isset($f['store'])) {
            $f['store'] = (bool) $this->get('store', true);
        }
        $f['to'] = (array) $f['to'];
        $f['cc'] = (array) $f['cc'];
        return $f;
    }
}

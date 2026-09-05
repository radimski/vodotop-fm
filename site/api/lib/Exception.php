<?php
/**
 * Failure reported to the browser. The code is what the client switches on;
 * the message is only shown when debug is on.
 *
 * Do not name a private property `$code` — that narrows Exception's protected
 * `$code` and is a compile-time fatal on current PHP.
 */
final class FE_Exception extends Exception
{
    /** @var string */
    private $err;
    /** @var array */
    private $fields;

    public function __construct($code, $message = '', array $fields = array())
    {
        parent::__construct($message !== '' ? $message : $code);
        $this->err = $code;
        $this->fields = $fields;
    }

    public function errorCode()
    {
        return $this->err;
    }

    public function fields()
    {
        return $this->fields;
    }

    public function status()
    {
        switch ($this->err) {
            case 'rate_limited':
                return 429;
            case 'server':
            case 'mail_failed':
                return 500;
            case 'spam':
            case 'bad_nonce':
            case 'captcha':
                return 403;
            default:
                return 400;
        }
    }
}

<?php
// Local end-to-end test configuration: SQLite instead of MySQL, a local fake SMTP server.
return [
    'environment' => 'development',
    'site_url' => 'http://localhost:8099',
    'database' => ['dsn' => 'sqlite:' . getenv('ZEE_E2E_DB')],
    'mail' => [
        'enabled' => true, 'host' => '127.0.0.1', 'port' => 8025, 'encryption' => 'none',
        'username' => '', 'password' => '', 'from_email' => 'info@zeetelephonicsbpo.com',
        'from_name' => 'Zee Telephonics Website', 'notify_to' => ['info@zeetelephonicsbpo.com'], 'send_confirmation' => true,
    ],
    'security' => ['ip_salt' => 'e2e', 'rate_limit_per_hour' => 20, 'min_seconds_to_submit' => 2, 'turnstile_secret' => ''],
    'crm' => ['driver' => 'none'],
];

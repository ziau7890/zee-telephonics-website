<?php
/**
 * Zee Telephonics: server configuration TEMPLATE.
 *
 * 1. Copy this file and name the copy  config.php
 * 2. Fill in the real values below.
 * 3. Upload config.php OUTSIDE public_html (see README, "Deploying on Hostinger").
 *
 * The real config.php holds passwords. It is excluded from Git and must never
 * be committed, emailed or pasted into chat.
 */
return [
    // 'production' hides error details from visitors. Use 'development' only on your own computer.
    'environment' => 'production',

    // The live website address, used to check that form posts come from your own site.
    'site_url' => 'https://zeetelephonicsbpo.com',

    'database' => [
        // Hostinger: hPanel > Databases > MySQL Databases. Host is usually 'localhost'.
        'host'     => 'localhost',
        'port'     => 3306,
        'name'     => 'uXXXXXXXX_zee_leads',
        'user'     => 'uXXXXXXXX_zee_user',
        'password' => 'CHANGE_ME',
    ],

    'mail' => [
        // Turn email alerts on once a mailbox exists. Leads are still saved to the database if this is false.
        'enabled'    => true,
        // Hostinger email SMTP: smtp.hostinger.com, port 465 with 'ssl' (or 587 with 'tls').
        'host'       => 'smtp.hostinger.com',
        'port'       => 465,
        'encryption' => 'ssl',
        'username'   => 'info@zeetelephonicsbpo.com',
        'password'   => 'CHANGE_ME',
        'from_email' => 'info@zeetelephonicsbpo.com',
        'from_name'  => 'Zee Telephonics Website',
        // Where new-lead alerts go. Can be a list: ['a@example.com', 'b@example.com']
        'notify_to'  => ['info@zeetelephonicsbpo.com'],
        // Send a short "we received your enquiry" email to the visitor.
        'send_confirmation' => true,
    ],

    'security' => [
        // A long random string, used to anonymise IP addresses before storing them.
        // Generate one at https://www.random.org/strings/ or with: php -r "echo bin2hex(random_bytes(32));"
        'ip_salt' => 'CHANGE_ME_TO_A_LONG_RANDOM_STRING',
        // Maximum enquiries from one connection per hour.
        'rate_limit_per_hour' => 5,
        // Reject forms sent faster than this many seconds after the page loaded (bots are fast).
        'min_seconds_to_submit' => 3,
        // Cloudflare Turnstile secret key. Leave '' to switch Turnstile off.
        // If you set it, also put the matching SITE key in src/content/site.json (turnstileSiteKey).
        'turnstile_secret' => '',
    ],

    'crm' => [
        // 'none'    : leads are only stored in MySQL and emailed (default).
        // 'webhook' : each lead is also POSTed as JSON to the URL below (Zapier, Make, n8n,
        //             or a HubSpot/Zoho workflow). Add a dedicated adapter later if needed.
        'driver'          => 'none',
        'webhook_url'     => '',
        'webhook_secret'  => '', // sent as an HMAC-SHA256 signature header so the receiver can verify it
        'timeout_seconds' => 5,
    ],
];

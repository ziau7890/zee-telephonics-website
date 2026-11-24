<?php
declare(strict_types=1);

/**
 * Loads the classes and the private configuration file.
 * No Composer needed: everything required ships in this folder.
 */
require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';
require_once __DIR__ . '/Http.php';
require_once __DIR__ . '/LeadValidator.php';
require_once __DIR__ . '/LeadRepository.php';
require_once __DIR__ . '/Mailer.php';
require_once __DIR__ . '/Turnstile.php';
require_once __DIR__ . '/Crm/CrmAdapter.php';
require_once __DIR__ . '/Crm/NullCrmAdapter.php';
require_once __DIR__ . '/Crm/WebhookCrmAdapter.php';
require_once __DIR__ . '/Crm/CrmFactory.php';
require_once __DIR__ . '/LeadService.php';

/**
 * Finds config.php. The safest place is OUTSIDE public_html, so it can never be downloaded:
 *   1. the path in the ZEE_CONFIG environment variable, if set
 *   2. <folder that contains public_html>/zee-private/config.php   (recommended on Hostinger)
 *   3. public_html/api/private/config.php                           (fallback, blocked by .htaccess)
 */
function zee_config_path(): ?string
{
    $candidates = array_filter([
        getenv('ZEE_CONFIG') ?: null,
        dirname(__DIR__, 3) . '/zee-private/config.php',
        dirname(__DIR__) . '/private/config.php',
    ]);
    foreach ($candidates as $path) {
        if (is_file($path) && is_readable($path)) {
            return $path;
        }
    }
    return null;
}

function zee_load_config(): array
{
    $path = zee_config_path();
    if ($path === null) {
        throw new RuntimeException('Configuration file not found. See README: "Server configuration".');
    }
    $config = require $path;
    if (!is_array($config)) {
        throw new RuntimeException('config.php must return an array.');
    }
    return $config;
}

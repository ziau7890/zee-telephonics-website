<?php
/**
 * Zee Telephonics: contact / quote form endpoint.
 * Receives POST /api/lead.php from the contact page.
 *   - With JavaScript: answers with JSON.
 *   - Without JavaScript: redirects to /thank-you/ or back to /contact/?error=...
 */
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

use Zee\Crm\CrmFactory;
use Zee\Http;
use Zee\LeadOutcome;
use Zee\LeadRepository;
use Zee\LeadService;
use Zee\LeadValidator;
use Zee\SmtpMailer;

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

function respond(LeadOutcome $o): void
{
    if (Http::wantsJson()) {
        Http::json($o->httpStatus, ['ok' => $o->ok(), 'message' => $o->message, 'errors' => (object)$o->errors]);
        return;
    }
    Http::redirect($o->ok() ? '/thank-you/' : '/contact/?error=' . rawurlencode($o->code) . '#quote');
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Allow: POST');
    Http::json(405, ['ok' => false, 'message' => 'Method not allowed.']);
    exit;
}

try {
    $config = zee_load_config();
} catch (Throwable $e) {
    error_log('[zee-lead] ' . $e->getMessage());
    respond(new LeadOutcome('server', 500, 'Sorry, we could not send your enquiry right now. Please try again later.'));
    exit;
}

$dev = ($config['environment'] ?? 'production') === 'development';
ini_set('display_errors', $dev ? '1' : '0');

if (!Http::sameOrigin((string)($config['site_url'] ?? ''), $dev)) {
    respond(new LeadOutcome('spam', 403, 'Your enquiry could not be verified. Please try again.'));
    exit;
}

$repo = null;
try {
    $repo = LeadRepository::connect($config['database'] ?? []);
} catch (Throwable $e) {
    error_log('[zee-lead] Database connection failed: ' . $e->getMessage());
}

// Allowed services come from the same services.json the website is built from.
$slugs = null;
$serviceTitles = [];
$servicesFile = __DIR__ . '/services.json';
if (is_file($servicesFile)) {
    $map = json_decode((string)file_get_contents($servicesFile), true);
    if (is_array($map)) {
        $serviceTitles = array_filter($map, 'is_string');
        $slugs = array_map('strval', array_keys($serviceTitles));
    }
}

$service = new LeadService(
    $config,
    $repo,
    new SmtpMailer($config['mail'] ?? [], 'Zee Telephonics', $serviceTitles),
    CrmFactory::fromConfig($config['crm'] ?? []),
    new LeadValidator($slugs),
);

respond($service->handle($_POST, Http::clientIp(), (string)($_SERVER['HTTP_USER_AGENT'] ?? '')));

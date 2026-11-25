<?php
/**
 * Automated tests for the lead handler. Run with:  php tests/php/run.php
 * Uses an in-memory SQLite database and a fake mailer, so no server or passwords are needed.
 */
declare(strict_types=1);

require __DIR__ . '/../../public/api/lib/bootstrap.php';

use Zee\Crm\CrmAdapter;
use Zee\Crm\CrmResult;
use Zee\Crm\LeadPayload;
use Zee\Crm\NullCrmAdapter;
use Zee\LeadEmail;
use Zee\LeadNotifier;
use Zee\LeadRepository;
use Zee\LeadService;
use Zee\LeadValidator;

final class FakeNotifier implements LeadNotifier
{
    public array $team = [];
    public array $confirm = [];
    public function __construct(public bool $fail = false) {}
    public function notifyTeam(array $lead): void { if ($this->fail) throw new RuntimeException('smtp down'); $this->team[] = $lead; }
    public function confirmToVisitor(array $lead): void { if ($this->fail) throw new RuntimeException('smtp down'); $this->confirm[] = $lead; }
}
final class FakeCrm implements CrmAdapter
{
    public array $pushed = [];
    public function push(array $lead): CrmResult { $this->pushed[] = $lead; return CrmResult::synced('crm-123'); }
}

$passed = 0; $failed = 0;
function check(string $name, bool $ok, string $detail = ''): void
{
    global $passed, $failed;
    if ($ok) { $passed++; echo "  ok   $name\n"; }
    else { $failed++; echo "  FAIL $name" . ($detail ? " ($detail)" : '') . "\n"; }
}

function db(): PDO
{
    $pdo = new PDO('sqlite::memory:', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec((string)file_get_contents(__DIR__ . '/schema.sqlite.sql'));
    return $pdo;
}

$config = [
    'mail' => ['enabled' => true, 'send_confirmation' => true],
    'security' => ['ip_salt' => 'test', 'rate_limit_per_hour' => 5, 'min_seconds_to_submit' => 3, 'turnstile_secret' => ''],
];
$NOW = 1_800_000_000;
$valid = [
    'full_name' => '  Aisha Khan ', 'company' => 'Example Ltd', 'email' => 'AISHA@example.com', 'phone' => '+1 (555) 010-2000',
    'service' => 'lead-generation', 'team_size' => '6 to 20 people', 'message' => "We need help with outbound calls.\nAbout 200 a week.",
    'consent' => 'yes', 'website' => '', 'form_started' => (string)($NOW - 60), 'source_page' => '/services/lead-generation/',
    'utm_source' => 'google', 'utm_medium' => 'cpc', 'utm_campaign' => 'launch',
];
$slugs = ['lead-generation', 'outbound-calling'];

function service(array $config, ?PDO $pdo, ?LeadNotifier $n, ?CrmAdapter $crm = null, ?callable $ts = null): LeadService
{
    global $NOW, $slugs;
    return new LeadService($config, $pdo ? new LeadRepository($pdo) : null, $n, $crm ?? new NullCrmAdapter(), new LeadValidator($slugs), fn () => $NOW, $ts, fn ($m) => null);
}

echo "Valid submission\n";
$pdo = db(); $n = new FakeNotifier(); $crm = new FakeCrm();
$o = service($config, $pdo, $n, $crm)->handle($valid, '203.0.113.9', 'TestAgent');
$row = $pdo->query('SELECT * FROM leads')->fetch();
check('returns ok', $o->ok() && $o->httpStatus === 200);
check('stores one lead', (int)$pdo->query('SELECT COUNT(*) FROM leads')->fetchColumn() === 1);
check('trims and lowercases', $row['full_name'] === 'Aisha Khan' && $row['email'] === 'aisha@example.com');
check('keeps message line breaks', str_contains($row['message'], "\n"));
check('stores CRM fields', $row['service'] === 'lead-generation' && $row['utm_campaign'] === 'launch' && $row['consent'] == 1);
check('never stores raw IP', $row['ip_hash'] !== '203.0.113.9' && strlen($row['ip_hash']) === 64);
check('emails the team once', count($n->team) === 1);
check('sends visitor confirmation', count($n->confirm) === 1);
check('marks notified', $row['notified_at'] !== null);
check('pushes to CRM and records it', count($crm->pushed) === 1 && $row['crm_status'] === 'synced' && $row['crm_id'] === 'crm-123');
check('public id is a UUID', (bool)preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', $row['public_id']));

echo "Spam and abuse\n";
$pdo = db(); $n = new FakeNotifier();
$o = service($config, $pdo, $n)->handle(['website' => 'http://spam'] + $valid, '1.1.1.1', '');
check('honeypot looks like success to bots', $o->ok());
check('honeypot stores nothing and sends nothing', (int)$pdo->query('SELECT COUNT(*) FROM leads')->fetchColumn() === 0 && !$n->team);
$o = service($config, $pdo, $n)->handle(['form_started' => (string)($NOW - 1)] + $valid, '1.1.1.2', '');
check('too-fast submission rejected', $o->code === 'spam' && $o->httpStatus === 400);
$pdo = db(); $svc = service($config, $pdo, new FakeNotifier());
for ($i = 0; $i < 5; $i++) { $svc->handle($valid, '9.9.9.9', ''); }
$o = $svc->handle($valid, '9.9.9.9', '');
check('6th enquiry in an hour is rate limited', $o->code === 'rate' && $o->httpStatus === 429);
$o = $svc->handle($valid, '9.9.9.10', '');
check('other connections are not affected', $o->ok());
$cfgTs = $config; $cfgTs['security']['turnstile_secret'] = 'secret';
$o = service($cfgTs, db(), new FakeNotifier(), null, fn () => false)->handle($valid, '1.1.1.3', '');
check('failed Turnstile rejected', $o->code === 'spam');
$o = service($cfgTs, db(), new FakeNotifier(), null, fn () => true)->handle($valid, '1.1.1.3', '');
check('passed Turnstile accepted', $o->ok());

echo "Validation\n";
$o = service($config, db(), new FakeNotifier())->handle(['email' => 'not-an-email', 'consent' => '', 'message' => 'hi', 'full_name' => ''] + $valid, '1.1.1.4', '');
check('invalid returns 422', $o->code === 'invalid' && $o->httpStatus === 422);
check('reports each bad field', isset($o->errors['email'], $o->errors['consent'], $o->errors['message'], $o->errors['full_name']));
[$lead] = (new LeadValidator($slugs))->validate(['service' => 'made-up', 'team_size' => 'a million', 'source_page' => 'javascript:alert(1)'] + $valid);
check('unknown service is cleared', $lead['service'] === '');
check('unknown team size is cleared', $lead['team_size'] === '');
check('bad source page is cleared', $lead['source_page'] === '');
[$lead] = (new LeadValidator())->validate(['full_name' => "Bob\x00\x07 Smith"] + $valid);
check('control characters removed', $lead['full_name'] === 'Bob Smith');
[$lead] = (new LeadValidator())->validate(['message' => str_repeat('a', 5000)] + $valid);
check('long message capped at 4000', mb_strlen($lead['message']) === 4000);

echo "Failure handling\n";
$pdo = db(); $o = service($config, $pdo, new FakeNotifier(true))->handle($valid, '1.1.1.5', '');
$row = $pdo->query('SELECT * FROM leads')->fetch();
check('email down: lead still saved and accepted', $o->ok() && $row && $row['notified_at'] === null);
$n = new FakeNotifier(); $o = service($config, null, $n)->handle($valid, '1.1.1.6', '');
check('database down: email still sent and accepted', $o->ok() && count($n->team) === 1);
$o = service($config, null, new FakeNotifier(true))->handle($valid, '1.1.1.7', '');
check('both down: honest error', $o->code === 'server' && $o->httpStatus === 500);
$cfgNoMail = $config; $cfgNoMail['mail']['enabled'] = false; $n = new FakeNotifier();
$o = service($cfgNoMail, db(), $n)->handle($valid, '1.1.1.8', '');
check('mail switched off: saved without email', $o->ok() && !$n->team);

echo "CRM payload and email\n";
[$lead] = (new LeadValidator($slugs))->validate($valid);
$lead += ['public_id' => LeadService::uuid(), 'created_at' => '2026-11-24 10:00:00'];
$p = LeadPayload::fromLead($lead);
check('payload splits name', $p['contact']['first_name'] === 'Aisha' && $p['contact']['last_name'] === 'Khan');
check('payload has ISO timestamp', $p['created_at'] === '2026-11-24T10:00:00Z');
check('payload keeps attribution', $p['source']['utm_source'] === 'google' && $p['source']['page'] === '/services/lead-generation/');
$html = LeadEmail::html(LeadEmail::rows(['full_name' => '<script>x</script>'] + $lead), 'T');
check('alert email escapes HTML', !str_contains($html, '<script>') && str_contains($html, '&lt;script&gt;'));

echo "\n$passed passed, $failed failed\n";
exit($failed ? 1 : 0);

<?php
declare(strict_types=1);

namespace Zee;

use Throwable;
use Zee\Crm\CrmAdapter;

final class LeadOutcome
{
    /** @param array<string, string> $errors */
    public function __construct(
        public readonly string $code,      // ok, invalid, spam, rate, server
        public readonly int $httpStatus,
        public readonly string $message,
        public readonly array $errors = [],
        public readonly ?string $leadId = null,
    ) {
    }

    public function ok(): bool
    {
        return $this->code === 'ok';
    }
}

/**
 * Handles one form submission: spam checks, validation, storage, email and CRM.
 * A lead is only lost if BOTH the database and the email alert fail.
 */
final class LeadService
{
    /** @var callable(): int */
    private $clock;
    /** @var callable(string, string, string): bool */
    private $turnstile;

    public function __construct(
        private array $config,
        private ?LeadRepository $repo,
        private ?LeadNotifier $notifier,
        private CrmAdapter $crm,
        private LeadValidator $validator,
        ?callable $clock = null,
        ?callable $turnstile = null,
        private ?\Closure $log = null,
    ) {
        $this->clock = $clock ?? 'time';
        $this->turnstile = $turnstile ?? [Turnstile::class, 'verify'];
    }

    public function handle(array $post, string $ip, string $userAgent): LeadOutcome
    {
        $sec = $this->config['security'] ?? [];
        $now = ($this->clock)();
        $nowSql = gmdate('Y-m-d H:i:s', $now);
        $ipHash = hash('sha256', ((string)($sec['ip_salt'] ?? '')) . '|' . $ip);

        // 1. Honeypot: real people never see this field. Pretend success so bots move on.
        if (trim((string)($post['website'] ?? '')) !== '') {
            $this->attempt($ipHash, 'spam', $nowSql);
            return new LeadOutcome('ok', 200, 'Thank you. Your enquiry has been sent.');
        }

        // 2. Rate limit per connection.
        $limit = (int)($sec['rate_limit_per_hour'] ?? 5);
        if ($this->repo && $limit > 0) {
            try {
                if ($this->repo->attemptsSince($ipHash, gmdate('Y-m-d H:i:s', $now - 3600)) >= $limit) {
                    $this->attempt($ipHash, 'rate_limited', $nowSql);
                    return new LeadOutcome('rate', 429, 'Too many enquiries were sent from your connection. Please try again in an hour.');
                }
            } catch (Throwable $e) {
                $this->log('Rate limit check failed: ' . $e->getMessage());
            }
        }

        // 3. Too fast to be a person (only when the browser told us when the form opened).
        $started = (int)($post['form_started'] ?? 0);
        $minSeconds = (int)($sec['min_seconds_to_submit'] ?? 3);
        if ($started > 0 && ($now - $started) < $minSeconds) {
            $this->attempt($ipHash, 'spam', $nowSql);
            return new LeadOutcome('spam', 400, 'Your enquiry could not be verified. Please wait a moment and try again.');
        }

        // 4. Cloudflare Turnstile, when configured.
        $secret = (string)($sec['turnstile_secret'] ?? '');
        if ($secret !== '' && !($this->turnstile)($secret, (string)($post['cf-turnstile-response'] ?? ''), $ip)) {
            $this->attempt($ipHash, 'spam', $nowSql);
            return new LeadOutcome('spam', 400, 'Your enquiry could not be verified. Please try again.');
        }

        // 5. Validate.
        [$lead, $errors] = $this->validator->validate($post);
        if ($errors) {
            $this->attempt($ipHash, 'invalid', $nowSql);
            return new LeadOutcome('invalid', 422, 'Please correct the highlighted fields.', $errors);
        }

        $lead += [
            'public_id' => self::uuid(),
            'created_at' => $nowSql,
            'status' => 'new',
            'ip_hash' => $ipHash,
            'user_agent' => LeadValidator::text($userAgent, 255),
            'crm_status' => 'pending',
        ];

        // 6. Save.
        $id = null;
        if ($this->repo) {
            try {
                $id = $this->repo->insertLead($lead);
            } catch (Throwable $e) {
                $this->log('Saving lead failed: ' . $e->getMessage());
            }
        }

        // 7. Alert the team.
        $notified = false;
        $mailOn = (bool)($this->config['mail']['enabled'] ?? false) && $this->notifier !== null;
        if ($mailOn) {
            try {
                $this->notifier->notifyTeam($lead);
                $notified = true;
                if ($id !== null) {
                    $this->repo->markNotified($id, $nowSql);
                }
            } catch (Throwable $e) {
                $this->log('Lead alert email failed: ' . $e->getMessage());
            }
        }

        if ($id === null && !$notified) {
            $this->attempt($ipHash, 'error', $nowSql);
            return new LeadOutcome('server', 500, 'Sorry, we could not send your enquiry right now. Please try again later.');
        }

        // 8. Confirmation to the visitor (best effort).
        if ($mailOn && ($this->config['mail']['send_confirmation'] ?? false)) {
            try {
                $this->notifier->confirmToVisitor($lead);
            } catch (Throwable $e) {
                $this->log('Confirmation email failed: ' . $e->getMessage());
            }
        }

        // 9. CRM (best effort; failures are recorded so they can be re-sent later).
        if ($id !== null) {
            $result = $this->crm->push($lead);
            try {
                $this->repo->markCrm($id, $result->status, $result->crmId, $result->error, $result->status === 'synced' ? $nowSql : null);
            } catch (Throwable $e) {
                $this->log('Recording CRM status failed: ' . $e->getMessage());
            }
        }

        $this->attempt($ipHash, 'accepted', $nowSql);
        return new LeadOutcome('ok', 200, 'Thank you. Your enquiry has been sent.', [], $lead['public_id']);
    }

    private function attempt(string $ipHash, string $outcome, string $when): void
    {
        if (!$this->repo) {
            return;
        }
        try {
            $this->repo->recordAttempt($ipHash, $outcome, $when);
        } catch (Throwable $e) {
            $this->log('Recording attempt failed: ' . $e->getMessage());
        }
    }

    private function log(string $msg): void
    {
        if ($this->log) {
            ($this->log)($msg);
        } else {
            error_log('[zee-lead] ' . $msg);
        }
    }

    public static function uuid(): string
    {
        $b = random_bytes(16);
        $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
        $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
    }
}

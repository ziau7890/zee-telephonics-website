<?php
declare(strict_types=1);

namespace Zee;

use PDO;

/**
 * Stores leads and submission attempts. Uses prepared statements only.
 */
final class LeadRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public static function connect(array $db): self
    {
        // Optional 'dsn' (e.g. 'sqlite:/path/leads.sqlite') is for local testing only.
        if (!empty($db['dsn'])) {
            $pdo = new PDO((string)$db['dsn'], null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            return new self($pdo);
        }
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $db['host'] ?? 'localhost',
            (int)($db['port'] ?? 3306),
            $db['name'] ?? ''
        );
        $pdo = new PDO($dsn, (string)($db['user'] ?? ''), (string)($db['password'] ?? ''), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 5,
        ]);
        $pdo->exec("SET time_zone = '+00:00'");
        return new self($pdo);
    }

    public function insertLead(array $lead): int
    {
        $columns = [
            'public_id', 'created_at', 'status', 'full_name', 'company', 'email', 'phone', 'service',
            'team_size', 'message', 'consent', 'consent_text', 'source_page', 'utm_source', 'utm_medium',
            'utm_campaign', 'utm_term', 'utm_content', 'ip_hash', 'user_agent', 'crm_status',
        ];
        $sql = sprintf(
            'INSERT INTO leads (%s) VALUES (%s)',
            implode(', ', $columns),
            implode(', ', array_map(fn ($c) => ':' . $c, $columns))
        );
        $stmt = $this->pdo->prepare($sql);
        foreach ($columns as $c) {
            $value = $lead[$c] ?? null;
            $stmt->bindValue(':' . $c, $value === '' ? null : $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        $stmt->execute();
        return (int)$this->pdo->lastInsertId();
    }

    public function markNotified(int $id, string $when): void
    {
        $this->pdo->prepare('UPDATE leads SET notified_at = :w WHERE id = :id')->execute([':w' => $when, ':id' => $id]);
    }

    public function markCrm(int $id, string $status, ?string $crmId, ?string $error, ?string $when): void
    {
        $this->pdo->prepare(
            'UPDATE leads SET crm_status = :s, crm_id = :cid, crm_error = :e, crm_synced_at = :w WHERE id = :id'
        )->execute([':s' => $status, ':cid' => $crmId, ':e' => $error ? mb_substr($error, 0, 255) : null, ':w' => $when, ':id' => $id]);
    }

    public function recordAttempt(string $ipHash, string $outcome, string $when): void
    {
        $this->pdo->prepare('INSERT INTO lead_attempts (ip_hash, created_at, outcome) VALUES (:ip, :w, :o)')
            ->execute([':ip' => $ipHash, ':w' => $when, ':o' => $outcome]);
    }

    public function attemptsSince(string $ipHash, string $since): int
    {
        $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM lead_attempts WHERE ip_hash = :ip AND created_at >= :since');
        $stmt->execute([':ip' => $ipHash, ':since' => $since]);
        return (int)$stmt->fetchColumn();
    }
}

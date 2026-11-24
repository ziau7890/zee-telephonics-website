<?php
declare(strict_types=1);

namespace Zee\Crm;

final class CrmFactory
{
    public static function fromConfig(array $crm): CrmAdapter
    {
        return match ($crm['driver'] ?? 'none') {
            'webhook' => ($crm['webhook_url'] ?? '') !== ''
                ? new WebhookCrmAdapter((string)$crm['webhook_url'], (string)($crm['webhook_secret'] ?? ''), (int)($crm['timeout_seconds'] ?? 5))
                : new NullCrmAdapter(),
            // 'hubspot' => new HubspotCrmAdapter(...),   // add later
            default => new NullCrmAdapter(),
        };
    }
}

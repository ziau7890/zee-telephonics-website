<?php
declare(strict_types=1);

namespace Zee\Crm;

/**
 * The single point where a CRM plugs in. To add HubSpot, Zoho, Salesforce, etc. later,
 * write a class that implements this interface and register it in CrmFactory.
 * The website pages never need to change.
 */
interface CrmAdapter
{
    /** Push one lead. Must not throw: report problems through the result. */
    public function push(array $lead): CrmResult;
}

final class CrmResult
{
    private function __construct(
        public readonly string $status, // synced, skipped, failed
        public readonly ?string $crmId = null,
        public readonly ?string $error = null,
    ) {
    }

    public static function synced(?string $crmId = null): self { return new self('synced', $crmId); }
    public static function skipped(): self { return new self('skipped'); }
    public static function failed(string $error): self { return new self('failed', null, $error); }
}

<?php
declare(strict_types=1);

namespace Zee\Crm;

/** Default: no CRM connected. Leads stay in MySQL and email only. */
final class NullCrmAdapter implements CrmAdapter
{
    public function push(array $lead): CrmResult
    {
        return CrmResult::skipped();
    }
}

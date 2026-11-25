<?php
declare(strict_types=1);

namespace Zee\Crm;

/**
 * Sends each lead as JSON to a webhook (Zapier, Make, n8n, or a CRM workflow endpoint).
 * Adds an X-Zee-Signature header (HMAC-SHA256 of the body) when a secret is configured.
 */
final class WebhookCrmAdapter implements CrmAdapter
{
    public function __construct(private string $url, private string $secret = '', private int $timeout = 5)
    {
    }

    public function push(array $lead): CrmResult
    {
        $payload = json_encode(LeadPayload::fromLead($lead), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $headers = ['Content-Type: application/json', 'User-Agent: ZeeTelephonics-Website/1.0'];
        if ($this->secret !== '') {
            $headers[] = 'X-Zee-Signature: sha256=' . hash_hmac('sha256', (string)$payload, $this->secret);
        }
        $ch = curl_init($this->url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
        ]);
        $body = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($body === false || $code < 200 || $code >= 300) {
            return CrmResult::failed($err !== '' ? $err : 'HTTP ' . $code);
        }
        $decoded = json_decode((string)$body, true);
        $id = is_array($decoded) ? ($decoded['id'] ?? null) : null;
        return CrmResult::synced(is_scalar($id) ? (string)$id : null);
    }
}

/** The CRM-neutral lead format (field names follow common CRM conventions). */
final class LeadPayload
{
    public static function fromLead(array $lead): array
    {
        $parts = preg_split('/\s+/', trim((string)$lead['full_name']), 2) ?: [''];
        return [
            'event' => 'lead.created',
            'id' => $lead['public_id'],
            'created_at' => str_replace(' ', 'T', (string)$lead['created_at']) . 'Z',
            'contact' => [
                'first_name' => $parts[0] ?? '',
                'last_name' => $parts[1] ?? '',
                'full_name' => $lead['full_name'],
                'email' => $lead['email'],
                'phone' => $lead['phone'],
                'company' => $lead['company'],
            ],
            'enquiry' => [
                'service' => $lead['service'],
                'team_size' => $lead['team_size'],
                'message' => $lead['message'],
            ],
            'consent' => ['given' => (bool)$lead['consent'], 'text' => $lead['consent_text']],
            'source' => [
                'channel' => 'website',
                'page' => $lead['source_page'],
                'utm_source' => $lead['utm_source'],
                'utm_medium' => $lead['utm_medium'],
                'utm_campaign' => $lead['utm_campaign'],
                'utm_term' => $lead['utm_term'],
                'utm_content' => $lead['utm_content'],
            ],
        ];
    }
}

<?php
declare(strict_types=1);

namespace Zee;

use PHPMailer\PHPMailer\PHPMailer;

interface LeadNotifier
{
    /** Alert the business about a new lead. Throws on failure. */
    public function notifyTeam(array $lead): void;

    /** Tell the visitor we received the enquiry. Throws on failure. */
    public function confirmToVisitor(array $lead): void;
}

/**
 * Sends email through authenticated SMTP (for example a Hostinger mailbox) using PHPMailer.
 */
final class SmtpMailer implements LeadNotifier
{
    /** @param array<string, string> $serviceTitles slug => title, so emails show readable names */
    public function __construct(private array $mail, private string $brand = 'Zee Telephonics', private array $serviceTitles = [])
    {
    }

    private function make(): PHPMailer
    {
        $m = new PHPMailer(true);
        $m->isSMTP();
        $m->Host = (string)$this->mail['host'];
        $m->Port = (int)$this->mail['port'];
        $m->SMTPAuth = true;
        $m->Username = (string)$this->mail['username'];
        $m->Password = (string)$this->mail['password'];
        $enc = strtolower((string)($this->mail['encryption'] ?? 'ssl'));
        if ($enc === 'none') { // local testing only
            $m->SMTPSecure = '';
            $m->SMTPAutoTLS = false;
            $m->SMTPAuth = (string)$this->mail['username'] !== '';
        } else {
            $m->SMTPSecure = $enc === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
        }
        $m->Timeout = 10;
        $m->CharSet = PHPMailer::CHARSET_UTF8;
        $m->setFrom((string)$this->mail['from_email'], (string)($this->mail['from_name'] ?? $this->brand));
        return $m;
    }

    public function notifyTeam(array $lead): void
    {
        $m = $this->make();
        foreach ((array)$this->mail['notify_to'] as $to) {
            $m->addAddress((string)$to);
        }
        $m->addReplyTo($lead['email'], $lead['full_name']);
        $m->Subject = 'New website enquiry: ' . $lead['full_name'] . ($lead['company'] ? ' (' . $lead['company'] . ')' : '');
        $rows = LeadEmail::rows($lead, $this->serviceTitles);
        $m->isHTML(true);
        $m->Body = LeadEmail::html($rows, 'New enquiry from the website');
        $m->AltBody = LeadEmail::text($rows);
        $m->send();
    }

    public function confirmToVisitor(array $lead): void
    {
        $m = $this->make();
        $m->addAddress($lead['email'], $lead['full_name']);
        $m->Subject = 'We received your enquiry | ' . $this->brand;
        $m->isHTML(false);
        $m->Body = "Hello {$lead['full_name']},\n\n"
            . "Thank you for contacting {$this->brand}. We have received your enquiry and will reply by email.\n\n"
            . "For your records, this is the message you sent:\n\n"
            . $lead['message'] . "\n\n"
            . "If you did not send this enquiry, you can ignore this email.\n\n"
            . $this->brand;
        $m->send();
    }
}

/** Builds the alert email content. All values are escaped. */
final class LeadEmail
{
    /** @return array<string, string> */
    public static function rows(array $lead, array $serviceTitles = []): array
    {
        $rows = [
            'Name' => $lead['full_name'],
            'Company' => $lead['company'],
            'Email' => $lead['email'],
            'Phone' => $lead['phone'],
            'Service' => $serviceTitles[$lead['service']] ?? $lead['service'],
            'Team size' => $lead['team_size'],
            'Message' => $lead['message'],
            'Sent from page' => $lead['source_page'],
            'Campaign' => trim(implode(' / ', array_filter([$lead['utm_source'], $lead['utm_medium'], $lead['utm_campaign']]))),
            'Received (UTC)' => $lead['created_at'],
            'Lead ID' => $lead['public_id'],
        ];
        return array_filter($rows, fn ($v) => (string)$v !== '');
    }

    public static function text(array $rows): string
    {
        $out = '';
        foreach ($rows as $k => $v) {
            $out .= $k . ': ' . $v . "\n";
        }
        return $out;
    }

    public static function html(array $rows, string $title): string
    {
        $e = fn (string $s) => htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $body = '';
        foreach ($rows as $k => $v) {
            $body .= '<tr><th align="left" valign="top" style="padding:6px 12px 6px 0;color:#46546b;font-weight:600;white-space:nowrap">'
                . $e($k) . '</th><td style="padding:6px 0;color:#142033">' . nl2br($e((string)$v)) . '</td></tr>';
        }
        return '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5">'
            . '<h2 style="color:#0A1630;margin:0 0 12px">' . $e($title) . '</h2>'
            . '<table cellspacing="0" cellpadding="0">' . $body . '</table></div>';
    }
}

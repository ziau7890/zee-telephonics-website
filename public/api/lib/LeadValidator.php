<?php
declare(strict_types=1);

namespace Zee;

/**
 * Cleans and checks every field server-side. Browser checks are a convenience only.
 */
final class LeadValidator
{
    public const TEAM_SIZES = ['Not sure yet', '1 to 5 people', '6 to 20 people', '21 to 50 people', 'More than 50 people'];
    public const CONSENT_TEXT = 'Agreed to be contacted about this enquiry and to the privacy policy.';

    /** @param string[]|null $serviceSlugs Allowed service slugs, or null to accept any well-formed slug. */
    public function __construct(private ?array $serviceSlugs = null)
    {
    }

    /**
     * @return array{0: array<string, mixed>, 1: array<string, string>} [clean lead, errors by field]
     */
    public function validate(array $in): array
    {
        $errors = [];
        $lead = [
            'full_name'    => self::text($in['full_name'] ?? '', 120),
            'company'      => self::text($in['company'] ?? '', 160),
            'email'        => strtolower(self::text($in['email'] ?? '', 190)),
            'phone'        => self::text($in['phone'] ?? '', 40),
            'service'      => self::text($in['service'] ?? '', 80),
            'team_size'    => self::text($in['team_size'] ?? '', 40),
            'message'      => self::text($in['message'] ?? '', 4000, true),
            'consent'      => (($in['consent'] ?? '') === 'yes') ? 1 : 0,
            'source_page'  => self::text($in['source_page'] ?? '', 255),
            'utm_source'   => self::text($in['utm_source'] ?? '', 120),
            'utm_medium'   => self::text($in['utm_medium'] ?? '', 120),
            'utm_campaign' => self::text($in['utm_campaign'] ?? '', 120),
            'utm_term'     => self::text($in['utm_term'] ?? '', 120),
            'utm_content'  => self::text($in['utm_content'] ?? '', 120),
        ];

        if (mb_strlen($lead['full_name']) < 2) {
            $errors['full_name'] = 'Please enter your name.';
        }
        if (!filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Please enter a valid email address.';
        }
        if ($lead['phone'] !== '' && !preg_match('/^[0-9+()\-.\s]{6,40}$/', $lead['phone'])) {
            $errors['phone'] = 'Please enter a valid phone number, or leave it empty.';
        }
        if (mb_strlen($lead['message']) < 10) {
            $errors['message'] = 'Please tell us a little about what you need (at least 10 characters).';
        }
        if ($lead['consent'] !== 1) {
            $errors['consent'] = 'Please tick the box so we can contact you.';
        }

        if ($lead['service'] !== '') {
            $known = $this->serviceSlugs === null
                ? (bool)preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $lead['service'])
                : in_array($lead['service'], $this->serviceSlugs, true);
            if (!$known) {
                $lead['service'] = '';
            }
        }
        if (!in_array($lead['team_size'], self::TEAM_SIZES, true)) {
            $lead['team_size'] = '';
        }
        if ($lead['source_page'] !== '' && !preg_match('#^/[A-Za-z0-9/_\-.]*$#', $lead['source_page'])) {
            $lead['source_page'] = '';
        }
        $lead['consent_text'] = $lead['consent'] ? self::CONSENT_TEXT : '';

        return [$lead, $errors];
    }

    /** Trim, strip control characters and cap the length. */
    public static function text(mixed $value, int $max, bool $multiline = false): string
    {
        if (!is_string($value)) {
            return '';
        }
        $value = $multiline
            ? preg_replace('/[^\P{C}\n\t]/u', '', str_replace("\r\n", "\n", $value))
            : preg_replace('/\p{C}/u', '', $value);
        $value = trim((string)$value);
        return mb_substr($value, 0, $max);
    }
}

/**
 * Lead validation used by the Vercel form function (api/lead.ts).
 * Mirrors public/api/lib/LeadValidator.php, which is used on PHP hosting.
 */
export const TEAM_SIZES = ['Not sure yet', '1 to 5 people', '6 to 20 people', '21 to 50 people', 'More than 50 people'];
export const CONSENT_TEXT = 'Agreed to be contacted about this enquiry and to the privacy policy.';

export interface Lead {
  full_name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  team_size: string;
  message: string;
  consent: boolean;
  consent_text: string;
  source_page: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
}

export function cleanText(value: unknown, max: number, multiline = false): string {
  if (typeof value !== 'string') return '';
  let v = multiline ? value.replace(/\r\n/g, '\n').replace(/[^\P{C}\n\t]/gu, '') : value.replace(/\p{C}/gu, '');
  v = v.trim();
  return [...v].slice(0, max).join('');
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateLead(input: Record<string, unknown>, serviceSlugs: string[] | null): { lead: Lead; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const lead: Lead = {
    full_name: cleanText(input.full_name, 120),
    company: cleanText(input.company, 160),
    email: cleanText(input.email, 190).toLowerCase(),
    phone: cleanText(input.phone, 40),
    service: cleanText(input.service, 80),
    team_size: cleanText(input.team_size, 40),
    message: cleanText(input.message, 4000, true),
    consent: input.consent === 'yes',
    consent_text: '',
    source_page: cleanText(input.source_page, 255),
    utm_source: cleanText(input.utm_source, 120),
    utm_medium: cleanText(input.utm_medium, 120),
    utm_campaign: cleanText(input.utm_campaign, 120),
    utm_term: cleanText(input.utm_term, 120),
    utm_content: cleanText(input.utm_content, 120),
  };

  if ([...lead.full_name].length < 2) errors.full_name = 'Please enter your name.';
  if (!EMAIL.test(lead.email)) errors.email = 'Please enter a valid email address.';
  if (lead.phone && !/^[0-9+()\-.\s]{6,40}$/.test(lead.phone)) errors.phone = 'Please enter a valid phone number, or leave it empty.';
  if ([...lead.message].length < 10) errors.message = 'Please tell us a little about what you need (at least 10 characters).';
  if (!lead.consent) errors.consent = 'Please tick the box so we can contact you.';

  if (lead.service) {
    const known = serviceSlugs ? serviceSlugs.includes(lead.service) : /^[a-z0-9]+(-[a-z0-9]+)*$/.test(lead.service);
    if (!known) lead.service = '';
  }
  if (!TEAM_SIZES.includes(lead.team_size)) lead.team_size = '';
  if (lead.source_page && !/^\/[A-Za-z0-9/_\-.]*$/.test(lead.source_page)) lead.source_page = '';
  lead.consent_text = lead.consent ? CONSENT_TEXT : '';
  return { lead, errors };
}

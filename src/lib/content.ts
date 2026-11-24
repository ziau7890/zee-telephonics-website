/**
 * Loads and validates the editable JSON content files.
 * If a required field is missing or misspelled, the build stops with a clear error,
 * so a typo can never publish a broken page.
 */
import { z } from 'astro/zod';
import siteRaw from '../content/site.json';
import servicesRaw from '../content/services.json';
import homeRaw from '../content/home.json';

export const ICONS = [
  'headset',
  'phone-out',
  'target',
  'calendar',
  'trend',
  'chat',
  'assistant',
  'documents',
] as const;
export type IconName = (typeof ICONS)[number];

const siteSchema = z.object({
  brandName: z.string().min(1),
  legalName: z.string(),
  tagline: z.string().min(1),
  domain: z.string().min(1),
  description: z.string().min(1),
  contact: z.object({
    email: z.string().email().or(z.literal('')),
    phone: z.string(),
    hours: z.string(),
    address: z.string(),
  }),
  social: z.record(z.string(), z.string().url().or(z.literal(''))),
  turnstileSiteKey: z.string(),
  formEndpoint: z.string().min(1),
});

const serviceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes'),
  title: z.string().min(1),
  published: z.boolean(),
  order: z.number(),
  icon: z.enum(ICONS),
  summary: z.string().min(1),
  intro: z.string().min(1),
  includes: z.array(z.string().min(1)).min(1),
  goodFit: z.array(z.string().min(1)),
});

const cardSchema = z.object({ title: z.string().min(1), text: z.string().min(1) });
const homeSchema = z.object({
  hero: z.object({ eyebrow: z.string(), lead: z.string().min(1) }),
  process: z.array(cardSchema).min(1),
  principles: z.array(cardSchema),
  about: z.object({
    mission: z.string(),
    story: z.string(),
    values: z.array(cardSchema),
  }),
});

function parse<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Content error in src/content/${file}:\n${issues}`);
  }
  return result.data;
}

export const site = parse(siteSchema, siteRaw, 'site.json');
export const home = parse(homeSchema, homeRaw, 'home.json');

const allServices = parse(z.array(serviceSchema), servicesRaw.services, 'services.json');
const slugs = new Set<string>();
for (const s of allServices) {
  if (slugs.has(s.slug)) throw new Error(`Content error in src/content/services.json: duplicate slug "${s.slug}"`);
  slugs.add(s.slug);
}

/** Services that are switched on, in display order. */
export const services = allServices
  .filter((s) => s.published)
  .sort((a, b) => a.order - b.order);

export type Service = z.infer<typeof serviceSchema>;

/** Display name used in the footer and legal pages. */
export const businessName = site.legalName || site.brandName;

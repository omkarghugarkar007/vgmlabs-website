import type { CompanyIdentity, NavItem } from '@/types/content';

/**
 * Company identity and canonical copy.
 *
 * This is the single source of truth for the brand, the legal entity and the
 * headline statements used across the site. Editing a string here updates every
 * page that renders it. See `docs/CONTENT.md`.
 *
 * Nothing in this file may assert customers, revenue, funding, team size, years
 * of experience, partnerships or certifications.
 */

const resolveSiteUrl = (): string => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  // The live origin. CI still sets NEXT_PUBLIC_SITE_URL (see the deploy workflow),
  // but this fallback means a local build also emits correct canonical URLs,
  // sitemap entries and JSON-LD @id values instead of a placeholder domain.
  return 'https://vgmlabsai.com';
};

export const company: CompanyIdentity = {
  brand: 'VGM Labs',
  legalName: 'VGM Labs AI Private Limited',
  descriptor: 'Applied Intelligence',
  city: 'Hyderabad',
  region: 'Telangana',
  country: 'India',
  countryCode: 'IN',
  cin: 'U62099TS2024PTC192252',
  // Propagates to the footer, contact page, Company page, both legal documents
  // and the Organization JSON-LD contact point. `city` additionally feeds the
  // governing-law clause in the terms ("the courts at ..."), so changing it moves
  // the stated jurisdiction — see src/data/legal.ts.
  email: 'info@vgmlabsai.com',
  siteUrl: resolveSiteUrl(),
  foundedYear: 2024,
};

/** Short-form location string for the footer and contact page. */
export const locationLine = `${company.city}, ${company.region}, ${company.country}`;

/**
 * The positioning statement. Used in metadata, JSON-LD and the company section.
 * Deliberately describes what the company designs, not how remarkable it is.
 */
export const positioningStatement =
  'VGM Labs designs intelligent systems that can reason, act, learn and operate in real-world environments.';

export const shortDescription =
  'VGM Labs builds AI-first software, agentic systems, edge intelligence and neuro-symbolic architectures for real-world applications.';

/** Rotating technical status label under the hero headline. */
export const heroStatusLabels: readonly string[] = [
  'Applied AI',
  'Agentic Systems',
  'Edge Intelligence',
];

export const hero = {
  /** Authored as explicit lines — the reveal animates on line boundaries. */
  headlineLines: ['Intelligence,', 'engineered for', 'the real world.'] as const,
  /**
   * The first sentence anyone reads, so it has to be the most specific one rather
   * than the vaguest.
   *
   * It used to say "AI-first software and intelligent systems that reason, act and
   * operate across cloud, edge and constrained environments" — a sentence any
   * company in this category could have published verbatim, on a site whose whole
   * argument is precision.
   *
   * This version says the thing the rest of the site actually earns: the work is at
   * the seam between a probabilistic component and the deterministic system around
   * it, and the deployment targets include environments most vendors will not go
   * near. It names a problem, not an adjective. It still claims nothing about
   * customers, results or track record.
   */
  support:
    'We build the parts of an AI system that have to keep working when the model is wrong — evaluation, permission boundaries, fallbacks, and deployment into cloud, edge or air-gapped environments.',
  primaryCta: { label: 'Explore our capabilities', href: '/capabilities' },
  secondaryCta: { label: 'Discuss a project', href: '/contact' },
} as const;

export const positioning = {
  headlineLines: ['From models', 'to working systems.'] as const,
  body: 'A model is only one component of an intelligent product. We design the reasoning, orchestration, data, evaluation and deployment layers required to make AI useful in production.',
  aside:
    'Most AI work fails at the seams — where a probabilistic component meets a deterministic system, a permission boundary, a latency budget or an operator who needs to understand what just happened.',
} as const;

export const companySection = {
  headlineLines: ['An AI lab', 'with a product mindset.'] as const,
  body: 'VGM Labs is an applied-AI company focused on turning advanced research and emerging AI architectures into dependable software systems.',
  support:
    'We work at the intersection of models, software engineering, system design and real-world operational constraints.',
  /**
   * Operating principles. These describe how the company works — they are
   * commitments, not achievements, and each one is falsifiable.
   */
  principles: [
    {
      id: 'evidence',
      label: 'Evidence over demonstration',
      body: 'A system is only understood once its failure modes are written down and measured. Evaluation is designed alongside the feature, not retrofitted after launch.',
    },
    {
      id: 'constraint',
      label: 'Constraints first',
      body: 'Latency budget, privacy posture, connectivity and available compute are treated as design inputs. Architecture follows the operating environment.',
    },
    {
      id: 'boundaries',
      label: 'Explicit boundaries',
      body: 'Autonomous components run inside defined permissions, with auditable actions and a human intervention path. Capability is bounded on purpose.',
    },
    {
      id: 'ownership',
      label: 'Handover as a deliverable',
      body: 'Documentation, evaluation datasets and operational runbooks ship with the system. A system another team cannot operate is unfinished.',
    },
  ],
} as const;

export const finalCta = {
  headlineLines: ['What should', 'intelligence do next?'] as const,
  body: 'Bring us the workflow, decision or technical constraint that conventional software cannot solve.',
  cta: { label: 'Start a conversation', href: '/contact' },
} as const;

/** Primary CTA reused by the navigation. */
export const primaryCta: NavItem = {
  label: 'Start a conversation',
  href: '/contact',
};

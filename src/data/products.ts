import type { Product } from '@/types/content';

/**
 * Products.
 *
 * These are VGM Labs' own products, as distinct from client engineering work. The
 * `status` field is what keeps the section honest — it is rendered as a visible
 * badge, so something in development cannot read as if it had shipped.
 *
 * ⚠️  ACTION NEEDED: the LawSpeak summary and detail below are deliberately
 *     minimal, because they were written without knowing the product. Replace them
 *     with an accurate description of what it actually does. Both fields are
 *     optional and the card renders correctly without them, so an empty string is
 *     safer than a guess.
 *
 * Rules, same as for research and case studies:
 *   - `status: 'live'` requires a working public URL
 *   - never describe a planned product in the present tense
 *   - no user counts, revenue, customer names or performance claims
 *
 * See `docs/CONTENT.md`.
 */
export const products: readonly Product[] = [
  {
    id: 'lawspeak',
    publish: true,
    name: 'LawSpeak',
    status: 'live',
    sector: 'Legal',
    // REPLACE with the real description.
    summary: 'Applied language AI for legal work.',
    detail:
      'LawSpeak is VGM Labs’ first product. Replace this paragraph with a description of the problem it solves, who uses it and what it does — written in the same defensible register as the rest of the site.',
    href: 'https://lawspeak.ai',
    builtOn: ['Language models', 'Document intelligence', 'Retrieval'],
  },
  {
    id: 'hospital-management',
    publish: true,
    name: 'Hospital Management System',
    status: 'in-development',
    sector: 'Healthcare',
    summary:
      'An intelligent hospital management system, currently in development — clinical and administrative workflow in one system, with AI applied where judgement is actually required.',
    detail:
      'A hospital runs on connected operational workflows — admissions, records, scheduling, discharge, billing — and the cost of moving information between them is absorbed by staff. The system under development treats those workflows as one surface and applies intelligence at the points where coordination and document handling consume clinical time.',
    builtOn: ['Document intelligence', 'Workflow automation', 'Knowledge systems'],
  },
];

/** Only publishable products. The single accessor components should use. */
export const publishedProducts: readonly Product[] = products.filter((p) => p.publish);

/** Live products, for places that should show only what is actually available. */
export const liveProducts: readonly Product[] = publishedProducts.filter(
  (p) => p.status === 'live',
);

export const productStatusLabels: Readonly<Record<Product['status'], string>> = {
  live: 'Live',
  'in-development': 'In development',
  planned: 'Planned',
};

export const productsSection = {
  headlineLines: ['Products we', 'build and run.'] as const,
  body: 'Alongside client engineering, VGM Labs builds and operates its own products — the same layers described on this page, applied end to end and maintained in production.',
  note: 'Every entry states its status, and only what is live is linked.',
} as const;

export const productsPage = {
  headlineLines: ['Our own', 'products.'] as const,
  lead: 'Running our own software is how the engineering standards on this site get tested against real operational load — the same layers, applied end to end, maintained by the people who designed them.',
} as const;

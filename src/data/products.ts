import type { Product } from '@/types/content';

/**
 * Products.
 *
 * These are VGM Labs' own products, as distinct from client engineering work. The
 * `status` field is what keeps the section honest — it is rendered as a visible
 * badge, so something in development cannot read as if it had shipped.
 *
 * The LawSpeak copy below is written from what www.lawspeak.ai actually presents:
 * research across judgments, acts and case law, question-answering over uploaded
 * documents, AI drafting, audio transcription and document translation, for
 * lawyers, paralegals and legal researchers.
 *
 * Its own marketing describes the translation as working "with high accuracy".
 * That is not repeated here — it is unquantified, and an accuracy claim on this
 * site would need a stated evaluation set and method behind it.
 *
 * Rules, same as for research and case studies:
 *   - `status: 'live'` requires a working public URL — check it resolves, not just
 *     that it looks right. The apex `lawspeak.ai` does not.
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
    summary:
      'Legal research, drafting and document work in one workspace — case law and statute alongside a practice’s own files.',
    detail:
      'Built for lawyers, paralegals and legal researchers. LawSpeak searches judgments, acts and case law, answers questions against documents the user has uploaded, drafts from a prompt, and handles the document work around all of it — transcribing audio and translating between languages. The hard part is provenance rather than fluency: in legal work an answer is only as useful as the source a practitioner can open and check themselves, which is the seam this site is about.',
    // The apex domain has no A record — only www resolves (CNAME to Railway). A
    // link to https://lawspeak.ai fails at DNS before any request is made, so it
    // must be www until an apex A record exists.
    href: 'https://www.lawspeak.ai',
    builtOn: [
      'Retrieval over legal corpora',
      'Document intelligence',
      'Speech transcription',
      'Machine translation',
    ],
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

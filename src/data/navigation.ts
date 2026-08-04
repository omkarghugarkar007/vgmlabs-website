import type { NavItem } from '@/types/content';
import { publishedWork } from './projects';

/**
 * Navigation. `primaryNav` drives the top bar, the mobile menu and the footer's
 * first column. Adding a route here does not create the page — add the
 * corresponding `src/app/<route>/page.tsx` and a `sitemap.ts` entry too.
 */

export const primaryNav: readonly NavItem[] = [
  { label: 'Products', href: '/products', hint: 'What we build and run' },
  { label: 'Capabilities', href: '/capabilities', hint: 'Six system layers' },
  { label: 'Approach', href: '/approach', hint: 'How work is run' },
  { label: 'Research', href: '/research', hint: 'Open questions' },
  { label: 'Company', href: '/company', hint: 'Who we are' },
];

export const utilityNav: readonly NavItem[] = [
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

/* -------------------------------------------------------------------------- */
/* Homepage outline                                                           */
/* -------------------------------------------------------------------------- */

/**
 * The homepage chapters, in order — the single source for both the section rail
 * and the numbered eyebrow on each section ("03 / Capabilities").
 *
 * Those numbers used to be typed into each component by hand, which meant any
 * change to the running order left a stale or duplicated number somewhere, and
 * removing a chapter left a visible gap in the sequence. Deriving them removes
 * that whole class of mistake: reorder this array and the page renumbers itself.
 *
 * `work` is conditional. Nothing in `projects.ts` is published yet, and giving an
 * empty portfolio its own numbered chapter of the homepage narrative drew
 * attention to the absence rather than away from it — the only content was
 * "currently being documented" plus four placeholders marked IN DOCUMENTATION.
 * The chapter reappears, in this position, the moment the first case study sets
 * `publish: true`. Until then the Company section carries a single line about how
 * client work is published. See docs/CASE-STUDIES.md.
 */
export const homeSections: readonly { readonly id: string; readonly label: string }[] = [
  { id: 'positioning', label: 'Systems' },
  { id: 'products', label: 'Products' },
  { id: 'capabilities', label: 'Build' },
  { id: 'matrix', label: 'Index' },
  { id: 'approach', label: 'Process' },
  { id: 'deployment', label: 'Deploy' },
  { id: 'research', label: 'Research' },
  ...(publishedWork.length > 0 ? [{ id: 'work', label: 'Work' }] : []),
  { id: 'company', label: 'Company' },
];

/** Whether the Work chapter is part of the homepage narrative right now. */
export const showWorkChapter = publishedWork.length > 0;

/**
 * Display titles for the numbered eyebrows. Separate from the rail labels above,
 * which are abbreviated to fit a narrow strip.
 */
const EYEBROW_TITLES: Readonly<Record<string, string>> = {
  positioning: 'Positioning',
  products: 'Products',
  capabilities: 'Capabilities',
  matrix: 'Index',
  approach: 'Approach',
  deployment: 'Deployment',
  research: 'Research',
  work: 'Work',
  company: 'Company',
};

/**
 * The numbered eyebrow for a homepage section, e.g. "03 / Capabilities".
 *
 * Throws on an unknown id rather than rendering something wrong — a typo here
 * should fail the build, not ship a mislabelled chapter.
 */
export function homeEyebrow(id: string): string {
  const index = homeSections.findIndex((section) => section.id === id);
  if (index < 0) {
    throw new Error(
      `homeEyebrow: "${id}" is not in homeSections. Add it to the outline in src/data/navigation.ts.`,
    );
  }
  return `${String(index + 1).padStart(2, '0')} / ${EYEBROW_TITLES[id] ?? id}`;
}

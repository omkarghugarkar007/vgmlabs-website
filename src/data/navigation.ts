import type { NavItem } from '@/types/content';

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

/** In-page anchors surfaced in the homepage section rail. */
export const homeSections: readonly { readonly id: string; readonly label: string }[] = [
  { id: 'positioning', label: 'Systems' },
  { id: 'products', label: 'Products' },
  { id: 'capabilities', label: 'Build' },
  { id: 'matrix', label: 'Index' },
  { id: 'approach', label: 'Process' },
  { id: 'deployment', label: 'Deploy' },
  { id: 'research', label: 'Research' },
  { id: 'work', label: 'Work' },
  { id: 'company', label: 'Company' },
];

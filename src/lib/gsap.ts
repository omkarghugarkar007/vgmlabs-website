'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * GSAP setup, imported once by any client component that needs ScrollTrigger.
 *
 * `gsap.registerPlugin` is idempotent, but keeping registration in one module
 * means the plugin is imported from exactly one place and tree-shaking has a
 * single edge to follow.
 */

let registered = false;

if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(ScrollTrigger);

  // ScrollTrigger's default is to normalise nothing and never take over the
  // scroller — which is what we want. The site must never hijack scrolling.
  ScrollTrigger.config({
    // Recalculate on resize but not on every address-bar show/hide on iOS,
    // which otherwise thrashes start/end positions during a scroll.
    ignoreMobileResize: true,
  });

  registered = true;
}

export { gsap, ScrollTrigger };

/**
 * True when the visitor has asked for reduced motion. Read at call time rather
 * than cached, so a mid-session change to the OS setting is respected.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Refresh ScrollTrigger once fonts have settled. Web-font swap changes text
 * height, which invalidates every measured start/end position.
 */
export function refreshAfterFonts(): void {
  if (typeof document === 'undefined') return;
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts) return;
  fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
}

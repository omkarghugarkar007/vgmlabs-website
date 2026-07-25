import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server.
 *
 * Measurement-dependent setup (ScrollTrigger, split-line reveals) must run
 * before paint to avoid a flash of unstyled position, but React warns when
 * `useLayoutEffect` runs during server rendering. Every route here is statically
 * exported, so that warning would otherwise fire at build time.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

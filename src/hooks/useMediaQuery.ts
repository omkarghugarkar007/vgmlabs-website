'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { detectWebGL } from '@/lib/field/config';

/**
 * Browser-capability hooks.
 *
 * All of these read state that lives outside React — the viewport, the OS motion
 * preference, the scroll position, the GPU — so they use `useSyncExternalStore`
 * rather than an effect that calls `setState`.
 *
 * That is not a lint workaround. `useSyncExternalStore` is the correct primitive
 * here: it gives a separate server snapshot (so the statically exported HTML is
 * deterministic), it re-reads after hydration and re-renders only if the value
 * actually differs, and it bails out of the render entirely when a subscription
 * fires with an unchanged value. An effect-plus-setState version renders twice on
 * mount and cannot express the server snapshot at all.
 */

/** One MediaQueryList per query, reused across every consumer of that query. */
const queryCache = new Map<string, MediaQueryList>();

function getQueryList(query: string): MediaQueryList {
  let mql = queryCache.get(query);
  if (!mql) {
    mql = window.matchMedia(query);
    queryCache.set(query, mql);
  }
  return mql;
}

/**
 * Subscribe to a media query.
 *
 * Returns `false` during server rendering and hydration, then the real value. Any
 * other server default would guarantee a hydration mismatch, since exported HTML
 * has no viewport. Components needing different *layouts* per breakpoint use CSS;
 * this is for behaviour CSS cannot express, such as not mounting a WebGL canvas.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = getQueryList(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => getQueryList(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/**
 * Reduced-motion preference. Every ambient animation in the project is gated on
 * this, and it is read live so toggling the OS setting takes effect without a
 * reload.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** Coarse pointer — used to skip hover-only affordances on touch devices. */
export function useCoarsePointer(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

/* -------------------------------------------------------------------------- */
/* Scroll                                                                     */
/* -------------------------------------------------------------------------- */

function subscribeToScroll(onStoreChange: () => void): () => void {
  window.addEventListener('scroll', onStoreChange, { passive: true });
  return () => window.removeEventListener('scroll', onStoreChange);
}

/**
 * True once the page has scrolled past `threshold` pixels.
 *
 * The snapshot is a boolean, so React discards every scroll notification where the
 * answer has not changed — the navigation bar re-renders at most twice for the
 * whole page rather than once per scroll event.
 */
export function useScrollThreshold(threshold: number): boolean {
  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);
  return useSyncExternalStore(subscribeToScroll, getSnapshot, () => false);
}

/* -------------------------------------------------------------------------- */
/* WebGL                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Detection is memoised for the lifetime of the document: it allocates a canvas and
 * a GL context, and the answer cannot change.
 */
let webglSupport: boolean | null = null;

function getWebGLSnapshot(): boolean {
  if (webglSupport === null) webglSupport = detectWebGL();
  return webglSupport;
}

/** Nothing to subscribe to — support is fixed once the document exists. */
const subscribeToNothing = () => () => {};

/**
 * Whether this device can run the WebGL field.
 *
 * `false` on the server so the exported HTML always contains the static fallback;
 * the real answer arrives immediately after hydration. Combined with the CSS
 * cross-fade in `IntelligenceField`, the handover is invisible.
 */
export function useWebGLSupport(): boolean {
  return useSyncExternalStore(subscribeToNothing, getWebGLSnapshot, () => false);
}

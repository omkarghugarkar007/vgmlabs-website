'use client';

import { useEffect, useState } from 'react';
import { gsap, ScrollTrigger, refreshAfterFonts } from '@/lib/gsap';
import { FIELD_STATE_INDEX, MAX_STATE_INDEX } from '@/lib/field/config';
import { fieldSignal, publishFieldState } from '@/lib/field/signal';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { usePrefersReducedMotion } from './useMediaQuery';

/**
 * The drivers that connect the document to the Intelligence Field.
 *
 * All of them write into the `fieldSignal` singleton rather than React state.
 * Scroll and pointer events fire at frame rate; re-rendering the tree that often
 * would cost far more than the WebGL scene itself.
 */

/* -------------------------------------------------------------------------- */
/* Scroll                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Maps sections to field states.
 *
 * Any element carrying `data-field-state="<id>"` claims a state while it occupies
 * the middle of the viewport. The signal's `target` snaps to that state's index
 * and the render loop damps `current` toward it, so the structure migrates over
 * roughly a second instead of tracking the scrollbar frame-for-frame.
 *
 * This is deliberately not a scrubbed mapping of scroll position onto the field
 * coordinate. Scrubbing ties morph speed to scroll speed, which makes a fast
 * flick look like a glitch; damping keeps every transition paced the same way and
 * respects the authored height of each section.
 *
 * Nothing here touches scroll behaviour itself — no pinning, no snapping, no
 * hijacking. The visitor remains in control.
 */
export function useFieldScrollDriver(enabled = true): void {
  const reducedMotion = usePrefersReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-field-state]'),
    );

    const triggers: ScrollTrigger[] = [];

    for (const el of sections) {
      const id = el.dataset.fieldState as keyof typeof FIELD_STATE_INDEX | undefined;
      if (!id) continue;
      const index = FIELD_STATE_INDEX[id];
      if (index === undefined) continue;

      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          // A section owns the field once its top passes 70% of the viewport and
          // keeps it until its bottom rises past 30%. Overlapping ranges resolve
          // to the last one entered, which matches reading order in both
          // scroll directions.
          start: 'top 70%',
          end: 'bottom 30%',
          onToggle: (self) => {
            if (!self.isActive) return;
            fieldSignal.target = index;
            publishFieldState(index);
          },
        }),
      );
    }

    // Whole-document progress for the navigation rail.
    triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          fieldSignal.scrollProgress = self.progress;
        },
      }),
    );

    refreshAfterFonts();

    return () => {
      for (const trigger of triggers) trigger.kill();
    };
  }, [enabled]);

  // Under reduced motion the field holds its first state: no scroll-linked 3D
  // transformation at all, as required. Content and navigation are untouched.
  useEffect(() => {
    if (!reducedMotion) return;
    fieldSignal.target = 0;
    fieldSignal.current = 0;
  }, [reducedMotion]);
}

/* -------------------------------------------------------------------------- */
/* Pointer and device orientation                                             */
/* -------------------------------------------------------------------------- */

/**
 * Pointer position in normalised device coordinates, plus device tilt on mobile.
 *
 * Listeners are passive and write two numbers. The damping that makes this feel
 * like parallax rather than mouse-following happens in the render loop, where it
 * is frame-rate correct.
 */
export function usePointerDriver(enabled = true): void {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!enabled || reducedMotion) {
      fieldSignal.pointerActive = false;
      fieldSignal.pointerX = 0;
      fieldSignal.pointerY = 0;
      fieldSignal.tiltX = 0;
      fieldSignal.tiltY = 0;
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      // Ignore touch drags: on a touch screen the pointer *is* the scroll
      // gesture, and coupling the field to it reads as a wobble.
      if (event.pointerType === 'touch') return;
      fieldSignal.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      fieldSignal.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      fieldSignal.pointerActive = true;
    };

    const onPointerLeave = () => {
      fieldSignal.pointerActive = false;
      fieldSignal.pointerX = 0;
      fieldSignal.pointerY = 0;
    };

    const onOrientation = (event: DeviceOrientationEvent) => {
      // gamma: left-right tilt in degrees, beta: front-back.
      const gamma = event.gamma ?? 0;
      const beta = event.beta ?? 0;
      fieldSignal.tiltX = Math.max(-1, Math.min(1, gamma / 45));
      // Offset by 45° so a naturally held phone reads as neutral.
      fieldSignal.tiltY = Math.max(-1, Math.min(1, (beta - 45) / 45));
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    // No permission prompt is requested: if the browser requires one, tilt
    // simply stays at zero and the field is none the worse for it.
    window.addEventListener('deviceorientation', onOrientation, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [enabled, reducedMotion]);
}

/* -------------------------------------------------------------------------- */
/* Motion budget                                                              */
/* -------------------------------------------------------------------------- */

/** Publishes the reduced-motion preference into the signal for the shader. */
export function useMotionBudget(): boolean {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    fieldSignal.motion = reducedMotion ? 0 : 1;
  }, [reducedMotion]);

  return reducedMotion;
}

/* -------------------------------------------------------------------------- */
/* Render gating                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Stop rendering when there is nothing to render for.
 *
 * Two independent conditions, both of which matter for battery life:
 *   - the tab is hidden (`visibilitychange`)
 *   - the canvas has been scrolled out of view (`IntersectionObserver`)
 */
export function useRenderGate(target: React.RefObject<HTMLElement | null>): boolean {
  const [active, setActive] = useState(true);

  useEffect(() => {
    let visible = !document.hidden;
    let onScreen = true;

    const apply = () => {
      const next = visible && onScreen;
      fieldSignal.rendering = next;
      setActive(next);
    };

    const onVisibility = () => {
      visible = !document.hidden;
      apply();
    };
    document.addEventListener('visibilitychange', onVisibility);

    let observer: IntersectionObserver | undefined;
    const el = target.current;
    if (el && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          onScreen = entries[0]?.isIntersecting ?? true;
          apply();
        },
        // A generous margin: start rendering slightly before the canvas is
        // visible so it is never caught mid-morph on re-entry.
        { rootMargin: '150px' },
      );
      observer.observe(el);
    }

    apply();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
    };
  }, [target]);

  return active;
}

/* -------------------------------------------------------------------------- */
/* Discrete state for the DOM                                                 */
/* -------------------------------------------------------------------------- */

/**
 * The active state index, for DOM chrome that highlights the current chapter.
 *
 * This is the one place field state becomes React state, and it changes at most
 * once per section boundary — a handful of renders per page view.
 */
export function useActiveFieldState(): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Imported lazily to keep the signal module out of the server graph.
    let mounted = true;
    import('@/lib/field/signal').then(({ subscribeFieldState }) => {
      if (!mounted) return;
      const unsubscribe = subscribeFieldState((next) => {
        setIndex(Math.min(MAX_STATE_INDEX, Math.max(0, next)));
      });
      cleanup = unsubscribe;
    });

    let cleanup: (() => void) | undefined;
    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  return index;
}

/* -------------------------------------------------------------------------- */
/* Assembly                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Drives the one-time assembly of the core out of independent particles.
 *
 * Not a loading screen and not blocking: content is interactive throughout, and
 * under reduced motion the field is simply already assembled.
 */
export function useAssembly(enabled: boolean): void {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!enabled) return;

    if (reducedMotion) {
      fieldSignal.assemble = 1;
      return;
    }

    const proxy = { value: fieldSignal.assemble };
    const tween = gsap.to(proxy, {
      value: 1,
      duration: 3.4,
      ease: 'power2.out',
      onUpdate: () => {
        fieldSignal.assemble = proxy.value;
      },
    });

    return () => {
      tween.kill();
    };
  }, [enabled, reducedMotion]);
}

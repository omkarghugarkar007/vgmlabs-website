'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import {
  useAssembly,
  useMotionBudget,
  usePointerDriver,
  useRenderGate,
} from '@/hooks/useFieldDrivers';
import { useWebGLSupport } from '@/hooks/useMediaQuery';
import { FieldStill } from './FieldStill';
import styles from './IntelligenceField.module.scss';

/**
 * The WebGL bundle. `ssr: false` keeps three.js out of the exported HTML and out
 * of the first JavaScript chunk; it is fetched only once the page has decided the
 * device can use it.
 */
const FieldCanvas = dynamic(() => import('./FieldCanvas'), {
  ssr: false,
  loading: () => null,
});

/**
 * THE INTELLIGENCE FIELD — mount point.
 *
 * A single fixed layer behind all content, present on every route so the
 * structure persists across navigation instead of restarting per page.
 *
 * Layering strategy: the static SVG field renders first, in the exported HTML, so
 * the page has its intended composition before any JavaScript arrives. The canvas
 * mounts over it and cross-fades in once it has produced a frame. If WebGL is
 * unavailable, unsupported or lost, the static layer simply stays — there is no
 * broken state and no missing information, because everything the field expresses
 * is also written in the page text.
 */
export function IntelligenceField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);

  // Reads as `false` in the exported HTML and resolves after hydration, so the
  // static field is always what ships and the canvas is an enhancement.
  const webglSupported = useWebGLSupport();

  const reducedMotion = useMotionBudget();
  const active = useRenderGate(rootRef);

  const shouldMount = webglSupported && !canvasFailed;

  usePointerDriver(shouldMount);
  useAssembly(shouldMount);

  /**
   * Hand over from the static field to the canvas.
   *
   * This used to wait purely on `onReady` from inside the Canvas. When that did not
   * arrive — and it did not, reproducibly — the fallback stayed at full opacity on
   * top of the live scene, so the static spiral and the WebGL field were composited
   * together and the result looked like neither.
   *
   * Making one layer's visibility depend on a callback from inside the other is the
   * mistake. The canvas being mounted is sufficient evidence to start the handover,
   * so a timer drives it and `onReady` only ever makes it happen sooner. If the
   * context is subsequently lost, `onFailure` unmounts the canvas and the fallback
   * returns on its own.
   */
  useEffect(() => {
    // No reset branch here: `onFailure` is the only path that unmounts the canvas,
    // and it already clears this. Resetting synchronously in the effect body would
    // also be a cascading render.
    if (!shouldMount || canvasReady) return;

    // Long enough to cover shader compilation and the first frame, short enough
    // that nobody sees both layers for meaningfully long.
    const timer = window.setTimeout(() => setCanvasReady(true), 1100);
    return () => window.clearTimeout(timer);
  }, [shouldMount, canvasReady]);

  const showCanvas = shouldMount && canvasReady;

  return (
    <div
      ref={rootRef}
      className={styles.layer}
      // Decorative. Every claim the field visualises is also stated in the page
      // copy, so there is nothing here for a screen reader to lose.
      aria-hidden="true"
      data-print-hide
    >
      <div className={`${styles.still} ${showCanvas ? styles.stillHidden : ''}`}>
        <FieldStill />
      </div>

      {shouldMount ? (
        <div className={`${styles.canvas} ${canvasReady ? styles.canvasReady : ''}`}>
          <FieldCanvas
            still={reducedMotion}
            active={active}
            onReady={() => setCanvasReady(true)}
            onFailure={() => {
              setCanvasFailed(true);
              setCanvasReady(false);
            }}
          />
        </div>
      ) : null}

      {/* A soft vertical veil. Content sections sit over the field, and this keeps
          body copy comfortably above the contrast floor without resorting to
          heavy backdrop blur on every panel. */}
      <div className={styles.veil} />
    </div>
  );
}

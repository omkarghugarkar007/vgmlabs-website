'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { NoToneMapping } from 'three';
import { fieldSignal } from '@/lib/field/signal';
import { useAdaptiveQuality } from './AdaptiveQuality';
import { FieldScene } from './FieldScene';

interface FieldCanvasProps {
  /** Called after the first successful frame, so the layer can fade in. */
  onReady?: () => void;
  /** Called if WebGL context creation or the render loop fails irrecoverably. */
  onFailure?: () => void;
  /** Reduced motion: still camera, no parallax, no assembly. */
  still: boolean;
  /** Render gate — false when the tab is hidden or the layer is off screen. */
  active: boolean;
}

/**
 * The WebGL canvas.
 *
 * This module is the heavy one (three, R3F, postprocessing) and is only ever
 * reached through a dynamic import with `ssr: false`, so none of it appears in
 * the initial HTML or the first JavaScript payload.
 *
 * `frameloop` is switched to `never` whenever the gate closes, which stops the
 * render loop entirely rather than merely skipping work inside it — the
 * difference matters for battery on a laptop with the tab in the background.
 */
export default function FieldCanvas({ onReady, onFailure, still, active }: FieldCanvasProps) {
  const { profile, onFrame } = useAdaptiveQuality();
  const [failed, setFailed] = useState(false);

  const handleFailure = useCallback(() => {
    setFailed(true);
    onFailure?.();
  }, [onFailure]);

  // Guard against a context loss after a successful start — a driver reset or a
  // GPU process crash. Rather than leave a dead black rectangle, hand over to the
  // static fallback.
  const onCreated = useCallback(
    ({ gl }: { gl: { domElement: HTMLCanvasElement } }) => {
      const canvas = gl.domElement;
      canvas.addEventListener('webglcontextlost', handleFailure, { once: true });

      // The wrapping layer is already aria-hidden, so the canvas is out of the
      // accessibility tree either way. These are set directly on the element for
      // the same reason the inline SVGs carry them: the attribute should be on
      // the decorative thing itself, not inferred from an ancestor. R3F creates
      // this element, so it cannot be set as a JSX prop.
      canvas.setAttribute('aria-hidden', 'true');
      canvas.setAttribute('role', 'presentation');
      // R3F sets tabIndex=0 when it installs pointer events. Events are disabled
      // here, but assert it regardless — a focusable decoration is a tab stop
      // that leads nowhere.
      canvas.removeAttribute('tabindex');

      onReady?.();
    },
    [handleFailure, onReady],
  );

  if (failed) return null;

  return (
    <Canvas
      // Clamped device pixel ratio. Retina at 3x costs nine times the fragments
      // of 1x for a difference nobody can see on a field of 2px points.
      dpr={profile.dpr as unknown as [number, number]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 42, near: 0.1, far: 40, position: [0, 0.2, 7] }}
      gl={{
        // Antialiasing is pointless here: points and additive lines have no hard
        // silhouettes to alias, and MSAA would cost a multisampled buffer.
        antialias: false,
        alpha: true,
        stencil: false,
        depth: true,
        powerPreference: 'high-performance',
        // The palette is authored in sRGB and the effects are additive; tone
        // mapping would desaturate the accents toward grey.
        toneMapping: NoToneMapping,
        failIfMajorPerformanceCaveat: false,
      }}
      // Nothing in the scene is interactive, so the raycaster would run every
      // frame for no reason. The layer is pointer-events: none in CSS as well.
      events={undefined}
      onCreated={onCreated}
      onError={handleFailure}
      style={{ position: 'absolute', inset: 0 }}
    >
      <FieldScene
        profile={profile}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, profile.dpr[1]) : 1}
        distanceScale={1}
        still={still}
      />
      <QualityProbe onFrame={onFrame} />
    </Canvas>
  );
}

/**
 * Feeds frame deltas to the adaptive quality manager. A separate component so the
 * measurement subscribes to the render loop without any scene component needing
 * to know about quality management.
 */
function QualityProbe({ onFrame }: { onFrame: (delta: number) => void }) {
  const armed = useRef(false);

  useEffect(() => {
    // Skip the first 400ms: shader compilation and buffer upload dominate early
    // frames and would trigger a spurious downgrade on capable hardware.
    const timer = window.setTimeout(() => {
      armed.current = true;
    }, 400);
    return () => window.clearTimeout(timer);
  }, []);

  useFrame((_, delta) => {
    if (!armed.current || !fieldSignal.rendering) return;
    onFrame(delta);
  });

  return null;
}

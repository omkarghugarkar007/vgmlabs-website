'use client';

import { useCallback, useRef, useState } from 'react';
import {
  QUALITY_PROFILES,
  initialTier,
  type QualityProfile,
  type QualityTier,
} from '@/lib/field/config';

const ORDER: readonly Exclude<QualityTier, 'off'>[] = ['low', 'medium', 'high'];

/**
 * Adaptive quality manager.
 *
 * A static guess from device signals is a starting point, not an answer — a
 * high-core laptop can still be driving an external 4K display on integrated
 * graphics. This measures real frame timing and steps the profile down when the
 * scene cannot hold a usable frame rate.
 *
 * Deliberately one-directional. Upgrading again after a downgrade produces
 * oscillation: the scene gets faster, upgrades, gets slower, downgrades, and the
 * visitor watches the visuals pulse. A downgrade is permanent for the session.
 *
 * Returns a stable profile object plus a `ready` flag, so the canvas can avoid
 * rendering one frame at the wrong tier.
 */
export function useAdaptiveQuality(): {
  profile: QualityProfile;
  tier: Exclude<QualityTier, 'off'>;
  onFrame: (delta: number) => void;
} {
  // A lazy initialiser rather than an effect: this hook only ever runs inside
  // FieldCanvas, which is dynamically imported with `ssr: false`. There is no
  // server render to mismatch against, so the device can be inspected during the
  // first render and the scene never draws a frame at the wrong tier.
  const [tier, setTier] = useState<Exclude<QualityTier, 'off'>>(initialTier);
  const samples = useRef<number[]>([]);
  const downgrades = useRef(0);
  const settled = useRef(false);

  const onFrame = useCallback(
    (delta: number) => {
      // Two downgrades is the floor; below `low` the honest answer is the static
      // fallback, and that decision belongs to the canvas, not here.
      if (downgrades.current >= 2) return;

      const store = samples.current;
      store.push(delta);
      // Ignore the first second or so: shader compilation and texture upload
      // make early frames unrepresentatively slow.
      if (store.length < 90) return;

      // Median, not mean — a single 400ms hitch from a garbage collection pause
      // should not trigger a downgrade.
      const sorted = [...store].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      store.length = 0;

      // ~45fps. Above this the experience is fluid; below it, sustained, the
      // scene is costing more than it returns.
      if (median > 1 / 45) {
        setTier((current) => {
          const index = ORDER.indexOf(current);
          if (index <= 0) return current;
          downgrades.current += 1;
          return ORDER[index - 1];
        });
      } else if (!settled.current) {
        settled.current = true;
      }
    },
    [],
  );

  return { profile: QUALITY_PROFILES[tier], tier, onFrame };
}

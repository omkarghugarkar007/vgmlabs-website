'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

interface PostFXProps {
  bloom: boolean;
  grade: boolean;
}

/**
 * The effect passes, behind a dynamic import.
 *
 * `bloom` and `grade` are false on every quality tier (see lib/field/config.ts for
 * the two rounds of visible artefacts that led to that), so `PostFX` returns null
 * in every code path that actually runs. A static import of `postprocessing` and
 * `@react-three/postprocessing` still pulled both libraries into the WebGL chunk —
 * a few hundred kilobytes downloaded on every visit to render nothing.
 *
 * Importing them lazily keeps the escape hatch exactly as it was: flip a tier's
 * flag and the chunk is fetched. The cost only exists if the feature is used.
 */
const Passes = dynamic(() => import('./PostFXPasses'), { ssr: false, loading: () => null });

/**
 * Post-processing. Restrained to the point of near-absence, for a reason.
 *
 * The first version of this used `mipmapBlur` bloom at a 0.72 luminance threshold.
 * With additive particles and no tone mapping, the dense core accumulates luminance
 * far above 1.0, so almost the whole field cleared the threshold — and mipmap
 * downsampling smeared it into enormous soft rectangles that washed the typography
 * out completely. It looked like a bug because it was one.
 *
 * What replaced it:
 *   - a Gaussian kernel rather than mipmap sampling, so a bright region produces a
 *     tight halo instead of a screen-sized block
 *   - a luminance threshold at 1.0, so only genuinely over-bright pixels bloom —
 *     in practice the signal particles and the node highlights, which is the point
 *   - low intensity, so the effect adds a glint rather than a glow
 *
 * There is no depth-of-field: it is the most expensive effect available and it would
 * blur the very structure the section copy refers to.
 */
export function PostFX({ bloom, grade }: PostFXProps) {
  // The early return is what makes the dynamic import free: with both flags off,
  // `Passes` is never rendered, so its chunk is never requested.
  if (!bloom && !grade) return null;

  return (
    <Suspense fallback={null}>
      <Passes bloom={bloom} grade={grade} />
    </Suspense>
  );
}

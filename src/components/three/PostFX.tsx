'use client';

import { Suspense } from 'react';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

interface PostFXProps {
  bloom: boolean;
  grade: boolean;
}

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
  if (!bloom && !grade) return null;

  // EffectComposer types its children as elements rather than ReactNode, so the
  // passes are collected into an array instead of inlined with `&&`.
  const passes = [];

  if (bloom) {
    passes.push(
      <Bloom
        key="bloom"
        // Deliberately low. Raising this is the fastest way back to the washed-out
        // version — if the field ever needs more presence, raise particle alpha in
        // the shader instead, where the effect is bounded.
        intensity={0.16}
        // Only pixels already at full brightness contribute. Anything lower and the
        // core's additive accumulation blooms as a mass.
        luminanceThreshold={1.0}
        luminanceSmoothing={0.06}
        // NOT mipmapBlur — see the note above.
        mipmapBlur={false}
        kernelSize={KernelSize.SMALL}
      />,
    );
  }

  if (grade) {
    passes.push(
      <Vignette
        key="vignette"
        offset={0.3}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
        eskil={false}
      />,
    );
  }

  return (
    <Suspense fallback={null}>
      <EffectComposer
        // The scene has no opaque background, so depth-aware effects have nothing
        // useful to read; skipping the depth pass saves a full-resolution buffer.
        enableNormalPass={false}
        multisampling={0}
      >
        {passes}
      </EffectComposer>
    </Suspense>
  );
}

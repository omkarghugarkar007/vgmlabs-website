'use client';

import { Suspense } from 'react';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

interface PostFXProps {
  bloom: boolean;
  grade: boolean;
}

/**
 * Post-processing. Restrained by design.
 *
 * Bloom is set with a high luminance threshold and low intensity so only the
 * genuinely bright things — signal particles, node highlights — pick up a halo.
 * A low threshold would wash the graphite environment into grey mush and turn the
 * palette into the generic glowing-AI look the art direction avoids.
 *
 * There is no depth-of-field: it is the most expensive effect available and it
 * would blur the very structure the section copy refers to.
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
        intensity={0.62}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.22}
        // Mipmap blur is both cheaper and softer than a large Gaussian kernel at
        // this radius.
        mipmapBlur
        kernelSize={KernelSize.MEDIUM}
      />,
    );
  }

  if (grade) {
    passes.push(
      <Vignette
        key="vignette"
        offset={0.28}
        darkness={0.62}
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

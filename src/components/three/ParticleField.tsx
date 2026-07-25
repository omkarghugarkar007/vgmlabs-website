'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Color, type ShaderMaterial } from 'three';
import { PARTICLE_FRAGMENT, PARTICLE_VERTEX } from '@/lib/field/shaders/particles.glsl';
import { FIELD_COLORS } from '@/lib/field/config';
import { advanceFieldSignal, fieldSignal, resolveFieldBlend } from '@/lib/field/signal';

interface ParticleFieldProps {
  count: number;
  /** Base point size in scene units, before per-particle scale and DPR. */
  size?: number;
  dpr: number;
}

/**
 * The particle half of the Intelligence Field.
 *
 * One draw call. Every attribute is written once at mount and never touched
 * again: all five formations, the morph between them, the assembly and the
 * procedural drift are evaluated in the vertex shader from a per-particle seed.
 * Per frame the CPU uploads eight scalars.
 *
 * `frustumCulled` is off because the geometry's `position` attribute holds birth
 * positions, not rendered ones — three's computed bounding sphere would be wrong
 * and the whole cloud would vanish at certain camera angles.
 */
export function ParticleField({ count, size = 1.75, dpr }: ParticleFieldProps) {
  const materialRef = useRef<ShaderMaterial>(null);

  const attributes = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 3);
    const indices = new Float32Array(count);
    const clusters = new Float32Array(count);
    const scales = new Float32Array(count);
    const roles = new Float32Array(count);

    // A deterministic PRNG rather than Math.random: the field looks identical on
    // every load and between server and client, which makes visual regressions
    // reproducible.
    let seed = 0x2f6e2b1;
    const rand = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return ((seed >>> 0) % 100000) / 100000;
    };

    for (let i = 0; i < count; i++) {
      const o = i * 3;

      // Birth position: scattered far out and unstructured. This is what the
      // core assembles *from* on first load.
      const phi = rand() * Math.PI * 2;
      const ct = rand() * 2 - 1;
      const st = Math.sqrt(Math.max(0, 1 - ct * ct));
      const radius = 5.5 + rand() * 7.5;
      positions[o] = st * Math.cos(phi) * radius;
      positions[o + 1] = ct * radius * 0.7;
      positions[o + 2] = st * Math.sin(phi) * radius;

      seeds[o] = rand();
      seeds[o + 1] = rand();
      seeds[o + 2] = rand();

      // Ordered in [0,1] — formations needing exact spacing (layers, lattice
      // sites) derive it from this rather than from randomness.
      indices[i] = count > 1 ? i / (count - 1) : 0;

      // Round-robin so every cluster gets an equal share regardless of count.
      clusters[i] = i % 9;

      scales[i] = 0.55 + rand() * 1.15;

      // Role decides which population a particle belongs to in each formation:
      // structure, constraint path, or signal. Weighted so signals stay a small
      // minority — they are the brightest thing on screen.
      roles[i] = rand();
    }

    return { positions, seeds, indices, clusters, scales, roles };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStateA: { value: 0 },
      uStateB: { value: 1 },
      uMix: { value: 0 },
      uAssemble: { value: 0 },
      uMotion: { value: 1 },
      uPointer: { value: [0, 0] as [number, number] },
      uSize: { value: size },
      uDpr: { value: dpr },
      uFocus: { value: 1 },
      uInk: { value: new Color(FIELD_COLORS.ink) },
      uCobalt: { value: new Color(FIELD_COLORS.cobalt) },
      uAmber: { value: new Color(FIELD_COLORS.amber) },
      uCyan: { value: new Color(FIELD_COLORS.cyan) },
    }),
    [size, dpr],
  );

  useFrame((state, delta) => {
    if (!fieldSignal.rendering) return;
    const material = materialRef.current;
    if (!material) return;

    const time = state.clock.elapsedTime;
    advanceFieldSignal(time, delta);

    const { a, b, mix } = resolveFieldBlend(fieldSignal.current);
    const u = material.uniforms;

    u.uTime.value = time;
    u.uStateA.value = a;
    u.uStateB.value = b;
    u.uMix.value = mix;
    u.uAssemble.value = fieldSignal.assemble;
    u.uMotion.value = fieldSignal.motion;
    (u.uPointer.value as [number, number])[0] = fieldSignal.smoothX;
    (u.uPointer.value as [number, number])[1] = fieldSignal.smoothY;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attributes.positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[attributes.seeds, 3]} />
        <bufferAttribute attach="attributes-aIndex" args={[attributes.indices, 1]} />
        <bufferAttribute attach="attributes-aCluster" args={[attributes.clusters, 1]} />
        <bufferAttribute attach="attributes-aScale" args={[attributes.scales, 1]} />
        <bufferAttribute attach="attributes-aRole" args={[attributes.roles, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={PARTICLE_VERTEX}
        fragmentShader={PARTICLE_FRAGMENT}
        uniforms={uniforms}
        transparent
        // Additive so overlapping particles accumulate into brighter regions —
        // this is what gives the cloud volume without any volumetric rendering.
        blending={AdditiveBlending}
        // Points must not write depth or they occlude each other arbitrarily
        // depending on draw order.
        depthWrite={false}
      />
    </points>
  );
}

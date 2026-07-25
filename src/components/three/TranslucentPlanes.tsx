'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, DoubleSide, type Mesh } from 'three';
import { FIELD_COLORS } from '@/lib/field/config';
import { advanceFieldSignal, fieldSignal } from '@/lib/field/signal';

interface TranslucentPlanesProps {
  count: number;
}

/**
 * Translucent surfaces cutting through the field — drawn as grids, not fills.
 *
 * These began as solid additive quads. Even at 2% opacity, three overlapping
 * screen-filling planes in cobalt and cyan tinted the entire graphite environment
 * blue, and bloom then amplified it. A large flat fill is simply the wrong device
 * in a design whose whole structural language is hairlines.
 *
 * As wireframe grids they do the job better and cannot wash anything out: they read
 * as constraint planes intersecting the organic flow, which is precisely the
 * neuro-symbolic idea, and their coverage is a few thin lines rather than a million
 * fragments. They are also cheaper.
 *
 * Presence peaks at the neuro-symbolic state and recedes in both directions.
 */
export function TranslucentPlanes({ count }: TranslucentPlanesProps) {
  const meshRefs = useRef<(Mesh | null)[]>([]);

  const planes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        rotation: [
          (i * 0.7 - 0.4) * Math.PI * 0.28,
          i * 1.1,
          (i % 2 === 0 ? 1 : -1) * 0.22,
        ] as [number, number, number],
        offset: (i - (count - 1) / 2) * 1.35,
        speed: 0.012 + i * 0.004,
        size: 7 + i * 1.6,
        // Coarse divisions: a fine grid at low opacity turns back into a fill.
        divisions: 5 + i,
      })),
    [count],
  );

  useFrame((state, delta) => {
    if (!fieldSignal.rendering) return;
    const time = state.clock.elapsedTime;
    advanceFieldSignal(time, delta);

    // Peak visibility at the neuro-symbolic state (coordinate 3), tapering off in
    // both directions.
    const distance = Math.abs(fieldSignal.current - 3);
    const presence = Math.max(0, 1 - distance / 2.2);

    for (let i = 0; i < meshRefs.current.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      mesh.rotation.y = planes[i].rotation[1] + time * planes[i].speed * fieldSignal.motion;

      const material = mesh.material as { opacity: number };
      // Thin lines tolerate a little more opacity than a fill ever could, and still
      // stay below the bloom threshold.
      material.opacity = 0.015 + presence * 0.05;
    }
  });

  if (count === 0) return null;

  return (
    <group>
      {planes.map((plane, i) => (
        <mesh
          key={i}
          ref={(node) => {
            meshRefs.current[i] = node;
          }}
          rotation={plane.rotation}
          position={[0, plane.offset * 0.3, 0]}
          frustumCulled={false}
        >
          <planeGeometry args={[plane.size, plane.size, plane.divisions, plane.divisions]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? FIELD_COLORS.cobalt : FIELD_COLORS.cyan}
            // The grid, rather than the surface.
            wireframe
            transparent
            opacity={0.02}
            side={DoubleSide}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

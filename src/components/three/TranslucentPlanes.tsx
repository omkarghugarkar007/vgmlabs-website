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
 * Occasional translucent surfaces cutting through the field.
 *
 * These do the work a fog volume would, for a fraction of the cost: three large
 * additive quads at very low opacity give the structure a sense of enclosing
 * space and catch the particles behind them.
 *
 * Their opacity is state-dependent. They are barely present while the core is
 * assembling, most visible in the neuro-symbolic state — where they read as
 * constraint planes intersecting the organic flow — and recede again once the
 * system stabilises.
 */
export function TranslucentPlanes({ count }: TranslucentPlanesProps) {
  const groupRefs = useRef<(Mesh | null)[]>([]);

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
        size: 9 + i * 2.2,
      })),
    [count],
  );

  useFrame((state, delta) => {
    if (!fieldSignal.rendering) return;
    const time = state.clock.elapsedTime;
    advanceFieldSignal(time, delta);

    // Peak visibility at the neuro-symbolic state (coordinate 3), tapering off
    // in both directions.
    const distance = Math.abs(fieldSignal.current - 3);
    const presence = Math.max(0, 1 - distance / 2.2);

    for (let i = 0; i < groupRefs.current.length; i++) {
      const mesh = groupRefs.current[i];
      if (!mesh) continue;
      const plane = planes[i];

      mesh.rotation.y = plane.rotation[1] + time * plane.speed * fieldSignal.motion;

      const material = mesh.material as { opacity: number };
      material.opacity = 0.006 + presence * 0.022;
    }
  });

  if (count === 0) return null;

  return (
    <group>
      {planes.map((plane, i) => (
        <mesh
          key={i}
          ref={(node) => {
            groupRefs.current[i] = node;
          }}
          rotation={plane.rotation}
          position={[0, plane.offset * 0.3, 0]}
          frustumCulled={false}
        >
          <planeGeometry args={[plane.size, plane.size, 1, 1]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? FIELD_COLORS.cobalt : FIELD_COLORS.cyan}
            transparent
            opacity={0.01}
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

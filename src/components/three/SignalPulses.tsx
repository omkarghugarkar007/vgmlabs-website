'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Matrix4, Quaternion, Vector3, type InstancedMesh } from 'three';
import { FIELD_COLORS } from '@/lib/field/config';
import { nodeGraph } from '@/lib/field/nodes';
import { advanceFieldSignal, fieldSignal } from '@/lib/field/signal';

interface SignalPulsesProps {
  count: number;
  nodeCount: number;
  maxEdges: number;
}

/**
 * Information moving through the structure.
 *
 * Each pulse rides an actual connection path, so traffic is always consistent
 * with the topology on screen. Pulses fade in and out at the ends of their run,
 * which also hides the reassignment that happens when the edge list changes
 * length between formations.
 */
export function SignalPulses({ count, nodeCount, maxEdges }: SignalPulsesProps) {
  const meshRef = useRef<InstancedMesh>(null);

  const scratch = useMemo(
    () => ({
      matrix: new Matrix4(),
      position: new Vector3(),
      a: new Vector3(),
      b: new Vector3(),
      quaternion: new Quaternion(),
      scale: new Vector3(),
      read: { x: 0, y: 0, z: 0 },
    }),
    [],
  );

  // Per-pulse speed and phase, stable across frames.
  const traits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        speed: 0.16 + ((i * 37) % 23) / 92,
        phase: ((i * 61) % 100) / 100,
        stride: 1 + ((i * 13) % 7),
      })),
    [count],
  );

  useFrame((state, delta) => {
    if (!fieldSignal.rendering) return;
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = state.clock.elapsedTime;
    advanceFieldSignal(time, delta);
    nodeGraph.allocate(nodeCount, maxEdges);
    nodeGraph.ensure(time, fieldSignal.current);

    const edgeCount = nodeGraph.edgeCount;
    const { matrix, position, a, b, quaternion, scale, read } = scratch;

    const drift = time * 0.016 * fieldSignal.motion;
    const yaw = drift + fieldSignal.smoothX * 0.2;
    const pitch = fieldSignal.smoothY * -0.11;

    for (let k = 0; k < count; k++) {
      const trait = traits[k];

      if (edgeCount === 0) {
        // No topology to travel: collapse the instance rather than leaving it
        // stranded at the origin.
        matrix.makeScale(0, 0, 0);
        mesh.setMatrixAt(k, matrix);
        continue;
      }

      // Spread pulses across the edge list. Because edges are generated in a
      // deterministic (i, j) order, a given pulse tends to stay on a related
      // part of the structure between frames.
      const edge = (k * trait.stride) % edgeCount;
      const i = nodeGraph.edges[edge * 2];
      const j = nodeGraph.edges[edge * 2 + 1];

      nodeGraph.read(i, read);
      a.set(read.x, read.y, read.z);
      nodeGraph.read(j, read);
      b.set(read.x, read.y, read.z);

      const t = (time * trait.speed + trait.phase) % 1;
      position.lerpVectors(a, b, t).applyAxisAngle(UP, yaw).applyAxisAngle(RIGHT, pitch);

      // Fade in and out at the ends of the run.
      const envelope = Math.sin(t * Math.PI);
      const s = 0.028 * envelope * (0.6 + nodeGraph.edgeWeights[edge] * 0.6);

      quaternion.setFromAxisAngle(UP, time * 0.9 + k);
      scale.setScalar(Math.max(0, s));
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(k, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        color={FIELD_COLORS.amber}
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

const UP = new Vector3(0, 1, 0);
const RIGHT = new Vector3(1, 0, 0);

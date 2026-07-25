'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Matrix4, Quaternion, Vector3, type InstancedMesh } from 'three';
import { FIELD_COLORS } from '@/lib/field/config';
import { nodeGraph } from '@/lib/field/nodes';
import { advanceFieldSignal, fieldSignal } from '@/lib/field/signal';

interface NodeLatticeProps {
  count: number;
  detail: number;
}

/**
 * The geometric nodes — the discrete, engineered counterpart to the particle
 * cloud. Octahedra rather than spheres: flat faces catch the light as they turn,
 * which reads as machined rather than organic.
 *
 * One InstancedMesh, one shared material. Positions come from `nodeGraph`, which
 * every consumer in the scene shares, so the graph is computed once per frame.
 */
export function NodeLattice({ count, detail }: NodeLatticeProps) {
  const meshRef = useRef<InstancedMesh>(null);

  // Scratch objects, allocated once. Creating a Vector3 per node per frame would
  // generate ~1.5k objects/second for the garbage collector to deal with.
  const scratch = useMemo(
    () => ({
      matrix: new Matrix4(),
      position: new Vector3(),
      quaternion: new Quaternion(),
      scale: new Vector3(),
      axis: new Vector3(0.4, 1, 0.2).normalize(),
      read: { x: 0, y: 0, z: 0 },
    }),
    [],
  );

  const emissive = useMemo(() => new Color(FIELD_COLORS.cobalt), []);

  useFrame((state, delta) => {
    if (!fieldSignal.rendering) return;
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = state.clock.elapsedTime;
    advanceFieldSignal(time, delta);
    nodeGraph.allocate(count, nodeGraph.maxEdges || count * 5);
    nodeGraph.ensure(time, fieldSignal.current);

    const { matrix, position, quaternion, scale, axis, read } = scratch;

    // Field-level orientation must match the particle shader exactly or the two
    // halves of the structure drift apart.
    const drift = time * 0.016 * fieldSignal.motion;
    const yaw = drift + fieldSignal.smoothX * 0.2;
    const pitch = fieldSignal.smoothY * -0.11;

    for (let i = 0; i < count; i++) {
      nodeGraph.read(i, read);
      position.set(read.x, read.y, read.z);
      position.applyAxisAngle(UP, yaw);
      position.applyAxisAngle(RIGHT, pitch);

      // Each node spins slowly on its own phase — enough to catch light, not
      // enough to read as an animation for its own sake.
      quaternion.setFromAxisAngle(axis, time * 0.14 + i * 1.7);

      // Nodes shrink slightly as the structure spreads out, so the wide
      // distributed state does not look chunky.
      const s = 0.055 + 0.02 * Math.sin(i * 2.1);
      scale.setScalar(s);

      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <octahedronGeometry args={[1, detail]} />
      <meshStandardMaterial
        color={FIELD_COLORS.metal}
        emissive={emissive}
        emissiveIntensity={0.55}
        metalness={0.72}
        roughness={0.34}
        // Flat shading keeps the facets crisp at this size; smooth normals on a
        // 6-pixel octahedron just look like a blurry dot.
        flatShading
      />
    </instancedMesh>
  );
}

const UP = new Vector3(0, 1, 0);
const RIGHT = new Vector3(1, 0, 0);

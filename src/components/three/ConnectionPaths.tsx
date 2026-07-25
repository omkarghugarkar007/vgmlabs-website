'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Vector3,
  type LineSegments,
} from 'three';
import { FIELD_COLORS } from '@/lib/field/config';
import { nodeGraph } from '@/lib/field/nodes';
import { advanceFieldSignal, fieldSignal } from '@/lib/field/signal';

interface ConnectionPathsProps {
  maxEdges: number;
  nodeCount: number;
}

/**
 * Thin connection paths between nodes.
 *
 * Edges are derived from proximity in `nodeGraph`, so the topology changes with
 * the formation without any per-state adjacency being authored: clusters wire
 * themselves internally, the lattice produces a grid, the layered state produces
 * rings plus vertical links.
 *
 * Per-edge brightness is carried in a vertex-colour attribute — with additive
 * blending, a darker colour is a dimmer line. That gives distance-based falloff
 * without a custom shader, so nearer pairs reveal cluster interiors.
 */
export function ConnectionPaths({ maxEdges, nodeCount }: ConnectionPathsProps) {
  const lineRef = useRef<LineSegments>(null);

  const { geometry, positions, colors } = useMemo(() => {
    const positionArray = new Float32Array(maxEdges * 2 * 3);
    const colorArray = new Float32Array(maxEdges * 2 * 3);

    const positionAttribute = new BufferAttribute(positionArray, 3);
    const colorAttribute = new BufferAttribute(colorArray, 3);
    // Signals the driver that this buffer is rewritten every frame.
    positionAttribute.setUsage(DynamicDrawUsage);
    colorAttribute.setUsage(DynamicDrawUsage);

    const geo = new BufferGeometry();
    geo.setAttribute('position', positionAttribute);
    geo.setAttribute('color', colorAttribute);
    geo.setDrawRange(0, 0);

    return { geometry: geo, positions: positionAttribute, colors: colorAttribute };
  }, [maxEdges]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const scratch = useMemo(
    () => ({
      a: new Vector3(),
      b: new Vector3(),
      read: { x: 0, y: 0, z: 0 },
      base: new Color(FIELD_COLORS.cobalt),
      warm: new Color(FIELD_COLORS.cyan),
      mixed: new Color(),
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!fieldSignal.rendering) return;
    const line = lineRef.current;
    if (!line) return;

    const time = state.clock.elapsedTime;
    advanceFieldSignal(time, delta);
    nodeGraph.allocate(nodeCount, maxEdges);
    nodeGraph.ensure(time, fieldSignal.current);

    const { a, b, read, base, warm, mixed } = scratch;
    const posArray = positions.array as Float32Array;
    const colArray = colors.array as Float32Array;

    const drift = time * 0.016 * fieldSignal.motion;
    const yaw = drift + fieldSignal.smoothX * 0.2;
    const pitch = fieldSignal.smoothY * -0.11;

    const edgeCount = Math.min(nodeGraph.edgeCount, maxEdges);

    for (let e = 0; e < edgeCount; e++) {
      const i = nodeGraph.edges[e * 2];
      const j = nodeGraph.edges[e * 2 + 1];
      const weight = nodeGraph.edgeWeights[e];

      nodeGraph.read(i, read);
      a.set(read.x, read.y, read.z).applyAxisAngle(UP, yaw).applyAxisAngle(RIGHT, pitch);
      nodeGraph.read(j, read);
      b.set(read.x, read.y, read.z).applyAxisAngle(UP, yaw).applyAxisAngle(RIGHT, pitch);

      const o = e * 6;
      posArray[o] = a.x;
      posArray[o + 1] = a.y;
      posArray[o + 2] = a.z;
      posArray[o + 3] = b.x;
      posArray[o + 4] = b.y;
      posArray[o + 5] = b.z;

      // Short links read cyan and bright, long links fade toward cobalt: the
      // structure's internal density becomes visible without extra geometry.
      mixed.copy(base).lerp(warm, weight * 0.5);
      const intensity = 0.06 + weight * weight * 0.34;
      colArray[o] = mixed.r * intensity;
      colArray[o + 1] = mixed.g * intensity;
      colArray[o + 2] = mixed.b * intensity;
      colArray[o + 3] = colArray[o];
      colArray[o + 4] = colArray[o + 1];
      colArray[o + 5] = colArray[o + 2];
    }

    // Only upload the range actually in use.
    positions.needsUpdate = true;
    colors.needsUpdate = true;
    geometry.setDrawRange(0, edgeCount * 2);
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        vertexColors
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
        // Line width is fixed at 1px in WebGL regardless of this value on most
        // platforms; the visual weight comes from colour intensity instead.
        linewidth={1}
      />
    </lineSegments>
  );
}

const UP = new Vector3(0, 1, 0);
const RIGHT = new Vector3(1, 0, 0);

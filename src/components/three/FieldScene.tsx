'use client';

import { useMemo } from 'react';
import { FIELD_COLORS, type QualityProfile } from '@/lib/field/config';
import { nodeGraph } from '@/lib/field/nodes';
import { CameraRig } from './CameraRig';
import { ConnectionPaths } from './ConnectionPaths';
import { NodeLattice } from './NodeLattice';
import { ParticleField } from './ParticleField';
import { PostFX } from './PostFX';
import { SignalPulses } from './SignalPulses';
import { TranslucentPlanes } from './TranslucentPlanes';

interface FieldSceneProps {
  profile: QualityProfile;
  dpr: number;
  /** Portrait/narrow viewports pull the camera back to keep the framing. */
  distanceScale: number;
  /** Reduced motion: no ambient camera movement, no parallax. */
  still: boolean;
}

/**
 * Scene contents.
 *
 * Composition only — every behaviour lives in its own component so the scene can
 * be read as a list of parts rather than one monolith. The lighting is minimal
 * because almost nothing in the scene is lit: the particles, paths and pulses are
 * unlit additive geometry, and only the nodes use a standard material.
 */
export function FieldScene({ profile, dpr, distanceScale, still }: FieldSceneProps) {
  // Allocate the shared node graph before any consumer's first frame so no
  // component sees a zero-length buffer.
  useMemo(() => {
    nodeGraph.allocate(profile.nodes, profile.maxEdges);
  }, [profile.nodes, profile.maxEdges]);

  return (
    <>
      <CameraRig distanceScale={distanceScale} still={still} />

      {/* Two lights, both for the nodes. A key light to define the facets and a
          cool fill so unlit faces read as metal rather than black. */}
      <directionalLight position={[3.5, 5, 4]} intensity={2.1} color={FIELD_COLORS.ink} />
      <directionalLight position={[-4, -2, -3]} intensity={0.7} color={FIELD_COLORS.cobalt} />
      <ambientLight intensity={0.12} />

      <ParticleField count={profile.particles} dpr={dpr} />

      <NodeLattice count={profile.nodes} detail={profile.nodeDetail} />

      <ConnectionPaths maxEdges={profile.maxEdges} nodeCount={profile.nodes} />

      <SignalPulses
        count={profile.signals}
        nodeCount={profile.nodes}
        maxEdges={profile.maxEdges}
      />

      <TranslucentPlanes count={profile.planes} />

      <PostFX bloom={profile.bloom} grade={profile.grade} />
    </>
  );
}

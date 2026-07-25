'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { FIELD_SCENE, MAX_STATE_INDEX } from '@/lib/field/config';
import { advanceFieldSignal, fieldSignal } from '@/lib/field/signal';

interface CameraRigProps {
  /**
   * Multiplier on camera distance. Narrow viewports need to pull back further to
   * fit the same structure into a portrait frame.
   */
  distanceScale?: number;
  /** Disables ambient float and parallax entirely (reduced motion). */
  still?: boolean;
}

/**
 * Camera controller.
 *
 * Three inputs, in order of authority:
 *   1. field state — the camera pulls back as the structure spreads out and
 *      moves in as it condenses, so the composition stays framed
 *   2. pointer / device tilt — a small parallax offset, damped
 *   3. ambient float — a very slow figure-of-eight, so a still page is not a
 *      still image
 *
 * There are no OrbitControls: the camera is authored, not user-driven. A visitor
 * dragging the background would fight the scroll narrative.
 */
export function CameraRig({ distanceScale = 1, still = false }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const target = useRef(new Vector3(0, 0, 0));
  const desired = useRef(new Vector3(0, 0, 7));

  useFrame((state, delta) => {
    if (!fieldSignal.rendering) return;

    const time = state.clock.elapsedTime;
    advanceFieldSignal(time, delta);
    const dt = Math.min(delta, 1 / 20);

    // Interpolate the authored per-state framing along the field coordinate.
    const coord = Math.min(MAX_STATE_INDEX, Math.max(0, fieldSignal.current));
    const i = Math.floor(coord);
    const j = Math.min(MAX_STATE_INDEX, i + 1);
    const f = coord - i;

    // Portrait and narrow viewports need more distance to fit the same structure
    // into the frame. Derived from the live canvas aspect rather than a
    // breakpoint, so it is correct on an iPad rotating mid-scroll.
    const aspect = state.size.width / Math.max(1, state.size.height);
    const aspectScale = aspect < 1 ? 1.42 : aspect < 1.35 ? 1.2 : aspect < 1.7 ? 1.06 : 1;

    const distance =
      MathUtils.lerp(FIELD_SCENE.cameraDistance[i], FIELD_SCENE.cameraDistance[j], f) *
      distanceScale *
      aspectScale;
    const height = MathUtils.lerp(FIELD_SCENE.cameraHeight[i], FIELD_SCENE.cameraHeight[j], f);

    let offsetX = 0;
    let offsetY = 0;

    if (!still) {
      // Parallax. Small on purpose — the field should acknowledge the pointer,
      // not follow it.
      offsetX = fieldSignal.smoothX * 0.42;
      offsetY = fieldSignal.smoothY * -0.3;

      // Ambient float. Two incommensurable periods so it never visibly loops.
      offsetX += Math.sin(time * 0.083) * 0.2;
      offsetY += Math.sin(time * 0.061 + 1.4) * 0.14;
    }

    desired.current.set(offsetX, height + offsetY, distance);

    // Damped rather than assigned: the camera has weight.
    camera.position.x = MathUtils.damp(camera.position.x, desired.current.x, 2.2, dt);
    camera.position.y = MathUtils.damp(camera.position.y, desired.current.y, 2.2, dt);
    camera.position.z = MathUtils.damp(camera.position.z, desired.current.z, 1.6, dt);

    // Look slightly above centre so the structure sits low in the frame, leaving
    // the upper area to the typography.
    target.current.set(0, height * 0.35, 0);
    camera.lookAt(target.current);
  });

  return null;
}

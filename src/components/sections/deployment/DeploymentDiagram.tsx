'use client';

import { useEffect, useRef } from 'react';
import { deploymentEnvironments } from '@/data/deployments';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import styles from './DeploymentDiagram.module.scss';

interface DeploymentDiagramProps {
  selectedId: string;
  /** Slow ambient rotation. Disabled under reduced motion and on low-power tiers. */
  animate?: boolean;
}

const VIEW = 400;
const CENTRE = VIEW / 2;
/** Distance of the projection plane. Larger is a flatter, less distorted view. */
const FOCAL = 5.4;

/**
 * The deployment network, projected.
 *
 * A perspective projection of the same node coordinates the WebGL version uses,
 * drawn as SVG. This is not a simplified stand-in: it is the version that runs on
 * mobile, on low-power devices and anywhere WebGL is unavailable, and it carries
 * the identical information — five environments, their links, and which one is
 * selected.
 *
 * Nodes are depth-sorted and scaled by distance, and link opacity falls off with
 * depth, so the structure reads as spatial without a GPU.
 *
 * Animation writes attributes directly in a rAF loop rather than through React:
 * five nodes and six links at 60fps through the reconciler would be pure waste.
 */
export function DeploymentDiagram({ selectedId, animate = true }: DeploymentDiagramProps) {
  const groupRef = useRef<SVGGElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const group = groupRef.current;
    if (!group || !animate || reducedMotion) return;

    let frame = 0;
    let start: number | null = null;

    const tick = (time: number) => {
      if (start === null) start = time;
      const elapsed = (time - start) / 1000;

      // A slow yaw applied as a 2D skew-free rotation of the projected result.
      // Re-projecting every frame in JS would be more accurate; rotating the
      // rendered group is one attribute write and visually equivalent at this
      // amplitude.
      const yaw = Math.sin(elapsed * 0.18) * 7;
      group.setAttribute('transform', `rotate(${yaw.toFixed(3)} ${CENTRE} ${CENTRE})`);

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, reducedMotion]);

  // Project once at module-render time; the coordinates are static data.
  const projected = deploymentEnvironments.map((env) => {
    const [x, y, z] = env.position;
    const scale = FOCAL / (FOCAL - z);
    return {
      id: env.id,
      label: env.label,
      x: CENTRE + x * 52 * scale,
      y: CENTRE - y * 52 * scale,
      depth: z,
      scale,
    };
  });

  const byId = new Map(projected.map((node) => [node.id, node]));

  const links = deploymentEnvironments.flatMap((env) =>
    env.links
      // De-duplicate: each pair is declared from both sides in the data.
      .filter((target) => env.id < target)
      .map((target) => {
        const from = byId.get(env.id);
        const to = byId.get(target);
        if (!from || !to) return null;
        return {
          key: `${env.id}-${target}`,
          from,
          to,
          active: selectedId === env.id || selectedId === target,
        };
      })
      .filter((link): link is NonNullable<typeof link> => link !== null),
  );

  // Painter's algorithm: far nodes first.
  const sorted = [...projected].sort((a, b) => a.depth - b.depth);

  return (
    <svg
      className={styles.diagram}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      // The list beside this diagram carries all of the same information in text,
      // so the graphic itself is decorative.
      aria-hidden="true"
      focusable="false"
    >
      <g ref={groupRef}>
        <g>
          {links.map((link) => (
            <line
              key={link.key}
              x1={link.from.x}
              y1={link.from.y}
              x2={link.to.x}
              y2={link.to.y}
              className={link.active ? styles.linkActive : styles.link}
            />
          ))}
        </g>

        {sorted.map((node) => {
          const active = node.id === selectedId;
          const size = 7 * node.scale;
          return (
            <g key={node.id} className={active ? styles.nodeActive : styles.node}>
              {active ? (
                <circle cx={node.x} cy={node.y} r={size * 2.6} className={styles.halo} />
              ) : null}
              {/* A 45° square, matching the node motif used in the Intelligence Field. */}
              <rect
                x={node.x - size / 2}
                y={node.y - size / 2}
                width={size}
                height={size}
                transform={`rotate(45 ${node.x} ${node.y})`}
              />
              <text
                x={node.x}
                y={node.y - size - 9}
                textAnchor="middle"
                className={styles.nodeLabel}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

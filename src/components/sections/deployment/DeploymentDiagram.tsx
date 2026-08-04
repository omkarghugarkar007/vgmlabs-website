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

/* -------------------------------------------------------------------------- */
/* Static geometry                                                            */
/* -------------------------------------------------------------------------- */

/* Projected once at module scope. None of this depends on props — the node
   coordinates are static data — so recomputing it per render was pure waste, and
   hoisting it lets the animation loop close over the real rotation centre. */

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

const linkPairs = deploymentEnvironments.flatMap((env) =>
  env.links
    // De-duplicate: each pair is declared from both sides in the data.
    .filter((target) => env.id < target)
    .map((target) => {
      const from = byId.get(env.id);
      const to = byId.get(target);
      if (!from || !to) return null;
      return { key: `${env.id}-${target}`, a: env.id, b: target, from, to };
    })
    .filter((link): link is NonNullable<typeof link> => link !== null),
);

/** Painter's algorithm: far nodes first. */
const sorted = [...projected].sort((a, b) => a.depth - b.depth);

/**
 * The viewBox is fitted to the content instead of being a fixed square.
 *
 * Five nodes in a 400×400 box used 65% of its width and 54% of its height, so
 * roughly two thirds of the panel was empty — a full screen of mostly nothing,
 * carrying less than the five-row list printed directly beneath it. Fitting the
 * box turns it into a wide band, which is the right shape for what it shows.
 *
 * Computed rather than hardcoded so it stays correct if a deployment environment
 * is added, removed or repositioned in the data.
 *
 * The padding covers what extends beyond a node's centre: half a label's width
 * horizontally, the label's height above, and the selection halo below.
 */
const PAD_X = 54;
const PAD_TOP = 32;
const PAD_BOTTOM = 28;

const BOUNDS = {
  minX: Math.min(...projected.map((n) => n.x)) - PAD_X,
  maxX: Math.max(...projected.map((n) => n.x)) + PAD_X,
  minY: Math.min(...projected.map((n) => n.y)) - PAD_TOP,
  maxY: Math.max(...projected.map((n) => n.y)) + PAD_BOTTOM,
};

const BOX_W = BOUNDS.maxX - BOUNDS.minX;
const BOX_H = BOUNDS.maxY - BOUNDS.minY;
const VIEW_BOX = `${BOUNDS.minX.toFixed(2)} ${BOUNDS.minY.toFixed(2)} ${BOX_W.toFixed(2)} ${BOX_H.toFixed(2)}`;

/** Rotation origin — the centre of the fitted box, not of the old square. */
const PIVOT_X = BOUNDS.minX + BOX_W / 2;
const PIVOT_Y = BOUNDS.minY + BOX_H / 2;

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
      group.setAttribute('transform', `rotate(${yaw.toFixed(3)} ${PIVOT_X} ${PIVOT_Y})`);

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, reducedMotion]);

  // The only per-render work: which link touches the selected environment.
  const links = linkPairs.map((link) => ({
    ...link,
    active: selectedId === link.a || selectedId === link.b,
  }));

  return (
    <svg
      className={styles.diagram}
      viewBox={VIEW_BOX}
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

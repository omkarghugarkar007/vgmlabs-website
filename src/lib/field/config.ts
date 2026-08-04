import type { FieldStateId } from '@/types/content';

/**
 * THE INTELLIGENCE FIELD — configuration.
 *
 * The field is one continuous computational structure that changes shape as the
 * page scrolls. It is not a set of unrelated animations: every section maps to a
 * position along a single continuous coordinate, and the geometry interpolates
 * between the two nearest states.
 */

/** Ordered states. Index order defines the scroll narrative. */
export const FIELD_STATES: readonly FieldStateId[] = [
  'core', // 0 — a concentrated intelligence core assembling from independents
  'agentic', // 1 — the core separates into autonomous, communicating nodes
  'distributed', // 2 — a distributed network of local processing clusters
  'symbolic', // 3 — organic movement intersecting explicit geometric rules
  'production', // 4 — a stabilised, structured computational architecture
];

export const FIELD_STATE_INDEX: Readonly<Record<FieldStateId, number>> = Object.freeze(
  FIELD_STATES.reduce<Record<string, number>>((acc, id, i) => {
    acc[id] = i;
    return acc;
  }, {}),
) as Readonly<Record<FieldStateId, number>>;

export const MAX_STATE_INDEX = FIELD_STATES.length - 1;

/* -------------------------------------------------------------------------- */
/* Quality tiers                                                              */
/* -------------------------------------------------------------------------- */

export type QualityTier = 'high' | 'medium' | 'low' | 'off';

export interface QualityProfile {
  readonly tier: QualityTier;
  /** Particle count. The dominant cost in the scene. */
  readonly particles: number;
  /** Geometric nodes drawn as one InstancedMesh. */
  readonly nodes: number;
  /** Upper bound on simultaneously drawn connection paths. */
  readonly maxEdges: number;
  /** Travelling signals along the connection paths. */
  readonly signals: number;
  /**
   * Translucent surfaces. Currently 0 on every tier — see the note on the profiles
   * below. The component is retained and working; raise this to bring them back.
   */
  readonly planes: number;
  /**
   * Bloom. Off on every tier. See the note on the profiles below before enabling.
   */
  readonly bloom: boolean;
  /** Screen-space vignette. Off on every tier — it shares bloom's composer. */
  readonly grade: boolean;
  /** Clamp on devicePixelRatio. Retina at 3x costs 9x the fragments. */
  readonly dpr: readonly [number, number];
  /** Node geometry subdivision. */
  readonly nodeDetail: number;
}

/**
 * Quality profiles.
 *
 * ── Why post-processing is off on every tier ──────────────────────────────────
 *
 * Bloom was tried twice and produced visible artefacts both times on real
 * hardware:
 *
 *   1. `mipmapBlur` at a 0.72 luminance threshold smeared the field into
 *      screen-sized rectangles. The cause is that additive particles with no tone
 *      mapping accumulate luminance far above 1.0, so nearly everything cleared
 *      the threshold, and mipmap downsampling turns a large bright region into a
 *      blocky one.
 *   2. Switching to a Kawase kernel at threshold 1.0 and intensity 0.16 still
 *      produced a pyramid of nested square halos, plus a hard-edged block from an
 *      incompletely cleared render target.
 *
 * A bloom that has to be nursed is not worth having. The additive particles
 * already read as luminous on their own — that is what the blending is for — so
 * the composer is simply not created (`PostFX` returns null when both flags are
 * false), which removes the entire class of framebuffer artefact along with a
 * full-resolution buffer and two passes per frame.
 *
 * The wireframe grid planes are back on (2 / 1 / 0). They were never the artefact —
 * the blur pass was smearing them into those nested squares. With no composer they
 * read as intended: faint constraint planes intersecting the organic flow.
 *
 * A separate and far more consequential bug sat underneath all of this: the particle
 * vertex shader declared a variable named `asm`, which is a GLSL ES reserved word, so
 * the program never compiled and every particle was silently absent. A failed shader
 * draws nothing and throws no page-level error — the field was only its nodes and
 * links, which is why tuning bloom kept not helping. If the field ever looks sparse
 * or static again, read the browser console for `THREE.WebGLProgram: Shader Error`
 * before adjusting any value in this file.
 *
 * Contrast at the frame edges is handled by the CSS veil in
 * IntelligenceField.module.scss, not by a vignette pass.
 */
export const QUALITY_PROFILES: Readonly<Record<Exclude<QualityTier, 'off'>, QualityProfile>> = {
  high: {
    tier: 'high',
    particles: 17000,
    nodes: 26,
    maxEdges: 132,
    signals: 26,
    planes: 2,
    bloom: false,
    grade: false,
    // 1.5, not 1.75. The scene is points and hairlines with no hard silhouettes,
    // so the visible difference between the two is close to nothing while the
    // fragment cost scales with the square — 1.75² is 36% more shading than
    // 1.5². That headroom is better spent on frame stability, which is what
    // occasional heavy frames on this page were costing.
    dpr: [1, 1.5],
    nodeDetail: 1,
  },
  medium: {
    tier: 'medium',
    particles: 8200,
    nodes: 20,
    maxEdges: 88,
    signals: 16,
    planes: 1,
    bloom: false,
    grade: false,
    dpr: [1, 1.4],
    nodeDetail: 0,
  },
  low: {
    tier: 'low',
    particles: 3200,
    nodes: 14,
    maxEdges: 52,
    signals: 9,
    planes: 0,
    bloom: false,
    grade: false,
    dpr: [1, 1.25],
    nodeDetail: 0,
  },
};

/* -------------------------------------------------------------------------- */
/* Scene constants                                                            */
/* -------------------------------------------------------------------------- */

export const FIELD_SCENE = {
  /** Agent clusters in the `agentic` state. */
  agentClusters: 7,
  /** Local processing clusters in the `distributed` state. */
  edgeClusters: 9,
  /** Architecture layers in the `production` state — mirrors the six-layer
   *  system model described on the Capabilities page. */
  productionLayers: 6,
  /** Lattice dimensions used by the `symbolic` state. */
  lattice: { x: 11, y: 5, z: 11, spacing: 0.47 } as const,
  /** Distance below which two nodes are joined by a connection path. Scene
   *  units. One rule produces a different topology in every state, which keeps
   *  the structure legibly continuous. */
  linkRadius: 1.62,
  /** Camera distance per state; interpolated along the field coordinate. */
  cameraDistance: [6.4, 7.6, 9.1, 8.2, 7.9] as const,
  /** Vertical camera offset per state. */
  cameraHeight: [0.15, 0.35, 0.95, 0.5, 0.2] as const,
  /** How strongly each state is perturbed by procedural flow. `production` is
   *  nearly still by design — the system has stabilised. */
  organic: [0.62, 0.5, 0.34, 0.78, 0.12] as const,
} as const;

/* -------------------------------------------------------------------------- */
/* Colours — mirrors src/styles/_palette.scss                                 */
/* -------------------------------------------------------------------------- */

export const FIELD_COLORS = {
  ink: '#ece9e2',
  cobalt: '#4f72ff',
  amber: '#ffb45c',
  cyan: '#8ce8e3',
  metal: '#24282d',
  void: '#050607',
} as const;

/* -------------------------------------------------------------------------- */
/* Device capability                                                          */
/* -------------------------------------------------------------------------- */

/** Feature-detect WebGL2, then WebGL1. Returns false in SSR. */
export function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    // Release immediately; this canvas is only for detection.
    const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Pick a starting tier from static device signals. `AdaptiveQuality` then
 * measures real frame timing and can downgrade from here — the initial guess
 * only needs to avoid starting far too high.
 */
export function initialTier(): Exclude<QualityTier, 'off'> {
  if (typeof window === 'undefined') return 'medium';

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.innerWidth < 768;
  const tablet = window.innerWidth < 1180;

  // Mobile: the composition is redesigned rather than scaled, and the field is
  // a quiet backdrop there. Always the low profile.
  if (narrow || (coarse && tablet)) return 'low';
  if (cores <= 4 || (memory > 0 && memory <= 4)) return 'medium';
  if (tablet) return 'medium';
  return 'high';
}

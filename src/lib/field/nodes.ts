import { FIELD_SCENE, MAX_STATE_INDEX } from './config';

/**
 * The node graph — the coarse, geometric half of the Intelligence Field.
 *
 * Where the particle system is thousands of points morphed on the GPU, the node
 * graph is a few dozen discrete nodes whose positions are computed on the CPU.
 * That is deliberate: connection paths and travelling signals need to know where
 * the nodes actually are, and reading positions back from a vertex shader is not
 * practical.
 *
 * The formations here mirror the GLSL ones in `shaders/particles.glsl.ts`. They
 * are intentionally the *same shapes at lower resolution*, which is what makes
 * the particles and the nodes read as one structure rather than two overlaid
 * effects.
 *
 * Three components consume this graph in the same frame (nodes, paths,
 * signals). Rather than depend on `useFrame` subscription order, each calls
 * `ensure(time, coord)`; the work happens once because R3F hands every callback
 * in a frame the identical clock value.
 */

const { agentClusters, edgeClusters, productionLayers, lattice, linkRadius } = FIELD_SCENE;
const LATTICE_SITES = lattice.x * lattice.y * lattice.z;
const TAU = Math.PI * 2;

/* -------------------------------------------------------------------------- */
/* Formations — CPU mirrors of the shader formations                           */
/* -------------------------------------------------------------------------- */

/** Golden-angle sphere distribution: even coverage without random clumping. */
function corePosition(i: number, count: number, t: number, out: Vec3): void {
  const k = (i + 0.5) / count;
  const ct = 1 - 2 * k;
  const st = Math.sqrt(Math.max(0, 1 - ct * ct));
  const phi = i * 2.39996323 + t * 0.1;
  const r = 0.78 + (i % 3) * 0.16;
  out.x = st * Math.cos(phi) * r;
  out.y = ct * r;
  out.z = st * Math.sin(phi) * r;
}

function agentCentre(ci: number, t: number, out: Vec3): void {
  const ang = (ci / agentClusters) * TAU + t * 0.1;
  const tilt = Math.sin(ci * 2.3999) * 0.58;
  out.x = Math.cos(ang) * 2.3;
  out.y = tilt + Math.sin(ang * 2) * 0.26;
  out.z = Math.sin(ang) * 2.3;
}

function agenticPosition(i: number, count: number, t: number, out: Vec3): void {
  const ci = i % agentClusters;
  agentCentre(ci, t, out);
  // Satellites orbit their own agent; the first node per agent is the agent
  // itself, so every cluster has a stable hub for links to converge on.
  const ring = Math.floor(i / agentClusters);
  if (ring === 0) return;
  const phi = i * 1.7 + t * 0.3;
  const r = 0.3 + ring * 0.1;
  out.x += Math.cos(phi) * r;
  out.y += Math.sin(phi * 1.3) * r * 0.6;
  out.z += Math.sin(phi) * r;
}

function edgeCentre(ci: number, out: Vec3): void {
  const gx = (ci % 3) - 1;
  const gz = Math.floor(ci / 3) - 1;
  out.x = gx * 2.95 + Math.sin(ci * 1.71) * 0.34;
  out.y = Math.sin(ci * 2.11) * 0.46;
  out.z = gz * 2.45 + Math.cos(ci * 2.33) * 0.3;
}

function distributedPosition(i: number, count: number, t: number, out: Vec3): void {
  const ci = i % edgeClusters;
  edgeCentre(ci, out);
  const ring = Math.floor(i / edgeClusters);
  if (ring === 0) return;
  const phi = i * 2.1 + t * 0.18;
  const r = 0.24 + ring * 0.08;
  out.x += Math.cos(phi) * r;
  out.y += Math.sin(phi * 1.7) * r * 0.5;
  out.z += Math.sin(phi) * r;
}

function latticeSite(si: number, out: Vec3): void {
  const gx = si % lattice.x;
  const gy = Math.floor(si / lattice.x) % lattice.y;
  const gz = Math.floor(si / (lattice.x * lattice.y));
  out.x = (gx - (lattice.x - 1) * 0.5) * lattice.spacing;
  out.y = (gy - (lattice.y - 1) * 0.5) * lattice.spacing;
  out.z = (gz - (lattice.z - 1) * 0.5) * lattice.spacing;
}

/**
 * Symbolic state: nodes sit on exact lattice sites. Sites are chosen by a
 * coprime stride so the selection spreads across the whole lattice instead of
 * bunching along one axis.
 */
function symbolicPosition(i: number, count: number, _t: number, out: Vec3): void {
  const stride = 173; // coprime with 605 (11*5*11)
  latticeSite((i * stride) % LATTICE_SITES, out);
}

function productionPosition(i: number, count: number, t: number, out: Vec3): void {
  const perLayer = Math.max(1, Math.round(count / productionLayers));
  const li = Math.min(productionLayers - 1, Math.floor(i / perLayer));
  const within = (i % perLayer) / perLayer;
  const r = 1.28 + li * 0.13;
  const ang = within * TAU + li * 0.4 + t * 0.026;
  out.x = Math.cos(ang) * r;
  out.y = (li - (productionLayers - 1) * 0.5) * 0.68;
  out.z = Math.sin(ang) * r;
}

type Formation = (i: number, count: number, t: number, out: Vec3) => void;

const FORMATIONS: readonly Formation[] = [
  corePosition,
  agenticPosition,
  distributedPosition,
  symbolicPosition,
  productionPosition,
];

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/* -------------------------------------------------------------------------- */
/* Graph                                                                      */
/* -------------------------------------------------------------------------- */

class NodeGraph {
  count = 0;
  maxEdges = 0;

  /** xyz triples, length 3 * count. */
  positions = new Float32Array(0);
  /** Index pairs, length 2 * maxEdges. Only the first `edgeCount` are valid. */
  edges = new Int32Array(0);
  edgeCount = 0;
  /** 0..1 strength per edge, from proximity. Drives path opacity. */
  edgeWeights = new Float32Array(0);

  private lastTime = -1;
  private a: Vec3 = { x: 0, y: 0, z: 0 };
  private b: Vec3 = { x: 0, y: 0, z: 0 };

  allocate(count: number, maxEdges: number): void {
    if (this.count === count && this.maxEdges === maxEdges) return;
    this.count = count;
    this.maxEdges = maxEdges;
    this.positions = new Float32Array(count * 3);
    this.edges = new Int32Array(maxEdges * 2);
    this.edgeWeights = new Float32Array(maxEdges);
    this.edgeCount = 0;
    this.lastTime = -1;
  }

  /**
   * Recompute positions and links for this frame. Safe to call from several
   * components: the second and later calls in a frame return immediately
   * because R3F passes every `useFrame` callback the same clock value.
   */
  ensure(time: number, coord: number): void {
    if (time === this.lastTime || this.count === 0) return;
    this.lastTime = time;

    const clamped = Math.min(MAX_STATE_INDEX, Math.max(0, coord));
    const ia = Math.floor(clamped);
    const ib = Math.min(MAX_STATE_INDEX, ia + 1);
    const mix = clamped - ia;
    // Smoothstep the blend so nodes ease between formations rather than
    // travelling at constant speed — matches the eased particle morph.
    const e = mix * mix * (3 - 2 * mix);

    const formA = FORMATIONS[ia];
    const formB = FORMATIONS[ib];
    const { positions, count, a, b } = this;

    for (let i = 0; i < count; i++) {
      formA(i, count, time, a);
      formB(i, count, time, b);
      const o = i * 3;
      positions[o] = a.x + (b.x - a.x) * e;
      positions[o + 1] = a.y + (b.y - a.y) * e;
      positions[o + 2] = a.z + (b.z - a.z) * e;
    }

    this.link();
  }

  /**
   * One proximity rule, five topologies.
   *
   * Rather than authoring an adjacency list per state, edges are derived from
   * distance. Clustered states produce intra-cluster links, the lattice produces
   * grid links, and the layered state produces ring plus inter-layer links — all
   * from the same threshold. That is what keeps the structure legible as one
   * evolving system.
   *
   * O(n²) over a few dozen nodes: a few hundred comparisons per frame.
   */
  private link(): void {
    const { positions, count, edges, edgeWeights, maxEdges } = this;
    const max2 = linkRadius * linkRadius;
    let e = 0;

    for (let i = 0; i < count && e < maxEdges; i++) {
      const ax = positions[i * 3];
      const ay = positions[i * 3 + 1];
      const az = positions[i * 3 + 2];
      for (let j = i + 1; j < count && e < maxEdges; j++) {
        const dx = ax - positions[j * 3];
        const dy = ay - positions[j * 3 + 1];
        const dz = az - positions[j * 3 + 2];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > max2) continue;
        edges[e * 2] = i;
        edges[e * 2 + 1] = j;
        // Nearer pairs draw brighter, which reveals cluster interiors.
        edgeWeights[e] = 1 - d2 / max2;
        e++;
      }
    }

    this.edgeCount = e;
  }

  /** Copy node `i` into `out`. */
  read(i: number, out: Vec3): void {
    const o = i * 3;
    out.x = this.positions[o];
    out.y = this.positions[o + 1];
    out.z = this.positions[o + 2];
  }
}

/** Module singleton — one graph per document, like `fieldSignal`. */
export const nodeGraph = new NodeGraph();

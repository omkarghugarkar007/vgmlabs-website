import { FIELD_SCENE } from '../config';
import { NOISE_GLSL } from './noise.glsl';

const { agentClusters, edgeClusters, productionLayers, lattice, organic } = FIELD_SCENE;

const LATTICE_SITES = lattice.x * lattice.y * lattice.z;

/**
 * Particle vertex shader for the Intelligence Field.
 *
 * All five formations are evaluated procedurally on the GPU from a stable
 * per-particle seed. Nothing is precomputed on the CPU and no attribute is
 * rewritten per frame, so morphing between states costs no bandwidth — the only
 * thing that changes is three uniforms.
 *
 * Only two formations are ever active at once (the scroll driver guarantees
 * adjacent states), so `mix(a, b, t)` is a genuine morph rather than an average
 * of five shapes.
 *
 * Attribute contract, built once in ParticleField:
 *   position  vec3   scattered birth position — where the particle exists before
 *                    the core assembles. Reused as the assembly origin.
 *   aSeed     vec3   uniform random in [0,1)^3
 *   aIndex    float  i / (count - 1) — ordered, so formations that need regular
 *                    spacing (layers, lattice sites) get it for free
 *   aCluster  float  cluster assignment for the grouped states
 *   aScale    float  per-particle size multiplier
 *   aRole     float  role selector in [0,1): structure / path / signal
 */
export const PARTICLE_VERTEX = /* glsl */ `
precision highp float;

attribute vec3 aSeed;
attribute float aIndex;
attribute float aCluster;
attribute float aScale;
attribute float aRole;

uniform float uTime;
// State indices are floats, not ints: three.js uploads a plain JS number with
// uniform1f, so an int declaration here would be a type mismatch. The values are
// small whole numbers and therefore exact in float32.
uniform float uStateA;
uniform float uStateB;
uniform float uMix;
uniform float uAssemble;
uniform float uMotion;
uniform vec2  uPointer;
uniform float uSize;
uniform float uDpr;
uniform float uFocus;

uniform vec3 uInk;
uniform vec3 uCobalt;
uniform vec3 uAmber;
uniform vec3 uCyan;

varying vec3  vColor;
varying float vAlpha;
varying float vCore;

${NOISE_GLSL}

#define AGENT_CLUSTERS ${agentClusters.toFixed(1)}
#define EDGE_CLUSTERS  ${edgeClusters.toFixed(1)}
#define LAYERS         ${productionLayers.toFixed(1)}
#define LAT_X          ${lattice.x.toFixed(1)}
#define LAT_Y          ${lattice.y.toFixed(1)}
#define LAT_Z          ${lattice.z.toFixed(1)}
#define LAT_SITES      ${LATTICE_SITES.toFixed(1)}
#define LAT_SPACING    ${lattice.spacing.toFixed(3)}

/* -------------------------------------------------------------------------- */
/* State 0 — CORE                                                             */
/* A concentrated intelligence core. Density biased inward so it reads as a    */
/* volume rather than a hollow shell.                                         */
/* -------------------------------------------------------------------------- */
vec3 formCore(vec3 s, float role) {
  float phi = s.x * TAU;
  float ct  = s.y * 2.0 - 1.0;
  float st  = sqrt(max(0.0, 1.0 - ct * ct));
  vec3 dir  = vec3(st * cos(phi), ct, st * sin(phi));

  float r = 0.30 + pow(s.z, 0.78) * 1.44;
  // A tenth of the population condenses into a tight nucleus.
  r = mix(r, r * 0.32, step(0.90, role));
  return dir * r;
}

/* -------------------------------------------------------------------------- */
/* State 1 — AGENTIC                                                          */
/* The core separates into autonomous agents on a tilted ring. A share of the  */
/* particles become messengers travelling between agents: the visual encoding  */
/* of coordination.                                                           */
/* -------------------------------------------------------------------------- */
vec3 agentCentre(float ci, float t) {
  float ang  = (ci / AGENT_CLUSTERS) * TAU + t * 0.10;
  float tilt = sin(ci * 2.3999) * 0.58;
  return vec3(cos(ang) * 2.30, tilt + sin(ang * 2.0) * 0.26, sin(ang) * 2.30);
}

vec3 formAgentic(vec3 s, float cluster, float role, float t) {
  float ci = mod(cluster, AGENT_CLUSTERS);
  vec3 centre = agentCentre(ci, t);

  if (role > 0.855) {
    // Messenger in transit between two agents.
    float hop = 1.0 + floor(s.x * (AGENT_CLUSTERS - 1.0));
    vec3 target = agentCentre(mod(ci + hop, AGENT_CLUSTERS), t);
    float k = fract(s.y + t * 0.22);
    // Bow the path outward so traffic reads as arcs, not chords.
    vec3 p = mix(centre, target, k);
    return p + normalize(p + vec3(0.0001)) * sin(k * 3.14159) * 0.30;
  }

  // Local population orbiting its own agent.
  float phi = s.x * TAU + t * 0.32 + ci;
  float ct  = s.y * 2.0 - 1.0;
  float st  = sqrt(max(0.0, 1.0 - ct * ct));
  float r   = 0.14 + pow(s.z, 0.62) * 0.44;
  return centre + vec3(st * cos(phi), ct * 0.78, st * sin(phi)) * r;
}

/* -------------------------------------------------------------------------- */
/* State 2 — DISTRIBUTED                                                      */
/* Local processing clusters spread across a wide, shallow footprint. Traffic  */
/* is sparser and slower, and one cluster carries none at all — connectivity   */
/* is intermittent by assumption at the edge.                                 */
/* -------------------------------------------------------------------------- */
vec3 edgeCentre(float ci) {
  float gx = mod(ci, 3.0) - 1.0;
  float gz = floor(ci / 3.0) - 1.0;
  return vec3(
    gx * 2.95 + sin(ci * 1.71) * 0.34,
    sin(ci * 2.11) * 0.46,
    gz * 2.45 + cos(ci * 2.33) * 0.30
  );
}

vec3 formDistributed(vec3 s, float cluster, float role, float t) {
  float ci = mod(cluster, EDGE_CLUSTERS);
  vec3 centre = edgeCentre(ci);

  // Cluster 4 is the disconnected one: it keeps processing, sends nothing.
  if (role > 0.90 && abs(ci - 4.0) > 0.5) {
    float hop = 1.0 + floor(s.x * (EDGE_CLUSTERS - 1.0));
    vec3 target = edgeCentre(mod(ci + hop, EDGE_CLUSTERS));
    return mix(centre, target, fract(s.y + t * 0.12));
  }

  float phi = s.x * TAU + t * 0.20;
  float ct  = s.y * 2.0 - 1.0;
  float st  = sqrt(max(0.0, 1.0 - ct * ct));
  float r   = 0.10 + pow(s.z, 0.55) * 0.34;
  return centre + vec3(st * cos(phi), ct * 0.62, st * sin(phi)) * r;
}

/* -------------------------------------------------------------------------- */
/* State 3 — NEURO-SYMBOLIC                                                   */
/* Three populations occupying the same space: particles snapped to exact      */
/* lattice sites, particles travelling the edges between them (constraint      */
/* paths), and particles following a continuous organic curve. The states      */
/* intersect rather than alternate.                                           */
/* -------------------------------------------------------------------------- */
vec3 latticeSite(float si) {
  float gx = mod(si, LAT_X);
  float gy = mod(floor(si / LAT_X), LAT_Y);
  float gz = floor(si / (LAT_X * LAT_Y));
  return (vec3(gx, gy, gz) - vec3((LAT_X - 1.0) * 0.5, (LAT_Y - 1.0) * 0.5, (LAT_Z - 1.0) * 0.5))
    * LAT_SPACING;
}

vec3 formSymbolic(vec3 s, float idx, float role, float t) {
  float si  = floor(idx * (LAT_SITES - 1.0));
  vec3  lat = latticeSite(si);

  // Precise geometry — the symbolic half of the system.
  if (role < 0.44) return lat;

  // Constraint paths: transit along a lattice edge to an axis neighbour.
  if (role < 0.71) {
    float axis = floor(s.x * 3.0);
    vec3 step3 = vec3(
      axis < 1.0 ? LAT_SPACING : 0.0,
      axis >= 1.0 && axis < 2.0 ? LAT_SPACING : 0.0,
      axis >= 2.0 ? LAT_SPACING : 0.0
    );
    float dir = s.y < 0.5 ? -1.0 : 1.0;
    return mix(lat, lat + step3 * dir, fract(s.z + t * 0.18));
  }

  // Organic flow — a continuous curve threading the same volume.
  float u = s.x * TAU + t * 0.07;
  return vec3(
    sin(u) * 2.15 + sin(u * 5.0) * 0.16,
    sin(u * 2.0) * 0.98,
    cos(u * 3.0) * 2.15 + cos(u * 7.0) * 0.12
  );
}

/* -------------------------------------------------------------------------- */
/* State 4 — PRODUCTION                                                       */
/* The system stabilises. Six ordered layers — mirroring the six-layer system  */
/* model — with vertical columns carrying traffic between them. Regularity      */
/* comes from aIndex, so spacing is exact rather than random.                  */
/* -------------------------------------------------------------------------- */
vec3 formProduction(vec3 s, float idx, float role, float t) {
  if (role > 0.885) {
    // Columns binding the layers together.
    float col = floor(s.x * 9.0);
    float ca  = (col / 9.0) * TAU;
    float rr  = 1.66;
    return vec3(cos(ca) * rr, mix(-1.95, 1.95, fract(s.y + t * 0.05)), sin(ca) * rr);
  }

  float li     = floor(idx * LAYERS);
  float within = fract(idx * LAYERS);
  float y      = (li - (LAYERS - 1.0) * 0.5) * 0.68;
  float r      = 1.28 + li * 0.13;
  // Three turns per layer packs the ring densely while staying perfectly even.
  float ang    = within * TAU * 3.0 + li * 0.4 + t * 0.026;
  // Minimal jitter: enough to avoid moiré, not enough to look unresolved.
  float jitter = (s.z - 0.5) * 0.05;
  return vec3(cos(ang) * (r + jitter), y + (s.y - 0.5) * 0.05, sin(ang) * (r + jitter));
}

/* -------------------------------------------------------------------------- */

// Float comparisons against half-integer thresholds — robust against any
// float32 representation concern while keeping the dispatch branch-cheap.
vec3 formation(float id, vec3 s, float idx, float cluster, float role, float t) {
  if (id < 0.5) return formCore(s, role);
  if (id < 1.5) return formAgentic(s, cluster, role, t);
  if (id < 2.5) return formDistributed(s, cluster, role, t);
  if (id < 3.5) return formSymbolic(s, idx, role, t);
  return formProduction(s, idx, role, t);
}

// Per-state procedural amplitude. 'production' is nearly still on purpose.
float organicFor(float id) {
  if (id < 0.5) return ${organic[0].toFixed(2)};
  if (id < 1.5) return ${organic[1].toFixed(2)};
  if (id < 2.5) return ${organic[2].toFixed(2)};
  if (id < 3.5) return ${organic[3].toFixed(2)};
  return ${organic[4].toFixed(2)};
}

void main() {
  float t = uTime;

  vec3 pA = formation(uStateA, aSeed, aIndex, aCluster, aRole, t);
  vec3 pB = formation(uStateB, aSeed, aIndex, aCluster, aRole, t);

  // Stagger the morph per particle: the structure migrates over a short window
  // instead of every particle arriving simultaneously.
  const float SPREAD = 0.34;
  float m = easeInOut((uMix - aSeed.z * SPREAD) / (1.0 - SPREAD));
  vec3 p = mix(pA, pB, m);

  // First-load assembly out of independent scattered particles.
  //
  // Deliberately NOT named asm -- that is a reserved word in GLSL ES, and using it
  // made this whole shader fail to compile. Silently, as far as the page was
  // concerned: a failed program simply draws nothing and raises no page-level
  // error, so every particle was absent while the nodes and links carried on.
  // Other reserved words to avoid in here: this, input, output, half, short, long,
  // double, static, switch, default, template, class, union, packed, goto.
  float assembled = easeOut(uAssemble * 1.55 - aIndex * 0.52);
  p = mix(position, p, assembled);

  // Procedural drift. Amplitude follows the blended state.
  float org = mix(organicFor(uStateA), organicFor(uStateB), m) * uMotion;
  p += flow(p * 0.78, t) * org * 0.26;

  // Field-level orientation: slow ambient rotation plus damped pointer response.
  float drift = t * 0.016 * uMotion;
  p = rotateY(drift + uPointer.x * 0.20) * rotateX(uPointer.y * -0.11) * p;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depth = max(0.0001, -mv.z);

  /* ---- colour ---------------------------------------------------------- */
  // Structure reads cobalt, transit reads amber, telemetry reads cyan, the bulk
  // stays close to the warm off-white so the field never becomes a light show.
  vec3 col = mix(uInk, uCobalt, 0.42);
  if (aRole > 0.885)      col = uAmber;
  else if (aRole > 0.760) col = uCyan;
  else if (aRole < 0.300) col = uCobalt;

  // Symbolic state warms the organic population; production cools everything.
  float symbolic   = step(2.5, uStateA) * step(uStateA, 3.5) + step(2.5, uStateB) * step(uStateB, 3.5);
  float production = step(3.5, uStateA) + step(3.5, uStateB);
  symbolic   = clamp(symbolic, 0.0, 1.0);
  production = clamp(production, 0.0, 1.0);
  col = mix(col, uAmber, symbolic * step(0.71, aRole) * 0.45);
  col = mix(col, mix(uInk, uCobalt, 0.6), production * 0.30);

  // Slight per-particle luminance variation stops the cloud reading as flat.
  // Keep the multiplier at or below 1.0 so no particle exceeds its palette colour.
  col *= 0.72 + aSeed.x * 0.28;

  /* ---- opacity --------------------------------------------------------- */
  // Depth attenuation stands in for volumetric falloff.
  float fade  = smoothstep(17.0, 2.6, depth);

  // Per-particle alpha is kept low because blending is additive: overlapping
  // particles accumulate, and in the dense core twenty or more can stack on one
  // pixel. Faint individually is what makes the accumulation read as a luminous
  // volume rather than a blown-out highlight.
  //
  // This sat at 0.05-0.22 for a while, which was an over-correction: the washout it
  // was meant to fix came from the bloom pass, not from here, and with no composer
  // the field just looked thin. 0.09-0.37 gives the core real presence while
  // staying well under saturation.
  float alpha = fade * (0.09 + aSeed.y * 0.28) * uFocus;

  // Signals are brighter than structure — they are the thing to look at.
  alpha *= aRole > 0.885 ? 1.5 : 1.0;
  // Fade in with assembly so nothing pops.
  alpha *= smoothstep(0.0, 0.35, assembled);

  vColor = col;
  vAlpha = clamp(alpha, 0.0, 1.0);
  vCore  = aRole > 0.885 ? 1.0 : 0.0;

  gl_Position  = projectionMatrix * mv;
  gl_PointSize = clamp(uSize * aScale * uDpr * (3.5 / depth), 0.7, 8.0);
}
`;

/**
 * Fragment shader. A soft round sprite with a slightly hotter centre — cheaper
 * and sharper than sampling a texture, and it keeps the build asset-free.
 */
export const PARTICLE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec3  vColor;
varying float vAlpha;
varying float vCore;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = dot(uv, uv);           // squared distance; avoids a sqrt
  if (d > 0.25) discard;           // outside the disc

  // Soft edge, with a tighter hot core on signal particles.
  float edge = smoothstep(0.25, 0.02, d);
  float hot  = mix(1.0, smoothstep(0.09, 0.0, d) * 0.9 + 0.35, vCore);

  gl_FragColor = vec4(vColor * hot, vAlpha * edge);
}
`;

import styles from './FieldStill.module.scss';

/**
 * The non-WebGL representation of the Intelligence Field.
 *
 * Serves two purposes:
 *   1. the fallback where WebGL is unavailable or has failed
 *   2. the initial paint, before the canvas has produced its first frame — so the
 *      loading state is the brand rather than an empty black rectangle
 *
 * Deliberately a server component with no client JavaScript: it is present in the
 * exported HTML, so the page has its intended composition before any bundle
 * loads. Geometry is a golden-angle spiral, which is deterministic — no PRNG, no
 * hydration mismatch, no asset to download.
 */

const NODE_COUNT = 190;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const VIEW = 1000;
const CENTRE = VIEW / 2;

interface Point {
  x: number;
  y: number;
  r: number;
  o: number;
}

/**
 * Round to a fixed precision before it reaches the DOM.
 *
 * The maths is deterministic, but the *string* form of a float is not portable:
 * Node serialised 453.5981141827905 where the browser produced
 * 453.59811418279054, and React reported a hydration mismatch on every one of
 * these nodes. Rounding to three decimals is far finer than a pixel at this
 * viewBox scale and makes the two environments agree exactly.
 */
const fx = (n: number): number => Math.round(n * 1000) / 1000;

const points: Point[] = Array.from({ length: NODE_COUNT }, (_, i) => {
  const k = (i + 0.5) / NODE_COUNT;
  // sqrt distribution keeps areal density even, so the core reads as a volume
  // rather than a ring.
  const radius = Math.sqrt(k) * CENTRE * 0.82;
  const angle = i * GOLDEN_ANGLE;
  return {
    x: fx(CENTRE + Math.cos(angle) * radius),
    // Slight vertical compression matches the camera's framing in the 3D scene.
    y: fx(CENTRE + Math.sin(angle) * radius * 0.88),
    r: fx(1.1 + (1 - k) * 2.6),
    o: fx(0.14 + (1 - k) * 0.5),
  };
});

/** Short links between neighbours in the spiral: the connection paths, statically. */
const links = points
  .map((p, i) => {
    const q = points[i + 8];
    if (!q) return null;
    const d = Math.hypot(p.x - q.x, p.y - q.y);
    if (d > 96) return null;
    return { x1: p.x, y1: p.y, x2: q.x, y2: q.y, o: fx(0.16 * (1 - d / 96)) };
  })
  .filter((link): link is NonNullable<typeof link> => link !== null);

export function FieldStill() {
  return (
    <svg
      className={styles.still}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      // Decorative: all information this represents is stated in the page text.
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="vgm-still-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4f72ff" stopOpacity="0.20" />
          <stop offset="45%" stopColor="#4f72ff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#050607" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={VIEW} height={VIEW} fill="url(#vgm-still-core)" />

      <g stroke="#4f72ff" strokeWidth="0.7">
        {links.map((link, i) => (
          <line
            key={i}
            x1={link.x1}
            y1={link.y1}
            x2={link.x2}
            y2={link.y2}
            strokeOpacity={link.o}
          />
        ))}
      </g>

      <g>
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            // Every seventh point takes the signal accent, matching the ratio of
            // signal particles to structure in the 3D field.
            fill={i % 17 === 0 ? '#ffb45c' : i % 7 === 0 ? '#8ce8e3' : '#ece9e2'}
            fillOpacity={p.o}
          />
        ))}
      </g>
    </svg>
  );
}
